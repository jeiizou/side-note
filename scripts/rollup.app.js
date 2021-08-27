import nodeResolve from '@rollup/plugin-node-resolve';
import { RollupOptions } from 'rollup';
import { CommonPlugin } from './rollup.common';

const production = !process.env.NODE_ENV;

/** @type RollupOptions */
const config = {
    input: `./src/extension.ts`,
    output: {
        format: 'commonjs',
        sourcemap: production ? false : true,
        file: `out/extension.js`,
    },
    plugins: [
        ...CommonPlugin,
        nodeResolve({
            browser: false,
            preferBuiltins: true,
        }),
    ],
    external: ['vscode'],
};

export default config;
