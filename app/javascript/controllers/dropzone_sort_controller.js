import { Controller } from 'stimulus'
import Sortable from 'sortablejs'
export default class extends Controller {
  connect() {
    this.sortable = Sortable.create(this.element, {
      draggable: '.dz-preview',
      animation: 150,
      onEnd: this.end.bind(this)
    })
  }
  end(event) {
    let url = this.element.dataset.url
    let data = new FormData()
    let sort = this.sortable.toArray()
    sort.forEach(i => data.append('blob[]', i))
    Rails.ajax({
      url: url,
      type: 'POST',
      data: data
    })
  }
}
