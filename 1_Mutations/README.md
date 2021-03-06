# Full Stack Serverless Apps with AWS AppSync and Amplify Framework

## Mutating Data

In this section, we will continue to expand our simple blog application by adding support for mutations in the frontend application. As you saw in the previous section, our API already supports creating and updating data, adding support to the Vue application is fairly simple.

First, we'll add support for commenting on a post. First, create a new file in the `src/components` directory named `NewComment.vue`. Paste the following code into the new file and save:

### src/components/NewComment.vue

``` js
<template>
  <div class="newComment">
    <b-field label="New Comment">
      <b-input v-model="content" maxlength="200" type="textarea"></b-input>
    </b-field>
    <div class="has-text-right">
      <b-button @click="submitComment" type="is-primary">Submit</b-button>
    </div>
  </div>
</template>

<script>
import { graphqlOperation, Logger } from 'aws-amplify'
import { createComment } from '@/graphql/mutations'

const logger = new Logger('PostDetail')

export default {
  name: 'NewComment',
  props: {
    postId: String
  },
  data: function() {
    return {
      content: ''
    }
  },
  methods: {
    async submitComment() {
      try {
        const newComment = {
          content: this.content,
          commentPostId: this.postId
        }
        await this.$Amplify.API.graphql(graphqlOperation(createComment, { input: newComment }))
        logger.debug('Comment created')
      } catch (error) {
        logger.error(error)
      }
    }
  }
}
</script>

<style>
.newComment {
  padding-top: "30px";
}
</style>
```

We also need to make a few updates to the `PostDetail` page:

### src/views/PostDetail.vue

``` js
<template>
  <div class="post">
    <Post :post="myPost" :key="myPost.id" />
    
    <hr />

    <h3 class="subtitle is-3" v-if="comments.length">Comments</h3>
    <Comment v-for="comment in comments" :comment="comment" :key="comment.id" />

    <!-- ADDED -->
    <NewComment :postId="myPost.id" />
  </div>
</template>

<script>
import Post from '@/components/Post.vue'
import Comment from '@/components/Comment.vue'
import NewComment from '@/components/NewComment.vue' // ADDED

import { graphqlOperation, Logger } from 'aws-amplify'
import { getPost } from '@/graphql/queries'

const logger = new Logger('PostDetail')

export default {
  name: 'PostDetail',
  components: {
    Post,
    Comment,
    NewComment // ADDED
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
  async mounted() {
    try {
      const postData = await this.$Amplify.API.graphql(
                          graphqlOperation(getPost, { id: this.$route.params.id })
                       )
      logger.debug('data from API: ' + postData)
      this.myPost = postData.data.getPost

      this.comments = this.postHasData() ? this.myPost.comments.items : []
    } catch (error) {
      logger.error(error)
    }
  },
  methods: {
    postHasData() {
      return Array.isArray(this.myPost.comments.items) || this.myPost.comments.items.length
    }
  }
}
</script>
```

Hop back to your browser, open your Develper Tools to the Network tab, and refresh the post detail page. Beneath all comments, there should now be an area to create a new comment. Enter a comment and click "Submit".

In your Developer Tools, you should see a `POST` request to your GraphQL endpoint such as:

![New Comment Network Pane](../images/new_comment_network.png)

Refresh the page to see the new comment, for example:

![New Comment Submitted](../images/new_comment_complete.png)

### A Brief Dive into Resolvers

We've now used a mutation to create a new comment in the Comments DyanmoDB table via AppSync. Thus far, we've relied on Amplify to build the resolvers that connect AppSync and DynamoDB. Resolvers in AppSync are built using the Velocity Template Language (VTL). While a simple resolver, such as the one that puts a new comment in a DynamoDB table, is somewhat boilerplate, we can also build more complex resolvers as needed.

We can find the resolver template used to create a new Comment both in the AWS Management Console and within our Amplify project. In your Amplify project, open the file `amplify/backend/api/MyAmplifyBlog/build/resolvers/Mutation.createComment.req.vtl`, it should look like the following:

``` vtl
$util.qr($context.args.input.put("createdAt", $util.defaultIfNull($ctx.args.input.createdAt, $util.time.nowISO8601())))
$util.qr($context.args.input.put("updatedAt", $util.defaultIfNull($ctx.args.input.updatedAt, $util.time.nowISO8601())))
$util.qr($context.args.input.put("__typename", "Comment"))
{
  "version": "2017-02-28",
  "operation": "PutItem",
  "key": #if( $modelObjectKey ) $util.toJson($modelObjectKey) #else {
  "id":   $util.dynamodb.toDynamoDBJson($util.defaultIfNullOrBlank($ctx.args.input.id, $util.autoId()))
} #end,
  "attributeValues": $util.dynamodb.toMapValuesJson($context.args.input),
  "condition": {
      "expression": "attribute_not_exists(#id)",
      "expressionNames": {
          "#id": "id"
    }
  }
}
```

If you are familiar with using an AWS SDK to put an item in DynamoDB, the latter part of the resolver should look familiar. From line 4 down, we are structuring a `PutItem` request for DynamoDB. Above line 4, we are setting default values for the `createdAt` and `updatedAt` timestamps and setting the GraphQL type value (`__typename`).

The corresponding response template can be found at `amplify/backend/api/MyAmplifyBlog/build/resolvers/Mutation.createComment.res.vtl` and simply converts the response from DynamoDB to JSON using a utility library provided by AppSync.

``` vtl
$util.toJson($context.result)
```

More details on DynamoDB resolver templates for AppSync can be found in [documentation](https://docs.aws.amazon.com/appsync/latest/devguide/resolver-mapping-template-reference-dynamodb.html).

Now that you know where to find the various resolvers for your GraphQL API, review a few others. Amplify has done a significant amount of heavy lifting for us, though we can also provide our own, [custom resolver](https://aws-amplify.github.io/docs/cli/graphql#add-a-custom-resolver-that-targets-a-dynamodb-table-from-model) using an "escape hatch" in Amplify, though that is out of the scope of this workshop.

## Subscribing to Changes in Data

AWS AppSync powers real-time use cases that provide rich, engaging user experiences by delivering quick access to data as it is available or changes. Use cases range from real-time scoreboards to messaging applications to collaborative writing. AppSync allows us to deliver these real-time experiences at scale, to millions of clients.

AppSync supports subscriptions against any data source, such that when a mutation occurs, the results can be passed to subscribed clients using MQTT over Websockets.

To demonstrate AppSync subscriptions, we will enhance the Home page of our blog application to automatically display the latest posts as they are published. In addition to updating `Home.vue`, we will use the AWS Management Console to create a new post, which will trigger AppSync to send the new post data to subscribed clients.

> In this example, we will use a Vue component provided by Amplify called `Connect` that will query and subscribe to changes in the data. This declarative approach provides the same functionality as JavaScript code but can be easier to understand in simple cases.

Overwrite the existing content of `src/views/Home/vue` with the code below. Save your updates and refresh the page in the browser.

### src/views/Home.vue

``` js
<template>
  <div class="home">
    <amplify-connect :query="listPostsQuery"
        :subscription="onCreatePostSubscription"
        :onSubscriptionMsg="onCreatePost">
      <template slot-scope="{ loading, data, errors }">
        <div v-if="loading"></div>
        <div v-else-if="errors.length > 0">An error occurred</div>
        <div v-else-if="data">
          <Post v-for="post in data.listPosts.items" :post="post" :key="post.id" :isSummary="true" />
        </div>
      </template>
    </amplify-connect>
  </div>
</template>

<script>
import Post from '@/components/Post.vue'

import { graphqlOperation } from 'aws-amplify'
import { listPosts } from '@/graphql/queries'
import { onCreatePost } from '@/graphql/subscriptions'

export default {
  name: 'home',
  components: {
    Post
  },
  computed: {
    listPostsQuery() {
      return graphqlOperation(listPosts)
    },
    onCreatePostSubscription() {
      return graphqlOperation(onCreatePost)
    }
  },
  methods: {
    // How to deal with new subscription data
    onCreatePost(prevData, newData) {
      const newPost = newData.onCreatePost
      prevData.data.listPosts.items.push(newPost)
      return prevData.data
    }
  }
}
</script>
```

Open the AWS AppSync console and click on the Queries menu item on the left.

> If you have already closed the Management Console, use the command `amplify console api`.

Create a new blog post using the following GraphQL mutation and click the orange run button. Hop back to the browser and look for the new post to appear.

``` graphql
mutation CreatePost {
  createPost(input: {
    title: "New Post - Subscription",
    content: [
      "This post should automatically appear on the home page using AppSync Subscriptions.",
    ]
  })
  {
    id
    title
    content
  }
}
```

While arguably an unneccessary example for a blog, real-time updates can open exciting possibilities for new and existing applications. AppSync makes adding real-time data easy to implement at scale.

While we've been working with our GraphQL API, you may have noticed that neither the application nor the API currently implement any type of auhorization. Any user with the API Key could create a new post. Next, we'll add authorization to the API to protect mutations that modify data.

**[Adding Authorization >>](./2_Auth)**
