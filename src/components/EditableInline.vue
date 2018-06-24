<script>

import EditableBase from './EditableBase'

export default {
  name: 'EditableInline',
  extends: EditableBase,
  render (createElement) {
    return createElement(this.tag, {
      class: this.wrapperClasses,
      attrs: {
        id: this.type + '-' + this.field + '-' + this.id,
         contenteditable: this.editable
      },
      props: {
        contenteditable: this.editable
      },
      on: {
        click: this.makeEditable,
        dblclick: this.toggleEditable
      }
    },
    this.textValue)
  }
}
</script>