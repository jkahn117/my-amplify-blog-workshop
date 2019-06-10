<template>
  <div class="post">
    <Post :post="post" :key="post.id" />
    
    <hr />

    <h3 class="subtitle is-3" v-if="comments.length">Comments</h3>
    <Comment v-for="comment in comments" :comment="comment" :key="comment.id" />    
  </div>
</template>

<script>
import data from '@/data'
import Post from '@/components/Post.vue'
import Comment from '@/components/Comment.vue'

export default {
  name: 'PostDetail',
  components: {
    Post,
    Comment
  },
  props: {
    post: Object
  },
  data: function() {
    return {
      comments: []
    }
  },
  mounted() {
    this.post = data.posts.find((el) => el.id === this.$route.params.id)
    this.comments = Array.isArray(this.post.comments) || this.post.comments.length ? this.post.comments : []
  }
}
</script>
