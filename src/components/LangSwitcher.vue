<template>
	<ul class="lang-switcher plain" :class="lang">
    <li v-on:click="switchLang('en')" class="en" :class="{'selected': lang == 'en'}" title="English">en</li>
    <li v-on:click="switchLang('it')" class="it" :class="{'selected': lang == 'it'}" title="italiano">it</li>
  </ul>
</template>
<script>
export default {
	name: 'LangSwitcher',
	props: {
    lang: {
      type: String,
      required: true
    }
  },
  methods: {
    switchLang (lang) {
      if (lang != this.$parent.$parent.lang) {
        this.$parent.lang = lang
        this.$parent.$parent.homeLoaded = false
        this.$parent.updating = true
        this.$parent.$parent.localiseSettings(lang)
        this.$parent.$parent.loadHome(true)
      }
    },
  }
}
</script>