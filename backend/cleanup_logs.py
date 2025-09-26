#!/usr/bin/env python3
"""
清理后端代码中的无用日志和print语句
"""

import os
import re
from pathlib import Path

def cleanup_test_files():
    """清理测试文件中的无用print语句"""
    
    test_files = [
        'test_registration.py',
        'test_knowledge_integration.py', 
        'test_frontend_integration.py',
        'test_deepseek_chat.py',
        'test_ai_with_knowledge.py',
        'comprehensive_api_test.py',
        'check_oauth_apps.py'
    ]
    
    backend_dir = Path(__file__).parent
    
    for test_file in test_files:
        file_path = backend_dir / test_file
        if file_path.exists():
            print(f"清理文件: {test_file}")
            
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # 替换调试print语句为logger语句
            patterns = [
                (r'print\(f?"DEBUG:.*?\)', '# DEBUG信息已清理'),
                (r'print\(f?"INFO:.*?\)', '# INFO信息已清理'),
                (r'print\(f?"WARNING:.*?\)', '# WARNING信息已清理'),
                (r'print\(f?"测试.*?\)', '# 测试信息已清理'),
                (r'print\(f?"Test.*?\)', '# Test信息已清理'),
            ]
            
            modified = False
            for pattern, replacement in patterns:
                if re.search(pattern, content):
                    content = re.sub(pattern, replacement, content)
                    modified = True
            
            if modified:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"  ✅ {test_file} 已清理")
            else:
                print(f"  ℹ️ {test_file} 无需清理")

def main():
    print("开始清理后端日志...")
    cleanup_test_files()
    print("✅ 日志清理完成！")

if __name__ == "__main__":
    main()