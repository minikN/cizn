import { fileURLToPath } from 'url';
import path from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default {
  entry: './src/app.js',
  experiments: {
    outputModule: true,
  },
  output: {
    filename: 'app.js',
    path: path.resolve(__dirname, 'build'),
    library: {
      type: 'module',
    },
  },
  mode: 'production',
  target: 'node18',
  resolve: {
    extensions: ['.js'],
    alias: {
      '@cizn': path.resolve(__dirname, './src/app'),
      '@lib': path.resolve(__dirname, './src/lib'),
    },
  },
}