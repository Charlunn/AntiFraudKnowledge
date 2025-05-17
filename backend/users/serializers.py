from rest_framework import serializers
from .models import CustomUser
from django.contrib.auth.password_validation import validate_password

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = CustomUser
        fields = ('username', 'nickname', 'password', 'password2', 'email', 'phone_number') # 包括需要注册时提交的字段
        extra_kwargs = {
            'username': {'required': True},
            'nickname': {'required': True},
            'email': {'required': False}, # 邮箱和手机号非必填
            'phone_number': {'required': False},
        }


    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({"password": "Passwords do not match"})
        return data

    def create(self, validated_data):
        # 移除 password2，因为它不需要存储到数据库
        validated_data.pop('password2')
        # 创建用户，并设置密码
        user = CustomUser.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            nickname=validated_data['nickname'],
            email=validated_data.get('email', ''), # 使用 .get() 获取可选字段
            phone_number=validated_data.get('phone_number', '')
        )
        # 默认用户类型为 normal
        user.user_type = 'normal'
        user.save()
        return user
