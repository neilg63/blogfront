import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex)

export const store = new Vuex.Store({
  state: {
    home: {},
    topImages: [],
    blogs: [],
    numBlogs: 0,
    tags: [],
    filter: 'all',
    visitedEms: 0,
    textSize: 'medium',
    scheme: 'light'
  },
  getters: {
    numTags: state => {
      return state.tags.length
    }
  },
  mutations: {
    
  },
  actions: {
    
  }
});