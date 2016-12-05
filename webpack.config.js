module.exports = {
  watch: true,
  entry: './app.jsx',
  output: {
    filename: 'bundle.js',
    path: './dist'
  },
  module:{
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015', 'react']
        }
      }
    ]
  }
}