import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'KnowledgeBackend.settings')
django.setup()

from users.models import CustomUser
from django.contrib.auth import authenticate

# 检查admin用户
user = authenticate(username='admin', password='password123')
print(f'Authentication result for admin/password123: {user}')

# 尝试其他常见密码
passwords = ['admin', '123456', 'password', 'admin123']
for pwd in passwords:
    user = authenticate(username='admin', password=pwd)
    if user:
        print(f'Authentication successful with password: {pwd}')
        break
else:
    print('No valid password found for admin user')

# 检查admin用户的详细信息
try:
    admin_user = CustomUser.objects.get(username='admin')
    print(f'Admin user exists: {admin_user.username}, Email: {admin_user.email}, Active: {admin_user.is_active}')
except CustomUser.DoesNotExist:
    print('Admin user does not exist')