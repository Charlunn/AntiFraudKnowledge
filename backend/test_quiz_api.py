import requests
import json

# 测试获取题目列表API
def test_quiz_api():
    base_url = 'http://127.0.0.1:8000'
    
    # 1. 先注册一个新用户
    register_data = {
        'username': 'quiz_test_user',
        'password': 'testpass123',
        'password2': 'testpass123',
        'email': 'quiz_test@example.com'
    }
    
    print("=== 注册用户 ===")
    register_response = requests.post(f'{base_url}/api/users/register/', json=register_data)
    print(f"注册状态码: {register_response.status_code}")
    print(f"注册响应: {register_response.text}")
    
    # 2. 登录获取token
    login_data = {
        'username': 'quiz_test_user',
        'password': 'testpass123'
    }
    
    print("\n=== 用户登录 ===")
    login_response = requests.post(f'{base_url}/api/users/login/', json=login_data)
    print(f"登录状态码: {login_response.status_code}")
    print(f"登录响应: {login_response.text}")
    
    if login_response.status_code != 200:
        print("登录失败，无法继续测试")
        return
    
    try:
        token = login_response.json()['access']
        print(f"获取到token: {token[:20]}...")
    except KeyError:
        print("登录响应中没有access token")
        return
    
    # 3. 测试获取题目列表
    headers = {'Authorization': f'Bearer {token}'}
    
    print("\n=== 获取题目列表 ===")
    quiz_response = requests.get(f'{base_url}/api/quiz/questions/', headers=headers)
    print(f"题目列表状态码: {quiz_response.status_code}")
    print(f"题目列表响应: {quiz_response.text}")
    
    if quiz_response.status_code == 500:
        print("\n❌ 发现500错误！")
    elif quiz_response.status_code == 200:
        print("\n✅ 题目列表获取成功！")
        try:
            data = quiz_response.json()
            print(f"题目数量: {len(data)}")
        except:
            print("响应不是有效的JSON")

if __name__ == '__main__':
    test_quiz_api()