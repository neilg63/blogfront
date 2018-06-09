<template>
<picture :class="className">
  <template v-for="(img,key) in imgset.sizes">
    <source v-if="sizes[key]" :data-srcset="img" :media="sizes[key]">
  </template>
  <img v-lazy="imgset.sizes.max_325x325" :width="imgset.attributes.width" :height="imgset.attributes.height" />
</picture>
</template>
<script>
export default {
  props: {
    imgset: {},
    sizes: {},
    className: ''
  },
  template: ''
}
</script>