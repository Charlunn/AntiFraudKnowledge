#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
AI API测试脚本
测试阿里百炼平台API集成和聊天功能
"""

import os
import sys
import django
import requests
from django.contrib.auth import get_user_model
from django.test import Client
from django.urls import reverse
import json

# 设置Django环境
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'KnowledgeBackend.settings')
django.setup()

User = get_user_model()

def test_openai_client():
    """测试OpenAI客户端配置"""
    print("=== 测试OpenAI客户端配置 ===")
    
    try:
        from openai import OpenAI
        from dotenv import load_dotenv
        
        # 加载环境变量
        load_dotenv()
        
        api_key = os.getenv('DASHSCOPE_API_KEY')
        if not api_key:
            print("❌ DASHSCOPE_API_KEY 未设置")
            return False
            
        print(f"✅ API密钥已配置: {api_key[:10]}...")
        
        # 创建客户端
        client = OpenAI(
            api_key=api_key,
            base_url="https://dashscope.aliyuncs.com/compatible-mode/v1"
        )
        
        # 测试简单对话
        print("正在测试API调用...")
        response = client.chat.completions.create(
            model="deepseek-r1",
            messages=[
                {"role": "user", "content": "你好，请简单介绍一下自己"}
            ]
        )
        
        print("✅ API调用成功")
        print(f"AI回复: {response.choices[0].message.content[:100]}...")
        
        # 如果有思考过程，也打印出来
        if hasattr(response.choices[0].message, 'reasoning_content') and response.choices[0].message.reasoning_content:
            print(f"思考过程: {response.choices[0].message.reasoning_content[:100]}...")
            
        return True
        
    except Exception as e:
        print(f"❌ OpenAI客户端测试失败: {str(e)}")
        return False

def test_django_chat_api():
    """测试Django聊天API"""
    print("\n=== 测试Django聊天API ===")
    
    try:
        # 创建测试用户
        test_user, created = User.objects.get_or_create(
            username='test_ai_user',
            defaults={
                'email': 'test@example.com',
                'first_name': 'Test',
                'last_name': 'User'
            }
        )
        
        if created:
            test_user.set_password('testpass123')
            test_user.save()
            print("✅ 创建测试用户成功")
        else:
            print("✅ 使用现有测试用户")
        
        # 创建Django测试客户端
        client = Client()
        
        # 登录用户
        login_success = client.login(username='test_ai_user', password='testpass123')
        if not login_success:
            print("❌ 用户登录失败")
            return False
            
        print("✅ 用户登录成功")
        
        # 测试聊天API
        chat_data = {
            'message': '你好，我想了解一下电信诈骗的常见手段'
        }
        
        print("正在测试聊天API...")
        response = client.post(
            '/api/chat/',
            data=json.dumps(chat_data),
            content_type='application/json'
        )
        
        print(f"响应状态码: {response.status_code}")
        
        if response.status_code == 200:
            response_data = response.json()
            print("✅ 聊天API调用成功")
            print(f"AI回复: {response_data.get('reply', '无回复')[:100]}...")
            print(f"风险评分: {response_data.get('score', '无评分')}")
            return True
        else:
            print(f"❌ 聊天API调用失败")
            print(f"响应内容: {response.content.decode()}")
            return False
            
    except Exception as e:
        print(f"❌ Django聊天API测试失败: {str(e)}")
        return False

def test_chat_api_with_reset():
    """测试聊天API的重置功能"""
    print("\n=== 测试聊天重置功能 ===")
    
    try:
        client = Client()
        
        # 登录
        client.login(username='test_ai_user', password='testpass123')
        
        # 测试重置对话
        reset_data = {
            'reset': True
        }
        
        response = client.post(
            '/api/chat/',
            data=json.dumps(reset_data),
            content_type='application/json'
        )
        
        if response.status_code == 200:
            print("✅ 对话重置功能正常")
            return True
        else:
            print(f"❌ 对话重置失败: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ 对话重置测试失败: {str(e)}")
        return False

def main():
    """主测试函数"""
    print("开始AI API功能测试...\n")
    
    results = []
    
    # 测试OpenAI客户端
    results.append(test_openai_client())
    
    # 测试Django聊天API
    results.append(test_django_chat_api())
    
    # 测试重置功能
    results.append(test_chat_api_with_reset())
    
    # 输出测试结果
    print("\n=== 测试结果汇总 ===")
    print(f"OpenAI客户端测试: {'✅ 通过' if results[0] else '❌ 失败'}")
    print(f"Django聊天API测试: {'✅ 通过' if results[1] else '❌ 失败'}")
    print(f"对话重置功能测试: {'✅ 通过' if results[2] else '❌ 失败'}")
    
    success_count = sum(results)
    total_count = len(results)
    
    print(f"\n总体结果: {success_count}/{total_count} 项测试通过")
    
    if success_count == total_count:
        print("🎉 所有AI API功能测试通过！")
    else:
        print("⚠️ 部分测试失败，请检查配置和代码")
    
    return success_count == total_count

if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)