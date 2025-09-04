<template>
  <div class="help-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">帮助中心</h1>
        <p class="page-description">获取使用平台的帮助和指导</p>
      </div>
    </div>

    <!-- 帮助内容 -->
    <div class="help-content">
      <div class="container mx-auto px-4 py-8">
        <!-- 快速导航 -->
        <div class="quick-nav mb-8">
          <h2 class="text-2xl font-bold mb-4">快速导航</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <NuxtLink to="/quiz" class="help-card">
              <div class="help-card-icon">
                <Icon name="heroicons:academic-cap" class="w-8 h-8" />
              </div>
              <h3 class="help-card-title">反欺诈测验</h3>
              <p class="help-card-description">通过测验检验您的反欺诈知识掌握程度</p>
            </NuxtLink>
            
            <NuxtLink to="/ai-test" class="help-card">
              <div class="help-card-icon">
                <Icon name="heroicons:cpu-chip" class="w-8 h-8" />
              </div>
              <h3 class="help-card-title">AI测试</h3>
              <p class="help-card-description">体验AI对话、评估和模拟功能</p>
            </NuxtLink>
            
            <NuxtLink to="/graph" class="help-card">
              <div class="help-card-icon">
                <Icon name="heroicons:share" class="w-8 h-8" />
              </div>
              <h3 class="help-card-title">知识图谱</h3>
              <p class="help-card-description">探索反欺诈知识的关联关系</p>
            </NuxtLink>
            
            <NuxtLink to="/community" class="help-card">
              <div class="help-card-icon">
                <Icon name="heroicons:users" class="w-8 h-8" />
              </div>
              <h3 class="help-card-title">社区</h3>
              <p class="help-card-description">与其他用户交流学习经验</p>
            </NuxtLink>
            
            <NuxtLink to="/resources" class="help-card">
              <div class="help-card-icon">
                <Icon name="heroicons:book-open" class="w-8 h-8" />
              </div>
              <h3 class="help-card-title">学习资源</h3>
              <p class="help-card-description">丰富的反欺诈学习材料</p>
            </NuxtLink>
            
            <NuxtLink to="/achievements" class="help-card">
              <div class="help-card-icon">
                <Icon name="heroicons:trophy" class="w-8 h-8" />
              </div>
              <h3 class="help-card-title">成就系统</h3>
              <p class="help-card-description">查看您的学习成就和进度</p>
            </NuxtLink>
          </div>
        </div>

        <!-- 常见问题 -->
        <div class="faq-section mb-8">
          <h2 class="text-2xl font-bold mb-6">常见问题</h2>
          <div class="space-y-4">
            <div class="faq-item">
              <h3 class="faq-question">如何开始使用平台？</h3>
              <p class="faq-answer">
                首先注册账户，然后可以从首页开始探索各个功能模块。建议先从基础测验开始，了解自己的知识水平。
              </p>
            </div>
            
            <div class="faq-item">
              <h3 class="faq-question">测验有时间限制吗？</h3>
              <p class="faq-answer">
                是的，不同难度的测验有不同的时间限制。初级测验通常为30分钟，中级为45分钟，高级为60分钟。
              </p>
            </div>
            
            <div class="faq-item">
              <h3 class="faq-question">如何查看我的学习进度？</h3>
              <p class="faq-answer">
                您可以在个人中心查看详细的学习统计，包括测验成绩、完成的课程数量、获得的成就等。
              </p>
            </div>
            
            <div class="faq-item">
              <h3 class="faq-question">忘记密码怎么办？</h3>
              <p class="faq-answer">
                在登录页面点击"忘记密码"链接，输入您的邮箱地址，系统会发送重置密码的邮件给您。
              </p>
            </div>
          </div>
        </div>

        <!-- 联系我们 -->
        <div class="contact-section">
          <h2 class="text-2xl font-bold mb-6">联系我们</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div class="contact-info">
              <h3 class="text-lg font-semibold mb-4">技术支持</h3>
              <div class="space-y-2">
                <p><strong>邮箱：</strong> support@antifraud-kg.com</p>
                <p><strong>电话：</strong> 400-123-4567</p>
                <p><strong>工作时间：</strong> 周一至周五 9:00-18:00</p>
              </div>
            </div>
            
            <div class="feedback-info">
              <h3 class="text-lg font-semibold mb-4">意见反馈</h3>
              <div class="space-y-2">
                <p><strong>邮箱：</strong> feedback@antifraud-kg.com</p>
                <p><strong>在线反馈：</strong> 
                  <NuxtLink to="/report" class="text-blue-600 hover:text-blue-500">举报中心</NuxtLink>
                </p>
                <p>我们重视每一条用户反馈，会及时回复处理。</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// 页面元数据
useHead({
  title: '帮助中心 - 反欺诈知识图谱系统',
  meta: [
    { name: 'description', content: '反欺诈知识图谱系统帮助中心，提供使用指导和常见问题解答' }
  ]
})

// 设置页面布局
definePageMeta({
  layout: 'default'
})
</script>

<style scoped>
.help-page {
  @apply min-h-screen bg-gray-50 dark:bg-gray-900;
}

.page-header {
  @apply bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-8;
}

.page-title {
  @apply text-3xl font-bold text-gray-900 dark:text-white mb-2;
}

.page-description {
  @apply text-lg text-gray-600 dark:text-gray-300;
}

.help-content {
  @apply py-8;
}

.help-card {
  @apply bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200 dark:border-gray-700 block;
}

.help-card-icon {
  @apply text-blue-600 dark:text-blue-400 mb-4;
}

.help-card-title {
  @apply text-lg font-semibold text-gray-900 dark:text-white mb-2;
}

.help-card-description {
  @apply text-gray-600 dark:text-gray-300 text-sm;
}

.faq-item {
  @apply bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700;
}

.faq-question {
  @apply text-lg font-semibold text-gray-900 dark:text-white mb-3;
}

.faq-answer {
  @apply text-gray-600 dark:text-gray-300 leading-relaxed;
}

.contact-section {
  @apply bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm border border-gray-200 dark:border-gray-700;
}

.contact-info, .feedback-info {
  @apply space-y-2;
}
</style>