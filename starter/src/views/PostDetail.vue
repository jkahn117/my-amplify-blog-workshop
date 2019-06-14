<template>
  <div class="post">
    <Post :post="myPost" :key="myPost.id" />
    
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
      myPost: {},
      comments: []
    }
  },
  mounted() {
    this.myPost = data.posts.find((el) => el.id === this.$route.params.id)
    this.comments = Array.isArray(this.myPost.comments) && this.myPost.comments.length ? this.myPost.comments : []
  }
}
</script>
