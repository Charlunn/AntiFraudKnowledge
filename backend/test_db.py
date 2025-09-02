import os
import sys
sys.path.append('/app')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'KnowledgeBackend.settings')
import django
django.setup()

# 测试数据库连接和用户模型
from users.models import CustomUser
from django.db import connection

# 检查数据库连接
try:
    with connection.cursor() as cursor:
        cursor.execute("SELECT 1")
        result = cursor.fetchone()
        print(f"数据库连接测试: {result}")

except Exception as e:
    print(f"数据库连接错误: {e}")

# 检查用户表是否存在
try:
    user_count = CustomUser.objects.count()
    print(f"当前用户数量: {user_count}")
    print("用户表存在且可访问")

except Exception as e:
    print(f"用户表访问错误: {e}")