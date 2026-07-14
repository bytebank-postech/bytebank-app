import type { StorybookConfig } from '@storybook/react-webpack5'

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@chromatic-com/storybook',
    '@storybook/addon-a11y',
    '@storybook/addon-docs',
    '@storybook/addon-webpack5-compiler-swc',
  ],
  framework: '@storybook/react-webpack5',
  webpackFinal: async (config) => {
    config.module ??= {}
    config.module.rules ??= []
    config.module.rules.push({
      test: /\.module\.s[ac]ss$/i,
      use: [
        'style-loader',
        {
          loader: 'css-loader',
          options: {
            esModule: false,
            modules: { namedExport: false },
          },
        },
        'sass-loader',
      ],
    })

    return config
  },
}
export default config
