<template>
  <div :class="contClass">
    <template v-if="editable">
      <vue-editor v-model="textValue"></vue-editor>
    </template>
    <template v-else>
      <div v-html="text" class="inner"></div>
    </template>
    <button class="make-editable edit-control" @click="makeEditable()">Edit</button>
    <button class="save-editable edit-control" @click="saveEditable()">Save</button>
    <div class="message" :class="messageClass">{{msg}}</div>
  </div>
</template>
<script>

import EditableBase from './EditableBase'
import { VueEditor } from "vue2-editor"

export default {
  name: 'EditableRich',
  extends: EditableBase,
  components: {
    VueEditor
  },
  computed: {
    contClass () {
      let cls = [this.className, 'text-wrapper']
      if  (this.editable) {
        cls.push('editable')
      } else {
        cls.push('static')
      }
      return cls
    },
    messageClass () {
      return (this.showMessage && this.msg.trim().length > 1) ? 'active' : 'inactive'
    }
  }
}
</script>