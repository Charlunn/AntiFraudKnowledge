import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'KnowledgeBackend.settings')
django.setup()

from users.models import CustomUser

try:
    user = CustomUser.objects.get(username='testuser')
    print(f'用户: {user.username}')
    print(f'邮箱: {user.email}')
    print(f'昵称: {user.nickname}')
    
    # 测试常见密码
    passwords = ['testpassword123', 'testpass123', 'password123', 'test123']
    for pwd in passwords:
        if user.check_password(pwd):
            print(f'✅ 正确密码: {pwd}')
            break
    else:
        print('❌ 未找到正确密码')
        
except CustomUser.DoesNotExist:
    print('用户不存在')