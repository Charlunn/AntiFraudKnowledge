import os
import sys

sys.path.append('/app')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'KnowledgeBackend.settings')
import django
django.setup()

from users.models import CustomUser

print("开始验证用户是否创建成功...")

try:
    # 检查curluser是否存在
    curl_user = CustomUser.objects.get(username='curluser')
    print(f"用户 'curluser' 存在！")
    print(f"用户ID: {curl_user.id}")
    print(f"用户昵称: {curl_user.nickname}")
    print(f"用户邮箱: {curl_user.email}")
    
    # 验证密码是否正确
    password_valid = curl_user.check_password('TestPass123!')
    print(f"密码验证: {password_valid}")
    
    # 打印当前所有用户
    print("\n当前所有用户:")
    all_users = CustomUser.objects.all()
    for user in all_users:
        print(f"- {user.username} (ID: {user.id}, 昵称: {user.nickname})")
    
    print("\n用户验证成功！用户已成功创建。")
except CustomUser.DoesNotExist:
    print("错误: 用户 'curluser' 不存在")