import os
import sys

sys.path.append('/app')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'KnowledgeBackend.settings')
import django
django.setup()

from django.test import Client
from users.models import CustomUser
import json

print("开始测试用户注册API...")

# 创建测试客户端
client = Client()

# 准备测试数据 - 这次包含了所有必需的字段
user_data = {
    'username': 'testapiuser',
    'nickname': '测试用户',  # 添加必需的nickname字段
    'email': 'testapiuser@example.com',
    'password': 'TestPass123!',
    'password2': 'TestPass123!'
}

# 确保测试用户不存在
try:
    test_user = CustomUser.objects.get(username='testapiuser')
    test_user.delete()
    print("已删除之前的测试用户")
except CustomUser.DoesNotExist:
    pass

# 发送POST请求到注册API
response = client.post('/api/users/register/', data=user_data, content_type='application/json')

# 打印响应状态码
print(f"响应状态码: {response.status_code}")

# 尝试获取响应内容
try:
    content = response.content.decode('utf-8')
    print(f"响应内容: {content}")
    
    # 尝试解析JSON内容
    try:
        json_data = json.loads(content)
        print(f"JSON解析成功: {json_data}")
    except json.JSONDecodeError:
        print("无法解析响应为JSON格式")
except Exception as e:
    print(f"获取响应内容时出错: {str(e)}")

# 验证用户是否成功创建
if response.status_code == 201:
    try:
        new_user = CustomUser.objects.get(username='testapiuser')
        print(f"用户创建成功: {new_user.username}, ID: {new_user.id}")
        print(f"用户昵称: {new_user.nickname}")
        
        # 验证密码是否正确
        password_valid = new_user.check_password('TestPass123!')
        print(f"密码验证: {password_valid}")
        
        # 打印当前用户总数
        total_users = CustomUser.objects.count()
        print(f"当前用户总数: {total_users}")
        
        print("API测试成功!")
    except CustomUser.DoesNotExist:
        print("测试失败: 用户未创建")
else:
    print(f"测试失败: 预期状态码201，实际状态码{response.status_code}")