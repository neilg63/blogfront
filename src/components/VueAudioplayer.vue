<template>
<div class="audio-player">
  <img v-if="media.has_preview" :src="media.preview" class="preview" v-on:click="play()" :title="tooltip" />
    <audio class="audio-control" controls :autoplay="autoplay">
      <source v-for="uri in media.uris" :src="uri.src" :type="uri.mimetype">
    </audio>
  </div>
</template>
<script>
export default {
  data: function () {
    return {
      id: '',
      playing: false,
      tooltip: 'Play'
    }
  },
  props: {
    media: {},
    autoplay: false
  },
  created: function () {
    if (this.media.uris instanceof Array) {
      if (this.media.uris.length > 0) {
        this.id = this.media.uris[0].src
      }
    }
  },
  methods: {
    play: function () {
      var audioEl = this.$el.querySelector('audio')
      if (audioEl) {
        if (audioEl.paused) {
          audioEl.play()
          this.tooltip = 'Pause'
        } else {
          audioEl.pause()
          this.tooltip = 'Play'
        }
      }
    },
    changeState: function () {
      var comp = this
      setTimeout(function () {
        var audioEl = comp.$el.querySelector('audio')
        if (audioEl) {
          comp.tooltip = audioEl.paused ? 'Play' : 'Pause'
        }
      }, 50)
    }
  }
}
</script>