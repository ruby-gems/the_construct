import { Controller } from 'stimulus'

export default class extends Controller {
  connect() {
    this.element.placeholder = 'YYYY-MM-DD hh:mm'

    $(this.element).daterangepicker({
      locale: { format: 'YYYY-MM-DD hh:mm' },
      singleDatePicker: true,
      timePicker: true,
      timePicker24Hour: true
    })
    new Cleave(this.element, {
      delimiters: ['-', '-', ' ', ':'],
      blocks: [4, 2, 2, 2, 2]
    })
  }
}
