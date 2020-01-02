const path = require('path');
const merge = require('webpack-merge');
const parts = require('./webpack.parts');


const commonConfig = merge([
    {
        entry: {
            main: './src/js/app.js',
        },
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: 'app.js',
        }
    },
    parts.loadBabel(),
    parts.loadCss(),
    // parts.loadImages(),
]);

const productionConfig = merge([]);
const developmentConfig = merge([
    parts.generateSourceMaps({ type: "source-map" }),
]);

module.exports = mode => {
    if (mode === "production") {
      return merge(commonConfig, productionConfig, { mode });
    }

    return merge(commonConfig, developmentConfig, { mode });
};
