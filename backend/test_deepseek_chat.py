#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
DeepSeek多轮对话功能测试脚本
测试基于阿里百炼平台deepseek-r1模型的多轮对话和分数更新功能
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
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

def create_test_user():
    """创建测试用户"""
    try:
        user, created = User.objects.get_or_create(
            username='deepseek_test_user',
            defaults={
                'email': 'deepseek_test@example.com',
                'first_name': 'DeepSeek',
                'last_name': 'Test'
            }
        )
        
        if created:
            user.set_password('testpass123')
            user.save()
            print("✅ 创建新的测试用户")
        else:
            print("✅ 使用现有测试用户")
            
        return user
        
    except Exception as e:
        print(f"❌ 创建用户失败: {str(e)}")
        return None

def test_multi_turn_conversation():
    """测试多轮对话功能"""
    print("\n=== 测试多轮对话功能 ===")
    
    user = create_test_user()
    if not user:
        return False
    
    client = Client()
    
    # 登录用户
    login_success = client.login(username=user.username, password='testpass123')
    if not login_success:
        print("❌ 用户登录失败")
        return False
    
    print("✅ 用户登录成功")
    
    # 重置对话
    print("\n--- 重置对话 ---")
    reset_response = client.post(
        '/api/chat/',
        data=json.dumps({'reset': True}),
        content_type='application/json'
    )
    
    if reset_response.status_code != 200:
        print(f"❌ 对话重置失败: {reset_response.status_code}")
        return False
    
    print("✅ 对话重置成功")
    
    # 测试对话轮次
    test_messages = [
        "你好，我想了解一下如何防范电信诈骗",
        "我刚才接到一个电话，说我的银行卡有问题，需要提供验证码",
        "好的，我明白了，我不会轻易相信陌生电话",
        "如果遇到这种情况，我应该怎么办？"
    ]
    
    conversation_results = []
    
    for i, message in enumerate(test_messages, 1):
        print(f"\n--- 第{i}轮对话 ---")
        print(f"用户消息: {message}")
        
        response = client.post(
            '/api/chat/',
            data=json.dumps({'message': message}),
            content_type='application/json'
        )
        
        if response.status_code == 200:
            data = response.json()
            ai_reply = data.get('reply', '')
            score = data.get('score', 0)
            
            print(f"AI回复: {ai_reply[:100]}...")
            print(f"当前分数: {score}")
            
            conversation_results.append({
                'round': i,
                'user_message': message,
                'ai_reply': ai_reply,
                'score': score,
                'success': True
            })
        else:
            print(f"❌ 第{i}轮对话失败: {response.status_code}")
            print(f"错误信息: {response.content.decode()}")
            conversation_results.append({
                'round': i,
                'success': False,
                'error': response.content.decode()
            })
    
    # 分析结果
    successful_rounds = [r for r in conversation_results if r.get('success', False)]
    
    if len(successful_rounds) >= 3:
        print(f"\n✅ 多轮对话测试成功 ({len(successful_rounds)}/{len(test_messages)} 轮成功)")
        
        # 检查分数变化
        scores = [r['score'] for r in successful_rounds]
        if len(set(scores)) > 1:
            print("✅ 分数在对话过程中有变化，分数更新逻辑正常")
            print(f"分数变化: {' -> '.join(map(str, scores))}")
        else:
            print("⚠️ 分数在对话过程中没有变化")
        
        return True
    else:
        print(f"❌ 多轮对话测试失败 ({len(successful_rounds)}/{len(test_messages)} 轮成功)")
        return False

def test_score_parsing():
    """测试分数解析功能"""
    print("\n=== 测试分数解析功能 ===")
    
    user = create_test_user()
    if not user:
        return False
    
    client = Client()
    client.login(username=user.username, password='testpass123')
    
    # 重置对话
    client.post('/api/chat/', data=json.dumps({'reset': True}), content_type='application/json')
    
    # 发送一条消息
    response = client.post(
        '/api/chat/',
        data=json.dumps({'message': '我想测试分数解析功能'}),
        content_type='application/json'
    )
    
    if response.status_code == 200:
        data = response.json()
        score = data.get('score')
        reply = data.get('reply', '')
        
        print(f"✅ 分数解析测试成功")
        print(f"解析后的分数: {score}")
        print(f"AI回复内容: {reply[:100]}...")
        
        # 检查分数是否在合理范围内
        if 0 <= score <= 100:
            print("✅ 分数在合理范围内 (0-100)")
            return True
        else:
            print(f"❌ 分数超出合理范围: {score}")
            return False
    else:
        print(f"❌ 分数解析测试失败: {response.status_code}")
        return False

def main():
    """主测试函数"""
    print("开始DeepSeek多轮对话功能测试...")
    
    results = []
    
    # 测试多轮对话
    results.append(test_multi_turn_conversation())
    
    # 测试分数解析
    results.append(test_score_parsing())
    
    # 输出测试结果
    test_names = [
        "多轮对话功能",
        "分数解析功能"
    ]
    
    print("\n=== 测试结果汇总 ===")
    for i, (name, result) in enumerate(zip(test_names, results)):
        status = "✅ 通过" if result else "❌ 失败"
        print(f"{name}: {status}")
    
    passed_count = sum(results)
    total_count = len(results)
    
    print(f"\n总体结果: {passed_count}/{total_count} 项测试通过")
    
    if passed_count == total_count:
        print("🎉 所有DeepSeek多轮对话功能测试通过！")
        return True
    else:
        print("⚠️ 部分测试失败，请检查配置和代码")
        return False

if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)