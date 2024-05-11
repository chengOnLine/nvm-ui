 // 开发者可以暴露自定义 API 供后加载脚本使用
const { exec } = require('child_process');
const path = require('path');
const sudoPrompt = require('sudo-prompt');
const tmpDir = require('os').tmpdir();
 
// const options = {
//   name: 'Node', // 可以是任何名称
// };
// const command = 'whoami';

function run( cmd , fn ){
    exec( cmd , ( err , stdout , stderr ) => {
        fn( err , stdout , stderr )
    })
 }
 window.services = {
    cmd: ( cmd , fn ) => {
      return run( cmd , fn )
    },
    adminCmd: ( cmd , fn ) => {
        const options = {
            shell: 'cmd.exe',
            args: ['/c', `runas /user:Administrator cmd /c "${cmd}"`],
        };
        return exec('start', options, (err, stdout, stderr) => {
            fn( err , stdout , stderr )
        });
        // return sudoPrompt.exec( cmd, options, function(err, stdout, stderr) {
        //     fn( err , stdout , stderr )
        // });
    },
    getFilePath( fileName ){
        // const dirName = String(Date.now()) + Math.random().toString(16).substring(2, 6);
        return path.join(__dirname, fileName);
    }
  }