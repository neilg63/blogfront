 <template>
 <section class="image-set" :class="sectionClasses">
  <div :class="contClasses">
    <figure v-for="(image,index) in images" class="image" :class="image.figClasses" v-on:click.prevent.stop="handleSelect(image,index)">
      <vue-picture :imgset="image" :group="image.groupName" :className="image.classNames.join(' ')"></vue-picture>
      <figcaption v-if="image.hasLink">
        <template v-if="image.hasPriceInfo">
          <p class="product-name">{{image.link.title}}</p>
        <p class="product-price">{{image.priceInfo.price|currency}}</p>
        </template>
        <template v-else>
          {{image.link.title}}
        </template>
      </figcaption>
    </figure>
  </div>
  <template v-if="showNav">
    <div class="slide-nav left-nav" v-on:click.stop="prev()"></div>
    <div class="slide-nav right-nav" v-on:click.stop="next()"></div>
  </template>
</section>
</template>
<script>
import VuePicture from './VuePicture'
import filters from '../mixins/filters'
export default {
  name: 'ImageSet',
  components: {
    VuePicture
  },
  mixins: [filters],
  props: {
    section: {
      type: Object,
      required: true,
      default: null
    }
  },
  data () {
    return {
      images: [],
      numImages: 0,
      contClasses: [],
      sectionClasses: [],
      showNav: false,
      currIndex: 0,
      cycleIv: null
    }
  },
  created () {
    this.assignSection()
    let comp = this
    this.$bus.$on('set-image-index', (index) => {
      comp.handleAspect()
      comp.setIndex(index)
    })
  },
  watch: {
    section (newVal) {
      this.assignSection()
    }
  },
  methods: {
    assignSection () {
      if (this.section.images) {
        if (this.section.images instanceof Array) {
          let lastIndex = this.section.images.length - 1
          this.images = this.section.images.map((img,index) => {
            let oddClass = index % 2 === 0 ? 'odd' : 'even'
            img.classNames = ['num-' + index, oddClass]
            img.groupName = 'half'
            img.figClasses = ['fig-' + index]
            if (index === 0) {
              img.figClasses.push('first')
              img.figClasses.push('active')
            }
            if (index === 1) {
              img.figClasses.push('next')
            }
            if (index === lastIndex) {
              img.figClasses.push('last')
              img.figClasses.push('prev')
            }
            img.hasLink = false
            img.hasPriceInfo = false
            if (img.link) {
              if (img.link.url) {
                img.hasLink = true
                img.figClasses.push('has-link')
              }
            }
            if (img.priceInfo) {
              if (img.priceInfo.price_formatted) {
                img.hasPriceInfo = true
                img.figClasses.push('has-price')
              }
            }
            return img
          })
          this.numImages = this.images.length
          switch (this.section.layout) {
            case 'column':
              break
            case 'aspect':
              this.cycleActive()
              break
            case 'slides-2':
              this.contClasses.push('offset-0')
              this.showNav = true
              break
            default:
              this.contClasses.push('flex-row')
              this.contClasses.push('multi-row')
              break
          }
          this.contClasses.push(this.section.layout.replace(/_/g, '-'))
          this.contClasses.push('num-images-' + this.numImages)
        }
      }
    },
    handleSelect (image, index) {
      switch (this.section.layout) {
        case 'aspect':
          this.handleAspect()
          break
      }
      if (image.hasLink) {
        this.$router.push(image.link.url)
      }
    },
    handleAspect () {
      if (!this.$parent.cycleStopped) {
        clearInterval(this.cycleIv)
        this.$parent.cycleStopped = true
        this.cycleIv = null
      } else {
        this.next()
      }
    },
    next () {
      this.nextPrev()
    },
    prev () {
      this.nextPrev('prev')
    },
    nextPrev (mode) {
      let ni = this.calcNext(mode)
      this.setIndex(ni)
    },
    calcNext (mode) {
      let ni = this.currIndex
      if (mode === 'prev') {
        ni--
      } else {
        ni++
      }
      if (ni < 0) {
        ni = this.numImages - 1
      } else if (ni >= this.numImages) {
        ni = 0
      }
      return ni
    },
    setIndex (ni) {
      this.contClasses = this.contClasses.filter(c => !/offset-/.test(c))
      this.contClasses.push('offset-' + ni)
      this.currIndex = ni
      let nxI = ni + 1
      let pvI = ni - 1
      if (pvI < 0) {
        pvI = this.numImages - 1
      }
      if (nxI >= this.numImages) {
        nxI = 0
      }
      this.$parent.selectedImgIndex = ni
      this.images = this.images.map((img,index) => {
        let ai = img.figClasses.indexOf('active')
        if (index === ni) {
          if (ai < 0) {
            img.figClasses.push('active')
          }
        } else if (ai >= 0) {
          img.figClasses.splice(ai, 1)
        }
        let prevI = img.figClasses.indexOf('prev')
        let nextI = img.figClasses.indexOf('next')
        if (index === pvI) {
          if (prevI < 0) {
            img.figClasses.push('prev')
          }
        } else if (prevI >= 0) {
          img.figClasses.splice(prevI, 1)
        }
        if (index === nxI) {
          if (nextI < 0) {
            img.figClasses.push('next')
          }
        } else if (nextI >= 0) {
          img.figClasses.splice(nextI, 1)
        }
        return img
      })
    },
    cycleActive () {
      let comp = this
      if (this.cycleIv) {
        clearInterval(this.cycleIv)
      }
      this.cycleIv = setInterval(() => {
        if (!comp.$parent.cycleStopped) {
          comp.next()
        }
      }, 5000)
    }
  }
}
</script>
<style>
#app .image-set .flex-row {
  display:  flex;
  flex-flow: wrap row;
  justify-content: center;
  align-items: center;
}

#app section.image-set .slide-nav {
  position: absolute;
  top: 0;
  width:  33.333vw;
  bottom: 0;
  z-index:  20;
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.75s ease-in-out;
  cursor: pointer;
}
#app section.image-set .slide-nav:before {
  position: absolute;
  top: 25%;
  font-size: 5vw;
}
#app section.image-set .slide-nav:hover {
  opacity: 0.5;
}
#app section.image-set .slide-nav:before {
  font-family: icomoon;
}
#app section.image-set .left-nav {
  left:  0;
}
#app section.image-set .left-nav:before {
  left: 5%;
  content: "\e904";
}
#app section.image-set .right-nav {
  left: 65vw;
}
#app section.image-set .right-nav:before {
  right: 5%;
  content: "\e90a";
}
#app .image-set {
  max-width:  100%;
  background-color: white;
}
#app section.image-set .slides-2 {
  position: relative;
  overflow: visible;
}
#app section.image-set .slides-2.num-images-2 {
  width: 300%;
}
#app section.image-set .slides-2.num-images-3 {
  width: 400%;
}
#app section.image-set .slides-2.num-images-4 {
  width: 500%;
}
#app section.image-set .slides-2.num-images-5 {
  width: 600%;
}
#app section.image-set .slides-2.num-images-6 {
  width: 700%;
}
#app section.image-set .slides-2.num-images-7 {
  width: 800%;
}
#app section.image-set .slides-2.num-images-8 {
  width: 900%;
}
#app section.image-set .slides-2.num-images-9 {
  width: 1000%;
}
#app section.image-set .slides-2,
#app section.image-set .slides-2 figure {
  height: 25vw;
}
#app section.image-set .slides-2 {
  white-space: nowrap;
  transition: left .5s ease-in-out;
}
#app section.image-set .slides-2 figure {
  position: relative;
  display: flex;
  float: left;
  flex-flow: nowrap row;
  justify-content: center;
  align-items: center;
  width: 100vw;
  max-width: 100vw;
}
#app section.image-set .slides-2 figure img {
  max-width: 50vw;
  max-height: 25vw;
  width: auto;
  height: auto;
}
#app section.image-set .slides-2 figure.prev img,
#app section.image-set .slides-2 figure.next img {
  transition: transform .5s ease-in-out;
}
#app section.image-set .slides-2 figure.prev img {
  transform: scale(-.25,.25) translate(-225vw,20vw);
}
#app section.image-set .slides-2 figure.next img {
  transform: scale(-.25,.25) translate(255vw,20vw);
}
#app section.image-set .slides-2.num-images-6 figure.prev.last img {
  transform: scale(-.25,.25) translate(2160vw,20vw);
}
#app section.image-set .slides-2.num-images-6 figure.next.first img {
  transform: scale(-.25,.25) translate(-2160vw,20vw);
}
#app section.image-set .slides-2 figure.active img {
  transform: scale(1,1);
}
#app section.image-set .slides-2 figure.active:hover {
  transform: scale(1.5);
}
#app section.image-set figure {
  position: relative;
}
#app section.image-set figure.has-link {
  cursor: pointer;
}
#app section.image-set figure figcaption {
  position: absolute;
  z-index: 8;
  bottom: 4rem;
  left: 10%;
  right: 10%;
  display: flex;
  flex-flow: wrap column;
  justify-content: center;
  align-items: center;
  color: white;
}
#app section.image-set figure.has-price figcaption {
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  flex-flow: nowrap row;
}
#app section.image-set figure.has-price figcaption p {
  padding: 0;
  margin: 0 1em 0 0;
  display: inline-block;
}
#app section.image-set figure.has-price figcaption {
  color: black;
}
#app section.image-set .column figure figcaption {
  font-size: 2em;
}
#app section.image-set .row-2 figure figcaption {
  font-size: 1.5em;
}
#app section.image-set .row-3 figure figcaption,
#app section.image-set .row-4 figure figcaption {
  font-size: 1em;
}
#app section.image-set figure.has-price img {
  transform: scale(1, 1);
  transition: transform .5s ease-in-out;
}
#app section.image-set figure.has-price:hover img {
  transform: scale(-1, 1);
}
#app section.image-set figure.has-price {
  font-size: 75%;
}
#app section.image-set .slides-2 figure picture,
#app section.image-set .slides-2 figure {
  transition: transform 1s ease-in-out;
}
#app section.image-set figure figcaption {
  transition: transform .5s ease-in-out;
}
#app section.image-set figure:hover figcaption {
    transform: scale(1.25);
}
@media screen and (min-width: 40em) {
  #app section.image-set figure  {
    font-size: 125%;
  }
}
@media screen and (min-width: 60em) {
  #app section.image-set figure  {
    font-size: 133%;
  }
}
@media screen and (min-width: 80em) {
  #app section.image-set figure  {
    font-size: 150%;
  }
}
#app section.image-set .slides-2.offset-1 {
  left:  -100vw;
}
#app section.image-set .slides-2.offset-2 {
  left:  -200vw;
}
#app section.image-set .slides-2.offset-3 {
  left:  -300vw;
}
#app section.image-set .slides-2.offset-4 {
  left:  -400vw;
}
#app section.image-set .slides-2.offset-5 {
  left:  -500vw;
}
#app section.image-set .slides-2.offset-6 {
  left:  -600vw;
}
#app section.image-set .slides-2.offset-7 {
  left:  -700vw;
}
#app section.image-set .slides-2.offset-8 {
  left:  -800vw;
}
#app section.image-set .slides-2.offset-9 {
  left:  -900vw;
}
#app .image-set figure {
  max-width:  100%;
  width: 100%;
}
#app .image-set figure img {
  width:  100%;
  height:  auto;
}
@keyframes twinslides {
  0% {
    left: 0;
  }
  20% {
    left: -100vw;
  }
  35% {
    left: -200vw;
  }
  45% {
    left: -200vw;
  }
  60% {
    left: -100vw;
  }
  80% {
    left: 0;
  }
  100% {
    left: 0;
  }
}
#app .image-set .row-6,
#app .image-set .row-5 {
  overflow: hidden;
}
#app .image-set .row-6 figure {
  width:  50%;
  max-width: 50vw;
}
#app .image-set .row-6 figure img,
#app .image-set .row-5 figure img {
  position: relative;
  transition: transform 0.75s ease-in-out;
  transform: scale(1);
  z-index: 3;
  padding: 1.5vw 3vw;
  cursor: pointer;
}
#app .image-set .row-6 figure:hover img,
#app .image-set .row-5 figure:hover img {
  transform: scale(1.5);
  z-index: 20;
}
#app .image-set .aspect figure {
  opacity: 0;
  transform: scale(-1, 1);
  transition: all .5s ease-in-out;
  pointer-events: none;
  z-index: -1;
}
#app .image-set .aspect figure.active {
  opacity: 1;
  transform: scale(1, 1);
  pointer-events: all;
  z-index: 2;
  cursor: pointer;
}
#app .image-set .multi-row figure {
  margin-bottom: -0.5em;
}

.sections > section.image-set > .multi-row.row-3,
.sections > section.image-set > .multi-row.row-4 {
  padding-bottom: 0.5em;
}

#app .image-set .multi-row figure,
#app .image-set .multi-row figure picture {
  max-height: 100vh;
  overflow: hidden;
}
#app .image-set .multi-row figure picture {
  position: relative;
  display: flex;
  flex-flow: nowrap column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}
#app .home-pane .image-set .multi-row figure picture {
  justify-content: flex-start;
}
#app .image-set .multi-row figure img {
}
/*#app .image-set .multi-row figure picture {
  position: relative;
  display: flex;
  flex-flow: nowrap row;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
#app .image-set .multi-row figure img {
  width: auto;
  height: auto;
  min-height: 100%;
  min-width: 100%;
}*/
@media screen and (min-width: 30em) {
  #app .image-set .row-2 figure {
    width:  50%;
    max-width: 50vw;
  }
}
@media screen and (orientation: landscape) {
  #app .image-set .row-2 figure {
    width:  50%;
    max-width: 50vw;
  }
}
@media screen and (min-width: 40em) {
  #app .image-set .row-5 figure,
  #app .image-set .row-4 figure {
    width:  50%;
    max-width: 50vw;
  }
  #app .image-set .row-3 figure{
    width:  33.333%;
  }
}
@media screen and (min-width: 60em) {
  #app .image-set .row-5 figure,
  #app .image-set .row-6 figure {
    width:  33.333%;
  }
}
@media screen and (min-width: 80em) {
  #app .image-set .row-6 figure {
    width:  16.66666%;
  }
  #app .image-set .row-5 figure {
    width:  20%;
  }
  #app .image-set .row-4 figure {
    width:  25%;
  }
  #app .image-set .row-6 figure:hover img,
  #app .image-set .row-5 figure:hover img {
    transform: scale(2);
  }
}
</style>
