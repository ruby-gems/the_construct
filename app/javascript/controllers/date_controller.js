import { Controller } from 'stimulus'

export default class extends Controller {
  connect() {
    this.element.placeholder = 'YYYY-MM-DD'
    $(this.element).daterangepicker({
      locale: { format: 'YYYY-MM-DD' },
      singleDatePicker: true
    })
    new Cleave(this.element, {
      date: true,
      delimiters: ['-', '-'],
      datePattern: ['Y', 'm', 'd']
    })
  }
}
