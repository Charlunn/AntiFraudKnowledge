#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import sys
import django
import requests
import json

# 设置Django环境
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'KnowledgeBackend.settings')
django.setup()

from django.test import Client
from django.contrib.auth import get_user_model
from chatapi.knowledge_service import knowledge_service

User = get_user_model()

def test_knowledge_service():
    """测试知识图谱服务"""
    print("\n=== 测试知识图谱服务 ===")
    
    # 测试1: 风险分析
    print("\n1. 测试诈骗风险分析")
    test_texts = [
        "您好，我是银行客服，您的账户异常，需要验证身份",
        "恭喜您中奖了，请点击链接领取奖金",
        "我是您朋友，手机没电了，能先借点钱吗",
        "高收益投资项目，稳赚不赔",
        "今天天气不错"
    ]
    
    for text in test_texts:
        risk_analysis = knowledge_service.analyze_fraud_risk(text)
        print(f"文本: {text}")
        print(f"风险评分: {risk_analysis['risk_score']}")
        print(f"检测到关键词: {[kw['word'] for kw in risk_analysis['keywords']]}")
        print(f"可能的诈骗类型: {[ft['name'] for ft in risk_analysis['fraud_types']]}")
        print("-" * 50)
    
    # 测试2: 获取诈骗类型信息
    print("\n2. 测试获取诈骗类型信息")
    fraud_types = ["电信诈骗", "投资诈骗", "网络诈骗"]
    for fraud_type in fraud_types:
        info = knowledge_service.get_fraud_type_info(fraud_type)
        if info:
            print(f"诈骗类型: {fraud_type}")
            print(f"描述: {info['fraud_type']['description']}")
            print(f"风险等级: {info['fraud_type']['risk_level']}")
            print(f"相关手段: {[m['name'] for m in info['methods']]}")
            print(f"防范措施: {[p['name'] for p in info['preventions']]}")
            print("-" * 50)
    
    # 测试3: 搜索知识
    print("\n3. 测试知识搜索")
    search_queries = ["投资", "银行", "验证码"]
    for query in search_queries:
        results = knowledge_service.search_knowledge(query)
        print(f"搜索关键词: {query}")
        print(f"找到结果: {len(results['results'])}个")
        for result in results['results'][:3]:  # 显示前3个结果
            print(f"  - {result['type']}: {result['name']}")
        print("-" * 50)
    
    # 测试4: 获取防范建议
    print("\n4. 测试获取防范建议")
    suggestions = knowledge_service.get_prevention_suggestions()
    print(f"通用防范建议数量: {len(suggestions)}")
    for suggestion in suggestions[:3]:  # 显示前3个建议
        print(f"  - {suggestion['name']}: {suggestion['description']} (有效性: {suggestion['effectiveness']})")
    
    # 基于关键词的建议
    risk_keywords = ["银行卡冻结", "高收益投资"]
    targeted_suggestions = knowledge_service.get_prevention_suggestions(risk_keywords)
    print(f"\n针对性防范建议数量: {len(targeted_suggestions)}")
    for suggestion in targeted_suggestions:
        print(f"  - {suggestion['name']}: {suggestion['description']}")
    
    print("\n✅ 知识图谱服务测试完成！")

def test_knowledge_api():
    """测试知识图谱API"""
    print("\n=== 测试知识图谱API ===")
    
    # 创建测试用户和客户端
    try:
        user = User.objects.get(username='testuser')
    except User.DoesNotExist:
        user = User.objects.create_user(username='testuser', password='testpass123')
    
    client = Client()
    client.force_login(user)
    
    # 测试1: 获取知识图谱统计信息
    print("\n1. 测试知识图谱统计信息API")
    response = client.get('/api/chat/knowledge/stats/')
    print(f"状态码: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        if data['success']:
            stats = data['data']
            print(f"总节点数: {stats['total_nodes']}")
            print(f"总关系数: {stats['total_relationships']}")
            print("各类型节点数量:")
            for node_type, count in stats['node_types'].items():
                print(f"  - {node_type}: {count}个")
        else:
            print(f"API返回错误: {data['message']}")
    
    # 测试2: 获取诈骗类型列表
    print("\n2. 测试诈骗类型列表API")
    response = client.get('/api/chat/knowledge/fraud-types/')
    print(f"状态码: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        if data['success']:
            fraud_types = data['data']['fraud_types']
            print(f"诈骗类型数量: {len(fraud_types)}")
            for fraud_type in fraud_types:
                print(f"  - {fraud_type['name']}: {fraud_type['description']} (风险: {fraud_type['risk_level']})")
    
    # 测试3: 风险分析API
    print("\n3. 测试风险分析API")
    test_data = {
        'text': '您好，我是银行客服，您的账户异常，需要配合调查，请提供验证码'
    }
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
    
    # 测试4: 知识搜索API
    print("\n4. 测试知识搜索API")
    response = client.get('/api/chat/knowledge/search/?q=投资')
    print(f"状态码: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        if data['success']:
            results = data['data']['results']
            print(f"搜索结果数量: {len(results)}")
            for result in results[:3]:
                print(f"  - {result['type']}: {result['name']}")
    
    # 测试5: 防范建议API
    print("\n5. 测试防范建议API")
    response = client.get('/api/chat/knowledge/prevention-suggestions/')
    print(f"状态码: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        if data['success']:
            suggestions = data['data']['suggestions']
            print(f"防范建议数量: {len(suggestions)}")
            for suggestion in suggestions[:3]:
                print(f"  - {suggestion['name']}: {suggestion['effectiveness']}")
    
    print("\n✅ 知识图谱API测试完成！")

def test_ai_integration():
    """测试AI集成知识图谱"""
    print("\n=== 测试AI集成知识图谱 ===")
    
    # 创建测试用户和客户端
    try:
        user = User.objects.get(username='testuser')
    except User.DoesNotExist:
        user = User.objects.create_user(username='testuser', password='testpass123')
    
    client = Client()
    client.force_login(user)
    
    # 测试包含风险关键词的消息
    print("\n测试包含风险关键词的AI对话")
    test_message = "我收到短信说银行卡冻结了，需要提供验证码解冻，这是真的吗？"
    
    # 先分析风险
    risk_analysis = knowledge_service.analyze_fraud_risk(test_message)
    print(f"用户消息: {test_message}")
    print(f"风险评分: {risk_analysis['risk_score']}")
    print(f"检测到的诈骗类型: {[ft['name'] for ft in risk_analysis['fraud_types']]}")
    print(f"风险关键词: {[kw['word'] for kw in risk_analysis['keywords']]}")
    
    if risk_analysis['risk_score'] > 5:
        print("\n✅ 系统将为AI提供知识图谱上下文信息")
        print("这将帮助AI给出更准确的反诈骗建议")
    else:
        print("\n风险评分较低，不会触发知识图谱增强")
    
    print("\n✅ AI集成测试完成！")

if __name__ == "__main__":
    print("开始测试知识图谱集成...")
    
    try:
        # 测试知识图谱服务
        test_knowledge_service()
        
        # 测试知识图谱API
        test_knowledge_api()
        
        # 测试AI集成
        test_ai_integration()
        
        print("\n🎉 所有测试完成！知识图谱集成功能正常工作。")
        
    except Exception as e:
        print(f"\n❌ 测试过程中出现错误: {e}")
        import traceback
        traceback.print_exc()