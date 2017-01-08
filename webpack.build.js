require('babel-core/register')
var config = require('./platforms/common/config')
var webpack = require('webpack')
var path = require('path')
var UglifyJsPlugin = webpack.optimize.UglifyJsPlugin
var ExtractTextPlugin = require('extract-text-webpack-plugin')
var extactStyle = new ExtractTextPlugin('all.min.css')

var fs = require('fs')
var nodeModules = fs.readdirSync('node_modules')
    .filter(function (i) {
        return ['.bin', '.npminstall'].indexOf(i) === -1
    })
var includes = [
    path.resolve(__dirname, 'app'),
    path.resolve(__dirname, 'platforms')
]

module.exports = [{
    name: 'Browser Side Render',
    devtool: 'cheap-source-map',
    entry: ['./platforms/browser/index.js'],
    output: {
        path: 'public.build',
        filename: '[name].js',
        publicPath: '/build/'
    },
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                include: includes,
                loader: 'babel-loader'
            }, {
                test: /\.css$/,
                loader: extractStyle.extract(['css', 'postcss'])
            }, {
                test: /\.less$/,
                include: includes,
                loader: extractStyle.extract(['css', 'less', 'postcss'])
            },
            { test: /\.woff2?$/, loader: 'url?limit=10000&minetype=application/font-woff' },
            { test: /\.ttf$/, loader: 'url?limit=10000&minetype=application/octet-stream' },
            { test: /\.eot$/, loader: 'file' },
            { test: /\.svg$/, loader: 'url?limit=10000&minetype=image/svg+xml' },
            { test: /\.(png|jpg|jpeg|gif|webp)$/i, loader: 'url?limit=10000' },
            { test: /\.json$/, loader: 'json' },
            { test: /\.html?$/, loader: 'file?name=[name].[ext]' }
        ]
    },
    resolve: {
        extensions: ['', '.js', '.jsx']
    },
    plugins: [
        extractStyles,
        new webpack.optimize.CommonsChunkPlugin('common', 'common.js'),
        new webpack.optimize.DedupePlugin(),
        new UglifyJsPlugin({
            compress: { warnings: false }
        }),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production'),
            __SERVER__: false
        })
    ]
}, {
    name: 'Server Side Render',
    devtool: 'cheap-source-map',
    entry: ['./platforms/server/index.js'],
    output: {
        path: path.join(__dirname, '/dist'),
        filename: 'index.js',
        publicPath: '/build/',
        libraryTarget: 'commonjs2'
    },
    target: 'node',
    node: {
        fs: 'empty',
        __dirname: true,
        __filename: true
    },
    externals: [
        function (context, request, callback) {
            var pathStart = request.split('/')[0]
            if (pathStart && (pathStart[0] === '!')
                || nodeModules.indexOf(pathStart) >= 0
                && request !== 'webpack/hot/signal.js') {
                    return callback(null, 'commmonjs' + request)
            }
            callback()
        }
    ],
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                include: includes,
                loader: 'babel-loader',
                query: {
                    plugins: [
                        [
                            "babel-plugin-require-ignore",
                            "extensions": [".less", ".css"]
                        ]
                    ]
                }
            }, {
                test: /\.(css|less)$/,
                loader: 'null'
            },
            { test: /\.woff2?$/, loader: 'null' },
            { test: /\.ttf$/, loader: 'null' },
            { test: /\.eot$/, loader: 'null' },
            { test: /\.svg$/, loader: 'null' },
            { test: /\.(png|jpg|jpeg|gif|webp)$/i, loader: 'url?limit=10000' },
            { test: /\.json$/, loader: 'json' }
        ]
    },
    resolve: {
        extensions: ['', '.js', '.jsx'],
        modulesDirectories: ['node_modules']
    },
    plugins: [
        new webpack.optimize.DedupePlugin(),
        new UglifyJsPlugin({
            compress: { warnings: false }
        }),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production'),
            __SERVER__: true
        })
    ]
}]
