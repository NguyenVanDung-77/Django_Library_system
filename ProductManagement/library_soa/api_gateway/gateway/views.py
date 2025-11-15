import json
import logging
import requests
import os
import sys
from django.conf import settings
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
import time
from datetime import datetime

# Configure logging
logger = logging.getLogger(__name__)

# Import Consul client from shared module
parent_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../..'))
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

try:
    from shared.consul_client import get_consul_client
    logger.info("Consul client imported successfully")
except ImportError as e:
    logger.warning(f"Could not import consul_client: {e}, Consul integration disabled")
    def get_consul_client():
        return None

class GatewayService:
    """API Gateway service for routing requests to microservices with Consul service discovery"""
    
    def __init__(self):
        self.services = getattr(settings, 'GATEWAY_SERVICES', {})
        self.timeout = getattr(settings, 'GATEWAY_TIMEOUT', 30)
        self.retry_count = getattr(settings, 'GATEWAY_RETRY_COUNT', 3)
        self.log_requests = getattr(settings, 'GATEWAY_LOG_REQUESTS', True)
        self.use_consul = getattr(settings, 'USE_CONSUL', True)
        
        # Initialize Consul client if enabled
        if self.use_consul:
            self.consul_client = get_consul_client()
            logger.info("Gateway initialized with Consul service discovery")
        else:
            self.consul_client = None
            logger.info("Gateway initialized with static service configuration")
    
    def get_service_url(self, service_name):
        """
        Get service URL from Consul or fallback to static config
        
        Args:
            service_name: Name of the service (user, book, borrow)
        
        Returns:
            str: Base URL of the service
        """
        # Map internal service names to Consul service names
        consul_service_map = {
            'user': 'user-service',
            'book': 'book-service',
            'borrow': 'borrow-service'
        }
        
        # Try Consul first if enabled
        if self.use_consul and self.consul_client:
            consul_service_name = consul_service_map.get(service_name)
            if consul_service_name:
                service_url = self.consul_client.get_service_url(consul_service_name)
                if service_url:
                    logger.info(f"Discovered {service_name} service from Consul: {service_url}")
                    return service_url
                else:
                    logger.warning(f"Service {consul_service_name} not found in Consul, falling back to static config")
        
        # Fallback to static configuration
        if service_name in self.services:
            base_url = self.services[service_name]['base_url']
            logger.info(f"Using static config for {service_name}: {base_url}")
            return base_url
        
        return None
    
    def route_request(self, service_name, path, method, headers=None, data=None, params=None):
        """Route request to appropriate microservice"""
        
        # Get service URL (from Consul or static config)
        base_url = self.get_service_url(service_name)
        
        if not base_url:
            return self._error_response(f"Service '{service_name}' not found", 404)
        
        # Construct full URL based on service routing patterns
        if service_name == 'user':
            # User service routes: /api/users/list/, /api/users/register/, etc.
            url = f"{base_url}/api/users/{path}" if path else f"{base_url}/api/users/"
        elif service_name == 'book':
            # Book service routes: /api/books/, /api/books/create/, etc.
            url = f"{base_url}/api/books/{path}" if path else f"{base_url}/api/books/"
        elif service_name == 'borrow':
            # Borrow service routes: /api/borrow/, /api/history/, etc.
            url = f"{base_url}/api/{path}" if path else f"{base_url}/api/"
        else:
            url = f"{base_url}/api/{path}" if path else f"{base_url}/api/"
        
        # Prepare headers
        request_headers = {
            'Content-Type': 'application/json',
        }
        if headers:
            # Forward important headers
            for header in ['Authorization', 'Accept', 'User-Agent']:
                if header in headers:
                    request_headers[header] = headers[header]
        
        # Log request if enabled
        if self.log_requests:
            logger.info(f"Gateway routing {method} {url} to {service_name} service")
        
        # Make request with retry logic
        for attempt in range(self.retry_count):
            try:
                start_time = time.time()
                
                if method.upper() == 'GET':
                    response = requests.get(url, headers=request_headers, params=params, timeout=self.timeout)
                elif method.upper() == 'POST':
                    response = requests.post(url, headers=request_headers, json=data, params=params, timeout=self.timeout)
                elif method.upper() == 'PUT':
                    response = requests.put(url, headers=request_headers, json=data, params=params, timeout=self.timeout)
                elif method.upper() == 'DELETE':
                    response = requests.delete(url, headers=request_headers, params=params, timeout=self.timeout)
                elif method.upper() == 'PATCH':
                    response = requests.patch(url, headers=request_headers, json=data, params=params, timeout=self.timeout)
                else:
                    return self._error_response(f"Method {method} not supported", 405)
                
                response_time = time.time() - start_time
                
                # Log response if enabled
                if self.log_requests:
                    logger.info(f"Gateway received response from {service_name} service: {response.status_code} in {response_time:.2f}s")
                
                # Return response
                return self._format_response(response)
                
            except requests.exceptions.Timeout:
                logger.warning(f"Timeout on attempt {attempt + 1} for {service_name} service")
                if attempt == self.retry_count - 1:
                    return self._error_response(f"Service {service_name} timeout", 504)
                    
            except requests.exceptions.ConnectionError:
                logger.warning(f"Connection error on attempt {attempt + 1} for {service_name} service")
                if attempt == self.retry_count - 1:
                    return self._error_response(f"Service {service_name} unavailable", 503)
                    
            except Exception as e:
                logger.error(f"Error routing to {service_name} service: {str(e)}")
                return self._error_response(f"Gateway error: {str(e)}", 500)
        
        return self._error_response(f"Failed to route to {service_name} service after {self.retry_count} attempts", 503)
    
    def _format_response(self, response):
        """Format microservice response for gateway"""
        try:
            # Try to parse as JSON
            content = response.json()
        except:
            # Fallback to text content
            content = response.text
        
        return JsonResponse(
            content,
            status=response.status_code,
            safe=False
        )
    
    def _error_response(self, message, status_code):
        """Create standardized error response"""
        return JsonResponse({
            'status': 'error',
            'message': message,
            'timestamp': datetime.now().isoformat(),
            'gateway': 'library-soa-gateway'
        }, status=status_code)

# Initialize gateway service
gateway = GatewayService()

@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """Health check endpoint for API Gateway"""
    return Response({
        'status': 'healthy',
        'service': 'API Gateway',
        'timestamp': datetime.now().isoformat(),
        'version': '1.0.0'
    })

@api_view(['GET'])
@permission_classes([AllowAny])
def gateway_info(request):
    """Gateway information and available services"""
    services_info = {}
    
    # Get Consul client
    consul_client = get_consul_client()
    
    # Check if using Consul
    use_consul = getattr(settings, 'USE_CONSUL', True)
    
    if use_consul and consul_client and consul_client.consul:
        # Get services from Consul
        consul_services = consul_client.get_all_services()
        
        for service_id, service_data in consul_services.items():
            service_name = service_data.get('Service', service_id)
            services_info[service_name] = {
                'service_id': service_id,
                'address': service_data.get('Address', 'unknown'),
                'port': service_data.get('Port', 'unknown'),
                'tags': service_data.get('Tags', []),
                'source': 'consul'
            }
    else:
        # Fallback to static configuration
        for service_name, config in gateway.services.items():
            services_info[service_name] = {
                'base_url': config['base_url'],
                'prefix': config.get('prefix', ''),
                'source': 'static'
            }
    
    return Response({
        'gateway': 'Library SOA API Gateway',
        'version': '1.0.0',
        'consul_enabled': use_consul,
        'services': services_info,
        'timestamp': datetime.now().isoformat()
    })

@csrf_exempt
@require_http_methods(["GET", "POST", "PUT", "DELETE", "PATCH"])
def route_to_user_service(request, path):
    """Route requests to User Service"""
    return _route_request(request, 'user', path)

@csrf_exempt
@require_http_methods(["GET", "POST", "PUT", "DELETE", "PATCH"])
def route_to_book_service(request, path):
    """Route requests to Book Service"""
    return _route_request(request, 'book', path)

@csrf_exempt
@require_http_methods(["GET", "POST", "PUT", "DELETE", "PATCH"])
def route_to_borrow_service(request, path):
    """Route requests to Borrow Service"""
    return _route_request(request, 'borrow', path)

def _route_request(request, service_name, path):
    """Helper function to route requests"""
    # Parse request data
    data = None
    if request.body:
        try:
            data = json.loads(request.body)
        except:
            pass
    
    # Get query parameters
    params = dict(request.GET)
    
    # Get headers
    headers = {}
    for header, value in request.META.items():
        if header.startswith('HTTP_'):
            # Convert HTTP_AUTHORIZATION to Authorization
            header_name = header[5:].replace('_', '-').title()
            headers[header_name] = value
    
    return gateway.route_request(
        service_name=service_name,
        path=path,
        method=request.method,
        headers=headers,
        data=data,
        params=params
    )
