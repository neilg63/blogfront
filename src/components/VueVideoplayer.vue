<template>
<figure class="player video" :class="playClass">
  <div class="overlay" v-on:click="togglePlaymode()">
    <img :src="media.preview" />
  </div>
  <video v-if="playing" controls autoplay>
    <source v-for="uri in media.uris" :src="uri.src" :type="uri.mimetype">
  </video>
</figure>
</template>
<script>

export default {
  data: function () {
    return {
      playing: false,
      playClass: 'preview',
      id: ''
    }
  },
  props: {
    media: {},
    current: ''
  },
  created: function () {
    if (this.media.uris instanceof Array) {
      if (this.media.uris.length > 0) {
        this.id = this.media.uris[0].src
      }
    }
  },
  methods: {
    togglePlaymode: function () {
      this.playing = !this.playing
      if (this.playing) {
        if (this.media.uris instanceof Array) {
          if (this.media.uris.length > 0) {
            this.$parent.mediaPlaying = this.id
          }
        }
      }
    }
  },
  watch: {
    current: function () {
      if (this.current !== this.id) {
        this.playing = false
      }
    },
    playing: function () {
      this.playClass = this.playing ? 'playing' : 'preview'
    }
  }
}

</script>