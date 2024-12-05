import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import url from '@rollup/plugin-url';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import pkg from './package.json';

export default {
  input: 'src/index.js',
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
      sourcemap: true,
      exports: 'named'
    }
  ],
  plugins: [
    peerDepsExternal({
      includeDependencies: true
    }),
    url({
      include: ['**/*.svg', '**/*.png', '**/*.jp(e)?g', '**/*.gif', '**/*.webp']
    }),
    json(),
    resolve({
      extensions: ['.js', '.jsx'],
      preferBuiltins: true,
      browser: true
    }),
    babel({
      exclude: 'node_modules/**',
      babelHelpers: 'runtime',
      presets: [
        '@babel/preset-env',
        ['@babel/preset-react', { runtime: 'automatic' }]
      ],
      plugins: [
        '@babel/plugin-transform-runtime',
        '@babel/plugin-transform-class-properties',
        '@babel/plugin-transform-nullish-coalescing-operator',
        '@babel/plugin-transform-numeric-separator',
        '@babel/plugin-transform-optional-chaining',
        '@babel/plugin-transform-json-strings',
        '@babel/plugin-transform-export-namespace-from'
      ]
    }),
    commonjs({
      include: /node_modules/,
      requireReturnsDefault: 'auto'
    })
  ],
  external: [
    ...Object.keys(pkg.peerDependencies || {}),
    ...Object.keys(pkg.dependencies || {}),
    /@babel\/runtime/,
    /@emotion\//,
    /@mui\//
  ]
};