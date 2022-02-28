module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
  },
  globals: {
    IpfsCore: 'readonly',
  },
  extends: ['eslint:recommended', 'plugin:vue/vue3-recommended', 'prettier'],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': 'warn',
    'no-unused-vars': 'warn',
    'spaced-comment': 'warn',
  },
}
