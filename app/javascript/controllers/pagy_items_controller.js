import { Controller } from 'stimulus'

export default class extends Controller {
  connect() {
    const input = this.activeSelecterInput
    this.activeSelecterSelect.addEventListener('change', function (e) {
      input.value = this.value
      input.dispatchEvent(new Event('focusout'), { bubbles: true })
    })
  }

  disconnect() {
    // console.log('dis')
  }

  get activeSelecter() {
    return this.element.querySelector('.per_page_block')
  }
  get activeSelecterSelect() {
    return this.element.querySelector('.item-select')
  }

  get activeSelecterInput() {
    return this.activeSelecter.querySelector('input')
  }
}
