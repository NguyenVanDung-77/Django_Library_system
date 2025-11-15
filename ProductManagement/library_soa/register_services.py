"""
Service Registration Script for Consul
Registers all microservices with Consul for service discovery
"""
import sys
import os

# Add shared module to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'shared'))

from consul_client import get_consul_client
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def register_all_services():
    """Register all microservices with Consul"""
    
    # Get Consul client
    consul_client = get_consul_client()
    
    if not consul_client or not consul_client.consul:
        logger.error("Failed to connect to Consul. Make sure Consul is running on localhost:8500")
        return False
    
    # Service configurations
    services = [
        {
            'service_name': 'user-service',
            'service_id': 'user-service-1',
            'host': '127.0.0.1',
            'port': 8001,
            'health_check_url': '/api/users/health/',
            'tags': ['django', 'user-management', 'authentication']
        },
        {
            'service_name': 'book-service',
            'service_id': 'book-service-1',
            'host': '127.0.0.1',
            'port': 8002,
            'health_check_url': '/api/books/health/',
            'tags': ['django', 'book-catalog', 'inventory']
        },
        {
            'service_name': 'borrow-service',
            'service_id': 'borrow-service-1',
            'host': '127.0.0.1',
            'port': 8003,
            'health_check_url': '/api/health/',
            'tags': ['django', 'borrow-management', 'transactions']
        }
    ]
    
    # Register each service
    success_count = 0
    for service in services:
        logger.info(f"Registering {service['service_name']}...")
        
        result = consul_client.register_service(
            service_name=service['service_name'],
            service_id=service['service_id'],
            host=service['host'],
            port=service['port'],
            health_check_url=service['health_check_url'],
            tags=service['tags']
        )
        
        if result:
            logger.info(f"✅ {service['service_name']} registered successfully")
            success_count += 1
        else:
            logger.error(f"❌ Failed to register {service['service_name']}")
    
    logger.info(f"\nRegistration complete: {success_count}/{len(services)} services registered")
    return success_count == len(services)

def deregister_all_services():
    """Deregister all microservices from Consul"""
    
    consul_client = get_consul_client()
    
    if not consul_client or not consul_client.consul:
        logger.error("Failed to connect to Consul")
        return False
    
    service_ids = [
        'user-service-1',
        'book-service-1',
        'borrow-service-1'
    ]
    
    for service_id in service_ids:
        logger.info(f"Deregistering {service_id}...")
        consul_client.deregister_service(service_id)
    
    logger.info("All services deregistered")
    return True

def check_service_status():
    """Check status of all registered services"""
    
    consul_client = get_consul_client()
    
    if not consul_client or not consul_client.consul:
        logger.error("Failed to connect to Consul")
        return
    
    service_names = ['user-service', 'book-service', 'borrow-service']
    
    print("\n=== Service Discovery Status ===")
    for service_name in service_names:
        instances = consul_client.discover_service(service_name)
        
        if instances:
            print(f"\n✅ {service_name}:")
            for instance in instances:
                print(f"   - {instance['address']}:{instance['port']} (ID: {instance['service_id']})")
                print(f"     Tags: {', '.join(instance['tags'])}")
        else:
            print(f"\n❌ {service_name}: No healthy instances found")
    
    print("\n=== All Registered Services ===")
    all_services = consul_client.get_all_services()
    for service_id, service_data in all_services.items():
        print(f"  - {service_id}: {service_data.get('Service', 'unknown')}")

if __name__ == '__main__':
    import argparse
    
    parser = argparse.ArgumentParser(description='Consul Service Registration Management')
    parser.add_argument('action', choices=['register', 'deregister', 'status'], 
                       help='Action to perform')
    
    args = parser.parse_args()
    
    if args.action == 'register':
        register_all_services()
    elif args.action == 'deregister':
        deregister_all_services()
    elif args.action == 'status':
        check_service_status()
