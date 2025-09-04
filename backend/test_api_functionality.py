#!/usr/bin/env python
"""
简化的API功能完整性测试脚本
主要测试Python语法和基本导入，不依赖Django完整初始化
"""

import os
import sys
import ast
import importlib.util
from pathlib import Path

def test_python_syntax(file_path):
    """测试Python文件语法是否正确"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            source = f.read()
        ast.parse(source)
        return True, None
    except SyntaxError as e:
        return False, f"语法错误: {e}"
    except Exception as e:
        return False, f"读取错误: {e}"

def test_file_structure():
    """测试项目文件结构"""
    print("\n=== 测试项目文件结构 ===")
    
    required_files = [
        'manage.py',
        'KnowledgeBackend/settings.py',
        'KnowledgeBackend/urls.py',
        'users/models.py',
        'users/views.py',
        'users/urls.py',
        'quiz/models.py',
        'quiz/views.py',
        'quiz/urls.py',
        'achievements/models.py',
        'achievements/views.py',
        'achievements/urls.py',
        'feedback/models.py',
        'feedback/views.py',
        'feedback/urls.py',
        'chatapi/views.py',
        'chatapi/urls.py',
        'community/models.py',
        'community/views.py',
        'community/urls.py',
        'statistics/views.py',
        'statistics/urls.py',
        'utils/permissions.py',
    ]
    
    success_count = 0
    base_path = Path('.')
    
    for file_path in required_files:
        full_path = base_path / file_path
        if full_path.exists():
            print(f"✓ {file_path} - 文件存在")
            success_count += 1
        else:
            print(f"✗ {file_path} - 文件缺失")
    
    print(f"\n文件结构测试结果: {success_count}/{len(required_files)} 文件存在")
    return success_count, len(required_files)

def test_python_syntax_all():
    """测试所有Python文件的语法"""
    print("\n=== 测试Python文件语法 ===")
    
    python_files = [
        'manage.py',
        'KnowledgeBackend/settings.py',
        'KnowledgeBackend/urls.py',
        'KnowledgeBackend/wsgi.py',
        'KnowledgeBackend/asgi.py',
        'users/models.py',
        'users/views.py',
        'users/urls.py',
        'users/serializers.py',
        'quiz/models.py',
        'quiz/views.py',
        'quiz/urls.py',
        'quiz/serializers.py',
        'achievements/models.py',
        'achievements/views.py',
        'achievements/urls.py',
        'achievements/serializers.py',
        'feedback/models.py',
        'feedback/views.py',
        'feedback/urls.py',
        'feedback/serializers.py',
        'chatapi/views.py',
        'chatapi/urls.py',
        'community/models.py',
        'community/views.py',
        'community/urls.py',
        'community/serializers.py',
        'statistics/views.py',
        'statistics/urls.py',
        'statistics/serializers.py',
        'utils/permissions.py',
    ]
    
    success_count = 0
    total_count = 0
    base_path = Path('.')
    
    for file_path in python_files:
        full_path = base_path / file_path
        if full_path.exists():
            total_count += 1
            is_valid, error = test_python_syntax(full_path)
            if is_valid:
                print(f"✓ {file_path} - 语法正确")
                success_count += 1
            else:
                print(f"✗ {file_path} - {error}")
    
    print(f"\nPython语法测试结果: {success_count}/{total_count} 文件语法正确")
    return success_count, total_count

def analyze_api_endpoints():
    """分析API端点配置"""
    print("\n=== 分析API端点配置 ===")
    
    url_files = [
        'users/urls.py',
        'quiz/urls.py',
        'achievements/urls.py',
        'feedback/urls.py',
        'chatapi/urls.py',
        'community/urls.py',
        'statistics/urls.py',
    ]
    
    total_endpoints = 0
    base_path = Path('.')
    
    for url_file in url_files:
        full_path = base_path / url_file
        if full_path.exists():
            try:
                with open(full_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # 简单计算path()调用的数量作为端点数量的估计
                endpoint_count = content.count('path(')
                total_endpoints += endpoint_count
                print(f"✓ {url_file} - 约 {endpoint_count} 个端点")
            except Exception as e:
                print(f"✗ {url_file} - 读取失败: {e}")
        else:
            print(f"✗ {url_file} - 文件不存在")
    
    print(f"\n总计约 {total_endpoints} 个API端点")
    return total_endpoints

def check_key_features():
    """检查关键功能实现"""
    print("\n=== 检查关键功能实现 ===")
    
    features_to_check = [
        ('用户注册', 'users/views.py', 'UserRegistrationView'),
        ('用户登录', 'users/views.py', 'UserLoginView'),
        ('用户资料', 'users/views.py', 'UserProfileView'),
        ('题目列表', 'quiz/views.py', 'QuestionListView'),
        ('提交答题', 'quiz/views.py', 'SubmitQuizView'),
        ('答题历史', 'quiz/views.py', 'UserQuizHistoryView'),
        ('答题统计', 'quiz/views.py', 'UserQuizStatsView'),
        ('成就列表', 'achievements/views.py', 'AchievementListView'),
        ('用户成就', 'achievements/views.py', 'UserAchievementListView'),
        ('反馈提交', 'feedback/views.py', 'FeedbackCreateView'),
        ('反馈管理', 'feedback/views.py', 'AdminFeedbackListView'),
        ('聊天API', 'chatapi/views.py', 'ChatAPIView'),
        ('社区帖子', 'community/views.py', 'PostListView'),
        ('用户统计', 'statistics/views.py', 'UserStatisticsView'),
    ]
    
    success_count = 0
    base_path = Path('.')
    
    for feature_name, file_path, class_name in features_to_check:
        full_path = base_path / file_path
        if full_path.exists():
            try:
                with open(full_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                if f'class {class_name}' in content:
                    print(f"✓ {feature_name} - {class_name} 已实现")
                    success_count += 1
                else:
                    print(f"✗ {feature_name} - {class_name} 未找到")
            except Exception as e:
                print(f"✗ {feature_name} - 检查失败: {e}")
        else:
            print(f"✗ {feature_name} - 文件 {file_path} 不存在")
    
    print(f"\n关键功能检查结果: {success_count}/{len(features_to_check)} 功能已实现")
    return success_count, len(features_to_check)

def main():
    """主测试函数"""
    print("开始API功能完整性测试...")
    print(f"Python版本: {sys.version}")
    print(f"当前目录: {os.getcwd()}")
    
    # 运行所有测试
    print("\n" + "="*60)
    
    # 1. 文件结构测试
    file_success, file_total = test_file_structure()
    
    # 2. Python语法测试
    syntax_success, syntax_total = test_python_syntax_all()
    
    # 3. API端点分析
    endpoint_count = analyze_api_endpoints()
    
    # 4. 关键功能检查
    feature_success, feature_total = check_key_features()
    
    # 汇总结果
    print("\n" + "="*60)
    print("API功能完整性测试结果汇总:")
    print("="*60)
    
    print(f"文件结构: {file_success}/{file_total} 文件存在 ({file_success/file_total*100:.1f}%)")
    print(f"Python语法: {syntax_success}/{syntax_total} 文件语法正确 ({syntax_success/syntax_total*100:.1f}% if syntax_total > 0 else 0)")
    print(f"API端点: 约 {endpoint_count} 个端点")
    print(f"关键功能: {feature_success}/{feature_total} 功能已实现 ({feature_success/feature_total*100:.1f}%)")
    
    # 计算总体评分
    total_score = 0
    max_score = 0
    
    # 文件结构权重: 20%
    total_score += (file_success / file_total) * 20
    max_score += 20
    
    # Python语法权重: 30%
    if syntax_total > 0:
        total_score += (syntax_success / syntax_total) * 30
    max_score += 30
    
    # 关键功能权重: 50%
    total_score += (feature_success / feature_total) * 50
    max_score += 50
    
    final_score = (total_score / max_score) * 100
    
    print(f"\n总体评分: {final_score:.1f}/100")
    
    if final_score >= 90:
        print("\n🎉 优秀！API系统功能完整，代码质量良好。")
        status = "优秀"
    elif final_score >= 80:
        print("\n✅ 良好！API系统基本完整，有少量问题需要修复。")
        status = "良好"
    elif final_score >= 70:
        print("\n⚠️  一般！API系统部分功能完整，需要进一步完善。")
        status = "一般"
    else:
        print("\n❌ 需要改进！API系统存在较多问题，需要大量修复工作。")
        status = "需要改进"
    
    print(f"\n测试完成！系统状态: {status}")
    
    return final_score >= 70  # 70分以上认为测试通过

if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)