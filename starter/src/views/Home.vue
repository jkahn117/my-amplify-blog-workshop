<template>
  <div class="home">
    <Post v-for="post in posts" :post="post" :key="post.id" :isSummary="true" />
  </div>
</template>

<script>
import data from '@/data'
import Post from '@/components/Post.vue'

export default {
  name: 'home',
  components: {
    Post
  },
  data: function() {
    return {
      posts: data.posts
    }
  }
}
</script>
