#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
OAuth配置设置脚本
用于快速配置第三方OAuth平台的APP_ID和密钥
"""

import os
import sys
from pathlib import Path

def get_project_root():
    """获取项目根目录"""
    current_dir = Path(__file__).parent
    return current_dir.parent

def create_frontend_env(config):
    """创建前端环境变量文件"""
    project_root = get_project_root()
    frontend_env_path = project_root / 'frontend' / '.env'
    
    env_content = f"""# OAuth配置 - 前端环境变量
# 生成时间: {config.get('timestamp', 'Unknown')}

# QQ互联应用ID
NUXT_QQ_APP_ID={config.get('qq_app_id', 'demo_qq_app_id')}

# 微信开放平台应用ID
NUXT_WECHAT_APP_ID={config.get('wechat_app_id', 'demo_wechat_app_id')}

# 抖音开放平台应用ID
NUXT_DOUYIN_APP_ID={config.get('douyin_app_id', 'demo_douyin_app_id')}

# 支付宝开放平台应用ID
NUXT_ALIPAY_APP_ID={config.get('alipay_app_id', 'demo_alipay_app_id')}

# API基础URL
NUXT_PUBLIC_API_BASE=/api
"""
    
    with open(frontend_env_path, 'w', encoding='utf-8') as f:
        f.write(env_content)
    
    print(f"✅ 前端环境变量文件已创建: {frontend_env_path}")

def create_backend_env(config):
    """创建后端环境变量文件"""
    project_root = get_project_root()
    backend_env_path = project_root / 'backend' / '.env'
    
    env_content = f"""# OAuth配置 - 后端环境变量
# 生成时间: {config.get('timestamp', 'Unknown')}

# QQ互联配置
QQ_APP_ID={config.get('qq_app_id', 'demo_qq_app_id')}
QQ_APP_KEY={config.get('qq_app_key', 'your_qq_app_key_here')}

# 微信开放平台配置
WECHAT_APP_ID={config.get('wechat_app_id', 'demo_wechat_app_id')}
WECHAT_APP_SECRET={config.get('wechat_app_secret', 'your_wechat_app_secret_here')}

# 抖音开放平台配置
DOUYIN_APP_ID={config.get('douyin_app_id', 'demo_douyin_app_id')}
DOUYIN_APP_SECRET={config.get('douyin_app_secret', 'your_douyin_app_secret_here')}

# 支付宝开放平台配置
ALIPAY_APP_ID={config.get('alipay_app_id', 'demo_alipay_app_id')}
ALIPAY_APP_PRIVATE_KEY={config.get('alipay_private_key', 'your_alipay_private_key_here')}
ALIPAY_PUBLIC_KEY={config.get('alipay_public_key', 'alipay_public_key_here')}

# 数据库配置
DATABASE_URL=postgresql://antifraud_user:your_password@localhost:5432/antifraud_knowledge

# Django配置
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# CORS配置
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
"""
    
    with open(backend_env_path, 'w', encoding='utf-8') as f:
        f.write(env_content)
    
    print(f"✅ 后端环境变量文件已创建: {backend_env_path}")

def interactive_setup():
    """交互式配置设置"""
    print("🔧 OAuth平台配置设置向导")
    print("=" * 50)
    print("请输入各平台的APP_ID和密钥信息")
    print("如果暂时没有，可以直接按回车使用演示配置\n")
    
    config = {
        'timestamp': __import__('datetime').datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    }
    
    # QQ互联配置
    print("📱 QQ互联配置")
    print("申请地址: https://connect.qq.com/")
    config['qq_app_id'] = input("QQ APP_ID (回车使用演示配置): ").strip() or 'demo_qq_app_id'
    if config['qq_app_id'] != 'demo_qq_app_id':
        config['qq_app_key'] = input("QQ APP_KEY: ").strip() or 'your_qq_app_key_here'
    else:
        config['qq_app_key'] = 'your_qq_app_key_here'
    
    # 微信开放平台配置
    print("\n💬 微信开放平台配置")
    print("申请地址: https://open.weixin.qq.com/")
    config['wechat_app_id'] = input("微信 AppID (回车使用演示配置): ").strip() or 'demo_wechat_app_id'
    if config['wechat_app_id'] != 'demo_wechat_app_id':
        config['wechat_app_secret'] = input("微信 AppSecret: ").strip() or 'your_wechat_app_secret_here'
    else:
        config['wechat_app_secret'] = 'your_wechat_app_secret_here'
    
    # 抖音开放平台配置
    print("\n🎵 抖音开放平台配置")
    print("申请地址: https://developer.open-douyin.com/")
    config['douyin_app_id'] = input("抖音 Client Key (回车使用演示配置): ").strip() or 'demo_douyin_app_id'
    if config['douyin_app_id'] != 'demo_douyin_app_id':
        config['douyin_app_secret'] = input("抖音 Client Secret: ").strip() or 'your_douyin_app_secret_here'
    else:
        config['douyin_app_secret'] = 'your_douyin_app_secret_here'
    
    # 支付宝开放平台配置
    print("\n💰 支付宝开放平台配置")
    print("申请地址: https://open.alipay.com/")
    config['alipay_app_id'] = input("支付宝 APPID (回车使用演示配置): ").strip() or 'demo_alipay_app_id'
    if config['alipay_app_id'] != 'demo_alipay_app_id':
        config['alipay_private_key'] = input("支付宝应用私钥: ").strip() or 'your_alipay_private_key_here'
        config['alipay_public_key'] = input("支付宝公钥: ").strip() or 'alipay_public_key_here'
    else:
        config['alipay_private_key'] = 'your_alipay_private_key_here'
        config['alipay_public_key'] = 'alipay_public_key_here'
    
    return config

def batch_setup(config_file):
    """批量配置设置"""
    try:
        import json
        with open(config_file, 'r', encoding='utf-8') as f:
            config = json.load(f)
        config['timestamp'] = __import__('datetime').datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        return config
    except Exception as e:
        print(f"❌ 读取配置文件失败: {e}")
        return None

def show_help():
    """显示帮助信息"""
    help_text = """
🔧 OAuth配置设置脚本使用说明

用法:
  python setup_oauth.py [选项]

选项:
  -i, --interactive    交互式配置 (默认)
  -f, --file FILE      从JSON文件批量导入配置
  -h, --help          显示此帮助信息

示例:
  python setup_oauth.py                    # 交互式配置
  python setup_oauth.py -f config.json    # 从文件导入配置

配置文件格式 (config.json):
{
  "qq_app_id": "your_qq_app_id",
  "qq_app_key": "your_qq_app_key",
  "wechat_app_id": "your_wechat_app_id",
  "wechat_app_secret": "your_wechat_app_secret",
  "douyin_app_id": "your_douyin_app_id",
  "douyin_app_secret": "your_douyin_app_secret",
  "alipay_app_id": "your_alipay_app_id",
  "alipay_private_key": "your_alipay_private_key",
  "alipay_public_key": "your_alipay_public_key"
}

注意事项:
- 密钥信息请妥善保管，不要提交到版本控制系统
- 生产环境请使用真实的APP_ID和密钥
- 回调地址必须与平台申请时填写的地址一致
"""
    print(help_text)

def main():
    """主函数"""
    if len(sys.argv) > 1:
        if sys.argv[1] in ['-h', '--help']:
            show_help()
            return
        elif sys.argv[1] in ['-f', '--file']:
            if len(sys.argv) < 3:
                print("❌ 请指定配置文件路径")
                return
            config = batch_setup(sys.argv[2])
            if not config:
                return
        else:
            print("❌ 未知选项，使用 -h 查看帮助")
            return
    else:
        config = interactive_setup()
    
    print("\n🔄 正在生成配置文件...")
    
    try:
        create_frontend_env(config)
        create_backend_env(config)
        
        print("\n✅ OAuth配置设置完成！")
        print("\n📋 后续步骤:")
        print("1. 检查生成的 .env 文件")
        print("2. 根据需要修改配置信息")
        print("3. 重启前后端服务")
        print("4. 测试第三方登录功能")
        
        print("\n📚 更多信息请参考:")
        print("- OAuth平台申请指南: docs/OAUTH_PLATFORM_SETUP_GUIDE.md")
        print("- 项目文档: README.md")
        
    except Exception as e:
        print(f"❌ 配置设置失败: {e}")

if __name__ == '__main__':
    main()