from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_list_or_404
from django.db.models import Q, Avg, Max, Count
from django.contrib.auth import get_user_model
import logging

from .models import Question, QuizAttempt
from .serializers import (
    QuestionSerializer, 
    AdminQuestionSerializer,
    QuizAttemptSerializer, 
    QuizSubmissionSerializer,
    UserQuizStatsSerializer
)
from utils.permissions import IsAdminUser

User = get_user_model()
logger = logging.getLogger(__name__)


class QuestionListView(generics.ListAPIView):
    """获取题目列表"""
    serializer_class = QuestionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        level = self.request.query_params.get('level')
        limit = self.request.query_params.get('limit', 10)
        
        queryset = Question.objects.all()
        if level:
            queryset = queryset.filter(level=level)
        
        try:
            limit = int(limit)
            if limit > 0:
                queryset = queryset[:limit]
        except (ValueError, TypeError):
            queryset = queryset[:10]
            
        return queryset.order_by('?')  # 随机排序


class SubmitQuizView(APIView):
    """提交答题"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            serializer = QuizSubmissionSerializer(data=request.data)
            if not serializer.is_valid():
                logger.warning(f"User {request.user.id} submitted invalid quiz data: {serializer.errors}")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            answers = serializer.validated_data['answers']
            level = serializer.validated_data['level']
            
            correct_answers = 0
            total_questions = len(answers)
            question_results = []
            
            for q_id, choice in answers.items():
                try:
                    question = Question.objects.get(id=q_id)
                    is_correct = question.correct_answer.upper() == choice.upper()
                    if is_correct:
                        correct_answers += 1
                    
                    question_results.append({
                        'question_id': q_id,
                        'user_answer': choice.upper(),
                        'correct_answer': question.correct_answer,
                        'is_correct': is_correct
                    })
                except Question.DoesNotExist:
                    logger.warning(f"User {request.user.id} answered non-existent question {q_id}")
                    continue
            
            # 计算分数（百分制）
            score = int((correct_answers / total_questions) * 100) if total_questions > 0 else 0
            
            # 保存答题记录
            quiz_attempt = QuizAttempt.objects.create(
                user=request.user,
                level=level,
                score=score,
                total_questions=total_questions,
                correct_answers=correct_answers
            )
            
            logger.info(f"User {request.user.id} completed quiz (level: {level}, score: {score})")
            
            return Response({
                'attempt_id': quiz_attempt.id,
                'score': score,
                'correct_answers': correct_answers,
                'total_questions': total_questions,
                'accuracy': round((correct_answers / total_questions) * 100, 2) if total_questions > 0 else 0,
                'question_results': question_results
            })
        except Exception as e:
            logger.error(f"Error submitting quiz for user {request.user.id}: {e}")
            return Response({'detail': 'An error occurred while submitting quiz'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UserQuizHistoryView(generics.ListAPIView):
    """用户答题历史"""
    serializer_class = QuizAttemptSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = QuizAttempt.objects.filter(user=self.request.user).order_by('-created_at')
        
        level = self.request.query_params.get('level')
        if level:
            queryset = queryset.filter(level=level)
            
        return queryset


class UserQuizStatsView(APIView):
    """用户答题统计"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        try:
            user = request.user
            attempts = QuizAttempt.objects.filter(user=user)
            
            if not attempts.exists():
                logger.info(f"User {user.id} has no quiz attempts")
                return Response({
                    'total_attempts': 0,
                    'average_score': 0,
                    'best_score': 0,
                    'level_stats': {},
                    'recent_attempts': []
                })
            
            # 基本统计
            total_attempts = attempts.count()
            average_score = attempts.aggregate(avg_score=Avg('score'))['avg_score'] or 0
            best_score = attempts.aggregate(max_score=Max('score'))['max_score'] or 0
            
            # 按难度级别统计
            level_stats = {}
            for level in ['beginner', 'intermediate', 'advanced']:
                level_attempts = attempts.filter(level=level)
                if level_attempts.exists():
                    level_stats[level] = {
                        'attempts': level_attempts.count(),
                        'average_score': level_attempts.aggregate(avg=Avg('score'))['avg'] or 0,
                        'best_score': level_attempts.aggregate(max=Max('score'))['max'] or 0
                    }
                else:
                    level_stats[level] = {
                        'attempts': 0,
                        'average_score': 0,
                        'best_score': 0
                    }
            
            # 最近的答题记录
            recent_attempts = attempts.order_by('-created_at')[:5]
            
            serializer = UserQuizStatsSerializer({
                'total_attempts': total_attempts,
                'average_score': round(average_score, 2),
                'best_score': best_score,
                'level_stats': level_stats,
                'recent_attempts': recent_attempts
            })
            
            logger.info(f"Retrieved quiz stats for user {user.id}")
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error retrieving quiz stats for user {request.user.id}: {e}")
            return Response({'detail': 'An error occurred while retrieving quiz stats'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AdminQuestionListView(generics.ListCreateAPIView):
    """管理员题目管理"""
    serializer_class = AdminQuestionSerializer
    permission_classes = [IsAdminUser]
    
    def get_queryset(self):
        queryset = Question.objects.all()
        
        # 搜索功能
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(text__icontains=search) |
                Q(option_a__icontains=search) |
                Q(option_b__icontains=search) |
                Q(option_c__icontains=search) |
                Q(option_d__icontains=search)
            )
        
        # 按难度筛选
        level = self.request.query_params.get('level')
        if level:
            queryset = queryset.filter(level=level)
            
        return queryset.order_by('id')


class AdminQuestionDetailView(generics.RetrieveUpdateDestroyAPIView):
    """管理员题目详情管理"""
    queryset = Question.objects.all()
    serializer_class = AdminQuestionSerializer
    permission_classes = [IsAdminUser]


class AdminQuizStatsView(APIView):
    """管理员答题统计"""
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        try:
            from django.utils import timezone
            from datetime import timedelta
            
            now = timezone.now()
            today = now.date()
            week_ago = today - timedelta(days=7)
            month_ago = today - timedelta(days=30)
            
            # 基本统计
            total_questions = Question.objects.count()
            total_attempts = QuizAttempt.objects.count()
            total_users = QuizAttempt.objects.values('user').distinct().count()
            
            # 时间统计
            today_attempts = QuizAttempt.objects.filter(created_at__date=today).count()
            week_attempts = QuizAttempt.objects.filter(created_at__date__gte=week_ago).count()
            month_attempts = QuizAttempt.objects.filter(created_at__date__gte=month_ago).count()
            
            # 难度级别统计
            level_stats = {}
            for level in ['beginner', 'intermediate', 'advanced']:
                level_questions = Question.objects.filter(level=level).count()
                level_attempts = QuizAttempt.objects.filter(level=level)
                level_stats[level] = {
                    'questions': level_questions,
                    'attempts': level_attempts.count(),
                    'average_score': level_attempts.aggregate(avg=Avg('score'))['avg'] or 0
                }
            
            # 平均分统计
            overall_average = QuizAttempt.objects.aggregate(avg=Avg('score'))['avg'] or 0
            
            logger.info(f"Admin user {request.user.id} retrieved quiz statistics")
            
            return Response({
                'total_questions': total_questions,
                'total_attempts': total_attempts,
                'total_users': total_users,
                'today_attempts': today_attempts,
                'week_attempts': week_attempts,
                'month_attempts': month_attempts,
                'overall_average_score': round(overall_average, 2),
                'level_stats': level_stats
            })
        except Exception as e:
            logger.error(f"Error retrieving admin quiz stats for user {request.user.id}: {e}")
            return Response({'detail': 'An error occurred while retrieving quiz statistics'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
