<template>
  <div class="text-wrapper" :class="contClass">
    <template v-if="editable">
      <vue-editor v-model="text"></vue-editor>
    </template>
    <template v-else>
      <div :id="'node-body-' + id" v-html="text"></div>
    </template>
    <button class="make-editable edit-control" @click="makeEditable()">Edit</button>
    <button class="save-editable edit-control" @click="saveEditable()">Save</button>
    <div class="message" v-if="showMessage">{{msg}}</div>
  </div>
</template>
<script>

import filters from '../mixins/filters'
import axios from 'axios'
import { VueEditor } from "vue2-editor"

export default {
  name: 'Editable',
  components: {
    VueEditor
  },
  mixins: [filters],
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
    }
  },
  data () {
    return {
      editable: false,
      msg: ''
    }
  },
  computed: {
    contClass () {
      return this.editable? 'editable' : 'text'
    },
    showMessage () {
      return this.msg.trim().length > 1
    }
  },
  methods: {
    makeEditable() {
      this.editable = true
    },
    saveEditable() {
      let data = {
        'et': this.type,
        'id': this.id,
        'field': this.field,
        'value': this.text
      };
      
      axios.post('/jsonstyles/save', data, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          "Access-Control-Allow-Origin": "*",
        }
    }).then(response => {
        this.msg = ''
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
        this.editable = false;
      });
    }
  }
}
</script>