const path = require("path");

module.exports = {
    entry: './src/app.ts',
    output: {
        filename: 'app.js',
        path: path.resolve(__dirname, 'dist')
    },
    resolve: {
        extensions: [".ts", '.js', '.html']
    },
    devtool: 'source-map',
    mode: "development",
    module: {
        rules: [{
            test: /\.tsx?$/,
            loader: 'ts-loader',
            exclude: /node_modules/
        },
        {
          test: /\.html$/,
          loader: 'file-loader',
          include: path.resolve(__dirname, 'src', 'res', 'html'),
          exclude: /node_modules/,
        }]
    }
};