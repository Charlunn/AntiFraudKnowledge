<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 页面头部 -->
    <div class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-6">
          <div class="flex items-center">
            <NuxtLink to="/" class="text-blue-600 hover:text-blue-500">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </NuxtLink>
            <h1 class="ml-4 text-2xl font-bold text-gray-900">服务条款</h1>
          </div>
          <div class="text-sm text-gray-500">
            最后更新：{{ lastUpdated }}
          </div>
        </div>
      </div>
    </div>

    <!-- 主要内容 -->
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="bg-white shadow rounded-lg">
        <div class="px-6 py-8">
          <!-- 引言 -->
          <div class="mb-8">
            <p class="text-gray-600 leading-relaxed">
              欢迎使用反欺诈知识图谱平台（以下简称"本平台"）。在使用本平台提供的服务之前，请您仔细阅读并理解以下服务条款。通过访问或使用本平台，您表示同意遵守这些条款。
            </p>
          </div>

          <!-- 条款内容 -->
          <div class="space-y-8">
            <!-- 1. 服务说明 -->
            <section>
              <h2 class="text-xl font-semibold text-gray-900 mb-4">1. 服务说明</h2>
              <div class="text-gray-600 space-y-3">
                <p>1.1 本平台是一个专注于反欺诈知识分享和学习的在线平台，提供知识图谱浏览、测验练习、社区交流等功能。</p>
                <p>1.2 本平台致力于为用户提供准确、及时的反欺诈相关知识和信息，但不保证信息的完整性和绝对准确性。</p>
                <p>1.3 本平台保留随时修改、暂停或终止服务的权利，恕不另行通知。</p>
              </div>
            </section>

            <!-- 2. 用户注册与账户 -->
            <section>
              <h2 class="text-xl font-semibold text-gray-900 mb-4">2. 用户注册与账户</h2>
              <div class="text-gray-600 space-y-3">
                <p>2.1 用户需要提供真实、准确的个人信息进行注册。</p>
                <p>2.2 用户有责任保护自己的账户安全，包括但不限于保护密码不被泄露。</p>
                <p>2.3 用户不得将账户转让给他人使用，不得恶意注册多个账户。</p>
                <p>2.4 如发现账户被盗用或存在安全风险，请立即联系我们。</p>
              </div>
            </section>

            <!-- 3. 用户行为规范 -->
            <section>
              <h2 class="text-xl font-semibold text-gray-900 mb-4">3. 用户行为规范</h2>
              <div class="text-gray-600 space-y-3">
                <p>3.1 用户在使用本平台时应遵守相关法律法规，不得从事违法违规活动。</p>
                <p>3.2 禁止发布以下内容：</p>
                <ul class="list-disc list-inside ml-4 space-y-1">
                  <li>违反国家法律法规的内容</li>
                  <li>涉及政治敏感话题的内容</li>
                  <li>包含暴力、色情、赌博等不良信息的内容</li>
                  <li>侵犯他人知识产权的内容</li>
                  <li>恶意攻击、诽谤他人的内容</li>
                  <li>垃圾信息、广告信息等</li>
                </ul>
                <p>3.3 用户应尊重其他用户，维护良好的社区氛围。</p>
                <p>3.4 禁止利用本平台进行任何商业推广活动，除非获得我们的明确授权。</p>
              </div>
            </section>

            <!-- 4. 知识产权 -->
            <section>
              <h2 class="text-xl font-semibold text-gray-900 mb-4">4. 知识产权</h2>
              <div class="text-gray-600 space-y-3">
                <p>4.1 本平台的所有内容，包括但不限于文字、图片、音频、视频、软件等，均受知识产权法保护。</p>
                <p>4.2 用户在本平台发布的原创内容，用户保留版权，但授予本平台免费使用的权利。</p>
                <p>4.3 未经授权，任何人不得复制、传播、修改本平台的内容。</p>
                <p>4.4 如发现侵权行为，我们将依法追究相关责任。</p>
              </div>
            </section>

            <!-- 5. 隐私保护 -->
            <section>
              <h2 class="text-xl font-semibold text-gray-900 mb-4">5. 隐私保护</h2>
              <div class="text-gray-600 space-y-3">
                <p>5.1 我们重视用户隐私保护，具体内容请参阅我们的
                  <NuxtLink to="/privacy" class="text-blue-600 hover:text-blue-500 underline">隐私政策</NuxtLink>。
                </p>
                <p>5.2 我们承诺不会向第三方泄露用户的个人信息，除非获得用户同意或法律要求。</p>
                <p>5.3 我们采用合理的技术和管理措施保护用户信息安全。</p>
              </div>
            </section>

            <!-- 6. 免责声明 -->
            <section>
              <h2 class="text-xl font-semibold text-gray-900 mb-4">6. 免责声明</h2>
              <div class="text-gray-600 space-y-3">
                <p>6.1 本平台提供的信息仅供参考，用户应根据实际情况做出判断。</p>
                <p>6.2 对于用户因使用本平台而遭受的任何直接或间接损失，我们不承担责任。</p>
                <p>6.3 本平台不对第三方链接的内容负责。</p>
                <p>6.4 因不可抗力因素导致的服务中断，我们不承担责任。</p>
              </div>
            </section>

            <!-- 7. 服务变更与终止 -->
            <section>
              <h2 class="text-xl font-semibold text-gray-900 mb-4">7. 服务变更与终止</h2>
              <div class="text-gray-600 space-y-3">
                <p>7.1 我们保留随时修改服务内容和条款的权利。</p>
                <p>7.2 重大变更将通过平台公告或邮件方式通知用户。</p>
                <p>7.3 用户如不同意变更内容，可以停止使用服务。</p>
                <p>7.4 我们有权终止违规用户的服务。</p>
              </div>
            </section>

            <!-- 8. 争议解决 -->
            <section>
              <h2 class="text-xl font-semibold text-gray-900 mb-4">8. 争议解决</h2>
              <div class="text-gray-600 space-y-3">
                <p>8.1 本条款的解释和争议解决适用中华人民共和国法律。</p>
                <p>8.2 如发生争议，双方应友好协商解决。</p>
                <p>8.3 协商不成的，可向有管辖权的人民法院提起诉讼。</p>
              </div>
            </section>

            <!-- 9. 联系我们 -->
            <section>
              <h2 class="text-xl font-semibold text-gray-900 mb-4">9. 联系我们</h2>
              <div class="text-gray-600 space-y-3">
                <p>如果您对本服务条款有任何疑问或建议，请通过以下方式联系我们：</p>
                <ul class="list-disc list-inside ml-4 space-y-1">
                  <li>邮箱：support@antifraud-kg.com</li>
                  <li>电话：400-123-4567</li>
                  <li>地址：北京市朝阳区xxx街道xxx号</li>
                </ul>
              </div>
            </section>
          </div>

          <!-- 底部 -->
          <div class="mt-12 pt-8 border-t border-gray-200">
            <div class="flex flex-col sm:flex-row justify-between items-center">
              <p class="text-sm text-gray-500 mb-4 sm:mb-0">
                本条款自 {{ effectiveDate }} 起生效
              </p>
              <div class="flex space-x-4">
                <NuxtLink 
                  to="/privacy" 
                  class="text-sm text-blue-600 hover:text-blue-500"
                >
                  隐私政策
                </NuxtLink>
                <NuxtLink 
                  to="/" 
                  class="text-sm text-blue-600 hover:text-blue-500"
                >
                  返回首页
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// 页面布局
definePageMeta({
  layout: 'default'
})

// 页面元数据
useHead({
  title: '服务条款 - 反欺诈知识图谱',
  meta: [
    { name: 'description', content: '反欺诈知识图谱平台服务条款，了解平台使用规则和用户权利义务' },
    { name: 'keywords', content: '服务条款,使用协议,反欺诈,知识图谱' }
  ]
})

// 日期信息
const lastUpdated = '2024年1月15日'
const effectiveDate = '2024年1月1日'
</script>

<style scoped>
/* 确保链接在打印时也能正常显示 */
@media print {
  .text-blue-600 {
    color: #2563eb !important;
  }
}
</style>