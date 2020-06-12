import babel from 'rollup-plugin-babel';
import serve from 'rollup-plugin-serve';

export default {
    input: './src/index.js',
    output: {
        format: 'umd',
        file: 'dist/vue.js',
        name: 'Vue',
        sourcemap: true
    },
    plugins: [
        babel({
            exclude: 'node_modules'
        }),
        serve({
            open: true,
            openPage: '/publish/index.html',
            port:3000,
            contentBase:''
        })
    ]
}