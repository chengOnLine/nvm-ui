<template>
    <div class="container">
        <el-card class="box-card">
            <div slot="header">
                <span>切换Node版本</span>
            </div>
            <el-radio-group v-model="version" @change="handleChange">
                <el-radio-button v-for="item in list" :label="item" :key="item">{{item}}</el-radio-button>
            </el-radio-group>
        </el-card>
    </div>
</template>

<script>
export default{
    data(){
        return {
            version: '',
            list: [],
        }
    },
    methods:{
        getNodeVersions(){
            const cmd = 'nvm ls'
            window?.services?.cmd( cmd , ( err , stdout ) => {
                if( err ){
                    this.$message.error( err || '获取node版本失败！');
                }
                this.list = stdout?.split('\n')?.filter( item => item.trim() )?.map( item => {
                    if( !item ) return item;
                    let reg = /([1-9]\d|[1-9])(.([1-9]\d|\d)){2}/g;
                    if( item?.indexOf('*') != -1 ){
                        let m = item?.match( reg );
                        this.version = m ? m[0] : '';
                    }
                    let match = item?.match( reg );
                    if( match ){
                        return match[0];
                    }
                } ) || [];
                console.log("list" ,  this.list );
            })
        },
        handleChange(version){
            console.log("version" , version)
            // const cmd = 'nvm use ' + version;
            const path =  window?.services?.getFilePath( 'changeNodeVersion.bat' )
            // const cmd = 'nvm ls';
            // const cmd = `powershell -Command "nvm use ${version}" -Verb RunAs`;
            const cmd = `powershell.exe Start-Process -FilePath "${path}" -WindowStyle hidden -Verb runAs`;
            console.log("path" , path);
            console.log("cmd" , cmd);
            window?.services?.cmd( cmd ,( err , stdout , stderr) => {
                if( err ){
                    this.$message.error( err || '切换node版本失败！');
                }
                console.log('stdout' , stdout );
                console.log('stderr' , stderr );
            })
        }
    },
    mounted(){
        this.getNodeVersions();
    }
}
</script>

<style>
</style>
