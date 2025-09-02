import os
import sys
sys.path.append('/app')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'KnowledgeBackend.settings')
import django
django.setup()

# 测试用户注册API视图
from django.test import RequestFactory
from users.views import UserRegistrationView
from users.models import CustomUser

print("开始测试用户注册API视图...")

try:
    # 创建请求工厂
    factory = RequestFactory()
    
    # 创建注册请求数据
    request_data = {
        'username': 'apitestuser',
        'nickname': 'API Test User',
        'password': 'apitestpassword123',
        'password2': 'apitestpassword123'
    }
    
    # 创建POST请求
    request = factory.post('/api/users/register/', data=request_data, content_type='application/json')
    
    # 实例化视图
    view = UserRegistrationView.as_view()
    
    # 执行视图
    response = view(request)
    
    # 打印响应
    print(f"响应状态码: {response.status_code}")
    # 对于Django的Response对象，需要先确保内容已渲染
    content = response.content
    print(f"响应内容类型: {type(content)}")
    
    # 验证用户是否成功创建
    user_exists = CustomUser.objects.filter(username='apitestuser').exists()
    print(f"API创建的用户存在验证: {user_exists}")
    
    # 显示当前用户总数
    total_users = CustomUser.objects.count()
    print(f"当前用户总数: {total_users}")
    
except Exception as e:
    print(f"测试API失败: {e}")