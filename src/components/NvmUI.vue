<template>
    <div class="container">
        <div class="info-warpper">
            <div>1. 本插件依赖NVM,参考安装教程： <el-link @click="toWeb('https://blog.csdn.net/jiangjunyuan168/article/details/134216065')" type="primary">https://blog.csdn.net/jiangjunyuan168/article/details/134216065</el-link></div>
            <div>2. 如果切换node版本无响应（一直转圈圈），可能是代码运行过程中生成的临时文件的路径含有中文名称导致系统无法识别，将系统默认编码设置为UTF-8即可解决。参考：<el-link type="primary" @click="toWeb('https://www.jb51.net/os/win11/908703.html')">https://www.jb51.net/os/win11/908703.html</el-link></div>
            <div>3. 如果觉得好用，希望给个5星评分，你们的支持就是我的动力，谢谢。</div>
        </div> 
        <el-card class="box-card">
            <div slot="header">
                <div class="flex" style="display: flex;justify-content: space-between;align-items: center;">
                    <div>基本信息</div>
                    <el-button plain type="primary" @click="handleRefreshClick" icon="el-icon-refresh">刷新</el-button>
                </div>
            </div>
            <div class="row" v-loading="basicLoading">
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

        <el-card class="box-card">
            <div slot="header">
                <div>切换Node版本<span style="font-weight: normal;">(点击版本号切换node版本)</span></div>
            </div>
            <div class="version-list-wrapper" v-loading="changeLoading">
                <el-radio-group v-if="list?.length > 0" v-model="version" @change="handleChange">
                    <el-radio-button v-for="item in list" :label="item" :key="item">
                        {{item}}
                    </el-radio-button>
                </el-radio-group>
                <div v-if="list?.length == 0">当前系统没有检测到已安装的node版本</div>
            </div>
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
                    clearable
                >
                </el-autocomplete>
                <el-button type="primary" :loading="installLoading" @click="handleInstallClick">{{ installLoading ? '安装中' : '安装' }}</el-button>
            </div>
        </el-card>

        <el-card class="box-card">
            <div slot="header">
                <span>卸载Node版本</span>
            </div>

            <div class="flex">
                <el-select style="flex: 1" placeholder="请选择要卸载的node版本号" v-model="unInstallVersion" clearable>
                    <el-option v-for="(version,idx) in list" :label="version" :value="version" :key="idx"></el-option>
                </el-select>
                <el-button type="danger" :loading="unInstallLoading" @click="handleUnInstallClick">{{ unInstallLoading ? '卸载中' : '卸载' }}</el-button>
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
    mounted(){
        this.getNodeVersions();
        this.getNodeAvailableVersions();
        this.getDetail();
    },
    methods:{
        toWeb(url){
            console.log("url" , url );
            if( !url ) return;
            window?.services?.open(url);
        },
        handleRefreshClick(){
            this.getNodeVersions();
            this.getNodeAvailableVersions();
            this.getDetail();
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
        querySearch(queryString, cb) {
            var nodeVersionList = this.nodeVersionList;
            console.log("queryString" , queryString)
            var results = queryString ? nodeVersionList.filter( ( restaurant ) => restaurant.value?.toLowerCase()?.indexOf(queryString?.toLowerCase()) === 0 ) : nodeVersionList;
            console.log("result" , results)
            // 调用 callback 返回建议列表的数据
            cb(results);
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
                this.nodeVersionList = list.map( version => ({ value: version }) ).reverse();
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
}
</script>

<style scoped>
/deep/ .el-card__header{
    text-align: left;
    font-size: 16px;
    font-weight: bold;
}
.el-card{
    /* margin-bottom: 5px; */
}
.info-warpper{
    background-color: #ffffff;
    border: 1px solid #b3d8ff;
    padding: 10px 15px;
    margin-bottom: 5px;
    text-align: left;
    background-color: #ecf5ff;
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
    margin-bottom: 10px;
}
.col-24{
    width: 100%;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    margin-bottom: 10px;
}
.flex{
    display: flex;
    align-items: center;
    gap: 15px;
}
</style>
