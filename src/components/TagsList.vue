<template>
  <nav class="tags" v-if="numTags > 0">
    <ul class="plain tags">
      <li v-for="(tag, index) in tags" :key="index" :class="tag.classNames" @click="filter(tag.name)">
        <span class="name">{{tag.name}}</span> <em>{{tag.num}}</em>
      </li>
    </ul>
  </nav>
</template>
<script>
import {mapGetters} from 'vuex'
export default {
  name: 'Blogs',
  data () {
    return {
      tags: [],
      filterName: 'All'
    }
  },
  computed: mapGetters(['numTags']),
  created () {
    let comp = this
    if (comp.$parent.$parent.homeLoaded) {
      comp.init()
    }
    this.$bus.$on('siteinfo', (status) => {
      comp.init()
    })
  },
  methods: {
    init () {
      this.tags = this.$store.state.tags
      this.mapClassNames()
    },
    filter (tagName) {
      this.$parent.filterByTag(tagName)
      this.mapClassNames()
      this.filterName = tagName
    },
    mapClassNames () {
      let filterRgx = new RegExp('^\s*' + this.filterName.replace(/[^a-z0-9]/,'.*?') + '\s*$', 'i')
      this.tags = this.tags.map((tag, index) => {
        tag.classNames = ['term-' + index, 'num-' + tag.num, , 'nth-' + index % 4]
        if (filterRgx.test(tag.name)) {
          tag.classNames.push('active')
        }
        return tag
      })
    }
  }
}

</script>
<style>
  
#app .tags li {
  margin-bottom: .5em;
  text-align: left;
  cursor: pointer;
}

#app .tags li:hover {
  font-style: italic;
  filter:  hue-rotate(20deg);
}

#app .tags li > em {
  display: inline-block;
  min-width: 1.25em;
  color: #0099ff;
  position: relative;
  top: -0.25em;
  font-size:  0.8em;
}

.tags li.nth-0 {
  color: #990000;
}

.tags li.nth-1 {
  color: #009900;
}

.tags li.nth-2 {
  color: #000099;
}

.tags li.nth-3 {
  color: #006666;
}

#app .tags li.active {
  font-style: italic;
  text-decoration: underline;
}

</style>