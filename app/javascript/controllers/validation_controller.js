import { Controller } from 'stimulus'
export default class extends Controller {
  connect() {
    $(this.element).on('submit', function (event) {
      return confirm('确定提交？')
    })
  }
}
