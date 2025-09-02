import os
import sys
import os

sys.path.append('/app')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'KnowledgeBackend.settings')
import django
django.setup()

from users.models import CustomUser
from users.serializers import UserRegistrationSerializer
from django.test import Client
import json

print("开始测试UserRegistrationSerializer和注册API...")

# 准备测试数据
user_data = {
    'username': 'testserializer_fixed',
    'nickname': '修复测试序列化器',
    'email': 'testserializer_fixed@example.com',
    'password': 'TestPass123!',
    'password2': 'TestPass123!'
}

# 确保测试用户不存在
try:
    test_user = CustomUser.objects.get(username='testserializer')
    test_user.delete()
    print("已删除之前的测试用户")
except CustomUser.DoesNotExist:
    pass

# 创建序列化器实例
serializer = UserRegistrationSerializer(data=user_data)

# 验证数据
if serializer.is_valid():
    print("序列化器验证成功!")
    # 尝试保存用户
    try:
        user = serializer.save()
        print(f"用户创建成功: {user.username}, ID: {user.id}")
        print(f"用户昵称: {user.nickname}")
        print(f"用户邮箱: {user.email}")

        # 验证密码是否正确
        password_valid = user.check_password('TestPass123!')
        print(f"密码验证: {password_valid}")

        # 打印当前用户总数
total_users = CustomUser.objects.count()
print(f"当前用户总数: {total_users}")

# 测试API端点
print("\n测试注册API端点...")
client = Client()

# 发送POST请求到注册API
response = client.post('/api/users/register/', data=json.dumps(user_data), content_type='application/json')

# 打印响应状态码
print(f"API响应状态码: {response.status_code}")

# 尝试获取响应内容
try:
    content = response.content.decode('utf-8')
    print(f"API响应内容: {content}")

    # 尝试解析JSON内容
    try:
        json_data = json.loads(content)
        print(f"JSON解析成功: {json_data}")
    except json.JSONDecodeError:
        print("无法解析响应为JSON格式")
except Exception as e:
    print(f"获取响应内容时出错: {str(e)}")

print("测试完成!")
        print(f"当前用户总数: {total_users}")

        print("序列化器测试成功!")
    except Exception as e:
        print(f"保存用户时出错: {str(e)}")
else:
    print("序列化器验证失败!")
    print(f"错误信息: {serializer.errors}")