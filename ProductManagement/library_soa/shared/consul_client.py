"""
Consul Service Discovery & Registration Client
Handles service registration, deregistration, and discovery via Consul
"""
import consul
import socket
import logging
import os

logger = logging.getLogger(__name__)

class ConsulClient:
    """Client for Consul service discovery and registration"""
    
    def __init__(self, host='localhost', port=8500):
        """
        Initialize Consul client
        
        Args:
            host: Consul server host (default: localhost)
            port: Consul server port (default: 8500)
        """
        try:
            self.consul = consul.Consul(host=host, port=port)
            self.host = host
            self.port = port
            logger.info(f"Consul client initialized: {host}:{port}")
        except Exception as e:
            logger.error(f"Failed to initialize Consul client: {e}")
            self.consul = None
    
    def register_service(self, service_name, service_id, host, port, health_check_url=None, tags=None):
        """
        Register a service with Consul
        
        Args:
            service_name: Name of the service (e.g., 'user-service')
            service_id: Unique ID for this service instance
            host: Service host address
            port: Service port
            health_check_url: URL for health check (e.g., '/health/')
            tags: List of tags for the service
        
        Returns:
            bool: True if registration successful, False otherwise
        """
        if not self.consul:
            logger.error("Consul client not initialized")
            return False
        
        try:
            # Default health check URL
            if not health_check_url:
                health_check_url = f"http://{host}:{port}/health/"
            else:
                health_check_url = f"http://{host}:{port}{health_check_url}"
            
            # Default tags
            if not tags:
                tags = []
            
            # Register service
            self.consul.agent.service.register(
                name=service_name,
                service_id=service_id,
                address=host,
                port=port,
                tags=tags,
                check=consul.Check.http(
                    health_check_url,
                    interval='10s',
                    timeout='5s',
                    deregister='30s'  # Auto-deregister after 30s of failing checks
                )
            )
            
            logger.info(f"Service registered: {service_name} ({service_id}) at {host}:{port}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to register service {service_name}: {e}")
            return False
    
    def deregister_service(self, service_id):
        """
        Deregister a service from Consul
        
        Args:
            service_id: Unique ID of the service instance
        
        Returns:
            bool: True if deregistration successful, False otherwise
        """
        if not self.consul:
            logger.error("Consul client not initialized")
            return False
        
        try:
            self.consul.agent.service.deregister(service_id)
            logger.info(f"Service deregistered: {service_id}")
            return True
        except Exception as e:
            logger.error(f"Failed to deregister service {service_id}: {e}")
            return False
    
    def discover_service(self, service_name):
        """
        Discover healthy instances of a service
        
        Args:
            service_name: Name of the service to discover
        
        Returns:
            list: List of healthy service instances with their addresses
                  Format: [{'address': '127.0.0.1', 'port': 8001}, ...]
        """
        if not self.consul:
            logger.error("Consul client not initialized")
            return []
        
        try:
            # Get only healthy services
            index, services = self.consul.health.service(service_name, passing=True)
            
            instances = []
            for service in services:
                instance = {
                    'service_id': service['Service']['ID'],
                    'address': service['Service']['Address'],
                    'port': service['Service']['Port'],
                    'tags': service['Service'].get('Tags', [])
                }
                instances.append(instance)
            
            if instances:
                logger.info(f"Discovered {len(instances)} instance(s) of {service_name}")
            else:
                logger.warning(f"No healthy instances found for {service_name}")
            
            return instances
            
        except Exception as e:
            logger.error(f"Failed to discover service {service_name}: {e}")
            return []
    
    def get_service_url(self, service_name):
        """
        Get the URL of a healthy service instance (load balanced)
        
        Args:
            service_name: Name of the service
        
        Returns:
            str: Service URL (e.g., 'http://127.0.0.1:8001') or None if not found
        """
        instances = self.discover_service(service_name)
        
        if not instances:
            return None
        
        # Simple round-robin: return first healthy instance
        # In production, implement proper load balancing
        instance = instances[0]
        url = f"http://{instance['address']}:{instance['port']}"
        
        return url
    
    def get_all_services(self):
        """
        Get all registered services from Consul
        
        Returns:
            dict: Dictionary of all services
        """
        if not self.consul:
            logger.error("Consul client not initialized")
            return {}
        
        try:
            services = self.consul.agent.services()
            logger.info(f"Retrieved {len(services)} registered services")
            return services
        except Exception as e:
            logger.error(f"Failed to get all services: {e}")
            return {}


# Singleton instance
_consul_client = None

def get_consul_client(host=None, port=None):
    """
    Get or create Consul client singleton
    
    Args:
        host: Consul host (default from env or 'localhost')
        port: Consul port (default from env or 8500)
    
    Returns:
        ConsulClient instance
    """
    global _consul_client
    
    if _consul_client is None:
        consul_host = host or os.getenv('CONSUL_HOST', 'localhost')
        consul_port = int(port or os.getenv('CONSUL_PORT', 8500))
        _consul_client = ConsulClient(consul_host, consul_port)
    
    return _consul_client
