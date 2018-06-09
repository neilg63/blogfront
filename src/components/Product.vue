<template>
  <div class="product-overlay">
    <div class="close icon-close" v-on:click="close()"></div>
    <h2><span class="catalog-title breadcrumb link-back" v-on:click="close()">{{product.catalog_title}}</span> <span class="breadcrumb last">{{product.title}}</span></h2>
    <div class="image-selector" v-touch:swipe="slideSwipe">
      <template v-for="(iset, index) in imageSets">
        <div class="set-container" :class="{'active':iset.active}" :key="index">
          <image-set :key="index" :section="iset"></image-set>
        </div>
      </template>
    </div>
    <div class="variant-selector" v-if="variants.length > 0">
      <ul class="plain">
        <template v-for="(variant, index) in product.variants">
          <li class="variant" :class="{'active':variant.active,'added':variant.added}" v-on:click="setActive(variant)" :data-index="variant.imgIndex" :key="index"><span class="text">{{variant.title}}</span></li>
        </template>
      </ul>
      <ol class="aspect-nav plain">
        <template v-for="num in numImagesInSet">
          <li :class="['num-'+num,{'active': (num-1) == selectedImgIndex}]" :key="num" v-on:click="setAspect(num-1)" :title="num"></li>
        </template>
      </ol>
      <div class="buy-now" :class="buyNowClasses" v-if="selectedVariant">
        <div class="icon icon-check"></div>
        <button class="price" v-on:click="addProduct()">{{selectedVariant.price|currency}}</button>
        <div class="icon cart-icon" :class="cartIconClass" v-on:click="manageProduct()">
          <span v-if="selectedVariant.varAdded" class="icon-plus"></span>
          <span v-if="selectedVariant.added" class="icon-minus"></span>
        </div>
        <div class="hint">
          {{buyHint}}
        </div>
      </div>
      <h3 class="selected-variant">{{selectedVariant.title}}</h3>
      <div class="catalog-body" v-html="product.intro"></div>
    </div>
    <div class="body">
      <div class="product-body" v-html="product.body"></div>
    </div>
  </div>
</template>
<script>
import ImageSet from './ImageSet'
import VuePicture from './VuePicture'
import filters from '../mixins/filters'

export default {
  name: 'Product',
  components: {
    VuePicture,
    ImageSet
  },
  mixins: [filters],
  props: {
    product: {
      type: Object,
      required: true,
      default: null
    },
    productIndex: {
      type: Number,
      required: true,
      default: 0
    },
    options: {
      type: Object,
      required: true,
      default: null
    }
  },
  data () {
    return {
      imageSets: [],
      variants: [],
      selectedVariant: null,
      cycleStopped: false,
      selecting: false,
      numImagesInSet: 3,
      selectedImgIndex: 0,
      showAltHint: false,
      buyHint: '',
      cartIconClass: 'icon-add-cart'
    }
  },
  created () {
    this.assignImageSets()
    if (this.productIndex > 0 && this.productIndex < this.variants.length) {
      this.setActive(this.variants[this.productIndex])
      this.adaptBuyWidget()
    }
  },
  watch: {
    product (newVal) {
      this.assignImageSets()
    },
    selectedVariant (newVal) {
      this.adaptBuyWidget();
    }
  },
  computed: {
    buyNowClasses () {
      let cls = []
      if (this.selectedVariant.added) {
        cls.push('added')
      }
      if (this.selectedVariant.varAdded) {
        cls.push('variant-added')
      }
      if (this.selecting) {
        cls.push('selecting')
      }
      return cls
    }
  },
  methods: {
    assignImageSets () {
      let comp = this
      this.$parent.updateAdded(this.product)
      this.imageSets = []
      this.variants = this.product.variants.map((v, vi) => {
        v.imgIndex = -1
        v.active = vi === 0
        if (v.active) {
          comp.selectedVariant = v
        }
        if (/^[A-Z]+\s*-\s*\w+/.test(v.title)) {
          v.title = v.title.replace(/^\w+\s*-/, '')
        }
        return v
      })
      if (this.product.sections) {
        if (this.product.sections instanceof Array && this.product.sections.length > 0) {
          for (let i = 0, c = 0, sec; i < this.product.sections.length; i++) {
            sec = this.product.sections[i]
            if (sec.type == 'image_set') {
              if (sec.images) {
                if (sec.images instanceof Array) {
                  sec.layout = 'aspect'
                  if (sec.images.length > 0) {
                    sec.active = c === 0
                    if (i === 0) {
                      this.numImagesInSet = sec.images.length
                    }
                    this.imageSets.push(sec)
                    if (sec.ecwid) {
                      let vi = this.variants.findIndex(v => v.id === sec.ecwid)
                      if (vi >= 0) {
                        this.variants[vi].title = sec.title
                        this.variants[vi].imgIndex = i
                      }
                    }
                    c++
                  }
                }
              }
            }
          }
        }
        //this.$parent.setHeight()
        setTimeout(() => {
          comp.$parent.updateAdded(comp.product)
        }, 2000)
      }
    },
    setActive (variant) {
      this.variants = this.variants.map(v => {
        v.active = false
        return v
      })
      variant.active = true
      this.selectedVariant = variant
      if (variant.imgIndex >= 0) {
        this.imageSets = this.imageSets.map((ims, index) => {
          ims.active = variant.imgIndex === index
          this.numImagesInSet = ims.images.length
          return ims
        })
      }
    },
    close () {
      this.$parent.toggleActiveProduct(false)
    },
    addProduct () {
      if (this.selectedVariant.id && !this.selectedVariant.added) {
        this.selecting = true
        let selVar = this.variants.find(v => v.added)
        let ts = 0
        if (selVar) {
          this.$bus.$emit('remove-ecwid-product', selVar, false)
            ts = 500
        }
        let comp = this
        setTimeout(() => {
          comp.$bus.$emit('add-ecwid-product', comp.selectedVariant)
        }, ts)
        setTimeout(() => {
          comp.$parent.updateAdded(comp.product)
          comp.selecting = false
          comp.selectedVariant.added = true
          comp.adaptBuyWidget()
        }, ts + 1500)
      }
    },
    manageProduct () {
      if (this.selectedVariant.id) {
        this.selecting = true
        let newStatus = false
        if (this.selectedVariant.added) {
           this.$bus.$emit('remove-ecwid-product', this.selectedVariant, true)
           newStatus = false
        } else {
          this.$bus.$emit('add-ecwid-product', this.selectedVariant)
          newStatus = true
        }
        let comp = this
        setTimeout(() => {
          comp.$parent.updateAdded(comp.product)
          comp.selecting = false
          comp.selectedVariant.added = newStatus
          comp.adaptBuyWidget()
        }, 1500)
      }
    },
    setAspect (index) {
      this.selectedImgIndex = index
      this.$bus.$emit('set-image-index', index)
    },
    slideSwipe (direction) {
      let nx = this.selectedImgIndex
      switch (direction) {
        case 'left':
          nx = this.selectedImgIndex + 1
          break
        case 'right':
          nx = this.selectedImgIndex - 1
          break
      }
      if (nx != this.selectedImgIndex) {
        if (nx < 0) {
          nx = this.numImagesInSet - 1
        } else if (nx >= this.numImagesInSet) {
          nx = 0
        }
        this.setAspect(nx)
      }
    },
    adaptBuyWidget () {
      if (this.selectedVariant.added) {
        if (this.showAltHint) {
          this.buyHint = this.options.removeHint
        } else {
          this.buyHint = this.options.addedHint
        }
      } else if (this.selectedVariant.varAdded) {
        if (this.showAltHint) {
          this.buyHint = this.options.buyNowHint
        } else {
          this.buyHint = this.options.selectHint
        }
      } else {
        this.buyHint = this.options.buyNowHint
      }
      if (this.selectedVariant.added || this.selectedVariant.varAdded) {
        this.cartIconClass = 'icon-plain-cart'
      } else {
        this.cartIconClass = 'icon-add-cart'
      }
    }
  }
}
</script>
<style>
#app .image-selector,
#app .image-selector > .set-container {
  height: 33.33vw;
  overflow:hidden;
}
#app .image-selector {
  width: 100%;
}
#app .variant-selector {
  position: relative;
  width: 90%;
  margin-top: 1em;
  padding: .5em 5% 1em 5%;
  text-align: left;
  z-index: 8;
}
#app .variant-selector li span.text {
  display: none;
}
#app .variant-selector ul.plain li {
  width: 1.33em;
  height: 1.33em;
  padding: 0.125em .5em 0.125em 0.125em;
  overflow: hidden;
  cursor: pointer;
  pointer-events: all;
}
#app .variant-selector ul.plain li:before {
  display: inline-block;
  font-family: icomoon;
  content: "\e601";
  margin-right: .25em;
}
#app .variant-selector ul.plain {
  display: flex;
  flex-flow: nowrap row;
  pointer-events: none;
}

#app .variant-selector ul.plain li.added:before,
#app .variant-selector ul.plain li.active:before {
  content: "\e602";
  transform: scale(1.125);
}

#app .variant-selector ul.plain li.added:before {
  opacity: 0.75;
}

.buy-now {
  position: absolute;
  outline: none;
  top: 0.5em;
  right: 5%;
  display: flex;
  flex-flow: nowrap row;
  cursor: pointer;
  z-index: 20;
  height: 2.5em;
  min-width: 5em;
}

.buy-now.selecting {
  opacity: 0.5;
  pointer-events: none;
}

.buy-now button.price {
  border: solid 1px black;
  padding: 0.125em 0.25em;
  margin: 0;
  font-size: 1em;
  line-height: 1em;
  outline: none;
  height: 1.5em;
  border-radius: 0.5em;
  background: white;
  cursor: pointer;
  transition: all .33s ease-in-out;
}

.buy-now:hover button.price {
  background: black;
  color: white;
}

.buy-now .icon {
  transform: scale(1);
  opacity: 0.75;
  transition: all .33s ease-in-out;
  width: 1em;
  overflow: hidden;
  font-size: 1.25em;
  outline: none;
}
.buy-now .hint {
  position: absolute;
  bottom: -.5em;
  right: 0;
  opacity: 0;
  font-style: italic;
  transition: opacity .5s ease-in-out;
  white-space: nowrap;
}

.buy-now.added .hint span.not-added,
.buy-now .hint span.added {
  display: none;
}

.buy-now.added .hint span.added {
  display: block;
}

.variant-selector:hover .buy-now .hint {
  opacity: 1;
}

.buy-now .hint,
.buy-now .hint span,
.buy-now .price,
.buy-now .icon {
  user-select: none;
}
.buy-now .cart-icon {
  margin-left: .5em;
}
.buy-now .icon-check {
  margin-right: .25em;
}

.buy-now.added .cart-icon,
.buy-now.variant-added .cart-icon {
  width: 1.75em;
}

.buy-now.added .cart-icon:before,
.buy-now.variant-added .cart-icon:before {
  right: .75em;
}

.buy-now.added .cart-icon span.icon-minus,
.buy-now.added .cart-icon span.icon-minus:before,
.buy-now.variant-added .cart-icon span.icon-plus,
.buy-now.variant-added .cart-icon span.icon-plus:before {
  position: absolute;
  right: 0;
}

.buy-now.added .cart-icon span.icon-minus,
.buy-now.variant-added .cart-icon span.icon-plus {
  top: 0;
}

.buy-now.added .cart-icon span.icon-minus:before,
.buy-now.variant-added .cart-icon span.icon-plus:before {
  top: 0.375em;
  font-size: .5em;
}

.buy-now .icon:before {
  position: absolute;
  top: 0;
  right: 0;
}
.buy-now:hover .icon-add-cart {
  transform: scale(1.25);
  opacity: 1;
}
.buy-now .icon-check:before {
  opacity: 0;
  transition: opacity 1s ease-in-out;
}
.buy-now.added .icon-check:before {
  opacity: 1;
}
#app .detail-pane .body p {
  margin: 0.25em 0;
  padding: 0;
}

#app .image-selector {
  position: relative;
}
#app .image-selector > .set-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0;
  transition: opacity .5s ease-in-out;
}
#app .image-selector > .set-container figure {
  width: 100vw;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-flow: nowrap row;
  justify-content: center;
  align-items: center;
}
#app .image-selector > .set-container figure img {
  width: 60%;
  max-height: none;
}


#app .product-overlay .close {
  position: fixed;
  top: 1.8em;
  margin-top: 2vh;
  right: 2.5%;
  font-size: 1.5em;
  z-index: 50;
  cursor: pointer;
  opacity: 0.5;
  transform: scale(1);
  transition: all 0.25s ease-in-out;
}
#app .product-overlay .close:hover {
  opacity: 1;
  transform: scale(1.125);
}
#app .image-selector > .set-container.active {
  opacity: 1;
}
#app .product-body h2 {
  font-size: 1.1em;
}
#app .product-body h2:first-child {
  margin-top: 0;
  padding-top: 0;
}

#app .variant-selector .aspect-nav {
  position: absolute;
  top: .5em;
  right: 25%;
  display: none;
}

#app .detail-pane .variant-selector ol.aspect-nav li {
  margin: 0 .5em;
  display: inline-block;
  position: relative;
  height: 1em;
  width: 1.75em;
  opacity: 0.333;
  transform: scale(1);
  transition: all .5s ease-in-out;
}

#app .detail-pane .variant-selector ol.aspect-nav li.active,
#app .detail-pane .variant-selector .aspect-nav li:hover {
  opacity: 0.5;
  transform: scale(1.2);
}

#app .aspect-nav li:before {
  font-family: icomoon;
  position: absolute;
  top: 0.1em;
  left: 0.1em;
  font-size: 0.8em;
}

#app .variant-selector ol.aspect-nav li.num-1:before {
  content: "\e902";
}

#app .variant-selector ol.aspect-nav li.num-2:before {
  content: "\e900";
  left: 0.3em;
}

#app .variant-selector ol.aspect-nav li.num-3:before {
  content: "\e901";
}

@media screen and (min-width: 30em) {
  #app .product-overlay .close {
    top: 2em;
  }
  #app .variant-selector ul.plain li {
    padding: 0.125em .75em 0.125em 0.125em;
  }
}

@media screen and (min-width: 40em) {
  #app .variant-selector .aspect-nav {
    display: flex;
  }
  #app .product-overlay .close {
    top: 2.4em;
  }
  #app .variant-selector ul.plain li {
    padding: 0.125em 1em 0.125em 0.125em;
  }
}

@media screen and (min-width: 60em) {

  #app .product-overlay .close {
    top: 3em;
  }

  #app .buy-now {
    position: relative;
    top: 0;
    left: -2.25em;
    margin: 2em 0 1.25em 1em;
  }

  #app .buy-now .hint {
    bottom: auto;
    top: 0;
    left: 9em;
  }

  #app .variant-selector ul.plain li {
    padding: 0 0 0.5em 0;
    margin-top: 0;
    white-space: nowrap;
    cursor: pointer;
    opacity: 0.8;
    width: auto;
    height: auto;
    cursor: pointer;
  }
  #app .variant-selector ul.plain {
    flex-flow: nowrap column;
  }
  #app h3.selected-variant {
    display: none;
  }
  #app .variant-selector {
    position: absolute;
    top: 0;
    margin-top: 2em;
    right: 0;
    width: 18em;
    padding-top: 2em;
    text-align: left;
    padding-bottom: 1em;
  }
  #app .variant-selector li span.text {
    display: inline-block;
  }
  #app .variant-selector ul.plain li.active {
    font-style: italic;
    opacity: 1;
  }

  #app .variant-selector ul.plain li.added:before {
    margin-left: 0.125em;
  }

  #app .image-selector {
    width: 70%;
  }
  #app .variant-selector ol.aspect-nav {
    position: relative;
    right: auto;
    display: block;
  }
}

@media screen and (min-height: 25em) {
  #app .image-selector > .set-container figure img {
    width: 70%;
  }
}

@media screen and (min-height: 30em) {
  #app .image-selector > .set-container figure img {
    width: 80%;
  }
}

@media screen and (min-width: 70em) {

  #app .image-selector {
    width: 75%;
  }

}

@media screen and (min-width: 80em) {

  #app .image-selector {
    width: 80%;
  }

}

</style>
