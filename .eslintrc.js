module.exports = {
    root: true,
    env: {
        browser: true,
        node: true
    },
    globals: {
        "IpfsCore": 'readonly'
    },
    extends: ['eslint:recommended', 'plugin:vue/vue3-recommended', 'prettier'],
    plugins: ['prettier'],
    rules: {
        'prettier/prettier': 'off',
        'no-unused-vars': 'warn',
        'spaced-comment': 'warn',
    },
    // parser: 'vue-eslint-parser',
    // parserOptions: {
    //   parser: '@typescript-eslint/parser',
    //   ecmaVersion: 2020,
    //   sourceType: 'module'
    // }
}
