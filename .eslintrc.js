module.exports = {
    extends: 'airbnb',
    env: {
      mocha: true
    },
    rules: {
      'max-len': [2, {code: 160, tabWidth: 4}],
      'no-var': 'off',
      'no-console': 'off',
      'no-unused-expressions': 'off',
      'consistent-return': 'off',
      'func-names': 'off',
      'prefer-arrow-callback': 'off',
      'vars-on-top': 'off',
      'prefer-destructuring': 'off',
    }
  };