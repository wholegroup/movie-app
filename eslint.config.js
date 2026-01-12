import neostandard from 'neostandard'
import { FlatCompat } from '@eslint/eslintrc'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname
})

const config = [
  ...neostandard({
    env: ['jest', 'node', 'browser']
  }),
  ...compat.extends('next/core-web-vitals', 'plugin:storybook/recommended'),
  {
    rules: {
      '@next/next/no-img-element': 'off'
    }
  },
  {
    ignores: ['.next/**/', 'out/**/', 'build/**/', 'node_modules/**/', 'public/**/']
  }
]

export default config
