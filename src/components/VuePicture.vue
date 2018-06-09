<template>
<picture :class="className">
  <template v-if="imgset.picture">
  <template v-for="(img,key) in imgset.sizes">
      <source v-if="sizes[key]" :srcset="expandPath(img, key)" :media="sizes[key]" :key="key">
    </template>
    <img :src="expandSize(imgset.sizes, 'max_650x650')" :width="imgset.attributes.width" :height="imgset.attributes.height" />
  </template>
  <template v-if="!imgset.picture">
    <img :src="expandOrig(imgset.sizes)" :width="imgset.attributes.width" :height="imgset.attributes.height" />
  </template>
</picture>
</template>
<script type="text/javascript">

import utils from '../utils/utils'

export default {
  name: 'VuePicture',
  props: {
    imgset: {
      type: Object,
      required: true,
      default: null
    },
    group: {
      type: String,
      required: false,
      default: 'wide'
    },
    className: String
  },
  data () {
    return {
      sizes: {},
      sizeGroups: {
        wide: {
          'max_650x650': '(max-width: 650px)',
          'max_1300x1300': '(min-width: 651px) and (max-width: 1300px)',
          'max_1920x1920': '(min-width: 1301px) and (max-width: 1920px)',
          'max_2600x2600': '(min-width: 1921px)'
        },
        half: {
          'max_650x650': '(max-width: 1300px)',
          'max_1300x1300': '(min-width: 1301px)'
        }
      }
    }
  },
  created () {
    if (this.sizeGroups[this.group]) {
      this.sizes = this.sizeGroups[this.group]
    }
  },
  methods: {
    expandPath (src, key) {
      return utils.expandImagePath(src, key)
    },
    expandSize (sizes, key) {
      return utils.expandImageSize(sizes, key)
    },
    expandOrig (sizes) {
      return utils.expandImageOrig(sizes)
    }
  }
}
</script>
