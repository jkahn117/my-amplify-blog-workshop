<template>
  <div class="comment">
    <div class="block">
      <b-icon pack="far" icon="user-circle" />
      <strong>Commenter</strong>
    </div>
    <p>
      {{ this.comment.content }}
    </p>
  </div>
</template>

<script>
export default {
  name: 'Comment',
  props: {
    comment: Object
  }
}
</script>