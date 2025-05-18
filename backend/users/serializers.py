from rest_framework import serializers
from .models import CustomUser
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth import authenticate
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    avatar = serializers.ImageField(required=False) # 添加头像字段，非必填

    class Meta:
        model = CustomUser
        fields = ('username', 'nickname', 'password', 'password2', 'email', 'phone_number', 'avatar') # 包含头像字段
        extra_kwargs = {
            'username': {'required': True},
            'nickname': {'required': True},
            'email': {'required': False},
            'phone_number': {'required': False},
            'avatar': {'required': False}, # 明确指定 avatar 为非必填
        }

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({"password": "Passwords do not match"})
        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        avatar_file = validated_data.pop('avatar', None)

        user = CustomUser.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            nickname=validated_data['nickname'],
            email=validated_data.get('email', ''),
            phone_number=validated_data.get('phone_number', '')
        )
        user.user_type = 'normal'
        if avatar_file:
            user.avatar = avatar_file
        user.save()
        return user

class UserLoginSerializer(TokenObtainPairSerializer):
    username_field = 'username'

    def validate(self, attrs):
        username = attrs.get('username')
        print(username)
        email = attrs.get('email')
        phone_number = attrs.get('phone_number')
        password = attrs.get('password')
        print(password)


        if not (username or email or phone_number):
            raise serializers.ValidationError("Please provide username, email, or phone number.")

        user = None
        if username:
            user = authenticate(request=self.context.get('request'), username=username, password=password)
        elif email:
            try:
                user = CustomUser.objects.get(email=email)
                user = authenticate(request=self.context.get('request'), username=user.username, password=password)
            except CustomUser.DoesNotExist:
                raise serializers.ValidationError("Invalid email or password.")
        elif phone_number:
             try:
                user = CustomUser.objects.get(phone_number=phone_number)
                user = authenticate(request=self.context.get('request'), username=user.username, password=password)
             except CustomUser.DoesNotExist:
                raise serializers.ValidationError("Invalid phone number or password.")

        if user and user.is_active:
            attrs['username'] = user.username
            return super().validate(attrs)
        else:
            raise serializers.ValidationError("Invalid credentials")


class UserProfileSerializer(serializers.ModelSerializer):
    avatar = serializers.ImageField(required=False)

    class Meta:
        model = CustomUser
        fields = ('username', 'nickname', 'email', 'phone_number', 'fraud_level', 'user_type', 'avatar')
        read_only_fields = ('username', 'fraud_level', 'user_type')

    def validate_email(self, value):
        # 校验邮箱唯一性
        if value and self.instance and CustomUser.objects.exclude(id=self.instance.id).filter(email=value).exists():
            raise serializers.ValidationError("Email already exists.")
        return value

    def validate_phone_number(self, value):
        # 校验手机号唯一性
        if value and self.instance and CustomUser.objects.exclude(id=self.instance.id).filter(phone_number=value).exists():
            raise serializers.ValidationError("Phone number already exists.")
        return value

    def update(self, instance, validated_data):
        # 在这里可以处理更复杂的更新逻辑，例如触发验证码发送
        # 目前只进行简单的更新
        return super().update(instance, validated_data)


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True, required=True)
    new_password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    new_password2 = serializers.CharField(write_only=True, required=True)

    def validate(self, data):
        if data['new_password'] != data['new_password2']:
            raise serializers.ValidationError({"new_password": "New passwords do not match"})
        return data

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Incorrect old password.")
        return value

    def save(self):
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user
