from django.contrib import admin
from .models import Notification, NotificationTemplate

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'type', 'priority', 'is_read', 'created_at', 'expires_at')
    list_filter = ('type', 'priority', 'is_read', 'created_at', 'expires_at')
    search_fields = ('title', 'message', 'user__username', 'user__email')
    readonly_fields = ('created_at', 'read_at')
    ordering = ('-created_at',)
    
    fieldsets = (
        ('基本信息', {
            'fields': ('user', 'type', 'title', 'message')
        }),
        ('设置', {
            'fields': ('priority', 'action_url', 'expires_at')
        }),
        ('状态', {
            'fields': ('is_read', 'read_at', 'created_at')
        }),
        ('元数据', {
            'fields': ('metadata',),
            'classes': ('collapse',)
        })
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user')

@admin.register(NotificationTemplate)
class NotificationTemplateAdmin(admin.ModelAdmin):
    list_display = ('name', 'type', 'is_active', 'created_at', 'updated_at')
    list_filter = ('type', 'is_active', 'created_at')
    search_fields = ('name', 'title_template', 'message_template')
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('基本信息', {
            'fields': ('name', 'type', 'is_active')
        }),
        ('模板内容', {
            'fields': ('title_template', 'message_template', 'action_url_template')
        }),
        ('时间信息', {
            'fields': ('created_at', 'updated_at')
        })
    )