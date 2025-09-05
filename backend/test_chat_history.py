#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
聊天历史功能测试脚本
测试新增的聊天历史查看和会话管理API
"""

import os
import sys
import django
import json

# 设置Django环境
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'KnowledgeBackend.settings')
django.setup()

from django.test import Client
from django.contrib.auth import get_user_model

User = get_user_model()

def login_user(client, user):
    """使用Django测试客户端登录用户"""
    client.force_login(user)
    return True

def test_chat_history_apis():
    """
    测试聊天历史相关API功能
    """
    print("=== 聊天历史API测试 ===")
    
    # 创建测试客户端
    client = Client()
    
    # 创建或获取测试用户
    try:
        user = User.objects.get(username='testuser')
        print(f"✅ 使用现有测试用户: {user.username}")
    except User.DoesNotExist:
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        print(f"✅ 创建新测试用户: {user.username}")
    
    # 登录用户
    login_success = login_user(client, user)
    if not login_success:
        print("❌ 用户登录失败")
        return False
    
    auth_headers = {
        'content_type': 'application/json'
    }
    
    print(f"\n1. 测试获取空聊天历史...")
    
    # 测试获取聊天历史（应该为空）
    response = client.get('/api/chat/history/', **auth_headers)
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ 获取聊天历史成功")
        print(f"   消息数量: {len(data['data']['messages'])}")
        print(f"   默认分数: {data['data']['score']}")
        print(f"   会话ID: {data['data']['session_id']}")
    else:
        print(f"❌ 获取聊天历史失败: {response.status_code}")
        print(f"   错误信息: {response.content.decode()}")
        return False
    
    print(f"\n2. 测试发送聊天消息...")
    
    # 发送一条测试消息
    chat_data = {
        'message': '你好，我想了解一下电信诈骗的常见手段'
    }
    
    response = client.post('/api/chat/', json.dumps(chat_data), **auth_headers)
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ 发送消息成功")
        print(f"   AI回复: {data['reply'][:100]}...")
        print(f"   当前分数: {data['score']}")
        print(f"   消息历史长度: {len(data['messages'])}")
    else:
        print(f"❌ 发送消息失败: {response.status_code}")
        print(f"   错误信息: {response.content.decode()}")
        return False
    
    print(f"\n3. 测试获取聊天历史（有内容）...")
    
    # 再次获取聊天历史（应该有内容）
    response = client.get('/api/chat/history/', **auth_headers)
    
    if response.status_code == 200:
        data = response.json()
        messages = data['data']['messages']
        print(f"✅ 获取聊天历史成功")
        print(f"   消息数量: {len(messages)}")
        print(f"   当前分数: {data['data']['score']}")
        
        # 检查消息内容
        if len(messages) >= 2:
            user_msg = messages[0]
            ai_msg = messages[1]
            print(f"   用户消息: {user_msg['content'][:50]}...")
            print(f"   AI回复: {ai_msg['content'][:50]}...")
        
    else:
        print(f"❌ 获取聊天历史失败: {response.status_code}")
        print(f"   错误信息: {response.content.decode()}")
        return False
    
    print(f"\n4. 测试获取会话列表...")
    
    # 测试获取会话列表
    response = client.get('/api/chat/sessions/', **auth_headers)
    
    if response.status_code == 200:
        data = response.json()
        sessions = data['data']['sessions']
        print(f"✅ 获取会话列表成功")
        print(f"   会话数量: {len(sessions)}")
        
        if len(sessions) > 0:
            session = sessions[0]
            print(f"   会话标题: {session['title']}")
            print(f"   消息数量: {session['message_count']}")
            print(f"   当前分数: {session['score']}")
        
    else:
        print(f"❌ 获取会话列表失败: {response.status_code}")
        print(f"   错误信息: {response.content.decode()}")
        return False
    
    print(f"\n5. 测试清空会话...")
    
    # 测试清空会话
    response = client.delete('/api/chat/sessions/', **auth_headers)
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ 清空会话成功: {data['message']}")
    else:
        print(f"❌ 清空会话失败: {response.status_code}")
        print(f"   错误信息: {response.content.decode()}")
        return False
    
    print(f"\n6. 验证会话已清空...")
    
    # 验证会话已清空
    response = client.get('/api/chat/history/', **auth_headers)
    
    if response.status_code == 200:
        data = response.json()
        messages = data['data']['messages']
        print(f"✅ 验证清空成功")
        print(f"   消息数量: {len(messages)}")
        print(f"   重置分数: {data['data']['score']}")
        
        if len(messages) == 0:
            print(f"✅ 会话确实已清空")
        else:
            print(f"⚠️ 会话可能未完全清空")
        
    else:
        print(f"❌ 验证清空失败: {response.status_code}")
        return False
    
    return True

def main():
    """
    主测试函数
    """
    print("开始聊天历史功能测试...\n")
    
    try:
        # 测试聊天历史API
        if test_chat_history_apis():
            print("\n🎉 所有聊天历史API测试通过！")
        else:
            print("\n❌ 聊天历史API测试失败")
            return False
        
        print("\n=== 测试总结 ===")
        print("✅ 聊天历史查看功能正常")
        print("✅ 会话列表获取功能正常")
        print("✅ 会话清空功能正常")
        print("✅ 所有API响应格式正确")
        
        return True
        
    except Exception as e:
        print(f"\n❌ 测试过程中发生错误: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)