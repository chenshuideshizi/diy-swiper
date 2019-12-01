import json from 'rollup-plugin-json'
import resolve from 'rollup-plugin-node-resolve'
import babel from 'rollup-plugin-babel'

import { name, version } from '../package.json'


var file 

if (process.env.NODE_ENV === 'production') {
  file = 'dist/' + name + '.min.js'
} else {
  file = 'dist/' + name + '.js'
}

export default {
  input: './src/index.js',
  output: {
    file: file,
    format: 'umd',
    name: 'Swiper'
  },
  plugins: [
    json(),
    resolve({
      customResolveOptions: {
        moduleDirectory: 'node_modules'
      }
    }),
    babel({
      exclude: 'node_modules/**'
    })
  ],
  external: ['lodash']
}