<template>
  <div id="app">
    <div class="hero-header">
      <header>
        <div class="container">
          <div class="section">
            <div class="has-text-centered">
              <h1 class="title is-1 is-spaced">My Amplify Blog</h1>
              <h4 class="subtitle is-4">A demonstration of AWS Amplify and AWS AppSync</h4>
            </div>
          </div>

          <div class="section">
            <div class="tabs is-centered">
              <ul>
                <router-link tag="li" exact-active-class="is-active" to="/"><a>Home</a></router-link>
                <router-link tag="li" exact-active-class="is-active" to="/about"><a>About</a></router-link>
              </ul>
            </div>
          </div>
        </div>
      </header>
    </div>

    <div class="hero-body">
      <div class="container">
        <div class="columns is-multiline is-mobile is-centered">
          <div class="column is-8 is-centered">
            <router-view/>
          </div>
        </div>
      </div>
    </div>

    <div class="hero-foot footer-custom">
      <div class="container has-text-centered">
        <hr/>
        <a class="nav-item" href="https://github.com/jkahn117/my-amplify-blog-workshop">
          <b-icon pack="fab" icon="github" size="is-medium" />
        </a>
        <AuthControl />
      </div>
    </div>
  </div>
</template>

<script>
import AuthControl from "./components/AuthControl.vue";

export default {
  components: {
    AuthControl
  }
}
</script>
