<template>
  <aside class="styler">
    <ul class="plain schemes">
      <li v-for="(item, index) in schemes" :class="item.classNames" @click="assignScheme(item)" :key="index">
        {{item.title}}
      </li>
    </ul>
    <ul class="plain text-sizes">
      <li v-for="(item, index) in sizes" :class="item.classNames" @click="assignSize(item)" :key="index">
        {{item.title}}
      </li>
    </ul>
    <ul class="plain font-families">
      <li v-for="(item, index) in fonts" :class="item.classNames" @click="assignFont(item)" :key="index">
        {{item.title}}
      </li>
    </ul>
  </aside>
</template>
<script>
  
export default {
  name: 'Styler',
  data () {
    return {
      sizes: [
        {
          type: 'small',
          title: 'Small'
        },
        {
          type: 'medium',
          title: 'Medium'
        },
        {
          type: 'large',
          title: 'Large'
        },
        {
          type: 'xlarge',
          title: 'Very Big'
        }
      ],
      schemes: [
        {
          type: 'light',
          title: 'Light'
        },
        {
          type: 'green',
          title: 'Green'
        },
        {
          type: 'dark',
          title: 'Dark'
        }
      ],
      fonts: [
        {
          type: 'raleway',
          title: 'Raleway'
        },
        {
          type: 'open',
          title: 'Open Sans'
        },
        {
          type: 'comingsoon',
          title: 'Coming Soon'
        },
        {
          type: 'bubbler',
          title: 'Bubbler'
        },
        {
          type: 'handlee',
          title: 'Handlee'
        }
      ]
    }
  },
  created () {
    this.assignClasses('scheme')
    this.assignClasses('size')
    this.assignClasses('font')
  },
  methods: {
    assignClasses (mode) {
      switch (mode) {
        case 'scheme':
          this.schemes = this.mapClasses(this.schemes, this.$store.getters.scheme)
          break
        case 'size':
          this.sizes = this.mapClasses(this.sizes, this.$store.getters.textSize)
          break
        case 'font':
          this.fonts = this.mapClasses(this.fonts, this.$store.getters.font)
          break
      }
    },
    mapClasses (items, def) {
      return items.map(item => {
        item.classNames = [item.type]
        if (item.type === def) {
          item.classNames.push('active')
        }
        return item
      })
    },
    assignSize (size) {
      this.$store.state.styles.size = size.type
      this.assignClasses('size')
      this.$parent.updateStyles()
    },
    assignScheme (scheme) {
      this.$store.state.styles.scheme = scheme.type
      this.assignClasses('scheme')
      this.$parent.updateStyles()
    },
    assignFont (font) {
      this.$store.state.styles.font = font.type
      this.assignClasses('font')
      this.$parent.updateStyles()
    }
  }
}

</script>
<style>

.text-sizes {
  font-size: 1rem;
  clear: both;
  flex: none;
}

#app .styler ul {
  margin: 1rem;
}

.styler ul li {
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: all .3333s ease-in-out;
}

#app .styler ul.schemes {
  margin-top: 0;
}

#app .styler ul.schemes li {
  border: solid 1px black;
  font-size: 1.5rem;
  margin: 1.25em 0 0 0;
  transform: scale(1, 1.25);
}

.styler ul.font-families li,
.styler ul.text-sizes li {
  color: black;
}

.styler ul li:hover {
  font-style: italic;
}

.text-sizes li.small {
  font-size: 87.5%;
}

.text-sizes li.medium {
  font-size: 100%;
}

.text-sizes li.large {
  font-size: 112.5%;
}

.text-sizes li.xlarge {
  font-size: 125%;
}

.styler ul li.active {
  filter:  hue-rotate(90deg);
  text-decoration: underline;
  font-style: italic;
}

.styler ul.font-families {
  font-size:  1.5em;
}

</style>
