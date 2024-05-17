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
            window?.services?.cmd( cmd ).then( stdout => {
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
            const cmd = `nvm use ${version}`;
            console.log("cmd" , cmd);
            window?.services?.sudo(cmd).then( stdout => {
                console.log("stdout: " , stdout )
            }).catch( err => {
                console.log("err: " , err)
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
