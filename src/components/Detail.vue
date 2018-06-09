<template>
  <article class="content-container node-page" :class="contClasses">
    <div class="article-top">
      <figure v-if="hasMainImage" class="subpanel" :class="mainImageClass">
        <vue-picture :imgset="image" :group="image.group" :className="image.type.replace('/','-')"></vue-picture>
      </figure>
      <div class="subpanel" :class="bodyClass">
        <h2 class="article-title" :class="{'show-title': showTitle,'hide-title': !showTitle}">{{title}}</h2>
        <div v-if="bodyTop" class="body" v-html="body"></div>
      </div>
    </div>
    <div v-if="hasProductImages" class="products">
      <template v-for="(image, index) in images">
        <figure :class="image.prodClasses" :key="image.nid" v-on:click="showActive(image, index)">
          <vue-picture :imgset="image" :group="image.group" :className="image.type.replace('/','-')"></vue-picture>
          <figcaption v-if="image.hasVariant">
            <p class="product-name">{{image.title}}</p> 
            <p class="price">{{image.variant.price|currency}}</p>
          </figcaption>
        </figure>
      </template>
    </div>
    <product v-if="hasActiveProduct" :product="product" :options="productOptions" :productIndex="productIndex"></product>
    <div v-if="!bodyTop" class="body" v-html="body"></div>
    <sections v-if="showSections" :sections="sections"></sections>
    <share :title="title"></share>
  </article>
</template>

<script>

import VuePicture from './VuePicture'
import Sections from './Sections'
import Share from './Share'
import filters from '../mixins/filters'

export default {
  name: 'Detail',
  components: {
    VuePicture,
    Sections,
    Share
  },
  mixins: [filters],
  data () {
    return {
      title: 'Welcome to Lucy of Syracuse',
      body: "",
      image: "",
      images: [],
      showTitle: false,
      numImages: 0,
      hasMainImage: false,
      hasContent: false,
      sections: [],
      numSections: 0,
      cType: 'article',
      hasProducts: false,
      hasActiveProduct: false,
      product: {
        title: ''
      },
      productOptions: {},
      hasProductImages: false,
      numProducts: 0,
      contClasses: [],
      mainImageClass: 'right',
      bodyClass: 'left',
      bodyTop: true,
      productIndex: 0
    }
  },
  computed: {
    showSections () {
      return this.numSections > 0 && !this.hasActiveProduct
    }
  },
  created () {
    this.$bus.$on('page', (data) => {
      this.matchOptions()
      this.contClasses = []
      this.products = []
      this.sections = []
      this.numSections = 0
      this.hasProducts = false
      this.bodyTop = true
      if (data.valid) {
        this.hasMainImage = false
        if (data.title) {
          this.title = data.title
          this.hasContent = true
          this.showTitle = this.title.length > 1
        } else {
          this.title = ''
          this.showTitle = false
        }
        if (data.body) {
          this.body = data.body
          this.hasContent = true
        } else {
          this.body = ''
        }
        if (data.image) {
          if (data.image.sizes) {
            this.image = data.image
            this.hasMainImage = true 
            this.hasContent = true
          } else {
            this.hasMainImage = false
          }
        } else {
          this.image = {}
        }
        if (data.sections) {
          if (data.sections instanceof Array) {
            this.sections = data.sections
            this.numSections = data.sections.length
          }
        }
        if (data.type) {
          this.cType = data.type
        }
        switch (this.cType) {
          case 'catalog':
            this.preProcessCatalog(data)
            this.bodyTop = false
            break;
          default:
            this.hasProductImages = false
            break;
        }
        if (this.hasMainImage) {
          this.contClasses.push('flex-row');
          this.mainImageClass = 'left'
          this.bodyClass = 'right'
        }
        this.$parent.showDetail = this.hasContent
      } else {
        this.$parent.showDetail = false
      }
      let comp = this
      window.scrollTo(0, 0)
      /*window.addEventListener('resize', () => {
        comp.setHeight()
      })*/
      window.addEventListener('keyup', (e) => {
        switch (e.keyCode) {
          case 27:
            comp.toggleActiveProduct(false)
            break;
        }
      })
      setTimeout(() => {
        comp.updateAdded()
      }, 3000)
    })
  },
  methods: {
    preProcessCatalog (data) {
      if (data.products) {
        if (data.products instanceof Array) {
          this.products = data.products
          this.numProducts = this.products.length
          this.hasProducts = this.numProducts > 0
          this.processProductImages()
        }
      }
    },
    processProductImages () {
      this.numImages = 0
      this.images = []
      for (let i = 0, prod, img, variant; i < this.numProducts; i++) {
        prod = this.products[i]
        if (prod) {
          this.mapAdded(prod)
        }
        if (prod.images) {
          if (prod.images instanceof Array && prod.images.length > 0) {
            img = prod.images[0]
            img.group = 'half'
            img.hasVariant = false
            img.active = false
            img.prodClasses = []
            if (prod.variants) {
              variant = prod.variants.find(vr => vr.ecwid == prod.ecwid)
              img.title = prod.title
              if (variant) {
                if (variant.price) {
                  img.hasVariant = true
                  img.variant = variant
                  img.nid = prod.nid
                }
              }
            }
            this.images.push(img)
          }
        }
      }
      this.numImages = this.images.length
      this.hasProductImages = this.numImages > 0
      if (this.hasProductImages) {
        this.processSub();
      }
    },
    updateAdded () {
      for (let i = 0; i < this.numProducts; i++) {
        if (i < this.products.length) {
          this.mapAdded(this.products[i])
        }
      }
    },
    mapAdded (prod) {
      if (prod.variants) {
        if (prod.variants instanceof Array) {
          prod.variants = prod.variants.map(v => {
            v.added = this.$parent.orderedItems.findIndex(oi => oi.productId.toString() === v.id.toString()) >= 0
            v.varAdded = false
            return v
          })
          let addedIndex = prod.variants.findIndex(v => v.added)
          if (addedIndex >= 0) {
            this.productIndex = addedIndex
            prod.variants = prod.variants.map(v => {
              v.varAdded = !v.added
              return v
            })
          }
        }
      }
    },
    processSub () {
      if (this.$route.params) {
        if (this.$route.params.sub) {
          let sub = this.$route.params.sub

          let prod = this.products.find(p => {
            let slug = p.path.split('/').pop()
            return slug === sub
          })
          if (prod) {
            this.product = prod
            this.toggleActiveProduct(true)
            this.mapActiveProduct()
          }
        }
      }
    },
    showActive (image,index) {
      this.toggleActiveProduct(false)
      if (image.hasVariant) {
        if (image.nid) {
          this.product = this.products.find(p => p.nid == image.nid)
          if (this.product) {
            if (this.product.nid) {
              this.mapActiveProduct()
              let newPath = '/' + this.$route.params.name + '/' + this.product.path.split('/').pop()
              this.$router.push(newPath)
            }
          }
        }
      }
    },
    mapActiveProduct () {
      this.product.intro = this.body
      this.product.catalog_title = this.title
      this.toggleActiveProduct(true)
    },/*
    setHeight () {
      let el = document.querySelector('article.content-container')
      if (el) {
        let elInner = document.querySelector('.product-overlay')
        if (elInner) {
          let style = window.getComputedStyle(elInner)
          el.style.minHeight = style.height
        }
      }
    },*/
    toggleActiveProduct (newVal) {
      this.hasActiveProduct = newVal
      let cl = 'show-product'
      let ai = this.contClasses.indexOf(cl)
      if (newVal) {
        if (ai < 0) {
          this.contClasses.push(cl)
        }
        /*setTimeout(() => {
          this.setHeight()
        }, 500)*/
      } else {
        if (ai >= 0) {
          this.contClasses.splice(ai, 1)
          if (this.$route.params.sub) {
            this.$router.push('/' + this.$route.params.name)
          }
        }
      }
    },
    matchOptions () {
      let opts = {
        en: {
          buyNowHint: 'Add to cart',
          selectHint: 'Select',
          addedHint: 'Already added',
          removeHint: 'Remove'
        },
        it: {
          buyNowHint: 'Aggiungi',
          selectHint: 'Scegli',
          addedHint: 'Già aggiunto',
          removeHint: 'Rimouvi'
        }
      }
      switch (this.$parent.lang) {
        case 'it':
          this.productOptions = opts.it
          break;
        default:
          this.productOptions = opts.en
          break
      }
    }
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

#app .detail-pane .products {
  max-width: 100vw;
  padding: 3% 3vw;
  margin: 0 -3%;
  background-color: white;
}

#app .detail-pane .products figure {
  cursor: pointer;
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

#app .detail-pane .products figure img {
  width: 100%;
  height: auto;
  transition: transform 0.5s ease-in-out;
  transform: scale(1, 1);
}

#app .detail-pane .products figure:hover img {
  transform: scale(-1, 1);
}

#app .detail-pane .products figure figcaption {
  display: absolute;
  bottom: 2%;
  text-align: center;
}

#app .detail-pane .product-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: auto;
  z-index: -2;
  transition: opacity .5s ease-in-out;
  overflow: hidden;
  background-color: white;
  opacity: 0;
}

#app .detail-pane > article {
  min-height: 75vh;
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

#app .detail-pane .show-product .product-overlay {
  position: relative;
  z-index: 11;
  opacity: 1;
}

#app .detail-pane .show-product > .sections,
#app .detail-pane .show-product > .body,
#app .detail-pane .show-product > .article-top,
#app .detail-pane .show-product > .subpanel,
#app .detail-pane .show-product .products {
  opacity: 0;
  height: 0;
  overflow: hidden;
  padding: 0;
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

  #app .detail-pane .flex-row .subpanel {
    width: 50%;
  }
  #app .detail-pane .body {
    max-width: 86.6667%;
  }
  #app .product-overlay > h2,
  #app .subpanel h2.article-title {
    font-size: 1.5em;
  }
}

@media screen and (min-width: 60em) {

  #app .product-overlay > h2,
  #app .subpanel h2.article-title {
    font-size: 1.667em;
  }
}

@media screen and (min-width: 80em) {
  #app .detail-pane .body {
    font-size: 106.667%;
  }

  #app .product-overlay > h2,
  #app .subpanel h2.article-title {
    font-size: 2em;
  }
}

@media screen and (min-width: 100em) {
  #app .detail-pane .body {
    font-size: 112.5%%;
  }
}

</style>