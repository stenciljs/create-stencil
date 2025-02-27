import { builtinModules } from 'node:module'

import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'src/index.ts',
  output: {
    dir: 'dist',
    format: 'esm',
    strict: false,
    banner: '#! /usr/bin/env node\n',
    generatedCode: {
      constBindings: true,
    },
  },
  plugins: [resolve(), commonjs(), typescript()],
  external: [...builtinModules],
};
