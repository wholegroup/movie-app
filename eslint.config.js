import neostandard from 'neostandard'
import js from '@eslint/js'

const config = [
  js.configs.recommended,
  ...neostandard({
    env: ['jest', 'node', 'browser']
  }),
  {
    files: ['**/*.js', '**/*.jsx'],
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      'no-unused-vars': 'off', // Отключаем, так как neostandard и так проверяет, но часто ложно для JSX импортов
    }
  },
  {
    ignores: ['.next/**/', 'out/**/', 'build/**/', 'node_modules/**/', 'public/**/']
  }
]

export default config
