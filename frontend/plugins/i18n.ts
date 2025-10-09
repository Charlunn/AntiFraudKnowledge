import { createI18n } from 'vue-i18n'
import zhGraph from '~/locales/zh/graph.json'
import enGraph from '~/locales/en/graph.json'

export default defineNuxtPlugin((nuxtApp) => {
  const i18n = createI18n({
    legacy: false,
    locale: 'zh',
    fallbackLocale: 'en',
    messages: {
      zh: {
        graph: zhGraph
      },
      en: {
        graph: enGraph
      }
    }
  })

  nuxtApp.vueApp.use(i18n)
})
