#!/usr/bin/env python
import os
import django
from datetime import datetime, timezone

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'KnowledgeBackend.settings')
django.setup()

from oauth2_provider.models import Application, AccessToken, RefreshToken
from users.models import CustomUser

print('OAuth Applications:')
for app in Application.objects.all():
    print(f'  - {app.name}: {app.client_id}')

print('\nAccess Tokens:')
for token in AccessToken.objects.all()[:5]:  # 只显示前5个
    print(f'  - Token: {token.token[:20]}... User: {token.user.username} Expires: {token.expires} Expired: {token.is_expired()}')

# 检查特定token
test_token = '0eKrDaQTJBOalknUpnlb9FtR60XAwPNrlWXlJU82oRc'
print(f'\nChecking access token: {test_token}')
try:
    access_token = AccessToken.objects.get(token=test_token)
    print(f'Access Token found! User: {access_token.user.username}, Expired: {access_token.is_expired()}')
    
    # 查找对应的refresh token
    print('\nLooking for refresh tokens for this user:')
    refresh_tokens = RefreshToken.objects.filter(user=access_token.user)
    for rt in refresh_tokens:
        print(f'  - Refresh Token: {rt.token[:20]}... Expires: {rt.expires if hasattr(rt, "expires") else "No expiry"}')
        
except AccessToken.DoesNotExist:
    print('Access token not found in database')

print('\nAll Refresh Tokens:')
for rt in RefreshToken.objects.all()[:5]:
    print(f'  - Token: {rt.token[:20]}... User: {rt.user.username}')