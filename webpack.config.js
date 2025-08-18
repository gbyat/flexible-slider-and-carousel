const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const defaultConfig = require('@wordpress/scripts/config/webpack.config');

module.exports = {
    ...defaultConfig,
    entry: {
        'slider/editor': './src/slider/index.js',
        'frame/editor': './src/frame/index.js',
        'slider/frontend': './src/slider/frontend.js'
    },
    output: {
        path: path.resolve(__dirname, 'blocks'),
        filename: '[name].js',
        publicPath: '/wp-content/plugins/flexible-slider-and-carousel/blocks/'
    },
    externals: {
        '@wordpress/blocks': ['wp', 'blocks'],
        '@wordpress/block-editor': ['wp', 'blockEditor'],
        '@wordpress/components': ['wp', 'components'],
        '@wordpress/element': ['wp', 'element'],
        '@wordpress/data': ['wp', 'data'],
        '@wordpress/core-data': ['wp', 'coreData'],
        '@wordpress/api-fetch': ['wp', 'apiFetch'],
        '@wordpress/i18n': ['wp', 'i18n']
    },
    plugins: [
        ...defaultConfig.plugins,
        new CopyPlugin({
            patterns: [
                {
                    from: 'src/slider/block.json',
                    to: 'slider/block.json'
                },
                {
                    from: 'src/frame/block.json',
                    to: 'frame/block.json'
                },
                {
                    from: 'src/slider/render.php',
                    to: 'slider/render.php'
                },
                {
                    from: 'src/frame/render.php',
                    to: 'frame/render.php'
                },
                {
                    from: 'src/slider/editor.css',
                    to: 'slider/editor.css'
                },
                {
                    from: 'src/slider/frontend.css',
                    to: 'slider/frontend.css'
                },
                {
                    from: 'src/frame/editor.css',
                    to: 'frame/editor.css'
                },
                {
                    from: 'src/frame/frontend.css',
                    to: 'frame/frontend.css'
                },
                // Copy Swiper CSS files
                {
                    from: 'node_modules/swiper/swiper-bundle.css',
                    to: 'slider/swiper-bundle.css'
                }

            ]
        })
    ],
    module: {
        ...defaultConfig.module,
        rules: [
            ...defaultConfig.module.rules,
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            }
        ]
    },
    resolve: {
        ...defaultConfig.resolve,
        alias: {
            ...defaultConfig.resolve.alias,
            '@': path.resolve(__dirname, 'src')
        }
    }
}; 