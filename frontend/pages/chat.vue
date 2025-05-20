<template>
  <div class="chat-page-container">
    <div v-if="!conversationStarted && !isConversationOver" class="start-screen">
      <p class="start-text">这是一个AI诈骗风险模拟器。你将与一个扮演诈骗角色的AI进行对话。对话结束后，你会看到你的被骗风险评分。</p>
      <button @click="startNewConversation" class="start-button">
        开始对话
      </button>
    </div>

    <div v-else ref="chatArea" class="chat-area">
      <div
        v-for="(message, index) in messages"
        :key="message.id || index" class="message-container"
        :class="{ 'user-message-container': message.sender === 'user', 'ai-message-container': message.sender === 'ai' }"
      >
        <div
          :class="{
            'user-message-bubble': message.sender === 'user',
            'ai-message-bubble': message.sender === 'ai',
            'is-typing': message.isTyping
          }"
          class="message-bubble"
        >
          <div v-if="message.sender === 'user'" class="message-tip user-tip"></div>
          <div v-if="message.sender === 'ai'" class="message-tip ai-tip"></div>

          <div v-if="message.isTyping" class="typing-indicator">
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
          </div>
          <span v-else>{{ message.text }}</span>
        </div>
      </div>

      <div v-if="isLoading && messages.length === 0 && conversationStarted" class="message-container ai-message-container">
        <div class="message-bubble ai-message-bubble is-typing">
            <div class="message-tip ai-tip"></div>
            <div class="typing-indicator">
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
            </div>
        </div>
      </div>
      <div v-else-if="isLoading && messages.length > 0 && messages[messages.length - 1]?.sender === 'user' && !isConversationOver" class="message-container ai-message-container">
        <div class="message-bubble ai-message-bubble is-typing">
            <div class="message-tip ai-tip"></div>
            <div class="typing-indicator">
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
            </div>
        </div>
      </div>
    </div>

    <div v-if="isConversationOver"
         class="conversation-summary"
         :class="scoreColorClass">
      <p class="summary-title">对话结束。</p>
      <p class="summary-score">
        您的最终被骗风险评分为: <span class="final-score">{{ typeof score === 'number' ? score.toFixed(2) : 'N/A' }}</span>
      </p>
      <p class="summary-message">{{ summaryMessage }}</p>
      <button
        @click="startNewConversation"
        class="start-button"
        :disabled="isLoading"
      >
        开始新对话
      </button>
    </div>

    <div v-else-if="conversationStarted" class="input-area">
      <button
        @click="endConversation"
        class="end-button"
        :disabled="isLoading"
        aria-label="结束对话"
      >
        <svg class="icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
      <input
        v-model="userInput"
        @keyup.enter="sendMessage"
        type="text"
        placeholder="输入你的回复..."
        class="message-input"
        :disabled="isLoading || isConversationOver"
      />
      <button
        @click="sendMessage"
        class="send-button"
        :disabled="isLoading || userInput.trim() === '' || isConversationOver"
        aria-label="发送消息"
      >
        <svg class="icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watchEffect, nextTick, computed } from 'vue';
import { useRuntimeConfig } from '#app';
import axios from 'axios';
import { useAuthStore } from '~/stores/auth';

definePageMeta({
  requiresAuth: true
});

const userInput = ref('');
const score = ref(50); // 全局对话分数
const isLoading = ref(false);
const isConversationOver = ref(false);
const summaryMessage = ref('');
const conversationStarted = ref(false);

const conversationLimit = 10;
const lowScoreThreshold = 20;
const highScoreThreshold = 80;

const chatArea = ref(null);
const messages = ref([]); 

const runtimeConfig = useRuntimeConfig();
const API_BASE_URL = runtimeConfig.public.apiBase;
const authStore = useAuthStore();

const parseBackendMessage = (msg) => {
  if (!msg || msg.role === 'system') {
    // console.log('Skipping system message or invalid msg object:', msg);
    return { parsedMessage: null, inlineScore: null };
  }

  let rawText = '';
  let senderType;
  let extractedInlineScore = null;

  if (msg.role === 'user') {
    senderType = 'user';
  } else if (msg.role === 'assistant' || msg.role === 'ai') {
    senderType = 'ai';
  } else {
    // console.warn('Unknown message role, skipping:', msg.role, msg.content);
    return { parsedMessage: null, inlineScore: null };
  }

  if (typeof msg.content === 'string') {
    rawText = msg.content;
  } else if (msg.content != null) {
    rawText = String(msg.content);
  }

  let processedText = rawText;

  if (senderType === 'ai') {
    const scoreMatch = rawText.match(/分数：\s*(\d+(\.\d+)?)/);
    if (scoreMatch && scoreMatch[1]) {
      extractedInlineScore = parseFloat(scoreMatch[1]);
      // console.log('Extracted inline score from AI message:', extractedInlineScore);
    }

    const textMatch = rawText.match(/正文：(.*)/s);
    if (textMatch && textMatch[1]) {
      processedText = textMatch[1];
    } else if (extractedInlineScore !== null) {
      processedText = rawText.replace(/分数：\s*(\d+(\.\d+)?)/, '').trim();
    }
  }

  const finalText = processedText.replace(/[\u200B-\u200D\uFEFF]/g, '').trim();

  if (senderType === 'ai' && finalText === '' && extractedInlineScore === null) {
    // console.log('Skipping empty AI message after parsing (no text, no inline score):', msg.content);
    return { parsedMessage: null, inlineScore: extractedInlineScore }; // Return score if present
  }
  
  const messageId = msg.id || `frontend-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const parsedMessageObject = {
    id: messageId,
    sender: senderType,
    text: finalText,
    isTyping: false
  };
  
  return { parsedMessage: parsedMessageObject, inlineScore: extractedInlineScore };
};


const scoreColorClass = computed(() => {
  const currentScore = typeof score.value === 'number' ? score.value : 50; // Default if score is not number
  if (currentScore <= lowScoreThreshold) {
    return 'summary-low-risk';
  } else if (currentScore >= highScoreThreshold) {
    return 'summary-high-safety';
  } else {
    return 'summary-medium-risk';
  }
});

const scrollToBottom = () => {
  nextTick(() => {
    if (chatArea.value) {
      chatArea.value.scrollTo({
        top: chatArea.value.scrollHeight,
        behavior: 'smooth'
      });
    }
  });
};

const startInitialAIResponse = async () => {
  isLoading.value = true;
  messages.value = [];
  try {
    const response = await axios.post(`${API_BASE_URL}/chat/`, { message: '你好' }, {
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authStore.getAccessToken}` }
    });
    const data = response.data;

    if (data.success === true && Array.isArray(data.messages) && data.score !== undefined) {
      let finalScoreForResponse = parseFloat(data.score); // Start with root score
      const processedMessages = [];

      for (const serverMsg of data.messages) {
        const { parsedMessage, inlineScore } = parseBackendMessage(serverMsg);
        if (parsedMessage) {
          processedMessages.push(parsedMessage);
        }
        // If an AI message in the initial batch has an inline score, it takes precedence
        if (inlineScore !== null && (serverMsg.role === 'assistant' || serverMsg.role === 'ai')) {
          finalScoreForResponse = inlineScore; 
        }
      }
      score.value = finalScoreForResponse; // Single update to score.value
      // console.log(`Initial score set to: ${score.value}`);
      messages.value = processedMessages;
      scrollToBottom();
    } else {
      const errorContent = data.error || '无法开始对话，请稍后再试。';
      const { parsedMessage: errorMsgObject } = parseBackendMessage({role: 'ai', content: errorContent, id: `err-${Date.now()}`});
      if(errorMsgObject) messages.value.push(errorMsgObject);
      console.error('Failed to get initial AI message or unexpected format:', data);
      scrollToBottom();
    }
  } catch (error) {
    console.error('Error fetching initial AI message:', error);
    const { parsedMessage: networkErrorMsg } = parseBackendMessage({role: 'ai', content:'启动对话失败，请检查网络或稍后再试。', id: `err-${Date.now()}`});
    if(networkErrorMsg) messages.value.push(networkErrorMsg);
    scrollToBottom();
  } finally {
    isLoading.value = false;
  }
};

const sendMessage = async () => {
  if (userInput.value.trim() === '' || isConversationOver.value) {
    return;
  }

  isLoading.value = true;
  const userMessageText = userInput.value;
  const { parsedMessage: userMsgObject } = parseBackendMessage({role: 'user', content: userMessageText, id: `user-${Date.now()}`});
  if (userMsgObject) {
      messages.value.push(userMsgObject);
  }
  
  userInput.value = ''; 
  scrollToBottom(); 

  try {
    const response = await axios.post(`${API_BASE_URL}/chat/`, { message: userMessageText }, {
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authStore.getAccessToken}` }
    });
    const data = response.data;

    if (data.success === true && Array.isArray(data.messages) && data.score !== undefined) {
      let finalScoreForResponse = parseFloat(data.score); // Start with root score
      let latestAiReplyObject = null;
      
      if (data.messages.length > 0) {
        // Iterate from the end to find the latest AI message and its potential inline score
        for (let i = data.messages.length - 1; i >= 0; i--) {
            const serverMsg = data.messages[i];
            if (serverMsg.role === 'assistant' || serverMsg.role === 'ai') {
                const { parsedMessage, inlineScore } = parseBackendMessage(serverMsg);
                latestAiReplyObject = parsedMessage;
                if (inlineScore !== null) {
                  finalScoreForResponse = inlineScore; // Inline score from the latest AI message overrides
                }
                break; // Found the latest AI message
            }
        }
      }

      score.value = finalScoreForResponse; // Single update to score.value
      // console.log(`Score updated to: ${score.value}`);

      if (latestAiReplyObject) {
        const isAlreadyPresent = messages.value.some(m => m.id === latestAiReplyObject.id);
        if (!isAlreadyPresent) {
             messages.value.push(latestAiReplyObject);
        } else {
            // console.log("AI reply already present (same ID), not adding again:", latestAiReplyObject);
        }
      }
      scrollToBottom();
    } else {
      const errorContent = data.error || '我暂时无法回复，请稍后再试。';
      const { parsedMessage: errorMsgObject } = parseBackendMessage({role: 'ai', content: errorContent, id: `err-${Date.now()}`});
      if(errorMsgObject) messages.value.push(errorMsgObject);
      console.error('Unexpected API response format or API error:', data);
      scrollToBottom();
    }
  } catch (error) {
    console.error('Error sending message:', error);
    const { parsedMessage: networkErrorMsg } = parseBackendMessage({role: 'ai', content: '发送消息失败，请检查网络或稍后再试。', id: `err-${Date.now()}`});
    if(networkErrorMsg) messages.value.push(networkErrorMsg);
    scrollToBottom();
  } finally {
    isLoading.value = false;
  }
};

const endConversationOnServer = async () => {
    try {
        await axios.post(`${API_BASE_URL}/chat/end/`, {}, {
            headers: { 'Authorization': `Bearer ${authStore.getAccessToken}` }
        });
        // console.log('Backend conversation state ended.');
    } catch (error) {
        console.error('Error ending conversation on backend:', error);
    }
};

const endConversation = () => {
  isConversationOver.value = true;
  isLoading.value = false;
  const currentScore = typeof score.value === 'number' ? score.value : 50; // Default for summary
  if (currentScore <= lowScoreThreshold) {
    summaryMessage.value = `您主动结束了对话。您的最终风险评分为 (${currentScore.toFixed(2)})，在本次模拟中表现出极易被骗的倾向。请务必提高警惕！`;
  } else if (currentScore >= highScoreThreshold) {
    summaryMessage.value = `您主动结束了对话。您的最终风险评分为 (${currentScore.toFixed(2)})。在本次模拟中您表现出较高的防范意识。`;
  } else {
    summaryMessage.value = `您主动结束了对话。您的最终风险评分为 (${currentScore.toFixed(2)})。请持续提高防范意识。`;
  }
  endConversationOnServer();
};

const startNewConversation = async () => {
  isLoading.value = true;
  try {
    const response = await axios.post(`${API_BASE_URL}/chat/reset/`, {}, {
      headers: { 'Authorization': `Bearer ${authStore.getAccessToken}` }
    });
    if (response.data.success === true) {
      // console.log('Backend conversation state reset.');
    } else {
      console.error('Backend conversation reset failed:', response.data.error);
    }
  } catch (error) {
    console.error('Error resetting conversation state on backend:', error);
  }

  userInput.value = '';
  score.value = 50; // 重置分数
  isConversationOver.value = false;
  summaryMessage.value = '';
  conversationStarted.value = true;
  
  await nextTick();
  if (chatArea.value) {
    chatArea.value.scrollTop = 0;
  }
  startInitialAIResponse(); 
};

watchEffect(async () => {
  if (!conversationStarted.value || isConversationOver.value) {
    return;
  }
  const turn = Math.floor(messages.value.filter(msg => !msg.isTyping && msg.sender === 'ai').length);
  let conversationShouldEnd = false;
  let endReasonMessage = '';
  const currentScore = typeof score.value === 'number' ? score.value : 50; // Use a number for checks

  if (currentScore <= lowScoreThreshold) {
    conversationShouldEnd = true;
    endReasonMessage = `对话结束。您的风险评分非常低 (${currentScore.toFixed(2)})，在本次模拟中表现出极易被骗的倾向。请务必提高警惕，注意保护个人信息！`;
  } else if (currentScore >= highScoreThreshold) {
    conversationShouldEnd = true;
    endReasonMessage = `对话结束。恭喜您！您的风险评分较高 (${currentScore.toFixed(2)})，在本次模拟中您表现出较高的防范意识。`;
  } else if (turn >= conversationLimit) {
    conversationShouldEnd = true;
    endReasonMessage = `本次模拟对话已达到最大轮次 (${conversationLimit})。您的最终风险评分为 (${currentScore.toFixed(2)})。请持续提高防范意识。`;
  }

  if (conversationShouldEnd && !isConversationOver.value) {
    isConversationOver.value = true;
    summaryMessage.value = endReasonMessage;
    isLoading.value = false;
    endConversationOnServer();
  }
});

watchEffect(() => {
  if (messages.value.length && chatArea.value) {
    scrollToBottom();
  }
});

</script>

<style scoped>
.chat-page-container {
  display: flex;
  flex-direction: column;
  height: 79vh; 
  background-color: var(--background-color);
  color: var(--text-color);
  overflow: hidden;
  max-width: 800px;
  margin: 0 auto; 
  margin-top:20px;
  border-radius: 15px;
  box-shadow: 0 4px 12px var(--shadow-color);
}

.start-screen {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 20px;
  background-color: var(--surface-color);
  border-radius: 15px;
  box-shadow: 0 4px 12px var(--shadow-color);
}

.start-text {
  font-size: 1.1em;
  color: var(--text-color);
  margin-bottom: 20px;
  max-width: 500px;
}

.start-button {
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 1em;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
  box-shadow: 0 2px 4px var(--shadow-color);
}

.start-button:hover:not(:disabled) {
  background-color: var(--primary-color-dark);
  box-shadow: 0 4px 8px var(--hover-shadow-color);
}

.start-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
  opacity: 0.7;
}

.chat-area {
  flex: 1; 
  overflow-y: auto; 
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  background-color: var(--surface-color);
  border-radius: 8px;
  box-shadow: inset 0 2px 4px var(--shadow-color-inset);
  margin-bottom: 10px;
}

.message-container {
  display: flex;
  align-items: flex-start;
  animation: messageFadeIn 0.5s ease-out;
}

.user-message-container {
  justify-content: flex-end;
}

.ai-message-container {
  justify-content: flex-start;
}

.message-bubble {
  padding: 12px 18px;
  border-radius: 20px;
  max-width: 80%;
  word-break: break-word;
  box-shadow: 0 1px 3px var(--shadow-color-light);
  position: relative;
}

.user-message-bubble {
  background-color: var(--primary-color);
  color: white;
  border-bottom-right-radius: 5px;
}

.ai-message-bubble {
  background-color: var(--surface-color-light);
  color: var(--text-color);
  border-bottom-left-radius: 5px;
}

.typing-indicator {
  display: flex;
  align-items: center;
  height: 1.5em;
}

.typing-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: var(--subtle-text-color);
  margin: 0 2px;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-dot:nth-child(1) { animation-delay: -0.32s; }
.typing-dot:nth-child(2) { animation-delay: -0.16s; }
.typing-dot:nth-child(3) { animation-delay: 0s; }

@keyframes typing {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1.0); }
}


.message-tip {
    position: absolute;
    bottom: 0;
    width: 0;
    height: 0;
    border: 6px solid transparent;
}

.user-tip {
    right: -6px;
    border-left-color: var(--primary-color);
    border-bottom-color: var(--primary-color);
    border-bottom-right-radius: 3px;
    transform: rotate(-20deg);
}

.ai-tip {
    left: -6px;
    border-right-color: var(--surface-color-light);
    border-bottom-color: var(--surface-color-light);
    border-bottom-left-radius: 3px;
    transform: rotate(20deg);
}

.conversation-summary {
  padding: 20px;
  text-align: center;
  font-weight: bold;
  border-radius: 8px;
  box-shadow: 0 -2px 8px var(--shadow-color-top);
  flex-shrink: 0;
}

.summary-low-risk {
  background-color: var(--error-color-light);
  color: var(--error-color-dark);
}

.summary-medium-risk {
  background-color: var(--warning-color-light);
  color: var(--warning-color-dark);
}

.summary-high-safety {
  background-color: var(--success-color-light);
  color: var(--success-color-dark);
}

.summary-title {
  font-size: 1.3em;
  margin-bottom: 10px;
}

.summary-score {
  font-size: 1.2em;
  margin-bottom: 10px;
}

.final-score {
  font-weight: bolder;
}

.summary-message {
  font-size: 1em;
  margin-bottom: 15px;
}


.input-area {
  display: flex;
  align-items: center;
  padding: 10px;
  background-color: var(--surface-color);
  border-top: 1px solid var(--border-color);
  gap: 10px;
  flex-shrink: 0; 
}

.end-button, .send-button {
  flex-shrink: 0;
  border: none;
  border-radius: 50%;
  padding: 10px;
  cursor: pointer;
  transition: background-color 0.3s ease, opacity 0.3s ease;
  box-shadow: 0 1px 3px var(--shadow-color-light);
}

.end-button {
  background-color: var(--subtle-text-color);
  color: white;
}

.end-button:hover:not(:disabled) {
    background-color: var(--subtle-text-color-dark);
}

.send-button {
  background-color: var(--primary-color);
  color: white;
}

.send-button:hover:not(:disabled) {
  background-color: var(--primary-color-dark);
}

.end-button:disabled, .send-button:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
    opacity: 0.7;
}

.icon {
    width: 24px;
    height: 24px;
    stroke: currentColor;
}

.message-input {
  flex-grow: 1;
  border: 1px solid var(--border-color);
  border-radius: 20px;
  padding: 10px 15px;
  outline: none;
  background-color: var(--input-bg-color);
  color: var(--text-color);
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.message-input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb, 0, 123, 255), 0.2);
}

.message-input:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

@keyframes messageFadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 768px) {
  .chat-page-container {
      padding: 10px;
      max-width: 100%;
      border-radius: 0;
      box-shadow: none;
      height: 70vh; 
      margin: 10px auto;
  }

  .start-screen {
      margin: 10px;
  }

  .chat-area {
      padding: 5px;
      gap: 10px;
      margin-bottom: 5px;
  }

  .message-bubble {
      padding: 10px 15px;
      max-width: 90%;
  }

  .input-area {
      padding: 8px;
      gap: 8px;
  }

  .end-button, .send-button {
      padding: 8px;
  }

  .icon {
      width: 20px;
      height: 20px;
  }

  .message-input {
      padding: 8px 12px;
  }
}
</style>
