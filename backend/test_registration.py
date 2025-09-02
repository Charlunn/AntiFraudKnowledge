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

print("===== 开始注册功能测试 =====")

# 准备测试数据
test_username = 'testuser_new'
user_data = {
    'username': test_username,
    'nickname': '新测试用户',
    'password': 'TestPass123!',
    'password2': 'TestPass123!'
}

print(f"测试数据: {user_data}")

# 确保测试用户不存在
try:
    test_user = CustomUser.objects.get(username=test_username)
    test_user.delete()
    print(f"已删除之前的测试用户: {test_username}")
except CustomUser.DoesNotExist:
    print(f"测试用户 {test_username} 不存在，无需删除")

# 1. 测试序列化器
try:
    print("\n1. 测试UserRegistrationSerializer序列化器...")
    serializer = UserRegistrationSerializer(data=user_data)
    
    if serializer.is_valid():
        print("✅ 序列化器验证成功!")
        user = serializer.save()
        print(f"✅ 用户创建成功: {user.username}, ID: {user.id}")
        print(f"   昵称: {user.nickname}")
        
        # 验证密码
        password_valid = user.check_password('TestPass123!')
        print(f"   密码验证: {'✅ 正确' if password_valid else '❌ 错误'}")
    else:
        print("❌ 序列化器验证失败!")
        print(f"   错误信息: {serializer.errors}")
except Exception as e:
    print(f"❌ 序列化器测试失败: {str(e)}")

# 2. 测试API端点
try:
    print("\n2. 测试注册API端点...")
    client = Client()
    
    # 发送POST请求到注册API
    response = client.post('/api/users/register/', 
                          data=json.dumps(user_data), 
                          content_type='application/json')
    
    print(f"✅ API响应状态码: {response.status_code}")
    
    # 尝试获取响应内容
    content = response.content.decode('utf-8')
    print(f"✅ API响应内容: {content}")
    
    # 尝试解析JSON内容
    try:
        json_data = json.loads(content)
        print(f"✅ JSON解析成功: {json_data}")
    except json.JSONDecodeError:
        print("❌ 无法解析响应为JSON格式")
except Exception as e:
    print(f"❌ API测试失败: {str(e)}")

print("\n===== 测试完成 =====")