<template>
  <ul class="share-links plain">
    <li v-for="(item, index) in services" :class="item.type" :key="index">
      <a :href="format(item)" :title="item.title" :class="'icon-' + item.type" target="_blank"></a>
    </li>
  </ul>
</template>
<script>

export default {
  name: 'Share',
  props: {
    title: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      services: [
        {
          type: 'facebook',
          title: 'Facebook',
          url: 'https://facebook.com/sharer/sharer.php',
          u: 'u'
        },
        {
          type: 'twitter',
          title: 'Twitter',
          url: 'https://twitter.com/intent/tweet/',
          u: 'url'
        },
        {
          type: 'googleplus',
          title: 'Google+',
          url: 'https://plus.google.com/share',
          u: 'url'
        },
        {
          type: 'pinterest',
          title: 'pInterest',
          url: 'https://pinterest.com/pin/create/button/',
          u: 'url'
        }
      ]
    }
  },
  methods: {
    format (item) {
      let link = item.url + '?' + item.u + '=' +encodeURIComponent(window.location.toString())
      if (item.t) {
        link += item.t + '=' + encodeURIComponent(this.title)
      }
      return link
    }
  }
}

</script>
<style>

.share-links {
  font-size: 1.33em;
  width: 100%;
  clear: both;
  flex: none;
}

.share-links li {
  padding: 0 0.333em;
}

.share-links li,
.share-links li a {
  display: inline-block;
}

.share-links li a {
  width: 1em;
  height: 1em;
  padding: 0 0.5em;
  text-decoration: none;
  transition: color .333s ease-in-out;
  color: #999999;
}

.share-links li.facebook:hover a {
  color: #336699;
}

.share-links li.twitter:hover a {
  color: #99ccff;
}

.share-links li.googleplus:hover a {
  color: #aa0000;
}

.share-links li.pinterest:hover a {
  color: #ff3300;
}

@media screen and (min-width: 25em) {
  .share-links li {
    padding: 0 0.333em;
  }
}

@media screen and (min-width: 40em) {
  .share-links {
    font-size: 1.5em;
  }
}

@media screen and (min-width: 50em) {
  .share-links {
    font-size: 1.667em;
  }
}

@media screen and (min-width: 60em) {
  .share-links {
    font-size: 2em;
  }
}

</style>