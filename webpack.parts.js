const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports.generateSourceMaps = ({ type }) => ({
    devtool: type,
});

module.exports.loadBabel = function () {
    return {
        module: {
            rules: [
                {
                    test: /\.m?js$/,
                    exclude: /(node_modules|bower_components)/,
                    use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                    }
                }
            ]
        }
    };
};

module.exports.loadCss = function () {
    return {
        plugins: [
            new MiniCssExtractPlugin({
                // Options similar to the same options in webpackOptions.output
                // all options are optional
                filename: 'app.css',
                ignoreOrder: false, // Enable to remove warnings about conflicting order
            }),
        ],
        module: {
            rules: [
                {
                    test: /\.css$/,
                    use: [
                        {
                            loader: MiniCssExtractPlugin.loader,
                            options: {
                                // you can specify a publicPath here
                                // by default it uses publicPath in webpackOptions.output
                                publicPath: '../',
                                hmr: process.env.NODE_ENV === 'development',
                            },
                        },
                        'css-loader',
                    ],
                },
            ],
        },
    };
};
