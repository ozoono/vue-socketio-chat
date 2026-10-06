import { globalIgnores } from 'eslint/config'
import {
  defineConfigWithVueTs,
  vueTsConfigs,
} from '@vue/eslint-config-typescript'
import pluginVue from 'eslint-plugin-vue'
import importX from 'eslint-plugin-import-x'
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript'
import skipFormatting from 'eslint-config-prettier/flat'

export default defineConfigWithVueTs(
  globalIgnores(['dist/**', 'node_modules/**']),
  pluginVue.configs['flat/essential'],
  vueTsConfigs.recommended,
  {
    // Relative imports must always include the file extension
    files: ['**/*.{js,ts,vue}'],
    plugins: { 'import-x': importX },
    settings: {
      'import-x/resolver-next': [createTypeScriptImportResolver()],
    },
    rules: {
      'import-x/extensions': [
        'error',
        'always',
        { ignorePackages: true, checkTypeImports: true },
      ],
    },
  },
  // Turns off the ESLint rules that Prettier already takes care of
  skipFormatting,
)
