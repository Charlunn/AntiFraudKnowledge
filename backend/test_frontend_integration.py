#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
前端集成测试脚本
创建测试用户，获取认证token，并测试前端API调用
"""

import os
import sys
import requests
import json

# 设置Django环境（必须在导入Django模块之前）
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'KnowledgeBackend.settings')

import django
django.setup()

# 现在可以安全地导入Django相关模块
from django.contrib.auth import get_user_model
from django.test import Client
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

def create_test_user_and_token():
    """创建测试用户并获取JWT token"""
    print("=== 创建测试用户和认证token ===")
    
    try:
        # 创建或获取测试用户
        test_user, created = User.objects.get_or_create(
            username='frontend_test_user',
            defaults={
                'email': 'frontend_test@example.com',
                'first_name': 'Frontend',
                'last_name': 'Test'
            }
        )
        
        if created:
            test_user.set_password('testpass123')
            test_user.save()
            print("✅ 创建新的测试用户")
        else:
            print("✅ 使用现有测试用户")
        
        # 生成JWT token
        refresh = RefreshToken.for_user(test_user)
        access_token = str(refresh.access_token)
        
        print(f"✅ 生成JWT access token: {access_token[:20]}...")
        
        return {
            'user': test_user,
            'access_token': access_token,
            'refresh_token': str(refresh)
        }
        
    except Exception as e:
        print(f"❌ 创建用户和token失败: {str(e)}")
        return None

def test_api_with_session(user):
    """使用Django Session测试API调用"""
    print("\n=== 使用Session认证测试API调用 ===")
    
    try:
        # 使用Django测试客户端进行Session认证
        client = Client()
        
        # 登录用户
        login_success = client.login(username=user.username, password='testpass123')
        if not login_success:
            print("❌ 用户登录失败")
            return False
        
        print("✅ 用户Session登录成功")
        
        # 测试聊天API
        data = {
            'message': '你好，我想了解一下如何防范电信诈骗'
        }
        
        print("正在调用聊天API...")
        response = client.post(
            '/api/chat/',
            data=json.dumps(data),
            content_type='application/json'
        )
        
        print(f"响应状态码: {response.status_code}")
        
        if response.status_code == 200:
            response_data = response.json()
            print("✅ API调用成功")
            print(f"AI回复: {response_data.get('reply', '无回复')[:100]}...")
            print(f"风险评分: {response_data.get('score', '无评分')}")
            return True
        else:
            print(f"❌ API调用失败")
            print(f"响应内容: {response.content.decode()}")
            return False
            
    except Exception as e:
        print(f"❌ API测试失败: {str(e)}")
        return False

def test_api_without_token():
    """测试无token的API调用（应该失败）"""
    print("\n=== 测试无token的API调用 ===")
    
    try:
        data = {
            'message': '这是一个无认证的测试消息'
        }
        
        response = requests.post(
            'http://localhost:8000/api/chat/',
            json=data,
            timeout=10
        )
        
        if response.status_code == 401:
            print("✅ 无token请求正确返回401未授权")
            return True
        else:
            print(f"❌ 无token请求返回了意外的状态码: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ 无token测试失败: {str(e)}")
        return False

def test_reset_conversation(user):
    """测试重置对话功能"""
    print("\n=== 测试重置对话功能 ===")
    
    try:
        client = Client()
        
        # 登录用户
        client.login(username=user.username, password='testpass123')
        
        # 测试重置对话
        data = {
            'reset': True
        }
        
        response = client.post(
            '/api/chat/',
            data=json.dumps(data),
            content_type='application/json'
        )
        
        if response.status_code == 200:
            print("✅ 对话重置功能正常")
            return True
        else:
            print(f"❌ 对话重置失败: {response.status_code}")
            print(f"响应内容: {response.content.decode()}")
            return False
            
    except Exception as e:
        print(f"❌ 重置对话测试失败: {str(e)}")
        return False

def test_server_connectivity():
    """测试服务器连通性"""
    print("\n=== 测试服务器连通性 ===")
    
    try:
        # 测试Django服务器是否运行
        response = requests.get('http://localhost:8000/', timeout=5)
        print(f"Django服务器响应状态: {response.status_code}")
        
        if response.status_code in [200, 404]:  # 404也说明服务器在运行
            print("✅ Django服务器正在运行")
            return True
        else:
            print(f"❌ Django服务器响应异常: {response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ 无法连接到Django服务器，请确保服务器在运行")
        return False
    except Exception as e:
        print(f"❌ 服务器连通性测试失败: {str(e)}")
        return False

def main():
    """主测试函数"""
    print("开始前端集成测试...\n")
    
    results = []
    
    # 测试服务器连通性
    server_ok = test_server_connectivity()
    results.append(server_ok)
    
    if not server_ok:
        print("\n❌ 服务器连接失败，跳过其他测试")
        return False
    
    # 创建用户和token
    auth_data = create_test_user_and_token()
    if not auth_data:
        print("\n❌ 无法创建认证数据，跳过API测试")
        return False
    
    user = auth_data['user']
    access_token = auth_data['access_token']
    
    # 测试无token的API调用
    results.append(test_api_without_token())
    
    # 测试Session认证的API调用
    results.append(test_api_with_session(user))
    
    # 测试重置对话功能
    results.append(test_reset_conversation(user))
    
    # 输出测试结果
    print("\n=== 测试结果汇总 ===")
    test_names = [
        "服务器连通性",
        "无token认证检查", 
        "Session认证API调用",
        "对话重置功能"
    ]
    
    for i, (name, result) in enumerate(zip(test_names, results)):
        print(f"{name}: {'✅ 通过' if result else '❌ 失败'}")
    
    success_count = sum(results)
    total_count = len(results)
    
    print(f"\n总体结果: {success_count}/{total_count} 项测试通过")
    
    if success_count == total_count:
        print("🎉 所有前端集成测试通过！")
        print("\n📋 测试用户信息:")
        print(f"用户名: frontend_test_user")
        print(f"密码: testpass123")
        print(f"用户ID: {user.id}")
        print(f"JWT Token: {access_token[:30]}...")
    else:
        print("⚠️ 部分测试失败，请检查配置和代码")
    
    return success_count == total_count

if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)