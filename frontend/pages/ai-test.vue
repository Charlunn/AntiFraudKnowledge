<template>
  <div class="container mx-auto px-6 py-8">
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2 bg-gray-800 rounded-2xl shadow-lg flex flex-col h-[calc(100vh-120px)]">
        <div class="p-6 border-b border-gray-700">
          <h2 class="text-2xl font-bold text-white">Anti-Fraud Drill</h2>
          <p class="text-gray-400 mt-1">Engage in a simulated chat with an AI scammer.</p>
        </div>
        <div class="flex-1 p-6 space-y-6 overflow-y-auto">
          <!-- Chat messages go here -->
          <div class="flex items-start gap-4">
            <div class="w-10 h-10 rounded-full bg-primary-color/20 flex items-center justify-center font-bold text-primary-color shrink-0">AI</div>
            <div>
              <p class="font-semibold text-sm text-primary-color">AI Scammer</p>
              <div class="gradient-chat-bubble text-gray-900 font-medium p-4 rounded-xl rounded-tl-none mt-1 inline-block max-w-md">
                Hello, this is Alex from the customer support team. We've detected some unusual activity on your account. Can you verify your details?
              </div>
            </div>
          </div>
          <div class="flex items-start gap-4 justify-end">
            <div class="text-right">
              <p class="font-semibold text-sm text-gray-400">You</p>
              <div class="bg-gray-700 text-white p-4 rounded-xl rounded-tr-none mt-1 inline-block max-w-md">
                Hi Alex, what kind of activity are you seeing?
              </div>
            </div>
             <div class="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center font-bold text-white shrink-0">U</div>
          </div>
        </div>
        <div class="p-6 border-t border-gray-700 mt-auto">
          <div class="flex items-center gap-4">
            <input class="w-full bg-gray-700 border-gray-600 text-white py-3 px-4 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-color" placeholder="Type your message..." type="text"/>
            <button class="bg-primary-color text-gray-900 py-3 px-6 rounded-full font-semibold hover:bg-opacity-90 transition-colors duration-200">Send</button>
            <button class="bg-red-500 text-white py-3 px-6 rounded-full font-semibold hover:bg-red-600 transition-colors duration-200">End Drill</button>
          </div>
        </div>
      </div>
      <div class="space-y-8">
        <div class="bg-gray-800 p-6 rounded-2xl shadow-lg">
          <h3 class="text-xl font-bold text-white mb-4">Real-time Risk Prompts</h3>
          <div class="space-y-4">
            <div class="flex items-center gap-4 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
              <div class="text-red-400">
                <svg fill="currentColor" height="28" viewBox="0 0 256 256" width="28" xmlns="http://www.w3.org/2000/svg"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm-8-80V80a8,8,0,0,1,16,0v56a8,8,0,0,1-16,0Zm20,36a12,12,0,1,1-12-12A12,12,0,0,1,140,172Z"></path></svg>
              </div>
              <div>
                <p class="font-semibold text-red-400">High Risk</p>
                <p class="text-gray-400 text-sm">Requesting sensitive information.</p>
              </div>
            </div>
          </div>
        </div>
        <div class="bg-gray-800 p-6 rounded-2xl shadow-lg">
          <h3 class="text-xl font-bold text-white mb-4">Drill Report</h3>
          <div class="space-y-6">
            <div class="bg-gray-700 p-4 rounded-lg">
              <p class="font-semibold text-white">Identification Success Rate</p>
              <div class="flex items-center gap-4 mt-2">
                <div class="w-full bg-gray-600 rounded-full h-2.5">
                  <div class="bg-primary-color h-2.5 rounded-full" style="width: 0%"></div>
                </div>
                <span class="font-bold text-lg text-primary-color">0%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: 'auth'
});
</script>

<style scoped>
:root {
  --primary-color: #38e07b;
}
.text-primary-color {
  color: var(--primary-color);
}
.bg-primary-color {
  background-color: var(--primary-color);
}
.focus\:ring-primary-color:focus {
  --tw-ring-color: var(--primary-color);
}
.gradient-chat-bubble {
  background: linear-gradient(90deg, #4ecdc4, #2a9d8f);
}
</style>
