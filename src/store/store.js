import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex)

export const store = new Vuex.Store({
  state: {
    home: {},
    topImages: [],
    blogs: [],
    tags: [],
    filter: 'all',
    visitedEms: 0
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