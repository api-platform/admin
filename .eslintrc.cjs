module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['tree-shaking', 'prettier'],
  extends: [
    'airbnb',
    'airbnb/hooks',
    'prettier',
    'plugin:markdown/recommended',
  ],
  rules: {
    'prettier/prettier': 'error',
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      excludedFiles: ['jest.config.ts', 'jest.setup.ts'],
      extends: [
        'airbnb',
        'airbnb-typescript',
        'airbnb/hooks',
        'plugin:@typescript-eslint/recommended',
        // @TODO Fix the problems when activating this config.
        // 'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'prettier',
      ],
      parserOptions: {
        project: ['./tsconfig.eslint.json'],
      },
      rules: {
        '@typescript-eslint/no-use-before-define': 'error',
        '@typescript-eslint/consistent-type-imports': 'error',
        '@typescript-eslint/prefer-nullish-coalescing': 'error',
        '@typescript-eslint/no-confusing-void-expression': 'error',
        '@typescript-eslint/prefer-optional-chain': 'error',
        '@typescript-eslint/no-unused-vars': [
          'warn',
          { ignoreRestSiblings: true, argsIgnorePattern: '^_' },
        ],
        'sort-imports': ['error', { ignoreDeclarationSort: true }],
        'react/function-component-definition': [
          'error',
          {
            namedComponents: 'arrow-function',
            unnamedComponents: 'function-expression',
          },
        ],

        'import/no-extraneous-dependencies': 'off',
        'react/require-default-props': 'off',
        'react/jsx-props-no-spreading': 'off',
        'react/forbid-prop-types': 'off',
        'react/default-props-match-prop-types': 'off',
      },
    },
    {
      files: ['*.ts', '*.tsx'],
      excludedFiles: [
        'jest.config.ts',
        'jest.setup.ts',
        '*.test.ts',
        '*.test.tsx',
      ],
      rules: {
        'tree-shaking/no-side-effects-in-initialization': 'error',
      },
    },
  ],
};
