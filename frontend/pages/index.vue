<template>
  <div>
    <h1>API 工具使用说明</h1>
    <p>本页演示 frontend/api 中所有工具函数的调用方式，请打开控制台查看调用结果。</p>
    <ul>
      <li>auth.js: 用户注册、登录、资料、设置等</li>
      <li>achievements.js: 成就获取与授予</li>
      <li>feedback.js: 提交反馈</li>
      <li>quiz.js: 题目获取与提交答案</li>
      <li>chat.js: AI 对话</li>
    </ul>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { register, login, fetchProfile, changePassword, deleteAccount, bindEmail, bindPhone, unbindEmail, unbindPhone, getSettings, updateSettings, logout } from '~/api/auth';
import { fetchAchievements, grantAchievement } from '~/api/achievements';
import { submitFeedback } from '~/api/feedback';
import { fetchQuestions, submitAnswers } from '~/api/quiz';
import { sendMessage } from '~/api/chat';
import { useAuthStore } from '~/stores/auth';

onMounted(async () => {
  const auth = useAuthStore();
  auth.initialize();

  try { await register({ username: 'demo', password: 'password123' }); console.log('register ok'); } catch (e) { console.log('register', e.response?.data || e.message); }
  try {
    const { data } = await login('demo', 'password123');
    auth.setTokens(data.access, data.refresh);
    console.log('login', data);
  } catch (e) { console.log('login', e.response?.data || e.message); }
  try { const profile = await fetchProfile(); console.log('profile', profile.data); } catch (e) { console.log('profile', e.response?.data || e.message); }
  try { await bindEmail('demo@example.com', '000000'); } catch (e) { console.log('bindEmail', e.response?.data || e.message); }
  try { await bindPhone('1234567890', '000000'); } catch (e) { console.log('bindPhone', e.response?.data || e.message); }
  try { await unbindEmail(); } catch (e) { console.log('unbindEmail', e.response?.data || e.message); }
  try { await unbindPhone(); } catch (e) { console.log('unbindPhone', e.response?.data || e.message); }
  try { const settings = await getSettings(); console.log('getSettings', settings.data); } catch (e) { console.log('getSettings', e.response?.data || e.message); }
  try { await updateSettings({ language: 'en', theme: 'light' }); console.log('updateSettings ok'); } catch (e) { console.log('updateSettings', e.response?.data || e.message); }
  try { await changePassword({ old_password: 'password123', new_password: 'newpass123' }); } catch (e) { console.log('changePassword', e.response?.data || e.message); }
  try { const ach = await fetchAchievements(); console.log('achievements', ach.data); } catch (e) { console.log('fetchAchievements', e.response?.data || e.message); }
  try { await grantAchievement(1); } catch (e) { console.log('grantAchievement', e.response?.data || e.message); }
  try { await submitFeedback({ message: 'test feedback' }); } catch (e) { console.log('submitFeedback', e.response?.data || e.message); }
  try { const q = await fetchQuestions('easy'); console.log('questions', q.data); await submitAnswers('easy', []); } catch (e) { console.log('quiz', e.response?.data || e.message); }
  try { const msg = await sendMessage('hello'); console.log('chat', msg.data); } catch (e) { console.log('chat', e.response?.data || e.message); }
  try { await logout(auth.refreshToken); auth.clear(); } catch (e) { console.log('logout', e.response?.data || e.message); }
  try { await deleteAccount(); } catch (e) { console.log('deleteAccount', e.response?.data || e.message); }
});
</script>
