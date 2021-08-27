import typescript from 'rollup-plugin-typescript2';
import tscompile from 'typescript';
import replace from '@rollup/plugin-replace';
import commonjs from '@rollup/plugin-commonjs';
import html from 'rollup-plugin-html';
import { terser } from 'rollup-plugin-terser';
import alias from '@rollup/plugin-alias';
import path from 'path';

const production = process.env.NODE_ENV !== 'development';

export const CommonPlugin = [
    replace({
        preventAssignment: true,
        values: {
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
        },
    }),
    commonjs(),
    alias({
        entries: [
            { find: '@', replacement: path.resolve(__dirname, '..', 'src') },
            {
                find: '@page-content',
                replacement: path.resolve(
                    __dirname,
                    '..',
                    'src/views/content/',
                ),
            },
        ],
    }),
    typescript({
        typescript: tscompile,
        tsconfig: 'tsconfig.json',
    }),
    html({
        include: '**/*.html',
    }),
    production && terser(),
];
