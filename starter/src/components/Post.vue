<template>
  <article>
    <div class="header-content">
      <div class="has-text-centered">
        <h1 class="title">
          {{ post.title }}
        </h1>
      </div>
    </div>

    <div class="subheader-content has-text-centered">
      <p>
        <a>{{ post.author || 'Author' }}</a> |
        {{ post.createdAt || new Date().toUTCString() | formatDate }}
      </p>
      <hr />
    </div>

    <div class="content">
      <p v-if="this.isSummary">{{ post.content[0] }}</p>
      <p v-else v-for="(paragraph, index) in post.content" :key="index">{{ paragraph }}</p>

      <div class="has-text-centered" v-if="this.isSummary">
        <p><router-link :to="{ name: 'post', params: { id: post.id } }" class="button">Continue Reading</router-link></p>
      </div>
      <div class="has-text-right" v-else>
        <p><router-link to="/" class="button">Back to Home</router-link></p>
      </div>
    </div>
  </article>
</template>

<script>
export default {
  name: 'Post',
  props: {
    post: Object,
    "is-summary": {
      type: Boolean,
      default: false
    }
  }
}
</script>