module.exports = {
  extends: ['eslint:recommended', 'prettier', 'react-app', 'react-app/jest'],
  settings: {
    react: {
      pragma: 'h',
    },
  },
  plugins: ['prettier'],
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2018,
    ecmaFeatures: {
      jsx: true,
      spread: true,
    },
  },
  env: {
    es6: true,
    node: true,
    browser: true,
  },
  rules: {
    // NOTE: accepted/intentionally defined rules - start
    'prettier/prettier': 'error',
    semi: ['error', 'never'],
    'no-unused-vars': [
      'error',
      {
        varsIgnorePattern: 'h',
      },
    ],
    // NOTE: accepted/intentionally defined rules - end
  },
}
