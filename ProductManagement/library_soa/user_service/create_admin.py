"""
Script to create admin user for Library SOA system
"""
import os
import django
import sys

# Setup Django
sys.path.insert(0, os.path.dirname(__file__))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'user_service.settings')
django.setup()

from users.models import User

# Create admin user
def create_admin():
    try:
        # Check if admin exists
        if User.objects.filter(username='admin').exists():
            print("Admin user 'admin' already exists!")
            admin = User.objects.get(username='admin')
            # Update password
            admin.set_password('admin123')
            admin.role = 'admin'
            admin.is_active = True
            admin.save()
            print("✅ Admin password updated to 'admin123'")
        else:
            # Create new admin
            admin = User(
                username='admin',
                email='admin@library.com',
                first_name='Admin',
                last_name='User',
                role='admin',
                is_active=True
            )
            admin.set_password('admin123')
            admin.save()
            print("✅ Admin user created successfully!")
        
        print("\n👑 Admin Account:")
        print(f"   Username: admin")
        print(f"   Password: admin123")
        print(f"   Role: {admin.role}")
        
    except Exception as e:
        print(f"❌ Error creating admin: {e}")

if __name__ == '__main__':
    create_admin()
