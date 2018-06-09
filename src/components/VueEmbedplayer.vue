<template>
<figure class="player embed" :class="playClass">
  <div class="overlay" v-on:click="togglePlaymode()">
    <img :src="media.preview" /></div>
    <iframe v-if="playing" :src="media.uri" :width="media.width" :height="media.height"></iframe>
</figure>
</template>
<script>
export default {
  data: function () {
    return {
      playing: false,
      playClass: 'preview'
    }
  },
  props: {
    media: {},
    current: ''
  },
  methods: {
    togglePlaymode: function () {
      this.playing = !this.playing
      var comp = this
      this.$on('media', function (uri) {
        if (uri !== this.media.uri) {
          comp.playing = false
        }
      })
      if (this.playing) {
        if (this.media.uri) {
          this.$parent.mediaPlaying = this.media.uri
        }
      }
    }
  },
  watch: {
    current: function () {
      if (this.current !== this.media.uri) {
        this.playing = false
      }
    },
    playing: function () {
      this.playClass = this.playing ? 'playing' : 'preview'
    }
  }
}
</script>