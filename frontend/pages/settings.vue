<template>
  <div class="px-20 py-10 lg:px-40">
    <div class="mx-auto max-w-3xl">
      <h2 class="text-4xl font-bold tracking-tight text-white mb-12">Settings</h2>
      <div class="space-y-8">
        <!-- Appearance Settings -->
        <div class="bg-gray-800 p-6 rounded-2xl gradient-border">
          <h3 class="text-xl font-semibold mb-4 text-white">Appearance</h3>
          <div class="space-y-4">
            <div>
              <label for="language" class="block text-sm font-medium text-gray-300">Language</label>
              <select id="language" class="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-color">
                <option>English</option>
                <option>中文 (Chinese)</option>
              </select>
            </div>
            <div>
              <label for="theme" class="block text-sm font-medium text-gray-300">Theme</label>
              <select id="theme" class="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-color">
                <option>Dark</option>
                <option>Light</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Feedback Form -->
        <div class="bg-gray-800 p-6 rounded-2xl gradient-border">
          <h3 class="text-xl font-semibold mb-4 text-white">Submit Feedback</h3>
          <form @submit.prevent="handleFeedback" class="space-y-4">
            <div>
              <label for="feedback_content" class="block text-sm font-medium text-gray-300">Your Feedback</label>
              <textarea id="feedback_content" rows="4" class="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-color"></textarea>
            </div>
            <div>
              <label for="feedback_image" class="block text-sm font-medium text-gray-300">Attach Image (Optional)</label>
              <input type="file" id="feedback_image" class="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-color file:text-gray-900 hover:file:bg-opacity-90"/>
            </div>
            <div>
              <label for="contact_info" class="block text-sm font-medium text-gray-300">Contact Info (Optional)</label>
              <input id="contact_info" type="text" class="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-color" placeholder="Your email or phone number"/>
            </div>
            <button
              type="submit"
              class="px-4 py-2 font-semibold text-gray-900 bg-primary-color rounded-md hover:bg-opacity-90 transition-colors"
            >
              Submit
            </button>
            <p v-if="feedbackMessage" class="text-green-400 text-sm mt-2">{{ feedbackMessage }}</p>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

definePageMeta({
  middleware: 'auth'
});

const feedbackMessage = ref('');

const handleFeedback = () => {
    feedbackMessage.value = "Thank you for your feedback! (This is a demo and the form is not connected to a backend).";
}
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
.gradient-border {
  border: 1px solid transparent;
  background-image: linear-gradient(var(--card-background, #1f2937), var(--card-background, #1f2937)),
    linear-gradient(to right, #38e07b, #2a9d8f);
  background-origin: border-box;
  background-clip: padding-box, border-box;
}
</style>
