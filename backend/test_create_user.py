import os
import sys
sys.path.append('/app')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'KnowledgeBackend.settings')
import django
django.setup()

# 测试创建用户
from users.models import CustomUser

print("开始测试创建用户...")
try:
    # 创建一个测试用户
    user = CustomUser.objects.create_user(
        username='testuser',
        password='testpassword123',
        nickname='Test User'
    )
    print(f"成功创建用户: {user.username}")
    print(f"用户ID: {user.id}")
    
    # 验证用户是否成功创建
    user_exists = CustomUser.objects.filter(username='testuser').exists()
    print(f"用户存在验证: {user_exists}")
    
    # 验证密码是否正确
    password_correct = user.check_password('testpassword123')
    print(f"密码验证: {password_correct}")
    
    # 显示当前用户总数
    total_users = CustomUser.objects.count()
    print(f"当前用户总数: {total_users}")
    
except Exception as e:
    print(f"创建用户失败: {e}")