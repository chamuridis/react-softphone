import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import esbuild from 'rollup-plugin-esbuild'
import peerDepsExternal from 'rollup-plugin-peer-deps-external'
import terser from '@rollup/plugin-terser'

import pkg from './package.json' with { type: 'json' }

export default {
  input: 'src/index.jsx',
  external: (id) => {
    // Only React and ReactDOM as external - bundle everything else including ALL MUI
    if (id === 'react' || id === 'react-dom' || id === 'react/jsx-runtime') {
      return true;
    }
    // Ensure MUI packages are NOT external (should be bundled)
    if (id.startsWith('@mui/') || id.startsWith('@emotion/')) {
      return false;
    }
    return false;
  },
  output: [
    {
      file: pkg.main,
      format: 'cjs',
      sourcemap: true,
      exports: 'named'
    },
    {
      file: pkg.module,
      format: 'es',
      sourcemap: true
    }
  ],
  plugins: [
    json(),
    nodeResolve({
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
      preferBuiltins: false,
      browser: true
    }),
    commonjs({
      include: /node_modules/
    }),
    esbuild({
      target: 'es2018',
      jsx: 'automatic',
      jsxImportSource: 'react'
    }),
    terser()
  ]
}
