<template>
  <form class="login" method="post">
    <input type="text" size="16" v-model="uname" name="uname" />
    <input type="password" size="12" v-model="psswd" name="psswd" />
    <button class="submit" type="submit" @click.prevent.stop="signIn()">Sign in</button>
  </form>
</template>

<script>

export default {
  name: 'Login',
  data () {
    return {
      uname: '',
      psswd: ''
    }
  },
  created () {
    
  },
  methods: {
    signIn () {
      let comp = this
      if (this.uname.length > 5 && this.psswd.length > 5) {
        this.uname = this.uname.trim()
        this.psswd = this.psswd.trim()
        this.$store.state.credentials = {
          uname: this.uname,
          psswd: this.psswd
        }
      }
      setTimeout(function(args) {
        comp.uname = ''
        comp.psswd = ''
      }, 500)
    },
  }
}
</script>