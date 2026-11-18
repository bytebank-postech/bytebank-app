const { build } = require('esbuild')
const sass = require('sass')
const { chromium } = require('playwright')

async function main() {
  const bundle = await build({
    stdin: {
      contents: `
        import React from 'react';
        import {createRoot} from 'react-dom/client';
        import Chart from './packages/ui/src/components/ui/Chart/Chart';
        import layout from './apps/mfe-home/src/app/page.module.scss';
        const data = Array.from({length: 6}, (_, i) => ({name: 'Mês '+(i+1), Receitas: 2000+i*1200, Despesas: 5000-i*600}));
        createRoot(document.getElementById('root')).render(
          <div className={layout.analytics}>
            <div className={layout.chartCard} style={{background: 'white'}}>
              <div style={{width: '100%', minWidth: 0}}>
                <Chart title='Receitas x Despesas' type='line' data={data}
                  axis={{x:{key:'name',show:true},y:{show:true}}}
                  series={[{name:'Receitas',key:'Receitas',color:'green'},{name:'Despesas',key:'Despesas',color:'red'}]} />
              </div>
            </div>
            <div className={layout.chartCard} style={{background: 'white'}}>
              <div style={{width: '100%', minWidth: 0}}>
                <Chart title='Distribuição por tipo' type='pie'
                  data={[{name:'Pix',value:100,fill:'green'},{name:'Pagamento',value:200,fill:'red'}]}
                  axis={{x:{show:false},y:{show:false}}}/>
              </div>
            </div>
          </div>);
      `,
      resolveDir: process.cwd(),
      loader: 'tsx',
    },
    outfile: 'chart-preview.js',
    bundle: true,
    write: false,
    platform: 'browser',
    jsx: 'automatic',
    minify: true,
    loader: { '.svg': 'dataurl' },
    define: { 'process.env.NODE_ENV': '"production"', 'process.env': '{}' },
    plugins: [{
      name: 'scss',
      setup(plugin) {
        plugin.onLoad({ filter: /\.scss$/ }, ({ path }) => ({
          contents: sass.compile(path, { loadPaths: ['packages/ui/src/styles'] }).css,
          loader: 'local-css',
        }))
      },
    }],
  })
  const js = bundle.outputFiles.find(file => file.path.endsWith('.js')).text
  const css = bundle.outputFiles.find(file => file.path.endsWith('.css')).text
  const browser = await chromium.launch({ headless: true })
  try {
    const page = await browser.newPage()
    page.on('pageerror', error => console.error('Browser:', error.message))
    for (const width of [375, 540, 768, 1280]) {
      await page.setViewportSize({ width, height: 900 })
      await page.setContent(`<style>*{box-sizing:border-box}body{margin:0;padding:12px;background:#eee}${css}</style><div id="root"></div>`)
      await page.addScriptTag({ content: js })
      await page.waitForFunction(() => document.querySelectorAll('.recharts-wrapper > svg.recharts-surface').length === 2)
      console.log('SVGs rendered at width ' + width)
      await page.waitForFunction(() => [...document.querySelectorAll('.recharts-wrapper > svg.recharts-surface')].every(svg => svg.getBoundingClientRect().height >= 280))
      const dimensions = await page.locator('.recharts-wrapper > svg.recharts-surface').evaluateAll(elements => elements.map(svg => {
        const rect = svg.getBoundingClientRect()
        const plot = svg.querySelector('clipPath rect')
        return { width: rect.width, height: rect.height, plotHeight: plot && Number(plot.getAttribute('height')) }
      }))
      console.log(JSON.stringify({ viewport: width, charts: dimensions }))
      if (dimensions[0].plotHeight < 180) throw new Error('Plot area too short')
    }
  } finally {
    await browser.close()
  }
}
main().catch(error => { console.error(error); process.exitCode = 1 })
