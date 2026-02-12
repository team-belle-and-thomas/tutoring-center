export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'chore', 'docs', 'style', 'refactor', 'revert', 'build', 'ci'],
    ],
    'header-max-length': [2, 'always', 120],
    'body-max-line-length': [2, 'always', 200],
    'footer-max-line-length': [2, 'always', 200],
  },
  globalIgnores: ['.next/**', 'out/**', 'node_modules/**'],
}
