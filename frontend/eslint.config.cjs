module.exports = [
  {
    ignores: ['node_modules']
  },
  {
    files: ['**/*.{js,ts,vue}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module'
    },
    plugins: {
      vue: require('eslint-plugin-vue')
    },
    rules: {},
    env: {
      browser: true,
      node: true,
      es2021: true
    },
    extends: ['eslint:recommended', 'plugin:vue/vue3-essential', 'prettier']
  }
]
