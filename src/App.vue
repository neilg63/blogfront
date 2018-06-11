<template>
  <div id="app" :class="classNames">
    <header class="top-header">
      <div class="inner">
        <div class="menu-toggle icon-menu top-icon" v-on:click.stop="toggleMenu()"></div>
        <div class="screen-y">{{screenY|round2}}, {{numBlogsLoaded}}</div>
        <div id="main-logo" class="main-logo icon-oi-logo" @click="logoAction()"></div>
        <div id="toggle-styler" @click="toggleStyler()">Styles</div>
      </div>
    </header>
    <nav class="main-nav">
      <div class="menu-toggle icon-menu top-icon" v-on:click.stop="toggleMenu()"></div>
      <ul class="menu">
        <li v-for="item in menu" :key="item.link"><router-link v-bind:to="item.link">{{item.title}}</router-link></li>
      </ul>
    </nav>
    <styler></styler>
    <div class="main">
      <div class="home-pane">
        <slides/>
        <article class="welcome">
          <h2>{{title}}</h2>
          <div v-html="introduction" class="body"></div>
        </article>
        <section class="listing">
          <tags-list />
          <blogs />
        </section>
        <sections :sections="sections">
        </sections>
        <vue-footer :menu="menu" :footer="footer" id="page-footer"></vue-footer>
      </div>
      <div class="detail-pane">
         <keep-alive>
          <router-view/>
        </keep-alive>
        <vue-footer :menu="menu" :footer="footer" id="inner-page-footer"></vue-footer>
      </div>
    </div>
  </div>
</template>
<script>
import Slides from '@/components/Slides'
import Sections from '@/components/Sections'
import VueFooter from '@/components/VueFooter'
import Blogs from '@/components/Blogs'
import TagsList from '@/components/TagsList'
import Styler from '@/components/Styler'
import filters from './mixins/filters'
import u from './utils/utils'
export default {
  name: 'App',
  components: {
    Slides,
    Sections,
    VueFooter,
    Blogs,
    TagsList,
    Styler
  },
  mixins: [filters],
  data () {
    return {
      menu: [],
      showMenu: false,
      showDetail: false,
      showStyler: false,
      blogs: [],
      numSections: 0,
      sections: [],
      title: 'Welcome',
      introduction: '',
      hasStore: false,
      footer: {
        copyright: ''
      },
      syncing: false,
      screenY: 0,
      visitedY: 0,
      scrolledDown: false,
      pageDown: false,
      lang: 'en',
      updating: false,
      fetching: false
    }
  },
  computed: {
    visitedEms () {
      return this.$store.state.visitedEms
    },
    numBlogs () {
      return this.$store.state.numBlogs
    },
    numBlogsLoaded () {
      return this.$store.state.blogs.length
    },
    classNames () {
      let cls = []
      if (this.showMenu) {
        cls.push('show-menu')
      }
      if (this.showDetail) {
        cls.push('show-detail')
      }
      if (!this.scrolledDown) {
        cls.push('scrolled-up')
      }
      if (!this.pageDown) {
        cls.push('page-up')
      }
      if (this.showStyler) {
        cls.push('show-styler')
      }
      cls.push('text-' + this.$store.getters.textSize)
      cls.push('scheme-' + this.$store.getters.scheme)
      cls.push('font-' + this.$store.getters.font)
      return cls
    }
  },
  created () {
    this.getStyles()
    let comp = this
    this.$bus.$on('hide-menu', () => {
      comp.showMenu = false
    })
    let path = this.$route.path.replace(/^\//, '')
    if (path.length < 2) {
      path = 'home'
    }
    switch (path) {
      case 'home':
        this.showDetail = false
        break
      default:
        this.showDetail = true
        break
    }

    this.$bus.$on('blogs-more-summaries', (data) => {
      if (data.items instanceof Array) {
        if (comp.numBlogsLoaded < comp.numBlogs) {
          comp.$store.state.blogs = comp.$store.state.blogs.concat(data.items)
          comp.$bus.$emit('blogs-appended', true)
        }
        comp.fetching = false
      }
    })
    window.addEventListener('keyup', (e) => {
      switch (e.keyCode) {
        case 27:
        case 13:
          comp.hideMenu()
          break;
      }
    })
    if (this.$parent.homeLoaded) {
      this.loadHome()
    }
    this.$bus.$on('siteinfo', (status) => {
      if (comp.$parent.homeLoaded) {
        comp.loadHome()
      }
    })
    this.$bus.$on('show-detail', (status) => {
      comp.showDetail = status === true
    })
  },
  mounted () {
    let comp = this
  },
  methods: {
    loadMenu (data) {
      if (data instanceof Array) {
        this.menu = data
      }
    },
    loadHome () {
      let data = this.$store.state.home
      if (data.menu) {
        this.loadMenu(data.menu)
      }
      if (data.pages) {
        this.$parent.pages = data.pages
      }
      if (data.home) {
        if (data.home.sections.length > 0) {
          let firstSec = data.home.sections[0]
          if (firstSec.type == 'image_set' && firstSec.layout == 'slides') {
            let topSec = data.home.sections.shift()
            let topImages = topSec.images;
            if (topImages.length > 0) {
              this.$store.state.topImages = topImages
            }
          }
        }
        if (data.home.sections instanceof Array) {
          this.sections = this.processSections(data.home.sections)
          this.numSections = this.sections.length
        }
        if (data.home.title) {
          this.title = data.home.title
        }
        if (data.home.body) {
          this.introduction = data.home.body.full
        }
      }
      if (data.blogs) {
        this.$store.state.blogs = data.blogs
        if (data.blogs_more) {
          if (data.blogs_more instanceof Array) {
            this.$store.state.blogs = this.$store.state.blogs.concat(data.blogs_more)
          }
        }
      }
      if (data.num_blogs) {
        this.$store.state.numBlogs = data.num_blogs
      }
      if (data.tags) {
        if (data.tags instanceof Array) {
          data.tags.unshift({
            name: 'All',
            num: this.$store.state.numBlogs
          })
          this.$store.state.tags = data.tags.filter(t => t.name.length < 32 && t.num > 5)
        }
      }
      if (data.footer) {
        this.footer = data.footer
      }
      let comp = this
      window.addEventListener('scroll', (e) => {
        comp.screenY = window.pageYOffset / window.innerHeight
        if (comp.screenY > comp.visitedY) {
          comp.visitedY = comp.screenY
          comp.$store.state.visitedEms = window.pageYOffset / 16;
        }
        comp.scrolledDown  = comp.screenY > 0.125;
        comp.pageDown = comp.screenY > 0.95;
        if (comp.screenY > 2) {
          comp.loadMoreBlogSummaries()
        }
      })
      if (comp.updating) {
        comp.$router.push(comp.$route.path + '#' + comp.lang)
        comp.$root.$forceUpdate()

        comp.updating = false
      }
    },
    loadMoreBlogSummaries () {
      let comp = this
      if (this.numBlogsLoaded < this.numBlogs) {
        if (!this.fetching) {
          this.fetching = true
          this.$parent.fetchData('blogs-more-summaries')
        }
      }
    },
    processSections (sections) {
      if (sections instanceof Array) {
        return sections.map(sc => {
          switch (sc.type) {
            case 'image_set':
              break;
            case 'section':
              sc.multiple = false
              switch (sc.text_layout) {
                case 'fade':
                  sc.multiple = true
                  break
                case 'blocks':
                  sc.multiple = true
                  break
                default:
                  if (sc.text instanceof Array) {
                    if (sc.text.length > 0) {
                      sc.text = sc.text[0];
                    }
                  }
                  break;
              }
              break;
          }
          return sc
        })
      }
      return []
    },
    updateStyles () {
      this.$ls.set('styles', JSON.stringify(this.$store.state.styles))
    },
    getStyles () {
      let stored = this.$ls.get('styles')
      if (typeof stored == 'string') {
        if (stored.indexOf('"font":') > 0) {
          this.$store.state.styles = JSON.parse(stored)

        }
      }
    },
    logoAction  () {

    },
    toggleMenu () {
      this.showMenu = !this.showMenu
    },
    hideMenu () {
      this.showMenu = false
    },
    toggleStyler (mode) {
      let newVal = !this.showStyler
      switch (mode) {
        case 'hide':
          newVal = false
          break
        case 'show':
          newVal = true
          break
      }
      this.showStyler = newVal
    }
  }
}
</script>
<style>

#app ol.dot-nav,
#app ol.arrow-nav {
  position: absolute;
}

#app ol.dot-nav {
  bottom: 12.5%;
  right: 2.5vw;
  z-index: 90;
}
#app ol.dot-nav li {
  cursor: pointer;
  font-size: 1.5em;
  opacity: 0.667;
  width: 1em;
  height: 1.25em;
  overflow: hidden;
  margin-left: 0.5em;
  transition: all .5s ease-in-out;
  display: inline-block;
  outline: none;
  user-select: none;
}
#app ol.dot-nav li:hover {
  opacity: 1;
}
#app ol.dot-nav li:before {
  font-family: icomoon;
  content: '\e601';
}
#app ol.dot-nav li.active {
  transform: scale(1.2);
}
#app ol.dot-nav li.active:before {
  content: '\e602';
}

#app .main .sections > section,
#app .main > div > section {
  position: relative;
  overflow: hidden;
}

.scrolled-up.show-intro .home-pane aside.site-intro {
  opacity: 1;
  pointer-events: all;
  z-index: 30;
}

#app .page-section ul.flex-slides li figure {
  max-height: 100vh;
  overflow: hidden;
}
#app .page-section ul.flex-slides > li img {
  max-width: 100%;
}
@media screen and (min-width: 48em) {
  #app .per-row-2 ul.flex-slides li figure,
  #app .per-row-2 ul.flex-slides > li {
    max-width: 50vw;
  }
  #app .per-row-2 .arrow-nav li {
    max-height: 40vw;
    height: 40vw;
  }
  #app .per-row-2 .dot-nav li.extra {
    display: none;
  }
}
#app .top-slides {
  position: relative;
  margin-top: 0;
}
@media screen and (orientation: portrait) {
  #app .top-slides ul.flex-slides li figure img,
  #app .top-slides ul.flex-slides,
  #app .top-slides {
    height: 50vh;
    max-height: 50vw;
  }
}
.back-to {
  position: absolute;
  top: 0.25em;
  right: 2.5%;
  font-size: 1.5em;
  opacity: 0;
  pointer-events: none;
  transform: scale(1.25,1);
}
.back-to:before {
  font-family: icomoon;
  content: "\e609";
}
.back-to span.text {
  position: absolute;
  left: -9999em;
}

footer .footer-menu {
  display: flex;
  flex-flow: wrap row;
  justify-content: center;
  align-items: center;
}
footer .footer-menu li {
  margin: 1em;
  padding: 0 1em;
}

@media screen and (min-width: 40em) {
  
  .home-pane aside.site-intro {
    left: 5%;
    right: 5%;
  }
}

@media screen and (min-width: 50em) {
  
  .home-pane aside.site-intro {
    left: 7.5%;
    right: 7.5%;
  }
}

@media screen and (min-width: 60em) {
  
  .back-to {
    font-size: 1.667em;
  }
  .home-pane aside.site-intro {
    left: 10%;
    right: 10%;
  }
}

@media screen and (min-width: 70em) {
  
  .home-pane aside.site-intro {
    left: 15%;
    right: 15%;
  }
}

@media screen and (min-width: 80em) {
  
  .home-pane aside.site-intro {
    left: 20%;
    right: 20%;
  }
}

</style>
