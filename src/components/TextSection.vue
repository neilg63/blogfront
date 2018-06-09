<template>
	<section class="text-section" :class="sectionClasses" v-on:mouseleave="hideIntro">
  	<h3 v-if="hasTitle"></h3>
    <template v-if="hasSingle" v-html="text">
    </template>
    <template v-if="hasSlides">
      <div class="slides">
        <article v-for="(slide,index) in slides" :key="index" v-html="slide" :class="{'active': index == currIndex}">
        </article>
        <aside v-if="hasIntro" class="site-intro">
          <div class="inner" v-html="intro"></div>
        </aside>
        <div class="bg top-left"></div>
        <div class="bg top-right" v-on:click.stop="toggleIntro"></div>
        <div class="bg bottom-left"></div>
        <div class="bg bottom-right"></div>
      </div>
    </template>
  </section>
</template>
<script>
export default {
	name: 'TextSection',
  props: {
    section: {
      type: Object,
      required: true,
      default: null
    },
    intro: {
      type: String,
      required: false
    }
  },
  data () {
    return {
      id: 0,
      title: '',
      text: '',
      slides: [],
      currIndex: 0,
      numSlides: 0,
      layout: 'single',
      multiple: false,
      hasSingle: false,
      hasSlides: false,
      hasIntro: false
    }
  },
  created () {
    this.assign(this.section)
    switch (this.layout) {
      case 'fade':
        this.cycle()
        this.hasTitle = false
        break
    }
    let comp = this
    this.$bus.$on('siteinfo', data => {
      if (data.home.sections && comp.id > 0) {
        let matched = data.home.sections.find(s => s.id == comp.id)
        if (matched) {
          comp.assign(matched)
        }
      }
    })
  },
  methods: {
    cycle () {
      setInterval(() => {
        let nx = this.currIndex + 1
        if (nx >= this.numSlides) {
          nx = 0
        }
        this.currIndex = nx
      }, 5000)
    },
    assign (section) {
      if (section.id) {
        this.id = parseInt(section.id)
      }
      if (typeof section.title == 'string') {
        this.title = section.title.trim()
        this.hasTitle = this.title.length > 1
      }
      if (typeof section.text == 'string') {
        this.text = section.text.trim()
        this.hasSingle = this.text.length > 1
      }
      if (section.text instanceof Array) {
        this.slides = section.text
        this.numSlides = this.slides.length
        this.hasSlides = this.numSlides > 0
      }
      this.sectionClasses = []
      if (section.text_layout) {
        this.layout = section.text_layout
      }
      if (this.layout) {
        this.sectionClasses.push(this.layout.replace(/_/g, '-'))
      }
      if (this.hasSlides) {
        this.sectionClasses.push('flex-row')
        this.sectionClasses.push('num-' + this.slides.length)
      }
      if (typeof this.intro == 'string') {
        this.hasIntro = this.intro.length > 5
      }
      if (this.hasIntro) {
        this.sectionClasses.push('has-intro')
      }
    },
    showIntro (e) {
      this.toggleIntro(e, 'show')
    },
    hideIntro (e) {
      this.toggleIntro(e, 'hide')
    },
    toggleIntro (e, mode) {
      let index = this.sectionClasses.indexOf('show-intro')
      if (index >= 0 && mode != 'show') {
        this.sectionClasses.splice(index, 1)
      }
      if (index < 0 && mode != 'hide') {
        this.sectionClasses.push('show-intro')
      }
    }
  }
}
</script>
<style>

.text-section.fade,
.text-section.fade .slides,
.text-section.blocks,
.home-pane .text-section {
  min-height: 20em;
  position: relative;
}

.text-section.fade .slides > article {
  height: 15em;
  padding: 2.5em 5%;
}

@media screen and (min-height: 40em) {
  .text-section.fade,
  .text-section.fade .slides,
  .text-section.blocks,
  .home-pane .text-section,
  .text-section {
    min-height: 50vh;
    position: relative;
  }
  .text-section.fade .slides > article {  
    padding: 5vh 5%;
    height: 40vh;
  }
}

.text-section.fade .slides > article,
.text-section.blocks .slides {
  display: flex;
  justify-content: center;
  align-items: center;
}

.text-section.blocks .slides {
  flex-flow: nowrap row;
}

.text-section.fade .slides > article {
  flex-flow: nowrap column;
  font-size: 1.2em;
  width: 90%;
}

.text-section .slides {
  position: relative;
  height: 100%;
}

.text-section article h3 {
  -webkit-margin-before: 0;
}

#app .fade .slides >.bg,
.fade > .slides > article {
  position: absolute;
}

.fade > .slides > article {
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  opacity: 0;
  z-index: -1;
  transition: opacity .5s ease-in-out;
}

.fade .slides > article.active {
  opacity: 1;
  z-index: 2;
}

.fade .slides >.bg {
  height: 4vmin;
  width: 4vmin;
  z-index: 3;
  transition: all .5s ease-in-out;
}

.fade .slides:hover >.bg {
  height: 9vmin;
  width: 8vmin;
}

.fade .slides >.bg.top-left {
  top: 3vmin;
  left: 3vmin;
  border-top: dashed 1px rgba(0,0,0,0.5);
  border-left: dashed 1px rgba(0,0,0,0.5);
}

.fade .slides >.bg.top-right {
  top: 3vmin;
  right: 3vmin;
  border-top: dashed 1px rgba(0,0,0,0.5);
  border-right: dashed 1px rgba(0,0,0,0.5);
}

#app .has-intro .slides > .bg.top-right {
  border-top: none;
  border-right: none;
  cursor: pointer;
}

#app .has-intro .slides >.bg.top-right:before {
  position: absolute;
  top: 0;
  right: 0;
  font-family: icomoon;
  content: "\e912";
  font-size: 2em;
}

.fade .slides >.bg.bottom-left {
  bottom: 3vmin;
  left: 3vmin;
  border-bottom: dashed 1px rgba(0,0,0,0.5);
  border-left: dashed 1px rgba(0,0,0,0.5);
}

.fade .slides >.bg.bottom-right {
  bottom: 3vmin;
  right: 3vmin;
  border-bottom: dashed 1px rgba(0,0,0,0.5);
  border-right: dashed 1px rgba(0,0,0,0.5);
}

.home-pane aside.site-intro {
  position: absolute;
  top: 10%;
  height: 80%;
  left: -90%;
  width: 80%;
  z-index: -1;
  text-align: left;
  pointer-events: none;
  transition: left 0.75s ease-in-out;
  background-color: rgb(228,228,228);
  display: flex;
  flex-flow: column;
  justify-content: center;
}

.home-pane section.text-section.show-intro aside.site-intro {
  left: 10%;
  z-index: 20;
}

@media screen and (min-width: 40em) {
  .text-section.fade .slides > article {
    font-size: 1.33em;
  }
}
@media screen and (min-width: 60em) {
  .text-section.fade .slides > article {
    font-size: 1.5em;
  }
}

@media screen and (min-width: 80em) {
  .text-section.fade .slides > article {
    font-size: 1.667em;
  }
}

</style>