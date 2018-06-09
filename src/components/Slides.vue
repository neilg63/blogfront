<template>
  <section class="slides-container top-slides" :class="sectionClasses">
    <ul v-if="numImages > 0" class="flex-slides" :class="itemClass">
      <li v-for="(image,i) in images" :key="i" :class="image.imgClasses" v-on:click.stop="selectLink()" v-on:mouseenter="addHover(true)" v-on:mouseleave="addHover(false)">
        <figure :class="image.alignment" :style="image.styles">
          <vue-picture :imgset="image" group="wide" className="wide"></vue-picture>
        </figure>
      </li>
    </ul>
    <img src="/static/images/rings.svg" class="enter-main" />
    <ol v-if="numImages > 0" class="dot-nav">
      <li v-for="(item, i) in navItems" v-on:click="showIndex(i)" :key="i" :class="{'active': i == index}"></li>
    </ol>
    <ol class="arrow-nav" v-touch:swipe="slideSwipe">
      <li class="prev icon-chevron-thin-left" v-on:click="showPrev()"></li>
      <li class="next icon-chevron-thin-right" v-on:click="showNext()"></li>
    </ol>
  </section>
</template>

<script>

import _ from 'lodash'
import VuePicture from './VuePicture'

export default {
  name: 'Slides',
  components: {
    VuePicture
  },
  data () {
    return {
      images: [],
      numImages: 0,
      navItems: [],
      index: 0,
      crossover: false,
      loaded: false,
      sectionClasses: ['loading'],
      defaultLink: '/sunglasses',
      interval: null
    }
  },
  computed: {
    itemClass () {
      return 'item-' + (this.index + 1)
    }
  },
  watch: {
    loaded (newVal) {
      if (newVal) {
        let ci = this.sectionClasses.indexOf('loading')
        if (ci >= 0) {
          this.sectionClasses.splice(ci, 1)
        }
      }
    }
  },
  created () {
    let comp = this
    if (comp.$parent.$parent.homeLoaded) {
      comp.readData(comp.$store.state.topImages)
    }
    this.$bus.$on('siteinfo', (status) => {
      comp.readData(comp.$store.state.topImages)
    })
    window.addEventListener('keyup', (e) => {
      switch (e.keyCode) {
        case 39:
          comp.showNext()
          break;
        case 37:
          comp.showPrev()
          break;
      }
    })
    setTimeout(() => {
      comp.interval = setInterval(() => {
        comp.showNext(true, true)
      }, 10000)
    }, 7500);
  },
  methods: {
    readData (images) {
      if (images instanceof Array) {
        this.numImages = images.length
        let imgs = _.clone(images)
        let lastIndex = this.numImages - 1
        imgs.push(_.clone(images[0]))
        imgs.unshift(_.clone(images[lastIndex]))
        this.images = imgs.map((img, index) => {
          img.imgClasses = ['index-' + (index-1)]
          if (index === 0) {
            img.imgClasses.push('first')
          } else if (index === (this.numImages + 1)) {
            img.imgClasses.push('last')
          }
          return img
        })
        this.navItems = _.clone(images)
        this.loaded = true
      }
    },
    showNext (forward, automatic) {
      let offset = forward === false ? -1 : 1
      let nx = this.index + offset
      if (nx < -1) {
        nx = this.numImages
      } else if (nx > this.numImages) {
        nx = -1
      }
      if (automatic !== true) {
        clearInterval(this.interval)
        this.interval = null
      }
      this.showIndex(nx)
    },
    showPrev () {
      this.showNext(false)
    },
    showIndex (index) {
      if (index >= -1 && index <= this.numImages) {
        this.index = index
        if (this.index < 0 || this.index >= this.numImages) {
          this.switchNextPrevMode()
        }
      }
    },
    switchNextPrevMode () {
      this.crossover = true
      let comp = this
      setTimeout(() => {
        setTimeout(() => {
          comp.sectionClasses.push('stable')
          if (comp.index < 0) {
            comp.index = comp.numImages - 1
          } else if (comp.index >= comp.numImages) {
            comp.index = 0
          }
        }, 50)
        setTimeout(() => {
          comp.crossover = false
          comp.sectionClasses = []
        }, 100)
      }, 900)
    },
    selectLink() {
      this.$router.push(this.defaultLink)
    },
    addHover(add) {
      let hi = this.sectionClasses.indexOf('hover')
      if (add !== true && hi >= 0) {
        this.sectionClasses.splice(hi,1)
      } else {
        if (hi < 0) {
          this.sectionClasses.push('hover')
        }
      }
    },
    slideSwipe (direction) {
      switch (direction) {
        case 'left':
          this.showNext()
          break
        case 'right':
          this.showPrev()
          break
      }
    }
  }
}
</script>
<style>
 
#app .slides-container {
  position: relative;
  width: 100vw;
  overflow: hidden;
}

#app ul.flex-slides {
  position: relative;
  display: flex;
  margin: 0;
  padding: 0;
  flex-flow: nowrap row;
  width: 30000vw;
  top: 0;
  left: 0;
  transition: left 1s ease-in-out;
}

,
#app ul.flex-slides li picture {
  width: 100%;
}

#app .stable ul.flex-slides {
  transition: none;
}

#app .slides-container li {
  position: relative;
}

#app .top-slides ul.flex-slides {
  display: flex;
  margin-top: 5vh;
}
#app .top-slides ul.flex-slides,
#app .top-slides {
  overflow: hidden;
}

#app .top-slides ul.flex-slides figure,
#app .top-slides ul.flex-slides li,
#app .top-slides ul.flex-slides,
#app .top-slides {
  height: 50vw;
  max-height: 50vh;
}

@keyframes panInOut {
  0% {
    transform: scale(1,1) translate(0,0);
    filter:  hue-rotate(30deg);
  }
  16% {
    transform: scale(1.125,1.125) translate(5%,5%);
    filter:  hue-rotate(0deg);
  }
  33% {
    transform: scale(1.125,1.125) translate(5%,5%);
  }
  50% {
    filter: hue-rotate(0deg);
  }
  66% {
    transform: scale(1.2,1.2) translate(-5%,-5%);
    filter:  hue-rotate(-30deg);
  }
  83% {
    transform: scale(1.05,1.05) translate(-1%,-1%);
    filter:  hue-rotate(0deg);
  }
  100% {
    transform: scale(1,1) translate(0,0);
    filter:  hue-rotate(30deg);
  }
}


#app .top-slides ul.flex-slides li figure img {
  width: 100%;
  height:  auto;
  animation: panInOut 10s infinite;
}

#app .top-slides ul.flex-slides li figure,
#app .top-slides ul.flex-slides li figure picture {
  position: relative;
  height: 100%;
  width:  100%;
}

#app .top-slides ul.flex-slides li figure {
  display: block;
}

#app .top-slides ul.flex-slides li figure picture {
  display: flex;
  flex-flow: nowrap row;
  overflow:  hidden;
  justify-content: center;
  align-items: center;
}

#app .top-slides ul.flex-slides li figure.left {
  justify-content: flex-start;
}

#app ul.flex-slides.item--1 {
  left: 100vw;
}

#app ul.flex-slides.item-0 {
  left: 0;
}

#app ul.flex-slides.item-1 {
  left: -100vw;
}
#app ul.flex-slides.item-2 {
  left: -200vw;
}
#app ul.flex-slides.item-3 {
  left: -300vw;
}
#app ul.flex-slides.item-4 {
  left: -400vw;
}
#app ul.flex-slides.item-5 {
  left: -500vw;
}
#app ul.flex-slides.item-6 {
  left: -600vw;
}
#app ul.flex-slides.item-7 {
  left: -700vw;
}
#app ul.flex-slides.item-8 {
  left: -800vw;
}
#app ul.flex-slides.item-9 {
  left: -900vw;
}
#app ul.flex-slides.item-10 {
  left: -1000vw;
}
#app ul.flex-slides.item-11 {
  left: -1100vw;
}
#app ul.flex-slides.item-12 {
  left: -1200vw;
}

#app ul.flex-slides > li {
  margin: 0;
  padding: 0 0 1em 0;
  width: 100vw;
}
#app ul.flex-slides li figure {
  width: 100%;
}

#app .enter-main {
  position: absolute;
  top: 25vh;
  left: 50vw;
  height: 9vw;
  width: 9vw;
  margin-left: -4.5vw;
  margin-top: -4.5vw;
  opacity: 0;
  transition: opacity 1s ease-in-out;
  pointer-events: none;
}

@media screen and (max-width: 60em) and (orientation: portrait) {
  #app .enter-main {
    top: 50vw;
  }
}

@media screen and (max-width: 25em) {
  #app ol.dot-nav li {
    display: none;
  }
}

#app .top-slides li {
  cursor: pointer;
}

#app .top-slides.hover .enter-main {
  opacity: 0.75;
}

#app ol.arrow-nav {
  top: 0;
  left: 0;
  right: 0;
  margin: 0;
  padding: 0;
  height: 100%;
}

.touch-disabled #app ol.arrow-nav {
  pointer-events: none;
}

@media screen and (max-width: 50em) {
  .touch-enabled #app ol.arrow-nav li {
    pointer-events: none;
  }
}

#app .top-slides ol.arrow-nav {
  height: 50vh;
  max-height: 50vw;
}

#app .top-slides li:before {
  color:  yellow;
}

#app ol.arrow-nav > li {
  pointer-events: all;
  width: 33.333vw;
  height: 50vh;
  max-height: 50vw;
  position: absolute;
  margin: 0;
  padding: 0;
  list-style: none;
  opacity: 0;
  transition: all 0.5s ease-in-out;
  cursor: pointer;
  overflow: hidden;
  font-size: 8vw;
  transform: scale(0.9);
  outline: none;
  user-select: none;
}
#app ol.arrow-nav li:before {
  position: absolute;
  top: 40%;
  width: 1.5em;
}
#app ol.arrow-nav li:hover {
  opacity: 0.75;
  transform: scale(1);
}
#app ol.arrow-nav li.next:before,
#app ol.arrow-nav li.next {
  right: 0;
}
#app ol.arrow-nav li.prev:before,
#app ol.arrow-nav li.prev {
  left: 0;
}

#app .top-slides ul.flex-slides li figure.right {
  justify-content: flex-end;
}

</style>
