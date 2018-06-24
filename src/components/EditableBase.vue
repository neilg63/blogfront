<script>

import axios from 'axios'

export default {
  name: 'EditableBase',
  props: {
    text: {
      type: String,
      required: true
    },
    field: {
      type: String,
      required: true
    },
    id: {
      type: Number,
      required: 0
    },
    type:{
      type: String,
      required: true
    },
    tag: {
      type: String,
      default: 'div'
    },
    className: {
      type: String,
      default: 'text'
    }
  },
  data () {
    return {
      textValue: '',
      editable: false,
      msg: '',
      showMessage: false
    }
  },
  created () {
    this.textValue = this.text
  },
  updated () {
    this.textValue = this.text
  },
  computed: {
    wrapperClasses () {
      let cls = [this.className]
      if (this.editable) {
        cls.push('editable')
      }
      return cls
    }
  },
  methods: {
    toggleEditable() {
      if (this.editable) {
        this.saveEditable()
      } else {
        this.editable = true
      }
    },
    makeEditable() {
      this.editable = true
    },
    saveEditable() {
      let data = {
        'et': this.type,
        'id': this.id,
        'field': this.field,
        'value': this.textValue
      };
      let creds = this.$store.state.credentials
      if (creds.uname) {
        data.uname = creds.uname
      }
      if (creds.psswd) {
        data.psswd = creds.psswd
      }
      console.log(data)
      axios.post('/jsonstyles/save', data, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          "Access-Control-Allow-Origin": "*",
        }
    }).then(response => {
        this.msg = ''
        let comp = this
        if (response.data) {
          let d = response.data
          if (d.authenticated) {
            this.msg = "Could not save referenced item"
            if (d.entity) {
              let et = d.entity;
              if (et.saved > 0) {
                this.msg = "Item " + et.id + " successfully saved";
              }  
            }
          } else {
            this.msg = "Not authorised"
          }
        }
        this.showMessage = true
        this.editable = false
        setTimeout(() => {
          comp.showMessage = false
        }, 5000)
      });
    }
  }
}
</script>