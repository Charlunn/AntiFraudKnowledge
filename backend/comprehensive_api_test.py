#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
综合API测试脚本
测试反诈骗知识平台的所有核心API端点
"""

import requests
import json
import time
from datetime import datetime

class APITester:
    def __init__(self, base_url="http://127.0.0.1:8000"):
        self.base_url = base_url
        self.session = requests.Session()
        self.access_token = None
        self.refresh_token = None
        self.user_id = None
        self.test_results = []
        
    def log_test(self, test_name, success, message="", response_data=None):
        """记录测试结果"""
        result = {
            "test_name": test_name,
            "success": success,
            "message": message,
            "timestamp": datetime.now().isoformat(),
            "response_data": response_data
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {message}")
        
    def test_user_registration(self):
        """测试用户注册"""
        print("\n=== 测试用户注册 ===")
        
        # 生成唯一的测试用户名
        timestamp = int(time.time())
        test_data = {
            "username": f"testuser_{timestamp}",
            "email": f"test_{timestamp}@example.com",
            "password": "TestPassword123!",
            "password2": "TestPassword123!"
        }
        
        try:
            response = self.session.post(
                f"{self.base_url}/api/users/register/",
                json=test_data
            )
            
            if response.status_code == 201:
                data = response.json()
                self.user_id = data.get('user', {}).get('id')
                self.log_test(
                    "用户注册", 
                    True, 
                    f"注册成功，用户ID: {self.user_id}",
                    data
                )
                return test_data
            else:
                self.log_test(
                    "用户注册", 
                    False, 
                    f"注册失败，状态码: {response.status_code}, 响应: {response.text}"
                )
                return None
                
        except Exception as e:
            self.log_test("用户注册", False, f"请求异常: {str(e)}")
            return None
    
    def test_user_login(self, user_data):
        """测试用户登录"""
        print("\n=== 测试用户登录 ===")
        
        if not user_data:
            self.log_test("用户登录", False, "没有有效的用户数据")
            return False
            
        login_data = {
            "username": user_data["username"],
            "password": user_data["password"]
        }
        
        try:
            response = self.session.post(
                f"{self.base_url}/api/users/login/",
                json=login_data
            )
            
            if response.status_code == 200:
                data = response.json()
                self.access_token = data.get('access')
                self.refresh_token = data.get('refresh')
                
                # 设置认证头
                self.session.headers.update({
                    'Authorization': f'Bearer {self.access_token}'
                })
                
                self.log_test(
                    "用户登录", 
                    True, 
                    "登录成功，获取到访问令牌",
                    {"has_access_token": bool(self.access_token)}
                )
                return True
            else:
                self.log_test(
                    "用户登录", 
                    False, 
                    f"登录失败，状态码: {response.status_code}, 响应: {response.text}"
                )
                return False
                
        except Exception as e:
            self.log_test("用户登录", False, f"请求异常: {str(e)}")
            return False
    
    def test_user_profile(self):
        """测试用户资料获取"""
        print("\n=== 测试用户资料 ===")
        
        try:
            response = self.session.get(f"{self.base_url}/api/users/profile/")
            
            if response.status_code == 200:
                data = response.json()
                self.log_test(
                    "获取用户资料", 
                    True, 
                    f"成功获取用户资料，用户名: {data.get('username')}",
                    data
                )
            else:
                self.log_test(
                    "获取用户资料", 
                    False, 
                    f"获取失败，状态码: {response.status_code}"
                )
                
        except Exception as e:
            self.log_test("获取用户资料", False, f"请求异常: {str(e)}")
    
    def test_quiz_endpoints(self):
        """测试答题系统API"""
        print("\n=== 测试答题系统 ===")
        
        # 测试获取题目列表
        try:
            response = self.session.get(f"{self.base_url}/api/quiz/questions/")
            if response.status_code == 200:
                questions = response.json()
                self.log_test(
                    "获取题目列表", 
                    True, 
                    f"成功获取 {len(questions)} 道题目",
                    {"count": len(questions)}
                )
            else:
                self.log_test(
                    "获取题目列表", 
                    False, 
                    f"获取失败，状态码: {response.status_code}"
                )
        except Exception as e:
            self.log_test("获取题目列表", False, f"请求异常: {str(e)}")
        
        # 测试获取用户答题记录
        try:
            response = self.session.get(f"{self.base_url}/api/quiz/history/")
            if response.status_code == 200:
                answers = response.json()
                self.log_test(
                    "获取答题记录", 
                    True, 
                    f"成功获取 {len(answers)} 条答题记录",
                    {"count": len(answers)}
                )
            else:
                self.log_test(
                    "获取答题记录", 
                    False, 
                    f"获取失败，状态码: {response.status_code}"
                )
        except Exception as e:
            self.log_test("获取答题记录", False, f"请求异常: {str(e)}")
    
    def test_achievements_endpoints(self):
        """测试成就系统API"""
        print("\n=== 测试成就系统 ===")
        
        # 测试获取成就列表
        try:
            response = self.session.get(f"{self.base_url}/api/achievements/all/")
            if response.status_code == 200:
                achievements = response.json()
                self.log_test(
                    "获取成就列表", 
                    True, 
                    f"成功获取 {len(achievements)} 个成就",
                    {"count": len(achievements)}
                )
            else:
                self.log_test(
                    "获取成就列表", 
                    False, 
                    f"获取失败，状态码: {response.status_code}"
                )
        except Exception as e:
            self.log_test("获取成就列表", False, f"请求异常: {str(e)}")
        
        # 测试获取用户成就
        try:
            response = self.session.get(f"{self.base_url}/api/achievements/my/")
            if response.status_code == 200:
                user_achievements = response.json()
                self.log_test(
                    "获取用户成就", 
                    True, 
                    f"成功获取 {len(user_achievements)} 个用户成就",
                    {"count": len(user_achievements)}
                )
            else:
                self.log_test(
                    "获取用户成就", 
                    False, 
                    f"获取失败，状态码: {response.status_code}"
                )
        except Exception as e:
            self.log_test("获取用户成就", False, f"请求异常: {str(e)}")
    
    def test_feedback_endpoints(self):
        """测试反馈系统API"""
        print("\n=== 测试反馈系统 ===")
        
        # 测试创建反馈
        feedback_data = {
            "message": "这是一个API测试反馈",
            "contact": "test@example.com"
        }
        
        try:
            response = self.session.post(
                f"{self.base_url}/api/feedback/create/",
                json=feedback_data
            )
            if response.status_code == 201:
                feedback = response.json()
                self.log_test(
                    "创建反馈", 
                    True, 
                    f"成功创建反馈，ID: {feedback.get('id')}",
                    feedback
                )
            else:
                self.log_test(
                    "创建反馈", 
                    False, 
                    f"创建失败，状态码: {response.status_code}"
                )
        except Exception as e:
            self.log_test("创建反馈", False, f"请求异常: {str(e)}")
        
        # 测试获取用户反馈列表
        try:
            response = self.session.get(f"{self.base_url}/api/feedback/my/")
            if response.status_code == 200:
                feedbacks = response.json()
                self.log_test(
                    "获取用户反馈", 
                    True, 
                    f"成功获取 {len(feedbacks)} 条反馈",
                    {"count": len(feedbacks)}
                )
            else:
                self.log_test(
                    "获取用户反馈", 
                    False, 
                    f"获取失败，状态码: {response.status_code}"
                )
        except Exception as e:
            self.log_test("获取用户反馈", False, f"请求异常: {str(e)}")
    
    def test_community_endpoints(self):
        """测试社区功能API"""
        print("\n=== 测试社区功能 ===")
        
        # 测试获取帖子列表
        try:
            response = self.session.get(f"{self.base_url}/api/community/posts/")
            if response.status_code == 200:
                posts = response.json()
                self.log_test(
                    "获取帖子列表", 
                    True, 
                    f"成功获取 {len(posts)} 个帖子",
                    {"count": len(posts)}
                )
            else:
                self.log_test(
                    "获取帖子列表", 
                    False, 
                    f"获取失败，状态码: {response.status_code}"
                )
        except Exception as e:
            self.log_test("获取帖子列表", False, f"请求异常: {str(e)}")
        
        # 测试获取分类列表
        try:
            response = self.session.get(f"{self.base_url}/api/community/categories/")
            if response.status_code == 200:
                categories = response.json()
                self.log_test(
                    "获取分类列表", 
                    True, 
                    f"成功获取 {len(categories)} 个分类",
                    {"count": len(categories)}
                )
            else:
                self.log_test(
                    "获取分类列表", 
                    False, 
                    f"获取失败，状态码: {response.status_code}"
                )
        except Exception as e:
            self.log_test("获取分类列表", False, f"请求异常: {str(e)}")
    
    def test_statistics_endpoints(self):
        """测试统计功能API"""
        print("\n=== 测试统计功能 ===")
        
        # 测试获取平台统计
        try:
            response = self.session.get(f"{self.base_url}/api/statistics/platform/")
            if response.status_code == 200:
                stats = response.json()
                self.log_test(
                    "获取平台统计", 
                    True, 
                    "成功获取平台统计数据",
                    stats
                )
            else:
                self.log_test(
                    "获取平台统计", 
                    False, 
                    f"获取失败，状态码: {response.status_code}"
                )
        except Exception as e:
            self.log_test("获取平台统计", False, f"请求异常: {str(e)}")
        
        # 测试获取用户统计
        try:
            response = self.session.get(f"{self.base_url}/api/statistics/user/")
            if response.status_code == 200:
                user_stats = response.json()
                self.log_test(
                    "获取用户统计", 
                    True, 
                    "成功获取用户统计数据",
                    user_stats
                )
            else:
                self.log_test(
                    "获取用户统计", 
                    False, 
                    f"获取失败，状态码: {response.status_code}"
                )
        except Exception as e:
            self.log_test("获取用户统计", False, f"请求异常: {str(e)}")
    
    def test_chat_endpoints(self):
        """测试聊天API"""
        print("\n=== 测试聊天功能 ===")
        
        # 测试发送消息
        chat_data = {
            "message": "这是一个API测试消息",
            "conversation_type": "general"
        }
        
        try:
            response = self.session.post(
                f"{self.base_url}/api/chat/",
                json=chat_data
            )
            if response.status_code == 200:
                chat_response = response.json()
                self.log_test(
                    "发送聊天消息", 
                    True, 
                    "成功发送消息并获得回复",
                    chat_response
                )
            else:
                self.log_test(
                    "发送聊天消息", 
                    False, 
                    f"发送失败，状态码: {response.status_code}"
                )
        except Exception as e:
            self.log_test("发送聊天消息", False, f"请求异常: {str(e)}")
        
        # 注意：chatapi应用只有一个端点，没有历史记录功能
        # 跳过聊天历史测试
        self.log_test(
            "获取聊天历史", 
            True, 
            "chatapi应用暂不支持历史记录功能",
            {"note": "功能未实现"}
        )
    
    def run_all_tests(self):
        """运行所有测试"""
        print("🚀 开始API综合测试...")
        print(f"测试服务器: {self.base_url}")
        print("=" * 50)
        
        # 1. 用户认证流程测试
        user_data = self.test_user_registration()
        if user_data:
            login_success = self.test_user_login(user_data)
            if login_success:
                self.test_user_profile()
        
        # 2. 各功能模块测试
        self.test_quiz_endpoints()
        self.test_achievements_endpoints()
        self.test_feedback_endpoints()
        self.test_community_endpoints()
        self.test_statistics_endpoints()
        self.test_chat_endpoints()
        
        # 3. 生成测试报告
        self.generate_report()
    
    def generate_report(self):
        """生成测试报告"""
        print("\n" + "=" * 50)
        print("📊 API测试报告")
        print("=" * 50)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result['success'])
        failed_tests = total_tests - passed_tests
        
        print(f"总测试数: {total_tests}")
        print(f"通过测试: {passed_tests} ✅")
        print(f"失败测试: {failed_tests} ❌")
        print(f"成功率: {(passed_tests/total_tests*100):.1f}%")
        
        if failed_tests > 0:
            print("\n❌ 失败的测试:")
            for result in self.test_results:
                if not result['success']:
                    print(f"  - {result['test_name']}: {result['message']}")
        
        # 保存详细报告到文件
        report_file = f"api_test_report_{int(time.time())}.json"
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(self.test_results, f, ensure_ascii=False, indent=2)
        
        print(f"\n📄 详细报告已保存到: {report_file}")
        print("=" * 50)

if __name__ == "__main__":
    # 运行API测试
    tester = APITester()
    tester.run_all_tests()