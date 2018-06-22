<template>
  <section class="blogs">
    <article v-for="(blog, index) in filteredBlogs" :key="index" v-if="inScope(index)" class="blog-entry" :class="blog.classNames">
      <h3 class="title"><router-link :to="blog.path">{{blog.title}}</router-link></h3>
      <time :data-date="blog.date_1">{{blog.date}}</time>
      <template v-if="blog.showFull">
        <div class="body" v-html="blog.body.full"></div>
      </template>
      <template v-else>
        <div class="body summary">
          <span class="summary-text"  v-html="blog.body.summary"></span>
          <em @click="loadMore(blog)" class="load-full-body">more</em>
        </div>
      </template>
      <ul class="plain inline tags">
        <li class="word-count">{{blog.body.wc}} words</li>
        <li v-for="tag in blog.tags" @click="filter(tag)">{{tag}}</li>
      </ul>
    </article>
  </section>
</template>
<script>
import {mapGetters} from 'vuex'
import axios from 'axios'
import filters from '../mixins/filters'
export default {
  name: 'Blogs',
  mixins: [
    filters
  ],
  data () {
    return {
      blogs: [],
      numBlogs: 0,
      filterRgx: null,
      showFull: false
    }
  },
  created () {
    let comp = this
    let filter = 'all'
    if (this.$parent.$parent.homeLoaded) {
      comp.initBlogs()
    }
    this.$bus.$on('siteinfo', (status) => {
      comp.initBlogs()
    })
    this.$bus.$on('blogs-appended', (status) => {
      comp.initBlogs()
    })
    if (this.$route.params) {
      if (this.$route.params.filter) {
        filter = this.$route.params.filter.toLowerCase().replace('-', ' ')
        this.$store.state.filter = filter
      }
    }
    this.filterRgx = RegExp(filter, 'i')
  },
  computed: {
    filteredBlogs () {
      let filter = this.$store.state.filter
      if (filter.length < 2) {
        filter = 'all';
      }
      if (filter.toLowerCase() == 'all') {
        return this.blogs
      } else {
        this.filterRgx = new RegExp('^\\s*' + filter.replace(/[^a-z0-9]/gi, '.*?') + '\\s*$', 'i')
        return this.blogs.filter(blog => this.filterByTag(blog))
      }
    }
  },
  methods: {
    initBlogs () {
      this.blogs = this.$store.state.blogs.map(b => {
        b.showFull = false
        b.classNames = ['node-' + b.nid]
        return b
      })
      this.numBlogs = this.$store.state.numBlogs
    },
    filterByTag (blog) {
      if (blog.tags instanceof Array) {
        let nt = blog.tags.length
        let i = 0
        for (; i < nt; i++) {
          if (typeof blog.tags[i] === 'string') {
            if (this.filterRgx.test(blog.tags[i])) {
              return true
            }
          }
        }
      }
      return false
    },
    filter (tagName) {
      this.$parent.filterByTag(tagName)
    },
    inScope (index) {
      return index < (15 + (this.$parent.visitedEms / 15))
    },
    loadMore (blog) {
      if (blog.fullMode) {
        this.blogs = this.blogs.map(b => {
          b.showFull = b.nid === blog.nid
          return b
        })
      } else {
        let comp = this
        axios.get(this.$parent.$parent.cmsApi + 'page-path/' + blog.path.replace(/^\//, '').replace(/\//g, '__'))
          .then(response => {
            if (response.data.nid) {
              blog = response.data
              blog.fullMode = true
              comp.blogs = this.blogs.map(b => {
                if (b.nid === blog.nid) {
                  b = blog
                  b.showFull = true
                } else {
                  b.showFull = false
                }
                return b
              })
            }
          })
          .catch(e => {
            console.log(e)
          })
      }
    }
  }
}
</script>
