<template>
  <div class="chat-page-container">
    <!-- 移除内部 Header，依赖 AppHeader -->

    <div v-if="!conversationStarted && !isConversationOver" class="start-screen">
        <p class="start-text">这是一个AI诈骗风险模拟器。你将与一个扮演诈骗角色的AI进行对话。对话结束后，你会看到你的被骗风险评分。</p>
        <button @click="startNewConversation" class="start-button">
          开始对话
        </button>
    </div>
    <div v-else ref="chatArea" class="chat-area">
      <!-- Message Loop -->
      <div
        v-for="(message, index) in messages"
        :key="index"
        class="message-container"
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
           <!-- Tip for user bubble -->
           <div v-if="message.sender === 'user'" class="message-tip user-tip"></div>
           <!-- Tip for AI bubble -->
           <div v-if="message.sender === 'ai'" class="message-tip ai-tip"></div>

          <div v-if="message.isTyping" class="typing-indicator">
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
          </div>
          <span v-else>{{ message.text }}</span>
        </div>
      </div>
      <!-- Loading indicator for the very first AI message -->
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
       <!-- Loading indicator for subsequent AI messages -->
       <div v-else-if="isLoading && messages[messages.length - 1]?.sender === 'user' && !isConversationOver" class="message-container ai-message-container">
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

    <!-- Conversation End Summary -->
    <div v-if="isConversationOver"
         class="conversation-summary"
         :class="scoreColorClass">
      <p class="summary-title">对话结束。</p>
      <p class="summary-score">
        您的最终被骗风险评分为: <span class="final-score">{{ score.toFixed(2) }}</span>
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

    <!-- Input Area -->
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
        :disabled="isLoading"
      />
      <button
        @click="sendMessage"
        class="send-button"
        :disabled="isLoading"
        aria-label="发送消息"
      >
         <svg class="icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
      </button>
    </div>

  </div>
</template>

<script setup>
import { ref, watchEffect, nextTick, computed, onMounted } from 'vue';
import { useRuntimeConfig } from '#app';
import axios from 'axios';
import { useAuthStore } from '~/stores/auth';

// Add middleware to require authentication for this page
definePageMeta({
  requiresAuth: true
});

const userInput = ref('');
const score = ref(50); // 初始评分设定为50
const isLoading = ref(false);
const isConversationOver = ref(false); // 控制对话是否结束
const summaryMessage = ref(''); // 总结提示信息
const conversationStarted = ref(false); // 控制对话是否开始

const conversationLimit = 10; // 最大对话轮次
const lowScoreThreshold = 20; // 低风险评分阈值 (触发失败)
const highScoreThreshold = 80; // 高风险评分阈值 (触发成功，新增)

const chatArea = ref(null); // Ref for the chat area element

// Initial message list is empty
const messages = ref([]);

// Access runtime config and API base URL
const runtimeConfig = useRuntimeConfig();
const API_BASE_URL = runtimeConfig.public.apiBase;

// Access auth store
const authStore = useAuthStore();

// Computed property to determine score color class
const scoreColorClass = computed(() => {
  if (score.value <= lowScoreThreshold) {
    return 'summary-low-risk'; // Low score = High Risk (Red)
  } else if (score.value >= highScoreThreshold) {
    return 'summary-high-safety'; // High score = Low Risk (Green)
  } else {
    return 'summary-medium-risk'; // Medium score = Medium Risk (Yellow)
  }
});

// Function to initiate the first AI message to get the scenario and role
const startInitialAIResponse = async () => {
    isLoading.value = true;
    try {
        // Use axios to call the backend API
        const response = await axios.post(`${API_BASE_URL}/chat/`, { message: '' }, { // Assuming your chat endpoint is /api/chat/
             headers: {
                'Content-Type': 'application/json',
                // Include Authorization header - Axios interceptor should handle token refresh
                'Authorization': `Bearer ${authStore.getAccessToken}`
             }
        });
        const data = response.data; // Axios puts the response body in .data

        // Check if the request was successful and contains necessary data
        if (data.success === true && data.messages !== undefined && data.score !== undefined) {
            // Update messages with the full conversation history from the backend
            // Convert backend format {role, content} to frontend format {sender, text}
            messages.value = data.messages.map(msg => ({
                sender: msg.role === 'user' ? 'user' : 'ai', // Map role to sender
                text: msg.content,
                isTyping: false // Assuming initial messages are not typing
            }));
            score.value = data.score; // Update score

            // Scroll to bottom after messages are updated
            await nextTick();
            scrollToBottom();
        } else {
           // Handle unexpected response format or backend error message
           const errorMessage = { sender: 'ai', text: data.error || '无法开始对话，请稍后再试。', isTyping: false };
           messages.value.push(errorMessage);
           console.error('Failed to get initial AI message or unexpected format:', data);
           // Scroll to bottom after error message
           await nextTick();
           scrollToBottom();
        }
    } catch (error) {
        console.error('Error fetching initial AI message:', error);
        // Handle network errors or other exceptions
        const errorMessage = { sender: 'ai', text: '启动对话失败，请检查网络或稍后再试。', isTyping: false };
        messages.value.push(errorMessage);
         await nextTick();
         scrollToBottom();
    } finally {
        isLoading.value = false;
    }
};


const sendMessage = async () => {
  if (userInput.value.trim() === '') {
    return;
  }

  isLoading.value = true; // Set loading state to true

  // Add user message to the frontend immediately
  const userMessage = { sender: 'user', text: userInput.value, isTyping: false };
  messages.value.push(userMessage);

  // Scroll to the bottom after adding user message
  await nextTick();
  scrollToBottom();

  const messageText = userInput.value;
  userInput.value = ''; // Clear input field

  try {
    // Use axios to send the message
    const response = await axios.post(`${API_BASE_URL}/chat/`, { message: messageText }, { // Assuming your chat endpoint is /api/chat/
         headers: {
            'Content-Type': 'application/json',
            // Include Authorization header
            'Authorization': `Bearer ${authStore.getAccessToken}`
         }
    });
    const data = response.data; // Axios puts the response body in .data

    // Check if the request was successful and contains necessary data
    if (data.success === true && data.messages !== undefined && data.score !== undefined) {
       // Update messages with the full conversation history from the backend
       // Convert backend format {role, content} to frontend format {sender, text}
       messages.value = data.messages.map(msg => ({
           sender: msg.role === 'user' ? 'user' : 'ai', // Map role to sender
           text: msg.content,
           isTyping: false // Assuming new messages from backend are not typing indicators
       }));
       score.value = data.score; // Update score

       // Scroll to the bottom after adding AI message
       await nextTick();
       scrollToBottom();

    } else {
       // If API response is unexpected, add an error message from AI
       const aiMessage = { sender: 'ai', text: data.error || '我暂时无法回复，请稍后再试。' , isTyping: false};
       messages.value.push(aiMessage);
       console.error('Unexpected API response format or API error:', data);
       // Scroll to bottom after error message
       await nextTick();
       scrollToBottom();
    }
  } catch (error) {
    console.error('Error sending message:', error);
    // If fetch fails, add a network error message from AI
    const errorMessage = { sender: 'ai', text: '发送消息失败，请检查网络或稍后再试。', isTyping: false };
    messages.value.push(errorMessage);
    // Scroll to bottom after error message
    await nextTick();
    scrollToBottom();
  } finally {
    isLoading.value = false; // Finish loading
  }
};

const endConversation = async () => { // Make async to call backend API
  isConversationOver.value = true;
  isLoading.value = false; // Ensure loading is off
  // Set a default summary message for manual end
  if (score.value <= lowScoreThreshold) {
     summaryMessage.value = `您主动结束了对话。您的最终风险评分为 (${score.value.toFixed(2)})，在本次模拟中表现出极易被骗的倾向。请务必提高警惕！`;
  } else if (score.value >= highScoreThreshold) {
      summaryMessage.value = `您主动结束了对话。您的最终风险评分为 (${score.value.toFixed(2)})。在本次模拟中您表现出较高的防范意识。`;
  } else {
      summaryMessage.value = `您主动结束了对话。您的最终风险评分为 (${score.value.toFixed(2)})。请持续提高防范意识。`;
  }

   // Optionally call backend to end conversation and save results
   try {
        await axios.post(`${API_BASE_URL}/chat/end/`, {}, { // Assuming your end endpoint is /api/chat/end/
             headers: {
                'Authorization': `Bearer ${authStore.getAccessToken}`
             }
        });
        console.log('Backend conversation state ended.');
   } catch (error) {
        console.error('Error ending conversation on backend:', error);
        // Continue with frontend end even if backend call fails
   }
};

const startNewConversation = async () => {
  // Call backend API to reset conversation state
  try {
    const response = await axios.post(`${API_BASE_URL}/chat/reset/`, {}, { // Assuming your reset endpoint is /api/chat/reset/
      headers: {
         'Authorization': `Bearer ${authStore.getAccessToken}`
      }
    });
    const data = response.data;
    if (data.success === true) {
        console.log('Backend conversation state reset.');
    } else {
        console.error('Backend conversation reset failed:', data.error);
        // Optionally show an error message to the user
    }
  } catch (error) {
    console.error('Error resetting conversation state on backend:', error);
    // Continue with frontend reset even if backend reset fails, but log the error
  }

  // Reset frontend state and UI
  messages.value = []; // Clear messages
  userInput.value = '';
  score.value = 50;
  isLoading.value = false;
  isConversationOver.value = false;
  summaryMessage.value = '';
  conversationStarted.value = true; // Set conversation started to true

  // Start the initial AI response to get the new scenario
  startInitialAIResponse();

  // Scroll to top when starting a new conversation (optional)
  // await nextTick();
  // if (chatArea.value) {
  //   chatArea.value.scrollTop = 0;
  // }
};

const scrollToBottom = () => {
  // Use the ref to access the chat area element
  if (chatArea.value) {
    // Use smooth scroll behavior
    chatArea.value.scrollTo({
      top: chatArea.value.scrollHeight,
      behavior: 'smooth'
    });
  }
};

// Watch for conversation end conditions (score or turn limit)
watchEffect(() => {
  // Filter out typing indicators when counting turns
  const turn = Math.floor(messages.value.filter(msg => !msg.isTyping).length / 2);

  if (score.value <= lowScoreThreshold && !isConversationOver.value) {
    isConversationOver.value = true;
    summaryMessage.value = `对话结束。您的风险评分非常低 (${score.value.toFixed(2)})，在本次模拟中表现出极易被骗的倾向。请务必提高警惕，注意保护个人信息！`;
    isLoading.value = false; // Ensure loading is off when conversation ends
     // Optionally call backend to end conversation on score trigger
     // endConversation(); // Call the function to also notify backend
  } else if (score.value >= highScoreThreshold && !isConversationOver.value) {
     isConversationOver.value = true;
     summaryMessage.value = `对话结束。恭喜您！您的风险评分较高 (${score.value.toFixed(2)})，在本次模拟中您表现出较高的防范意识。`;
     isLoading.value = false;
      // Optionally call backend to end conversation on score trigger
     // endConversation(); // Call the function to also notify backend
  }
  else if (turn >= conversationLimit && !isConversationOver.value) {
    isConversationOver.value = true;
    summaryMessage.value = `本次模拟对话已达到最大轮次 (${conversationLimit})。您的最终风险评分为 (${score.value.toFixed(2)})。请持续提高防范意识。`;
     isLoading.value = false; // Ensure loading is off when conversation ends
      // Optionally call backend to end conversation on turn limit trigger
     // endConversation(); // Call the function to also notify backend
  }
});

</script>

<style scoped>
/* Re-integrate styles to match main theme and remove hardcoded values */
/* Use CSS variables defined in main.css */

.chat-page-container {
  display: flex;
  flex-direction: column; /* Arrange content vertically */
  flex-grow: 1; /* Allow container to fill available space within App layout */
  /* Removed height: 100vh */
  background-color: var(--background-color); /* Use theme background color */
  color: var(--text-color); /* Use theme text color */
  overflow: hidden; /* Prevent content overflow */
  padding: 20px; /* Add padding around the chat area */
  max-width: 800px; /* Limit chat width for better readability */
  margin: 0 auto; /* Center the chat container */
  border-radius: 15px; /* Add border radius for a card-like appearance */
  box-shadow: 0 4px 12px var(--shadow-color); /* Add shadow */
}

.start-screen {
  flex: 1; /* Allow start screen to fill space */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 20px;
  background-color: var(--surface-color); /* Use surface color */
  border-radius: 15px; /* Consistent border radius */
  box-shadow: 0 4px 12px var(--shadow-color); /* Consistent shadow */
}

.start-text {
  font-size: 1.1em;
  color: var(--text-color); /* Use theme text color */
  margin-bottom: 20px;
  max-width: 500px;
}

.start-button {
  background-color: var(--primary-color); /* Use theme primary color */
  color: white; /* White text for primary button */
  border: none;
  border-radius: 8px; /* Consistent button border radius */
  padding: 12px 24px;
  font-size: 1em;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
  box-shadow: 0 2px 4px var(--shadow-color); /* Button shadow */
}

.start-button:hover:not(:disabled) {
  background-color: var(--primary-color-dark); /* Darken primary color on hover */
  box-shadow: 0 4px 8px var(--hover-shadow-color); /* Increase shadow on hover */
}

.start-button:disabled {
  background-color: #cccccc; /* Disabled button color */
  cursor: not-allowed;
  opacity: 0.7;
}

.chat-area {
  flex: 1; /* Chat area fills available vertical space */
  overflow-y: auto; /* Enable vertical scrolling */
  padding: 10px; /* Padding inside chat area */
  display: flex;
  flex-direction: column;
  gap: 15px; /* Space between messages */
   background-color: var(--surface-color); /* Use surface color for chat background */
   border-radius: 8px; /* Slightly smaller border radius for chat area */
   box-shadow: inset 0 2px 4px var(--shadow-color-inset); /* Optional inset shadow */
}

.message-container {
  display: flex;
  align-items: start;
  animation: messageFadeIn 0.5s ease-out; /* Animation for new messages */
}

.user-message-container {
  justify-content: flex-end; /* Align user messages to the right */
}

.ai-message-container {
  justify-content: flex-start; /* Align AI messages to the left */
}

.message-bubble {
  padding: 12px 18px;
  border-radius: 20px; /* More rounded corners for bubbles */
  max-width: 80%;
  word-break: break-word; /* Break long words */
  box-shadow: 0 1px 3px var(--shadow-color-light); /* Subtle bubble shadow */
  position: relative; /* For tip positioning */
}

.user-message-bubble {
  background-color: var(--primary-color); /* User message color */
  color: white; /* White text for user message */
  border-bottom-right-radius: 5px; /* Adjust one corner for tip */
}

.ai-message-bubble {
  background-color: var(--surface-color-light); /* AI message color */
  color: var(--text-color); /* Theme text color for AI */
  border-bottom-left-radius: 5px; /* Adjust one corner for tip */
}

/* Typing Indicator */
.typing-indicator {
  display: flex;
  align-items: center;
  height: 1.5em; /* Match line height */
}

.typing-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: var(--subtle-text-color); /* Color for typing dots */
  margin: 0 2px;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-dot:nth-child(1) { animation-delay: -0.32s; }
.typing-dot:nth-child(2) { animation-delay: -0.16s; }
.typing-dot:nth-child(3) { animation-delay: 0s; }

@keyframes typing {
  0%, 80%, 100% { transform: initial; }
  40% { transform: translateY(-4px); }
}

/* Message Tip */
.message-tip {
    position: absolute;
    bottom: 0;
    width: 0;
    height: 0;
    border: 6px solid transparent; /* Size of the tip */
}

.user-tip {
    right: -6px; /* Position right */
    border-left-color: var(--primary-color); /* Match user bubble color */
    border-bottom-color: var(--primary-color); /* Match user bubble color */
    border-bottom-right-radius: 3px; /* Blend with bubble corner */
    transform: rotate(-20deg); /* Angle of the tip */
}

.ai-tip {
    left: -6px; /* Position left */
    border-right-color: var(--surface-color-light); /* Match AI bubble color */
    border-bottom-color: var(--surface-color-light); /* Match AI bubble color */
     border-bottom-left-radius: 3px; /* Blend with bubble corner */
    transform: rotate(20deg); /* Angle of the tip */
}


/* Conversation Summary */
.conversation-summary {
  padding: 20px;
  text-align: center;
  font-weight: bold;
  margin-top: 20px; /* Space above summary */
  border-radius: 8px; /* Consistent border radius */
  box-shadow: 0 -2px 8px var(--shadow-color-top); /* Shadow above summary */
  /* Background colors will be applied by scoreColorClass */
}

.summary-low-risk { /* Red background for low score (high risk) */
  background-color: var(--error-color-light); /* Light red */
  color: var(--error-color-dark); /* Dark red text */
}

.summary-medium-risk { /* Orange background for medium risk */
    background-color: var(--warning-color-light); /* Light orange */
    color: var(--warning-color-dark); /* Dark orange text */
}

.summary-high-safety { /* Green background for high score (low risk) */
    background-color: var(--success-color-light); /* Light green */
    color: var(--success-color-dark); /* Dark green text */
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
  color: var(--subtle-text-color); /* Subtle text for the message */
}


/* Input Area */
.input-area {
  display: flex;
  align-items: center;
  padding: 10px; /* Padding around input area */
  background-color: var(--surface-color); /* Use surface color */
  border-top: 1px solid var(--border-color); /* Top border */
  gap: 10px; /* Space between input elements */
}

.end-button, .send-button {
  flex-shrink: 0;
  border: none;
  border-radius: 50%; /* Round buttons */
  padding: 10px;
  cursor: pointer;
  transition: background-color 0.3s ease, opacity 0.3s ease;
  box-shadow: 0 1px 3px var(--shadow-color-light);
}

.end-button {
  background-color: var(--subtle-text-color); /* Use subtle color for end button */
  color: white;
}

.end-button:hover:not(:disabled) {
    background-color: var(--subtle-text-color-dark); /* Darken on hover */
}

.send-button {
  background-color: var(--primary-color); /* Use primary color for send button */
  color: white;
}

.send-button:hover:not(:disabled) {
  background-color: var(--primary-color-dark); /* Darken primary on hover */
}

.end-button:disabled, .send-button:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
    opacity: 0.7;
}

.icon {
    width: 24px;
    height: 24px;
    stroke: currentColor; /* Use parent's text color for icon */
}


.message-input {
  flex-grow: 1; /* Input fills available space */
  border: 1px solid var(--border-color); /* Border with theme color */
  border-radius: 20px; /* Rounded input */
  padding: 10px 15px;
  outline: none; /* Remove default outline */
  background-color: var(--input-bg-color); /* Input background color */
  color: var(--text-color); /* Input text color */
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.message-input:focus {
  border-color: var(--primary-color); /* Highlight on focus */
  box-shadow: 0 0 0 2px rgba(var(--primary-color-dark), 0.2); /* Add subtle focus shadow */
}

.message-input:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

/* Animation for messages */
@keyframes messageFadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .chat-page-container {
      padding: 10px; /* Reduce padding on smaller screens */
      max-width: 100%; /* Full width on smaller screens */
      border-radius: 0; /* Remove border radius on full width */
      box-shadow: none; /* Remove shadow on full width */
  }

  .start-screen {
      margin: 10px; /* Adjust margin for smaller screens */
  }

  .chat-area {
      padding: 5px; /* Reduce padding in chat area */
      gap: 10px; /* Adjust gap between messages */
  }

  .message-bubble {
      padding: 10px 15px; /* Adjust bubble padding */
      max-width: 90%; /* Allow bubbles to take more width */
  }

  .input-area {
      padding: 8px; /* Adjust input area padding */
      gap: 8px; /* Adjust gap in input area */
  }

  .end-button, .send-button {
      padding: 8px; /* Adjust button padding */
  }

   .icon {
       width: 20px;
       height: 20px;
   }

   .message-input {
       padding: 8px 12px; /* Adjust input padding */
   }
}
</style>
