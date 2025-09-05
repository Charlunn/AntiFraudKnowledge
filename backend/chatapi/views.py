from django.shortcuts import render

# Create your views here.
# chatapi/views.py

import json
import os
from typing import List, Dict, TypedDict, Optional, Any
import logging

# 需要安装 openai 库
# pip install openai

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

import openai
from .knowledge_service import knowledge_service

logger = logging.getLogger(__name__)

# --- 类型定义 (为了代码可读性，对应 Nuxt/H3 中的 interface) ---
class Message(TypedDict):
    role: str  # 'user', 'assistant', 'system'
    content: str

# 我们将把这个状态字典直接存在 session 中
class ConversationState(TypedDict):
    messages: List[Message]
    score: int
    # 注意：session 存储的数据需要是 JSON 序列化的 (默认数据库 backend 是这样)
    # 如果有自定义对象，需要特别处理序列化

# --- 初始化 OpenAI 客户端 ---
# 推荐在 settings.py 中加载环境变量，然后在 views.py 中导入使用
# 但为了直接对应你的原代码结构，我们在这里直接从 os.environ 获取
# 确保你的环境变量 DASHSCOPE_API_KEY 已经设置
DASHSCOPE_API_KEY = os.environ.get("DASHSCOPE_API_KEY")

# 如果 API key 未设置，这里可以根据需要抛出错误或记录警告
if not DASHSCOPE_API_KEY:
     print("WARNING: DASHSCOPE_API_KEY environment variable not set. AI calls will likely fail.")
     openai_client = None
     # raise EnvironmentError("DASHSCOPE_API_KEY environment variable not set.") # 生产环境建议直接中断
else:
    openai_client = openai.OpenAI(
        api_key=DASHSCOPE_API_KEY,
        base_url="https://dashscope.aliyuncs.com/compatible-mode/v1"
    )

# --- Django View 类 ---

@method_decorator(csrf_exempt, name='dispatch')
class ChatAPIView(APIView):
    """聊天API视图"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """
        处理用户聊天消息，使用Django Sessions进行状态管理，
        调用AI API，并返回响应。
        """
        # 使用一个唯一的 key 来存储会话状态在 session 中
        SESSION_STATE_KEY = 'chat_conversation_state'

        try:
            # 1. 读取并解析请求体
            user_message: Optional[str] = request.data.get('message')
            reset_conversation: Optional[bool] = request.data.get('reset')
            # 使用认证用户的ID
            user_id = str(request.user.id)
            
            logger.info(f"聊天请求来自用户: {user_id}")
            logger.debug(f"Django Session Key: {request.session.session_key}")


            # 2. 处理重置会话请求
            if reset_conversation:
                logger.info(f"重置用户 {user_id} 的会话状态")
                # 从 session 中删除对应的状态
                if SESSION_STATE_KEY in request.session:
                    del request.session[SESSION_STATE_KEY]

                # 返回成功响应
                return Response(
                    {'success': True, 'message': '会话状态重置成功'},
                    status=status.HTTP_200_OK
                )

            # 确保有用户消息，否则返回错误
            if not user_message or not isinstance(user_message, str):
                return Response(
                    {'success': False, 'message': '请求中缺少有效的消息内容'},
                    status=status.HTTP_400_BAD_REQUEST
                )


            # 3. 获取或初始化会话状态 from Session
            # 从 session 中获取状态，如果不存在，则为 None
            conversation_state: Optional[ConversationState] = request.session.get(SESSION_STATE_KEY)
            is_new_conversation = not conversation_state

            if is_new_conversation:
                logger.info(f"为用户 {user_id} 初始化新的会话状态")
                # 初始化分数和消息列表
                conversation_state = {'messages': [], 'score': 50} # 初始化分数

                # 新会话开始时，添加系统消息 (这是你原代码的一部分)
                # 注意：请在这里补充你的系统消息内容
                system_message_content = '''你是一名精通各种电信诈骗手段的AI，现在你将扮演一个具体的诈骗角色。你的目标是模拟真实诈骗情境，逐步诱导用户泄露敏感信息或进行危险操作，同时不暴露你是AI或诈骗分子。

每轮对话，在回复用户之前，你需要根据用户的最新回复，为用户在本轮的表现进行一个风险评分（基于用户的警惕性、是否泄露信息、是否听信你的诱导等）。评分范围是0-100分，初始分数为50分。
评分标准：
- 如果用户表现出高度警惕、怀疑、要求核实、提及报警或识破骗局，分数应该显著增加（例如+10到+30）。
- 如果用户轻易相信你、按照你的指示操作、询问敏感信息、或表现出焦虑、不知所措，分数应该减少（例如-10到-30）。
- 如果用户直接泄露银行卡号、身份证号、验证码、密码等极端敏感信息，分数应大幅减少（例如-40到-60）。
- 如果用户只是进行普通交流，与骗局核心不相关，分数变化较小或不变。
- 如果用户一直重复无关内容，或是辱骂性内容，可进行显得有些气急败坏的威胁后主动结束对话，并增加少许评分。
请根据用户的具体用词、语气和行为来判断并给出分数。

你的回复必须遵循以下固定格式：
分数：[你的最新评分] 正文：[你扮演角色的回复文本]

例子如下（请注意不要复制此文本）：分数：75 正文：您好！关于您账户异常的问题，请提供一下您的账号信息以便我们核实。

回复文本的要求如下：
- 保持简短、清晰，避免冗余信息。
- 严格扮演你设定的诈骗角色，对话要自然、有说服力。
- 根据用户反应调整策略，深入或转移话题。
- 设计多样化的诈骗情境，每轮新对话都可以是一个全新的骗局（例如：冒充电商客服退款、冒充公检法、虚假投资平台、兼职刷单、杀猪盘等）。

请在你的第一条回复中，构思一个详细的诈骗背景故事和情境，然后以你扮演的角色身份向用户介绍这个场景，并以指定的格式输出（分数默认为50，因为这是第一条回复）。'''
                conversation_state['messages'].append({'role': 'system', 'content': system_message_content})
                logger.info(f"为用户 {user_id} 添加系统消息")

                # 将新的或修改后的状态存回 session
                request.session[SESSION_STATE_KEY] = conversation_state
                request.session.modified = True # 标记 session 已修改


            # 4. 分析用户消息的诈骗风险（知识图谱集成）
            risk_analysis = knowledge_service.analyze_fraud_risk(user_message)
            logger.info(f"用户 {user_id} 消息风险分析: 风险评分={risk_analysis['risk_score']}, 关键词数={len(risk_analysis['keywords'])}")
            
            # 如果检测到高风险内容，为AI提供额外的上下文信息
            knowledge_context = ""
            if risk_analysis['risk_score'] > 5:  # 风险评分大于5时提供知识图谱信息
                context_parts = []
                
                if risk_analysis['fraud_types']:
                    fraud_types_info = ", ".join([f"{ft['name']}({ft['risk_level']}风险)" for ft in risk_analysis['fraud_types']])
                    context_parts.append(f"检测到可能的诈骗类型: {fraud_types_info}")
                
                if risk_analysis['keywords']:
                    keywords_info = ", ".join([f"{kw['word']}(风险值{kw['risk_score']})" for kw in risk_analysis['keywords']])
                    context_parts.append(f"风险关键词: {keywords_info}")
                
                if risk_analysis['suggestions']:
                    suggestions_info = "; ".join([f"{s['name']}: {s['description']}" for s in risk_analysis['suggestions'][:3]])  # 最多3个建议
                    context_parts.append(f"防范建议: {suggestions_info}")
                
                if context_parts:
                    knowledge_context = f"\n\n[知识图谱分析] {' | '.join(context_parts)}"
            
            # 添加用户消息到会话状态（如果有知识图谱上下文，则附加到消息中）
            user_message_with_context = user_message + knowledge_context
            conversation_state['messages'].append({'role': 'user', 'content': user_message_with_context})
            logger.info(f"为用户 {user_id} 添加用户消息: {user_message[:50]}...")
            if knowledge_context:
                logger.info(f"为用户 {user_id} 添加知识图谱上下文: {knowledge_context[:100]}...")
            
            request.session[SESSION_STATE_KEY] = conversation_state
            request.session.modified = True # 标记 session 已修改

            # 5. 调用 AI API
            try:
                # 检查 OpenAI 客户端是否已初始化
                if openai_client is None:
                    logger.error(f"用户 {user_id} AI服务未配置: API密钥未设置")
                    return Response(
                        {'success': False, 'message': 'AI服务未配置，请联系管理员'},
                        status=status.HTTP_503_SERVICE_UNAVAILABLE
                    )
                
                logger.info(f"为用户 {user_id} 调用AI API")
                # 调用 AI 时使用当前 session 中的消息历史
                chat_completion = openai_client.chat.completions.create(
                    model="deepseek-r1", # 请根据你实际使用的模型调整
                    messages=conversation_state['messages'] # 使用 session 中的消息历史
                )
                logger.info(f"用户 {user_id} 的AI API调用成功")

                # 6. 处理 AI 响应并更新状态 (使用从 session 中获取的状态)
                # 假设响应格式是标准的 OpenAI API 格式
                ai_reply_content = chat_completion.choices[0].message.content
                if not ai_reply_content:
                    # 如果 AI 返回空内容，根据需要处理，这里作为错误
                    raise ValueError("AI response content is empty.")

                # 添加 AI 响应到会话状态
                conversation_state['messages'].append({'role': 'assistant', 'content': ai_reply_content})
                logger.info(f"为用户 {user_id} 添加AI响应: {ai_reply_content[:50]}...")
                request.session[SESSION_STATE_KEY] = conversation_state
                request.session.modified = True # 标记 session 已修改

                # 7. 实现分数更新逻辑 - 解析AI响应中的分数
                import re
                
                # 解析AI响应中的分数和正文
                score_pattern = r'分数：(\d+)\s*正文：(.*)'
                match = re.match(score_pattern, ai_reply_content.strip(), re.DOTALL)
                
                if match:
                    # 提取分数和正文
                    new_score = int(match.group(1))
                    reply_text = match.group(2).strip()
                    
                    # 更新会话状态中的分数
                    conversation_state['score'] = max(0, min(100, new_score))  # 确保分数在 0-100 范围内
                    
                    # 更新AI消息内容为纯正文（去掉分数前缀）
                    conversation_state['messages'][-1]['content'] = reply_text
                    
                    logger.info(f"用户 {user_id} 分数更新为: {conversation_state['score']}")
                    
                    # 用于返回的AI回复内容
                    ai_reply_for_response = reply_text
                else:
                    # 如果无法解析分数格式，保持原有分数不变
                    logger.warning(f"用户 {user_id} 的AI响应格式不符合预期，无法解析分数: {ai_reply_content[:100]}...")
                    ai_reply_for_response = ai_reply_content
                
                # 保存更新后的状态到session
                request.session[SESSION_STATE_KEY] = conversation_state
                request.session.modified = True
                
                current_score = conversation_state['score']


                # 8. 返回响应
                return Response(
                    {
                        'success': True,
                        'reply': ai_reply_for_response,
                        'score': current_score,
                        'messages': conversation_state['messages'] # 返回 session 中的完整消息历史
                     },
                     status=status.HTTP_200_OK
                 )

            except openai.APIConnectionError as e:
                logger.error(f"用户 {user_id} 连接AI服务失败: {e}")
                return Response(
                    {'success': False, 'message': '连接AI服务失败'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            except openai.RateLimitError as e:
                logger.error(f"用户 {user_id} AI服务请求频率超限: {e}")
                return Response(
                    {'success': False, 'message': 'AI服务请求频率超限，请稍后重试'},
                    status=status.HTTP_429_TOO_MANY_REQUESTS
                )
            except openai.APIStatusError as e:
                logger.error(f"用户 {user_id} AI服务返回状态错误: {e.status_code} - {e.response}")
                return Response(
                    {'success': False, 'message': f'AI服务返回错误 (状态码: {getattr(e, "status_code", 500)})'},
                    status=getattr(e, 'status_code', status.HTTP_500_INTERNAL_SERVER_ERROR)
                )
            except ValueError as e:
                logger.error(f"用户 {user_id} AI响应内容错误: {e}")
                return Response(
                    {'success': False, 'message': f'AI返回无效响应: {str(e)}'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            except Exception as e:
                logger.error(f"用户 {user_id} AI调用过程中发生意外错误: {e}")
                return Response(
                    {'success': False, 'message': 'AI处理过程中发生意外错误'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

        except Exception as e:
            logger.error(f"处理用户 {request.user.id if hasattr(request, 'user') else 'unknown'} 请求时发生意外错误: {e}")
            return Response(
                {'success': False, 'message': '服务器发生意外错误'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# 保留原有的函数式视图作为备用
chat_api_view = ChatAPIView.as_view()


@method_decorator(csrf_exempt, name='dispatch')
class ChatHistoryView(APIView):
    """聊天历史记录视图"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """获取当前用户的聊天历史记录"""
        SESSION_STATE_KEY = 'chat_conversation_state'
        
        try:
            user_id = str(request.user.id)
            logger.info(f"获取用户 {user_id} 的聊天历史")
            
            # 从session中获取对话状态
            conversation_state = request.session.get(SESSION_STATE_KEY)
            
            if not conversation_state:
                return Response({
                    'success': True,
                    'data': {
                        'messages': [],
                        'score': 70,  # 默认分数
                        'session_id': request.session.session_key or 'new'
                    }
                }, status=status.HTTP_200_OK)
            
            return Response({
                'success': True,
                'data': {
                    'messages': conversation_state.get('messages', []),
                    'score': conversation_state.get('score', 70),
                    'session_id': request.session.session_key
                }
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"获取用户 {user_id} 聊天历史失败: {e}")
            return Response({
                'success': False,
                'message': '获取聊天历史失败'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@method_decorator(csrf_exempt, name='dispatch')
class ChatSessionsView(APIView):
    """聊天会话管理视图"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """获取用户的会话列表（基于当前session）"""
        try:
            user_id = str(request.user.id)
            session_key = request.session.session_key
            
            # 由于使用Django Session，每个用户只有一个活跃会话
            # 这里返回当前会话的基本信息
            SESSION_STATE_KEY = 'chat_conversation_state'
            conversation_state = request.session.get(SESSION_STATE_KEY)
            
            if conversation_state and conversation_state.get('messages'):
                # 获取第一条用户消息作为会话标题
                first_user_message = None
                for msg in conversation_state['messages']:
                    if msg.get('role') == 'user':
                        first_user_message = msg.get('content', '')[:50] + '...'
                        break
                
                session_info = {
                    'id': session_key or 'current',
                    'title': first_user_message or '新对话',
                    'message_count': len(conversation_state['messages']),
                    'score': conversation_state.get('score', 70),
                    'created_at': None,  # Session没有创建时间信息
                    'updated_at': None
                }
            else:
                session_info = {
                    'id': session_key or 'new',
                    'title': '新对话',
                    'message_count': 0,
                    'score': 70,
                    'created_at': None,
                    'updated_at': None
                }
            
            return Response({
                'success': True,
                'data': {
                    'sessions': [session_info],
                    'total': 1,
                    'current_page': 1,
                    'total_pages': 1
                }
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"获取用户 {user_id} 会话列表失败: {e}")
            return Response({
                'success': False,
                'message': '获取会话列表失败'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def delete(self, request):
        """清空当前会话"""
        SESSION_STATE_KEY = 'chat_conversation_state'
        
        try:
            user_id = str(request.user.id)
            logger.info(f"清空用户 {user_id} 的会话")
            
            # 从session中删除对话状态
            if SESSION_STATE_KEY in request.session:
                del request.session[SESSION_STATE_KEY]
                request.session.modified = True
            
            return Response({
                'success': True,
                'message': '会话已清空'
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"清空用户 {user_id} 会话失败: {e}")
            return Response({
                'success': False,
                'message': '清空会话失败'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)