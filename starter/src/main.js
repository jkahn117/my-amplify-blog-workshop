import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import moment from "moment";
import Buefy from 'buefy'
import 'buefy/dist/buefy.css'
import '@/assets/style.css'


//// Add Amplify Imports ////

Vue.use(Buefy)

Vue.config.productionTip = false

Vue.filter("formatDate", function(value) {
  if (value) {
    return moment(String(value)).format("MMM D YYYY");
  }
})

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
