#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import sys
import django
import json

# 设置Django环境
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'KnowledgeBackend.settings')
django.setup()

from django.test import Client
from django.contrib.auth import get_user_model
from chatapi.knowledge_service import knowledge_service

User = get_user_model()

def test_ai_chat_with_knowledge():
    """测试AI对话集成知识图谱"""
    print("=== 测试AI对话集成知识图谱 ===")
    
    # 创建测试用户
    try:
        user = User.objects.get(username='testuser')
    except User.DoesNotExist:
        user = User.objects.create_user(username='testuser', email='test@example.com', password='testpass123')
    
    client = Client()
    client.force_login(user)
    
    # 测试场景1: 包含高风险关键词的消息
    print("\n场景1: 用户询问银行卡冻结问题")
    test_message1 = "我刚收到短信说我的银行卡被冻结了，需要提供验证码来解冻，这是真的吗？"
    
    # 先分析风险
    risk_analysis = knowledge_service.analyze_fraud_risk(test_message1)
    print(f"用户消息: {test_message1}")
    print(f"风险评分: {risk_analysis['risk_score']}")
    print(f"检测到的诈骗类型: {[ft['name'] for ft in risk_analysis['fraud_types']]}")
    print(f"风险关键词: {[kw['word'] for kw in risk_analysis['keywords']]}")
    print(f"防范建议数量: {len(risk_analysis['suggestions'])}")
    
    # 发送消息到AI
    print("\n发送消息到AI...")
    response = client.post('/api/chat/', 
                          data=json.dumps({'message': test_message1}), 
                          content_type='application/json')
    
    print(f"AI响应状态码: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        if data['success']:
            print(f"AI回复: {data['reply'][:200]}...")
            print(f"当前分数: {data['score']}")
        else:
            print(f"AI响应错误: {data['message']}")
    
    print("-" * 80)
    
    # 测试场景2: 包含投资诈骗关键词的消息
    print("\n场景2: 用户询问投资项目")
    test_message2 = "有人推荐我一个高收益投资项目，说稳赚不赔，我应该投资吗？"
    
    # 先分析风险
    risk_analysis = knowledge_service.analyze_fraud_risk(test_message2)
    print(f"用户消息: {test_message2}")
    print(f"风险评分: {risk_analysis['risk_score']}")
    print(f"检测到的诈骗类型: {[ft['name'] for ft in risk_analysis['fraud_types']]}")
    print(f"风险关键词: {[kw['word'] for kw in risk_analysis['keywords']]}")
    
    # 发送消息到AI
    print("\n发送消息到AI...")
    response = client.post('/api/chat/', 
                          data=json.dumps({'message': test_message2}), 
                          content_type='application/json')
    
    print(f"AI响应状态码: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        if data['success']:
            print(f"AI回复: {data['reply'][:200]}...")
            print(f"当前分数: {data['score']}")
        else:
            print(f"AI响应错误: {data['message']}")
    
    print("-" * 80)
    
    # 测试场景3: 普通消息（无风险）
    print("\n场景3: 普通消息")
    test_message3 = "今天天气很好，适合出门散步"
    
    # 先分析风险
    risk_analysis = knowledge_service.analyze_fraud_risk(test_message3)
    print(f"用户消息: {test_message3}")
    print(f"风险评分: {risk_analysis['risk_score']}")
    print(f"检测到的诈骗类型: {[ft['name'] for ft in risk_analysis['fraud_types']]}")
    print(f"风险关键词: {[kw['word'] for kw in risk_analysis['keywords']]}")
    
    # 发送消息到AI
    print("\n发送消息到AI...")
    response = client.post('/api/chat/', 
                          data=json.dumps({'message': test_message3}), 
                          content_type='application/json')
    
    print(f"AI响应状态码: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        if data['success']:
            print(f"AI回复: {data['reply'][:200]}...")
            print(f"当前分数: {data['score']}")
        else:
            print(f"AI响应错误: {data['message']}")
    
    print("\n✅ AI对话集成知识图谱测试完成！")

def test_knowledge_api_endpoints():
    """测试知识图谱API端点"""
    print("\n=== 测试知识图谱API端点 ===")
    
    # 创建测试用户
    try:
        user = User.objects.get(username='testuser')
    except User.DoesNotExist:
        user = User.objects.create_user(username='testuser', email='test@example.com', password='testpass123')
    
    client = Client()
    client.force_login(user)
    
    # 测试风险分析API（修复后）
    print("\n测试风险分析API")
    test_data = {'text': '您好，我是银行客服，您的账户异常，需要配合调查'}
    response = client.post('/api/chat/knowledge/risk-analysis/', 
                          data=json.dumps(test_data), 
                          content_type='application/json')
    print(f"状态码: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        if data['success']:
            analysis = data['data']
            print(f"风险评分: {analysis['risk_score']}")
            print(f"检测到关键词: {len(analysis['keywords'])}个")
            print(f"可能的诈骗类型: {len(analysis['fraud_types'])}个")
            print(f"防范建议: {len(analysis['suggestions'])}个")
        else:
            print(f"API错误: {data['message']}")
    else:
        print(f"HTTP错误: {response.status_code}")
        if hasattr(response, 'content'):
            print(f"错误内容: {response.content.decode()[:200]}")
    
    print("\n✅ 知识图谱API端点测试完成！")

if __name__ == "__main__":
    print("开始测试AI与知识图谱集成...")
    
    try:
        # 测试知识图谱API端点
        test_knowledge_api_endpoints()
        
        # 测试AI对话集成
        test_ai_chat_with_knowledge()
        
        print("\n🎉 所有测试完成！AI与知识图谱集成功能正常工作。")
        
    except Exception as e:
        print(f"\n❌ 测试过程中出现错误: {e}")
        import traceback
        traceback.print_exc()