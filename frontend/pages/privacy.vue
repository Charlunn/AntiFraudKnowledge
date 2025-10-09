<template>
  <div class="space-y-10 pb-16">
    <PageHeader
      title="隐私政策"
      description="了解澄源在收集、使用、存储与保护个人信息方面的承诺。我们希望通过透明的方式，让您清晰掌握自己的隐私权利。"
      eyebrow="合规与信任"
    >
      <template #actions>
        <Badge variant="secondary" class="self-start bg-muted text-muted-foreground">
          最后更新：{{ lastUpdated }}
        </Badge>
      </template>
    </PageHeader>

    <Card>
      <CardHeader>
        <CardTitle>政策概览</CardTitle>
        <CardDescription>
          本政策自 {{ effectiveDate }} 起生效，适用于您使用澄源产品与服务期间的全部个人信息处理活动。
        </CardDescription>
      </CardHeader>
      <CardContent class="prose max-w-none text-muted-foreground prose-headings:text-foreground prose-strong:text-foreground dark:prose-invert">
        <p>
          澄源（以下简称“我们”或“本平台”）深知隐私对您的重要性。我们将按照合法、正当、必要的原则处理您的个人信息，并采纳多重技术与管理措施保障数据安全。
        </p>
        <p>
          请您在使用服务前仔细阅读并充分理解本政策内容。如对政策有任何疑问，可随时通过文末提供的联系方式咨询，我们会及时响应。
        </p>
      </CardContent>
    </Card>

    <div class="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
      <Card class="lg:col-span-1">
        <CardHeader>
          <CardTitle>我们收集的信息</CardTitle>
          <CardDescription>确保服务运作、优化体验与安全合规所需的数据类型。</CardDescription>
        </CardHeader>
        <CardContent class="prose max-w-none text-muted-foreground prose-headings:text-foreground prose-strong:text-foreground dark:prose-invert">
          <h3>您主动提供的信息</h3>
          <ul>
            <li>账户信息：用户名、邮箱、密码、头像、昵称与个人简介等。</li>
            <li>联系方式：手机号（可选）、社交账号或第三方认证信息。</li>
            <li>用户内容：帖子、评论、反馈、上传的文件及互动记录。</li>
          </ul>
          <h3>自动采集的信息</h3>
          <ul>
            <li>设备信息：设备型号、操作系统、浏览器类型、语言设置等。</li>
            <li>服务使用数据：访问时间、页面浏览、功能点击、错误日志等。</li>
            <li>网络信息：IP 地址、网络类型、运营商、信号状态等。</li>
            <li>Cookie 与同类技术生成的匿名标识。</li>
          </ul>
          <h3>来自第三方的信息</h3>
          <ul>
            <li>经您授权的第三方登录平台所提供的必要公开信息。</li>
            <li>在符合法律法规的前提下，合作伙伴共享的风险控制与防诈情报。</li>
          </ul>
        </CardContent>
      </Card>

      <Card class="lg:col-span-1">
        <CardHeader>
          <CardTitle>信息使用目的</CardTitle>
          <CardDescription>我们不会超出明确目的使用您的个人信息。</CardDescription>
        </CardHeader>
        <CardContent>
          <ul class="space-y-3 text-sm text-muted-foreground">
            <li class="flex gap-3 rounded-lg border border-border bg-card/60 p-3">
              <ShieldCheck class="mt-0.5 h-5 w-5 text-primary" />
              <div>
                <p class="font-medium text-foreground">提供与维护服务</p>
                <p>用于账号创建、身份校验、个性化学习路线与风险情报推送。</p>
              </div>
            </li>
            <li class="flex gap-3 rounded-lg border border-border bg-card/60 p-3">
              <Sparkles class="mt-0.5 h-5 w-5 text-primary" />
              <div>
                <p class="font-medium text-foreground">优化体验与分析</p>
                <p>通过数据分析改进产品功能、性能与交互流程，提升安全性。</p>
              </div>
            </li>
            <li class="flex gap-3 rounded-lg border border-border bg-card/60 p-3">
              <Lock class="mt-0.5 h-5 w-5 text-primary" />
              <div>
                <p class="font-medium text-foreground">安全保障</p>
                <p>用于防范欺诈、异常检测、账号安全审计及遵守法律义务。</p>
              </div>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>信息共享与披露</CardTitle>
        <CardDescription>我们仅在充分评估合法性、正当性与必要性的前提下进行共享。</CardDescription>
      </CardHeader>
      <CardContent class="prose max-w-none text-muted-foreground prose-headings:text-foreground prose-strong:text-foreground dark:prose-invert">
        <p>我们承诺不会向任何第三方出售、出租个人信息，仅在以下情形披露：</p>
        <ul>
          <li><strong>经您明确授权：</strong>在您选择授权的情况下共享必要信息。</li>
          <li><strong>服务提供商：</strong>与可信赖的云服务、数据分析、客服供应商共享，以履行合同约定，并签订严格的保密协议。</li>
          <li><strong>法律合规：</strong>根据法律法规、诉讼或政府机关的强制性要求提供信息。</li>
          <li><strong>安全保护：</strong>为保护您、我们或其他用户的合法权益，在法律允许的情况下披露信息。</li>
        </ul>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>信息存储与安全保障</CardTitle>
        <CardDescription>我们遵循最小必要原则制定存储策略与安全措施。</CardDescription>
      </CardHeader>
      <CardContent class="grid gap-4 md:grid-cols-2">
        <div class="rounded-lg border border-border bg-card/60 p-4">
          <h3 class="text-base font-semibold text-foreground">存储位置</h3>
          <p class="mt-2 text-sm text-muted-foreground">
            数据主要存放于中华人民共和国境内的服务器。如需跨境传输，我们将遵循法律要求，征得您的明示同意并采取安全保护措施。
          </p>
        </div>
        <div class="rounded-lg border border-border bg-card/60 p-4">
          <h3 class="text-base font-semibold text-foreground">存储期限</h3>
          <p class="mt-2 text-sm text-muted-foreground">
            我们仅在达成收集目的所需期间内保存个人信息，超期后会匿名化或删除。具体期限将依据业务类型与法律要求确定。
          </p>
        </div>
        <div class="rounded-lg border border-border bg-card/60 p-4">
          <h3 class="text-base font-semibold text-foreground">安全措施</h3>
          <ul class="mt-2 space-y-2 text-sm text-muted-foreground">
            <li>全链路加密传输与多重身份校验。</li>
            <li>严格的访问控制、最小权限策略与操作审计。</li>
            <li>定期安全测试、漏洞扫描与安全基线检查。</li>
            <li>数据备份、容灾演练与应急预案。</li>
            <li>隐私与安全意识培训，签署保密协议。</li>
          </ul>
        </div>
        <div class="rounded-lg border border-border bg-card/60 p-4">
          <h3 class="text-base font-semibold text-foreground">异常事件处理</h3>
          <p class="mt-2 text-sm text-muted-foreground">
            当发生数据安全事件时，我们会按法规要求在 72 小时内向监管机构报告，并在必要时以邮件、站内消息等方式告知受影响用户。
          </p>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>您的权利</CardTitle>
        <CardDescription>您可随时管理、纠正或删除个人信息，并撤回授权。</CardDescription>
      </CardHeader>
      <CardContent class="grid gap-4 md:grid-cols-2">
        <div class="rounded-lg border border-border bg-card/60 p-4">
          <h3 class="text-base font-semibold text-foreground">访问与更正</h3>
          <p class="mt-2 text-sm text-muted-foreground">
            可通过账户设置查看、更新个人资料。如发现信息不准确，您可随时更正或联系我们协助处理。
          </p>
        </div>
        <div class="rounded-lg border border-border bg-card/60 p-4">
          <h3 class="text-base font-semibold text-foreground">删除与撤回</h3>
          <p class="mt-2 text-sm text-muted-foreground">
            在符合法律法规的前提下，您可申请删除特定信息或撤回授权。我们将在验证身份后尽快处理。
          </p>
        </div>
        <div class="rounded-lg border border-border bg-card/60 p-4">
          <h3 class="text-base font-semibold text-foreground">限制处理</h3>
          <p class="mt-2 text-sm text-muted-foreground">
            如您认为我们处理行为违法或存在错误，可申请限制处理。在审核期间，我们仅保留必要数据。
          </p>
        </div>
        <div class="rounded-lg border border-border bg-card/60 p-4">
          <h3 class="text-base font-semibold text-foreground">数据可携</h3>
          <p class="mt-2 text-sm text-muted-foreground">
            在技术可行的情况下，您可要求我们提供结构化的数据副本，以便迁移至其他服务。
          </p>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Cookie 与同类技术</CardTitle>
        <CardDescription>我们将为您提供精细的偏好管理能力。</CardDescription>
      </CardHeader>
      <CardContent class="grid gap-4 md:grid-cols-2">
        <div class="rounded-lg border border-border bg-card/60 p-4">
          <h3 class="text-base font-semibold text-foreground">用途分类</h3>
          <ul class="mt-2 space-y-2 text-sm text-muted-foreground">
            <li><strong>必要型：</strong>保障登录、安全校验与基本功能正常运行。</li>
            <li><strong>分析型：</strong>统计访问行为，为产品优化提供决策依据。</li>
            <li><strong>个性化：</strong>记住您的偏好配置，提供更契合的内容与体验。</li>
          </ul>
        </div>
        <div class="rounded-lg border border-border bg-card/60 p-4">
          <h3 class="text-base font-semibold text-foreground">管理方式</h3>
          <p class="mt-2 text-sm text-muted-foreground">
            您可以通过浏览器设置清除或限制 Cookie，也可在平台内的隐私设置中调整个性化推荐选项。关闭必要型 Cookie 可能导致部分功能受限。
          </p>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>联系我们</CardTitle>
        <CardDescription>如有隐私相关问题或建议，欢迎随时与我们取得联系。</CardDescription>
      </CardHeader>
      <CardContent class="space-y-4 text-sm text-muted-foreground">
        <div class="flex items-center gap-3 rounded-lg border border-border bg-card/60 p-4">
          <Mail class="h-5 w-5 text-primary" />
          <div>
            <p class="font-medium text-foreground">隐私邮箱</p>
            <p>privacy@chengyuan.com</p>
          </div>
        </div>
        <div class="flex items-center gap-3 rounded-lg border border-border bg-card/60 p-4">
          <Phone class="h-5 w-5 text-primary" />
          <div>
            <p class="font-medium text-foreground">安全热线</p>
            <p>400-800-1234（工作日 09:00-18:00）</p>
          </div>
        </div>
        <p>
          我们将在收到请求后的 15 个工作日内给予回复；若涉及复杂情况，将在 30 个工作日内答复并告知进展。
        </p>
      </CardContent>
    </Card>
  </div>
</template>

<script setup>
import { Lock, Mail, Phone, ShieldCheck, Sparkles } from 'lucide-vue-next'

import Badge from '~/components/ui/badge.vue'
import Card from '~/components/ui/card.vue'
import CardContent from '~/components/ui/card-content.vue'
import CardDescription from '~/components/ui/card-description.vue'
import CardHeader from '~/components/ui/card-header.vue'
import CardTitle from '~/components/ui/card-title.vue'
import PageHeader from '~/components/ui/page-header.vue'

definePageMeta({
  layout: 'default'
})

useHead({
  title: '隐私政策 - 澄源',
  meta: [
    { name: 'description', content: '了解澄源如何收集、使用与保护您的个人信息，全面掌握平台隐私政策。' },
    { name: 'keywords', content: '隐私政策,数据安全,个人信息保护,澄源' }
  ]
})

const lastUpdated = '2024 年 1 月 15 日'
const effectiveDate = '2024 年 1 月 1 日'
</script>