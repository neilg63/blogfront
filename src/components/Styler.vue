<template>
  <aside class="styler">
    <ul class="plain schemes">
      <li v-for="item in schemes" :class="item.classNames" @click="assignScheme(item)">
        {{item.title}}
      </li>
    </ul>
    <ul class="plain text-sizes">
      <li v-for="item in sizes" :class="item.classNames" @click="assignSize(item)">
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
      ]
    }
  },
  created () {
    this.assignClasses('scheme')
    this.assignClasses('size')
  },
  methods: {
    assignClasses (mode) {
      let def = ''
      switch (mode) {
        case 'scheme':
          this.schemes = this.mapClasses(this.schemes, this.$store.state.scheme)
          break
        case 'size':
          this.sizes = this.mapClasses(this.sizes, this.$store.state.textSize)
          break
      }
      
      
    },
    mapClasses (items, def) {
      return items.map(item => {
        item.classNames = [item.type]
        if (item.type == def) {
          item.classNames.push('active')
        }
        return item
      })
    },
    assignSize (size) {
      this.$store.state.textSize = size.type
      this.assignClasses('size')
    },
    assignScheme (scheme) {
      this.$store.state.scheme = scheme.type
      this.assignClasses('scheme')
    }
  }
}

</script>
<style>

.text-sizes {
  font-size: 1rem;
  width: 100%;
  clear: both;
  flex: none;
}

.styler ul li {
  padding: 0.25em 1em;
  cursor: pointer;
}

.styler ul li:hover {
  transform: skew(-20deg);
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
}

</style>