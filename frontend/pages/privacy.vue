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
            <h1 class="ml-4 text-2xl font-bold text-gray-900">隐私政策</h1>
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
              反欺诈知识图谱平台（以下简称"我们"或"本平台"）非常重视用户的隐私保护。本隐私政策详细说明了我们如何收集、使用、存储和保护您的个人信息。请您仔细阅读本政策，以了解我们对您个人信息的处理方式。
            </p>
          </div>

          <!-- 政策内容 -->
          <div class="space-y-8">
            <!-- 1. 信息收集 -->
            <section>
              <h2 class="text-xl font-semibold text-gray-900 mb-4">1. 我们收集的信息</h2>
              <div class="text-gray-600 space-y-4">
                <div>
                  <h3 class="font-medium text-gray-800 mb-2">1.1 您主动提供的信息</h3>
                  <ul class="list-disc list-inside ml-4 space-y-1">
                    <li>注册信息：用户名、邮箱地址、密码等</li>
                    <li>个人资料：头像、昵称、个人简介等</li>
                    <li>联系信息：手机号码（可选）</li>
                    <li>用户生成内容：发布的帖子、评论、反馈等</li>
                  </ul>
                </div>
                <div>
                  <h3 class="font-medium text-gray-800 mb-2">1.2 自动收集的信息</h3>
                  <ul class="list-disc list-inside ml-4 space-y-1">
                    <li>设备信息：设备类型、操作系统、浏览器类型等</li>
                    <li>使用信息：访问时间、页面浏览记录、功能使用情况等</li>
                    <li>网络信息：IP地址、网络类型等</li>
                    <li>Cookie和类似技术收集的信息</li>
                  </ul>
                </div>
                <div>
                  <h3 class="font-medium text-gray-800 mb-2">1.3 第三方提供的信息</h3>
                  <ul class="list-disc list-inside ml-4 space-y-1">
                    <li>第三方登录服务提供的公开信息</li>
                    <li>合作伙伴提供的相关信息（在法律允许范围内）</li>
                  </ul>
                </div>
              </div>
            </section>

            <!-- 2. 信息使用 -->
            <section>
              <h2 class="text-xl font-semibold text-gray-900 mb-4">2. 信息使用目的</h2>
              <div class="text-gray-600 space-y-3">
                <p>我们收集和使用您的个人信息主要用于以下目的：</p>
                <ul class="list-disc list-inside ml-4 space-y-1">
                  <li>提供、维护和改进我们的服务</li>
                  <li>创建和管理您的账户</li>
                  <li>个性化用户体验和内容推荐</li>
                  <li>处理您的请求和提供客户支持</li>
                  <li>发送重要通知和服务更新</li>
                  <li>进行数据分析以改善服务质量</li>
                  <li>防范欺诈和确保平台安全</li>
                  <li>遵守法律法规要求</li>
                </ul>
              </div>
            </section>

            <!-- 3. 信息共享 -->
            <section>
              <h2 class="text-xl font-semibold text-gray-900 mb-4">3. 信息共享与披露</h2>
              <div class="text-gray-600 space-y-4">
                <p>我们承诺不会出售、出租或交易您的个人信息。在以下情况下，我们可能会共享您的信息：</p>
                <div>
                  <h3 class="font-medium text-gray-800 mb-2">3.1 经您同意的共享</h3>
                  <p>在获得您明确同意的情况下，我们会与第三方共享您的个人信息。</p>
                </div>
                <div>
                  <h3 class="font-medium text-gray-800 mb-2">3.2 服务提供商</h3>
                  <p>我们可能与可信的第三方服务提供商共享必要信息，以便他们为我们提供服务，如云存储、数据分析等。</p>
                </div>
                <div>
                  <h3 class="font-medium text-gray-800 mb-2">3.3 法律要求</h3>
                  <p>在法律法规要求或政府部门要求的情况下，我们可能会披露您的个人信息。</p>
                </div>
                <div>
                  <h3 class="font-medium text-gray-800 mb-2">3.4 安全保护</h3>
                  <p>为保护我们或其他用户的权利、财产或安全，我们可能会披露相关信息。</p>
                </div>
              </div>
            </section>

            <!-- 4. 信息存储 -->
            <section>
              <h2 class="text-xl font-semibold text-gray-900 mb-4">4. 信息存储与安全</h2>
              <div class="text-gray-600 space-y-4">
                <div>
                  <h3 class="font-medium text-gray-800 mb-2">4.1 存储位置</h3>
                  <p>您的个人信息主要存储在中华人民共和国境内的服务器上。如需跨境传输，我们将严格遵守相关法律法规。</p>
                </div>
                <div>
                  <h3 class="font-medium text-gray-800 mb-2">4.2 存储期限</h3>
                  <p>我们仅在实现收集目的所需的期间内保留您的个人信息。具体期限根据信息类型和法律要求确定。</p>
                </div>
                <div>
                  <h3 class="font-medium text-gray-800 mb-2">4.3 安全措施</h3>
                  <ul class="list-disc list-inside ml-4 space-y-1">
                    <li>采用行业标准的加密技术保护数据传输</li>
                    <li>实施严格的访问控制和权限管理</li>
                    <li>定期进行安全审计和漏洞检测</li>
                    <li>建立数据备份和灾难恢复机制</li>
                    <li>对员工进行隐私保护培训</li>
                  </ul>
                </div>
              </div>
            </section>

            <!-- 5. 用户权利 -->
            <section>
              <h2 class="text-xl font-semibold text-gray-900 mb-4">5. 您的权利</h2>
              <div class="text-gray-600 space-y-3">
                <p>根据相关法律法规，您享有以下权利：</p>
                <ul class="list-disc list-inside ml-4 space-y-1">
                  <li><strong>知情权：</strong>了解我们如何收集、使用您的个人信息</li>
                  <li><strong>访问权：</strong>查看我们持有的您的个人信息</li>
                  <li><strong>更正权：</strong>更正不准确或不完整的个人信息</li>
                  <li><strong>删除权：</strong>在特定情况下要求删除您的个人信息</li>
                  <li><strong>限制处理权：</strong>在特定情况下限制我们处理您的个人信息</li>
                  <li><strong>数据可携权：</strong>以结构化格式获取您的个人信息</li>
                  <li><strong>撤回同意权：</strong>撤回之前给予的同意</li>
                  <li><strong>投诉权：</strong>向监管部门投诉我们的数据处理行为</li>
                </ul>
                <p class="mt-3">
                  如需行使上述权利，请通过本页面底部的联系方式与我们联系。
                </p>
              </div>
            </section>

            <!-- 6. Cookie政策 -->
            <section>
              <h2 class="text-xl font-semibold text-gray-900 mb-4">6. Cookie和类似技术</h2>
              <div class="text-gray-600 space-y-4">
                <div>
                  <h3 class="font-medium text-gray-800 mb-2">6.1 Cookie的使用</h3>
                  <p>我们使用Cookie和类似技术来改善用户体验、分析网站使用情况和提供个性化服务。</p>
                </div>
                <div>
                  <h3 class="font-medium text-gray-800 mb-2">6.2 Cookie类型</h3>
                  <ul class="list-disc list-inside ml-4 space-y-1">
                    <li><strong>必要Cookie：</strong>确保网站正常运行所必需的Cookie</li>
                    <li><strong>功能Cookie：</strong>记住您的偏好设置和选择</li>
                    <li><strong>分析Cookie：</strong>帮助我们了解网站使用情况</li>
                    <li><strong>营销Cookie：</strong>用于提供相关的内容和广告</li>
                  </ul>
                </div>
                <div>
                  <h3 class="font-medium text-gray-800 mb-2">6.3 管理Cookie</h3>
                  <p>您可以通过浏览器设置管理Cookie，但请注意，禁用某些Cookie可能会影响网站功能。</p>
                </div>
              </div>
            </section>

            <!-- 7. 未成年人保护 -->
            <section>
              <h2 class="text-xl font-semibold text-gray-900 mb-4">7. 未成年人信息保护</h2>
              <div class="text-gray-600 space-y-3">
                <p>我们非常重视未成年人的隐私保护：</p>
                <ul class="list-disc list-inside ml-4 space-y-1">
                  <li>我们不会主动收集14岁以下儿童的个人信息</li>
                  <li>如发现无意中收集了儿童信息，我们将立即删除</li>
                  <li>未成年人使用我们的服务需要监护人同意</li>
                  <li>我们建议监护人指导未成年人正确使用互联网服务</li>
                </ul>
              </div>
            </section>

            <!-- 8. 政策更新 -->
            <section>
              <h2 class="text-xl font-semibold text-gray-900 mb-4">8. 隐私政策更新</h2>
              <div class="text-gray-600 space-y-3">
                <p>8.1 我们可能会不时更新本隐私政策，以反映我们服务的变化或法律要求的变更。</p>
                <p>8.2 重大变更将通过网站公告、邮件或其他适当方式通知您。</p>
                <p>8.3 继续使用我们的服务即表示您接受更新后的隐私政策。</p>
                <p>8.4 我们建议您定期查看本政策以了解最新信息。</p>
              </div>
            </section>

            <!-- 9. 联系我们 -->
            <section>
              <h2 class="text-xl font-semibold text-gray-900 mb-4">9. 联系我们</h2>
              <div class="text-gray-600 space-y-3">
                <p>如果您对本隐私政策有任何疑问、意见或建议，或需要行使您的权利，请通过以下方式联系我们：</p>
                <div class="bg-gray-50 p-4 rounded-lg">
                  <ul class="space-y-2">
                    <li><strong>邮箱：</strong> privacy@antifraud-kg.com</li>
                    <li><strong>电话：</strong> 400-123-4567</li>
                    <li><strong>邮寄地址：</strong> 北京市朝阳区xxx街道xxx号</li>
                    <li><strong>在线客服：</strong> 工作日 9:00-18:00</li>
                  </ul>
                </div>
                <p>我们将在收到您的请求后尽快回复，通常不超过15个工作日。</p>
              </div>
            </section>
          </div>

          <!-- 底部 -->
          <div class="mt-12 pt-8 border-t border-gray-200">
            <div class="flex flex-col sm:flex-row justify-between items-center">
              <p class="text-sm text-gray-500 mb-4 sm:mb-0">
                本政策自 {{ effectiveDate }} 起生效
              </p>
              <div class="flex space-x-4">
                <NuxtLink 
                  to="/terms" 
                  class="text-sm text-blue-600 hover:text-blue-500"
                >
                  服务条款
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
  title: '隐私政策 - 反欺诈知识图谱',
  meta: [
    { name: 'description', content: '反欺诈知识图谱平台隐私政策，了解我们如何保护您的个人信息和隐私' },
    { name: 'keywords', content: '隐私政策,个人信息保护,数据安全,反欺诈,知识图谱' }
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

/* 改善长文本的可读性 */
section {
  scroll-margin-top: 2rem;
}

/* 突出显示重要信息 */
.bg-gray-50 {
  border-left: 4px solid #3b82f6;
}
</style>