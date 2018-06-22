<template>
  <article class="content-container node-page">
    <h1 class="title">{{title}}</h1>
    <figure v-if="hasMainImage" class="subpanel" :class="mainImageClass">
      <vue-picture :imgset="image" :group="image.group" :className="image.type.replace('/','-')"></vue-picture>
    </figure>
    <editable :text="body" type="node" :id="id" field="body"></editable>
    
    <sections v-if="showSections" :sections="sections"></sections>
    <share :title="title"></share>
  </article>
</template>

<script>

import VuePicture from './VuePicture'
import Sections from './Sections'
import Share from './Share'
import Editable from './Editable'
import filters from '../mixins/filters'
import axios from 'axios'

export default {
  name: 'Detail',
  components: {
    VuePicture,
    Sections,
    Share,
    Editable
  },
  mixins: [filters],
  data () {
    return {
      id: 0,
      title: 'Blog Title',
      body: "",
      image: "",
      showTitle: false,
      hasMainImage: false,
      hasContent: false,
      sections: [],
      numSections: 0,
      cType: 'article',
      hasProductImages: false,
      numProducts: 0,
      mainImageClass: 'right'
    }
  },
  computed: {
    showSections () {
      return this.numSections > 0 && !this.hasActiveProduct
    }
  },
  created () {
    this.fetchNode()
    let comp = this
    this.$bus.$on('update-detail', status => {
      console.log(status)
      comp.fetchNode()
    })
  },
  methods: {
    fetchNode () {
      let blogs = this.$store.state.blogs
      let matched = false
      let refPath = this.$route.path
      if (refPath.length > 2) {
        let cn = this.$store.state.currNode
        if (cn) {
          if (cn.path === refPath) {
            this.mapNode(cn)
            matched = true
          }
        }
        if (blogs instanceof Array) {
          let node = blogs.find(b => b.path === refPath)
          if (node) {
            if (node.fullMode) {
              this.mapNode(node)
              matched = true
            }
          }
        }
        if (!matched) {
          let comp = this
          let key = refPath.replace(/^\//,'').replace(/\//g,'__')
          let stored = this.$ls.get(key)
          if (typeof stored == 'string') {
            let node = JSON.parse(store)
            if (node) {
              if (node.nid) {
                node.fullMode = true
                this.mapNode(node)
                matched = true
              }
            }
          }
          if (!matched) {
            axios.get(this.$parent.$parent.cmsApi + 'page-path/' + key)
            .then(response => {
              if (response.data.nid) {
                let node = response.data
                node.fullMode = true
                comp.$store.commit('updateBlog', node)
                comp.mapNode(node)
              } 
            })
            .catch(e => {
              console.log(e)
            })
          }
        }
      }
    },
    mapNode (node) {
      this.id = node.nid
      this.title = node.title
      this.body = node.body.full
      this.cType = node.type
      this.image = node.image
    },
  }
}
</script>
<style>

#app .detail-pane .body {
  padding: .5em 5% 1em 5%;
  text-align: left;
  margin: 0 auto;
}


.detail-pane figure img {
  width: 100%;
  max-height: 80vh;
  margin-top: 2.5vh;
}

.detail-pane .products figure img {
  max-height: none;
}

.detail-pane .body {
  position: relative;
  font-size: 100%;
  z-index: 8;
}


#app .detail-pane .flex-row .body {
  max-width: 100%;
}

@media screen and (min-width: 40em) {

  #app .detail-pane .products {
    display: flex;
    flex-flow: nowrap row;
    background-color: white;
  }
}

@media screen and (min-width: 60em) {
  #app .detail-pane .body {
    padding: .5em 2em 1em 2em;
  }
}


#app .detail-pane > article {
  min-height: 75vh;
}

.detail-pane > article .edit-control {
  position: absolute;
  top: 0.25em;
  right:  0.25em;
  opacity: 0;
  pointer-events: none; 
 font-size: 1em;
 border:  none;
 background: black;
 color:  white;
 border-radius:  .5em;
 padding: 0.125em 0.25em;
 cursor: pointer;
 transition: all .5s ease-in-out;
}

.edit-control:hover {
  transform: skew(-10deg);
}

.detail-pane > article .text-wrapper {
  position: relative;
}

.detail-pane > article .save-editable {
  display:  none;
}

.detail-pane > article .editable .save-editable {
   display:  block;
   pointer-events: all;
}

.detail-pane > article .editable:hover .save-editable {
   z-index: 200;
   opacity: 0.75;
}

#app .detail-pane > article .text-wrapper:hover .make-editable {
  opacity: 0.75;
  pointer-events: all;
}

#app .detail-pane > article .editable .make-editable {
   display:  none;
}

#app .detail-pane h2 span.breadcrumb {
  display: inline-block;
  margin-right: .25em;
}

#app .detail-pane h2 span.link-back {
  cursor: pointer;
}

#app .detail-pane h2 span.link-back:after {
  display: inline-block;
  font-family: icomoon;
  content: "\e908";
  font-size: 0.5em;
  opacity: 0.5;
  margin: 0 .25em;
}

#app .subpanel h2 {
  padding-top: 0.25em;
}

#app .detail-pane .flex-row figure.subpanel {
  margin-top: 2em;
}

#app .product-overlay > h2,
#app .subpanel h2.article-title {
  font-size: 1.33em;
  transform: scaleX(1.25);
}

#app .detail-pane .sections,
#app .detail-pane .sections > section {
  position: relative;
}

@media screen and (min-width: 40em) {
  
  #app .detail-pane .flex-row  .article-top {
    width: 100%;
    display: flex;
    flex-flow: nowrap row;
  }
}

@media screen and (min-width: 60em) {

  
}

@media screen and (min-width: 80em) {
  #app .detail-pane .body {
    font-size: 106.667%;
  }
}

@media screen and (min-width: 100em) {
  #app .detail-pane .body {
    font-size: 112.5%%;
  }
}

</style>