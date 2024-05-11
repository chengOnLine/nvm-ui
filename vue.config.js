const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    host: '0.0.0.0',
    port: 4000, // 端口号
    https: false, // https:{type:Boolean}
    open: true, // 配置自动启动浏览器
  },
})
