from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Avg, Max, Sum, Count
from django.utils import timezone
from .models import TestRecord
from .serializers import TestRecordSerializer, TestRecordListSerializer, TestRecordStatsSerializer

class TestRecordCreateView(generics.CreateAPIView):
    """创建测试记录"""
    serializer_class = TestRecordSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class TestRecordListView(generics.ListAPIView):
    """获取用户的测试记录列表"""
    serializer_class = TestRecordListSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return TestRecord.objects.filter(user=self.request.user).order_by('-created_at')

class TestRecordDetailView(generics.RetrieveAPIView):
    """获取测试记录详情"""
    serializer_class = TestRecordSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return TestRecord.objects.filter(user=self.request.user)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def test_record_stats(request):
    """获取用户测试记录统计信息"""
    user = request.user
    records = TestRecord.objects.filter(user=user)
    
    if not records.exists():
        return Response({
            'total_tests': 0,
            'average_score': 0,
            'best_score': 0,
            'total_rounds': 0,
            'difficulty_stats': {},
            'scenario_stats': {},
            'recent_tests': []
        })
    
    # 基础统计
    stats = records.aggregate(
        total_tests=Count('id'),
        average_score=Avg('score'),
        best_score=Max('score'),
        total_rounds=Sum('conversation_rounds')
    )
    
    # 难度统计
    difficulty_stats = {}
    for difficulty, display in TestRecord.DIFFICULTY_CHOICES:
        count = records.filter(difficulty=difficulty).count()
        if count > 0:
            avg_score = records.filter(difficulty=difficulty).aggregate(avg=Avg('score'))['avg']
            difficulty_stats[difficulty] = {
                'count': count,
                'average_score': round(avg_score, 1) if avg_score else 0,
                'display_name': display
            }
    
    # 场景统计
    scenario_stats = {}
    scenario_counts = records.values('scenario_type').annotate(
        count=Count('id'),
        avg_score=Avg('score')
    ).order_by('-count')[:5]  # 取前5个最常测试的场景
    
    for item in scenario_counts:
        scenario_stats[item['scenario_type']] = {
            'count': item['count'],
            'average_score': round(item['avg_score'], 1) if item['avg_score'] else 0
        }
    
    # 最近的测试记录
    recent_tests = records.order_by('-completed_at')[:5]
    recent_tests_data = TestRecordListSerializer(recent_tests, many=True).data
    
    response_data = {
        'total_tests': stats['total_tests'],
        'average_score': round(stats['average_score'], 1) if stats['average_score'] else 0,
        'best_score': stats['best_score'] or 0,
        'total_rounds': stats['total_rounds'] or 0,
        'difficulty_stats': difficulty_stats,
        'scenario_stats': scenario_stats,
        'recent_tests': recent_tests_data
    }
    
    return Response(response_data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def save_test_record(request):
    """保存测试记录的便捷接口"""
    data = request.data.copy()
    data['completed_at'] = timezone.now()
    
    # 检查是否需要替换最新记录
    replace_latest = data.pop('replace_latest', False)
    
    if replace_latest:
        # 删除用户相同场景类型的旧记录，只保留最新的
        scenario_type = data.get('scenario_type')
        if scenario_type:
            TestRecord.objects.filter(
                user=request.user, 
                scenario_type=scenario_type
            ).delete()
    
    serializer = TestRecordSerializer(data=data, context={'request': request})
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
