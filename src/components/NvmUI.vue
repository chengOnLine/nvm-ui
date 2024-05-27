<template>
    <div class="container">
        <el-card class="box-card" v-loading="basicLoading">
            <div slot="header">
                <span>基本信息</span>
            </div>
            <div class="row">
                <div class="col">
                    <div class="label">当前nvm版本：</div>
                    <div class="value">{{ detail.NVMVersion || '--' }}</div>
                </div>
                <div class="col">
                    <div class="label">当前node版本：</div>
                    <div class="value">{{ detail.NODEVersion || '--' }}</div>
                </div>
            </div>
        </el-card>

        <el-card class="box-card" v-loading="changeLoading">
            <div slot="header">
                <span>切换Node版本</span>
            </div>
            <el-radio-group v-model="version" @change="handleChange">
                <el-radio-button v-for="item in list" :label="item" :key="item">
                    {{item}}
                </el-radio-button>
            </el-radio-group>
        </el-card>

        <el-card class="box-card">
            <div slot="header">
                <span>安装Node版本</span>
            </div>

            <div class="flex">
                <el-autocomplete
                    style="flex: 1"
                    class="inline-input"
                    v-model="installVersion"
                    :fetch-suggestions="querySearch"
                    placeholder="请输入或选择要安装的node版本号，例如14.17.3"
                >
                </el-autocomplete>
                <el-button :loading="installLoading" @click="handleInstallClick">{{ installLoading ? '安装中' : '安装' }}</el-button>
            </div>
        </el-card>

        <el-card class="box-card">
            <div slot="header">
                <span>卸载Node版本</span>
            </div>

            <div class="flex">
                <el-select style="flex: 1" placeholder="请选择要卸载的node版本号" v-model="unInstallVersion">
                    <el-option v-for="(version,idx) in list" :label="version" :value="version" :key="idx"></el-option>
                </el-select>
                <el-button :loading="unInstallLoading" @click="handleUnInstallClick">{{ unInstallLoading ? '卸载中' : '卸载' }}</el-button>
            </div>
        </el-card>
<!-- 
        <el-card>
            <div slot="header">
                <span>运行cmd命令</span>
            </div>
            <div class="flex">
                <el-input v-model="command"></el-input>
                <el-button @click="handleRunClick">运行</el-button>
                <el-button style="margin-left: 0;" @click="handleAdminRunClick">管理员权限运行</el-button>
            </div>
            <div class="log-list">
                <div class="log-item" v-for="(item, index) in logList" :key="index">
                    >>><pre>{{item}}</pre>
                </div>
            </div>
        </el-card> -->
    </div>
</template>

<script>
export default{
    data(){
        return {
            version: '',
            list: [],
            command: '',
            loading: false,
            logList: [],
            detail: {
                NVMVersion: '',
                NODEVersion: '',
            },
            basicLoading: false,
            changeLoading: false,
            unInstallLoading: false,
            installLoading: false,
            installVersion: undefined,
            unInstallVersion: undefined,
            nodeVersionList: [],
        }
    },
    methods:{
        querySearch(queryString, cb) {
            var nodeVersionList = this.nodeVersionList;
            console.log("queryString" , queryString)
            var results = queryString ? nodeVersionList.filter( ( restaurant ) => restaurant.value?.toLowerCase()?.indexOf(queryString?.toLowerCase()) === 0 ) : nodeVersionList;
            console.log("result" , results)
            // 调用 callback 返回建议列表的数据
            cb(results);
        },
        handleRunClick(){
            this.run(this.command);
        },
        handleAdminRunClick(){
            this.runByAdmin(this.command);
        },
        handleInstallClick(){
            if( !this.installVersion ){
                this.$message.warning("请输入或选择一个版本号");
                return;
            }
            console.log("installVersion" , this.installVersion)
            this.installNode(this.installVersion)
        },
        handleUnInstallClick(){
            if( !this.unInstallVersion ){
                this.$message.warning("请选择要卸载的版本号");
                return;
            }
            this.$confirm(`是否确定卸载node版本: ${this.unInstallVersion}?`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                console.log("installVersion" , this.unInstallVersion)
                this.unInstallNode(this.unInstallVersion)
            })  
        },
        run(cmd){
            if( !cmd ) return;
            window?.services?.cmd( cmd ).then( stdout => {
                console.log("stdout: ", stdout);
                this.logList.push( stdout )
            }).catch( err => {
                this.$message.error( err );
                this.logList.push( err )
                console.error("err: " , err)
            })
        },
        runByAdmin(cmd){
            if( !cmd ) return;
            window?.services?.sudo( cmd ).then( stdout => {
                console.log("stdout: " , stdout )
                this.logList.push( stdout )
            }).catch( err => {
                this.$message.error( err );
                this.logList.push( err )
                console.error("err: " , err)
            })
        },
        getNodeVersions(){
            const cmd = 'nvm ls';
            this.changeLoading = true;
            window?.services?.cmd( cmd ).then( stdout => {
                this.list = stdout?.split('\n')?.filter( item => item.trim() )?.map( item => {
                    if( !item ) return item;
                    // let reg = /([1-9]\d|[1-9])(.([1-9]\d|\d)){2}/g;
                    let reg = /\d+.\d+.\d+/g;
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
            }).catch( err => {
                this.$message.error( err );
                console.error("err: " , err)
            }).finally( () => {
                this.changeLoading = false;
            })
        },
        getNodeAvailableVersions(){
            const cmd = 'npm view node versions';
            window?.services?.cmd( cmd ).then( stdout => {
                let reg = /\d+.\d+.\d+/g;
                let list = stdout?.match(reg);
                this.nodeVersionList = list.map( version => ({ value: version }) );
            }).catch( () => {
                this.$message.error("获取node所有可用版本失败，请检查是否已经安装npm或环境变量设置")
            })
        },
        installNode(version){
            const cmd = `nvm install ${version}`;
            this.installLoading = true;
            window?.services?.cmd( cmd ).then( stdout => {
                console.log("stdout" , stdout );
                this.getNodeVersions();
                this.$message.success('安装成功');
                this.installVersion = undefined;
            }).catch((err) => {
                this.$message.error("安装失败" + err );
            }).finally( () => {
                this.installLoading = false;
            })
        },
        unInstallNode(version){
            const cmd = `nvm uninstall ${version}`;
            this.unInstallLoading = true;
            window?.services?.cmd( cmd ).then( stdout => {
                console.log("stdout" , stdout );
                this.getNodeVersions();
                this.$message.success('卸载成功');
                this.unInstallVersion = undefined;
            }).catch((err) => {
                this.$message.error("卸载失败" + err );
            }).finally( () => {
                this.unInstallLoading = false;
            })
        },
        getDetail(){
            let p1 = new Promise( resolve => {
                window?.services?.cmd('nvm version').then( stdout => {
                    this.detail.NVMVersion = stdout;
                    resolve();
                })  
            })
            let p2 = new Promise( resolve => {
                window?.services?.cmd('nvm current').then( stdout => {
                    var reg = /\d+.\d+.\d+/g;
                    if( stdout && reg.test(stdout )){
                        this.detail.NODEVersion = stdout;   
                    }else{
                        this.detail.NODEVersion = "当前没有安装node版本";
                    }
                    resolve()
                })
            })
            this.basicLoading = true;
            Promise.all([p1, p2]).then( () => {}).finally( () => {
                this.basicLoading = false;
            })
        },
        handleChange(version){
            const cmd = `nvm use ${version}`;
            this.changeLoading = true;
            window?.services?.sudo(cmd).then( stdout => {
                console.log("stdout: " , stdout )
                this.$message.success("切换成功")
            }).catch( err => {
                console.log("err: " , err)
                this.$message.error("切换失败")
            }).finally( () => {
                this.changeLoading = false;
                this.getNodeVersions();
                this.getDetail();
            })
        }
    },
    mounted(){
        this.getNodeVersions();
        this.getNodeAvailableVersions();
        this.getDetail();
    }
}
</script>

<style scoped>
/deep/ .el-card__header{
    text-align: left;
    font-size: 16px;
    font-weight: bold;
}
.log-list{
    margin-top: 15px;
    padding: 0 20px;
    max-height: 180px;
    /* padding: 15px; */
    overflow: auto;
    /* background-color: aqua; */
    text-align: left;
}
.log-item{
    
}
.row{
    display: flex;
    flex-wrap: wrap;
}
.col{
    width: 50%;
    display: flex;
    justify-content: flex-start;
    align-items: center;
}
.flex{
    display: flex;
    align-items: center;
    gap: 15px;
}
</style>
