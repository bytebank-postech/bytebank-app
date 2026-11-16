import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: [
      'packages/domain',
      'packages/application',
      'packages/infrastructure',
      'packages/shared',
      'apps/shell',
      'apps/mfe-auth',
    ],
  },
})
