 // 开发者可以暴露自定义 API 供后加载脚本使用
const { exec } = require('child_process');
const Sudo = require('./sudo');

 window.services = {
    cmd: (cmd) => {
      return new Promise( (resolve , reject) => {
        exec( cmd , ( err , stdout , stderr ) => {
            if( err ){
                reject(err);
            }
            resolve( stdout );
        })
      })
    },
    sudo: (cmd) => {
      const sudo = new Sudo();
      return sudo?.execOnce( cmd );
    },
  }