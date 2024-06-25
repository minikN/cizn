import { fileURLToPath } from 'url'
import terser from '@rollup/plugin-terser'
import alias from '@rollup/plugin-alias'
import path from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default {
  input: 'src/app.js',
  output: {
    file: 'build/app.js',
    format: 'es',
  },
  plugins: [
    terser(),
    alias({
      entries: [
        { find: '@cizn', replacement:  path.resolve(__dirname, './src/app') },
        { find: '@lib', replacement:  path.resolve(__dirname, './src/lib') },
      ],
    }),
  ],
}