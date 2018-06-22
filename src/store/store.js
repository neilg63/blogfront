import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex)

export const store = new Vuex.Store({
  state: {
    home: {},
    topImages: [],
    blogs: [],
    currNode: {
      nid: 0,
      title: '',
      body: ''
    },
    numBlogs: 0,
    tags: [],
    filter: 'all',
    visitedEms: 0,
    styles: {
      size: 'medium',
      scheme: 'light',
      font: 'default'
    }
  },
  getters: {
    numTags: state => {
      return state.tags.length
    },
    textSize: state => {
      return state.styles.size
    },
    scheme: state => {
      return state.styles.scheme
    },
    font: state => {
      return state.styles.font
    }
  },
  mutations: {
    updateBlog(state, blog) {
      for (let i = 0; i < state.blogs.length; i++) {
        let b = state.blogs[i];
        if (b.nid === blog.nid) {
          state.blogs[i] = blog
        }
      }
    }
  },
  actions: {
    
  }
});