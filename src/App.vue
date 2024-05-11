<template>
  <div id="app">
    <NvmUI></NvmUI>
  </div>
</template>

<script>
import NvmUI from './components/NvmUI.vue'
export default {
  name: 'App',
  components: {
    NvmUI
  },
  methods:{
    handleClick(){
      console.log("window" , window.services)
      window.services.cmd('nvm ls' , ( err , stdout , stderr  ) => {
        if( err ){
          console.log("err" , err );
        }
        console.log("stdout" , stdout );
        console.log("stderr" , stderr );
      })
    }
  },
  mounted() {
    console.log('App.vue mounted');
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
