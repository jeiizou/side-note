import { nodeResolve } from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import postcss from 'rollup-plugin-postcss';
import copy from 'rollup-plugin-copy';
import * as fs from 'fs-extra';
import { CommonPlugin } from './rollup.common';

const files = fs.readdirSync('./src/views');

const config = (name) => {
    /** @type RollupOptions */
    return {
        input: `src/views/${name}/index.tsx`,
        output: {
            format: 'iife',
            sourcemap: false,
            file: `out/views/${name}.js`,
            name: name,
        },
        plugins: [
            ...CommonPlugin,
            nodeResolve({
                extensions: ['.js', '.jsx', '.ts', '.tsx', '.css'],
            }),
            babel({
                exclude: 'node_modules/**',
                babelHelpers: 'bundled',
            }),
            postcss({
                extract: `${name}.css`,
                use: {
                    less: {
                        javascriptEnabled: true,
                    },
                },
            }),
            copy({
                targets: [
                    {
                        src: 'node_modules/react/umd/react.production.min.js',
                        dest: 'out/assets',
                    },
                    {
                        src: 'node_modules/react-dom/umd/react-dom.production.min.js',
                        dest: 'out/assets',
                    },
                ],
            }),
        ],
        globals: {
            'react': 'React',
            'react-dom': 'ReactDOM',
        },
        external: ['react', 'react-dom'],
    };
};

export default files.map((file) => {
    return config(file);
});
