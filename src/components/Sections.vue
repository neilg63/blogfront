<template>
  <div class="sections">
  <template v-for="(section,index) in sections">
    <template v-if="section.type == 'image_set'">
       <image-set :key="index" :section="section"></image-set>
    </template>
    <template v-if="section.type == 'section'">
       <text-section :key="index" :section="section" :intro="intro"></text-section>
    </template>
  </template>
  </div>
</template>
<script>

import ImageSet from './ImageSet'
import TextSection from './TextSection'

export default {
  name: 'Sections',
  components: {
    ImageSet,
    TextSection
  },
  props: {
    sections: {
      type: Array,
      required: true
    },
    intro: {
      type: String,
      required: false
    }
  }
}
</script>
