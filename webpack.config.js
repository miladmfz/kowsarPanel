// webpack.config.js
//require.resolve("stream-browserify"),

module.exports = {
    resolve: {
        fallback: {
            stream: require.resolve('stream-browserify')
        }
    }


};
