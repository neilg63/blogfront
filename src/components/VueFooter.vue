<template>
	<footer :id="id">
  	<ul class="menu plain footer-menu flex-row">
		  <li v-for="item in menu" :key="item.link"><router-link v-bind:to="item.link">{{item.title}}</router-link></li>
		</ul>
		<div class="info">
  		<p>{{footer.copyright}}</p>
  	</div>
  	<div class="developed-by">
  		<a href="http://www.multifaceted.info/" target="_blank">Developed by Multifaceted Web Services</a>
  	</div>
  	<div class="admin">
  		<span class="clear icon-backward" v-on:click="clearCache()" title="Clear cache"></span>
  		<a href="/user" target="_blank">Admin</a>
  	</div>
</footer>
</template>
<script>
export default {
	name: 'VueFooter',
  props: {
  	id: {
      type: String,
      required: true,
      default: 'page-footer'
    },
    menu: {
      type: Array,
      required: true,
      default: []
    },
    footer: {
    	type: Object,
      required: true,
      default: {
      	copyright: ''
      }
    }
  },
  methods: {
  	clearCache () {
  		this.$ls.remove('siteinfo')
  	}
  }
}
</script>