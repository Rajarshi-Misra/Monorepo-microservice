const { defineConfig } = require('eslint/config');
const tsParser = require('@typescript-eslint/parser');
const typescriptEslint = require('@typescript-eslint/eslint-plugin');
const importPlugin = require('eslint-plugin-import');
const unusedImports = require('eslint-plugin-unused-imports');
const js = require('@eslint/js');

module.exports = defineConfig([
    // Base JavaScript recommended rules
    js.configs.recommended,
    
    // ESLint config file - Node.js environment
    {
        files: ['eslint.config.js', '*.config.js', '*.config.mjs'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'commonjs',
            globals: {
                require: 'readonly',
                module: 'readonly',
                __dirname: 'readonly',
                __filename: 'readonly',
            },
        },
    },
    
    // TypeScript configuration
    {
        files: ['**/*.ts', '**/*.tsx'],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module',
            },
            globals: {
                console: 'readonly',
                Buffer: 'readonly',
                process: 'readonly',
                global: 'readonly',
            },
        },
        plugins: {
            '@typescript-eslint': typescriptEslint,
            import: importPlugin,
            'unused-imports': unusedImports,
        },
        rules: {
            // TypeScript specific rules
            ...typescriptEslint.configs.recommended.rules,
            
            // Import rules
            ...importPlugin.configs.recommended.rules,
            ...importPlugin.configs['typescript'].rules,
            
            // Unused imports
            'unused-imports/no-unused-imports': 'warn',
            'unused-imports/no-unused-vars': [
                'warn',
                {
                    vars: 'all',
                    varsIgnorePattern: '^_',
                    args: 'after-used',
                    argsIgnorePattern: '^_',
                },
            ],
            
            // Additional rules
            'no-console': 'warn',
            'no-debugger': 'warn',
            'prefer-const': 'error',
            'no-var': 'error',
            
            // Allow any type for now (you can make this stricter later)
            '@typescript-eslint/no-explicit-any': 'warn',
        },
        settings: {
            'import/resolver': {
                typescript: {
                    alwaysTryTypes: true,
                    project: ['./tsconfig.base.json', './services/*/tsconfig.json'],
                },
                node: {
                    extensions: ['.js', '.jsx', '.ts', '.tsx'],
                    moduleDirectory: ['node_modules', '.'],
                },
            },
        },
    },

      // Global ignores
    {
        ignores: [
            'node_modules/**',
            'dist/**',
            'build/**',
            '*.min.js',
            'coverage/**',
            // Ignore compiled JavaScript files from TypeScript
            '**/*.js',
            '**/*.mjs',
            // But allow JavaScript config files
            '!eslint.config.js',
            '!*.config.js',
            '!*.config.mjs',
        ],
    },
]);
