<template>
  <div class="auth">
    <div v-if="isLoggedIn">
      Welcome {{ this.getUsername }} |
      <a @click="logout">Logout</a>
    </div>
    <a @click="login" v-else>Login</a>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'AuthControl',
  computed: {
    ...mapGetters([
      'isLoggedIn',
      'getUsername'
    ])
  },
  methods: {
    login() {
      this.$router.push('/auth')
    },
    async logout() {
      await this.$Amplify.Auth.signOut()
    }
  }
}
</script>
