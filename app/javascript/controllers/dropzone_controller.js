import Dropzone from 'dropzone'
import { Controller } from 'stimulus'
import { DirectUpload } from '@rails/activestorage'
import {
  getMetaValue,
  toArray,
  findElement,
  removeElement,
  insertAfter
} from 'helpers'

export default class extends Controller {
  static targets = ['input']

  connect() {
    this.dropZone = createDropZone(this)
    this.hideFileInput()
    this.bindEvents()
    createListController(this, this.files).start()
    Dropzone.autoDiscover = false // necessary quirk for Dropzone error in console
  }

  createHiddenInput() {
    const input = document.createElement('input')
    input.type = 'hidden'
    input.name = this.inputTarget.name
    insertAfter(input, this.inputTarget)
    return input
  }

  // Private
  hideFileInput() {
    this.inputTarget.disabled = true
    this.inputTarget.style.display = 'none'
  }

  bindEvents() {
    const that = this
    this.dropZone.on('addedfile', file => {
      setTimeout(() => {
        file.accepted && createDirectUploadController(this, file).start()
      }, 500)
    })

    this.dropZone.on('removedfile', file => {
      if (file.mock) {
        file.controller &&
          removeElement(file.controller.hiddenInputs[file.signed_id])
      } else {
        file.controller && removeElement(file.controller.hiddenInput)
      }
      // this.dropZone.options.maxFiles += 1
      if (parseInt(that.maxFiles) === 1) {
        // that.removeAllFiles()
        that.dropZone.options.maxFiles = 1
      }
    })

    this.dropZone.on('canceled', file => {
      file.controller && file.controller.xhr.abort()
    })

    this.dropZone.on('complete', function (file, response) {
      const elm = $(this.element).find('.dz-preview:last-child')
      elm.attr('data-id', file.id)
      elm.attr('id', 'blob-' + file.id)
      // $('.dz-remove').html(
      //   "<div><span class='fa fa-trash text-danger' style='font-size: .5em; cursor: pointer;'></span></div>"
      // )
    })

    this.dropZone.on('maxfilesexceeded', function (file) {
      // If only upload one file
      // if (parseInt(that.maxFiles) === 1) {
      //   // that.removeAllFiles()
      //   that.dropZone.removeAllFiles()
      //   that.dropZone.emit('addedfile', file)
      //   that.dropZone.emit('complete', file)
      //   that.dropZone.emit('success', file)
      // }
      // alert('No more files please!')
      // that.dropZone.removeFile(file)
    })
  }

  get headers() {
    return { 'X-CSRF-Token': getMetaValue('csrf-token') }
  }

  get url() {
    return this.inputTarget.getAttribute('data-direct-upload-url')
  }

  get maxFiles() {
    return this.data.get('maxFiles') || 1
  }

  get maxFileSize() {
    return this.data.get('maxFileSize') || 256
  }

  get acceptedFiles() {
    return this.data.get('acceptedFiles')
  }

  get addRemoveLinks() {
    return this.data.get('addRemoveLinks') || true
  }

  get files() {
    return JSON.parse(this.data.get('files')) || []
  }
}
class ListController {
  constructor(source, files) {
    this.source = source
    this.files = files
    this.hiddenInputs = {}
  }

  start() {
    this.files.forEach(file => this.thumbnail(file))
  }

  thumbnail(file) {
    const self = this
    const allImgExt = new RegExp(/jpg|jpeg|gif|bmp|png/)
    file.mock = true
    file.controller = self
    const isImg = allImgExt.test(file.content_type)
    self.hiddenInputs[file.signed_id] = self.createHiddenInput(file)
    self.source.dropZone.files.push(file)
    self.source.dropZone.options.maxFiles -= 1
    self.source.dropZone.emit('addedfile', file)
    if (isImg) {
      self.source.dropZone.emit('thumbnail', file, file.path)
    }
    self.source.dropZone.emit('complete', file)
  }

  createHiddenInput(file) {
    const input = document.createElement('input')
    input.type = 'hidden'
    input.name = this.source.inputTarget.name
    input.value = file.signed_id
    input.id = file.id
    insertAfter(input, this.source.inputTarget)
    return input
  }
}
class DirectUploadController {
  constructor(source, file) {
    this.directUpload = createDirectUpload(file, source.url, this)
    this.source = source
    this.file = file
  }

  start() {
    this.file.controller = this
    this.hiddenInput = this.createHiddenInput()
    this.directUpload.create((error, attributes) => {
      if (error) {
        removeElement(this.hiddenInput)
        this.emitDropzoneError(error)
      } else {
        this.hiddenInput.value = attributes.signed_id
        this.file.id = attributes.id
        this.emitDropzoneSuccess()
      }
    })
  }

  createHiddenInput() {
    const input = document.createElement('input')
    input.type = 'hidden'
    input.name = this.source.inputTarget.name
    input.id = this.file.id
    insertAfter(input, this.source.inputTarget)
    return input
  }

  directUploadWillStoreFileWithXHR(xhr) {
    this.bindProgressEvent(xhr)
    this.emitDropzoneUploading()
  }

  bindProgressEvent(xhr) {
    this.xhr = xhr
    this.xhr.upload.addEventListener('progress', event =>
      this.uploadRequestDidProgress(event)
    )
  }

  uploadRequestDidProgress(event) {
    const element = this.source.element
    const progress = (event.loaded / event.total) * 100
    findElement(
      this.file.previewTemplate,
      '.dz-upload'
    ).style.width = `${progress}%`
  }

  emitDropzoneUploading() {
    this.file.status = Dropzone.UPLOADING
    this.source.dropZone.emit('processing', this.file)
  }

  emitDropzoneError(error) {
    this.file.status = Dropzone.ERROR
    this.source.dropZone.emit('error', this.file, error)
    this.source.dropZone.emit('complete', this.file)
  }

  emitDropzoneSuccess() {
    this.file.status = Dropzone.SUCCESS
    this.source.dropZone.emit('success', this.file)
    this.source.dropZone.emit('complete', this.file)
  }
}

function createDirectUploadController(source, file) {
  return new DirectUploadController(source, file)
}

function createDirectUpload(file, url, controller) {
  return new DirectUpload(file, url, controller)
}

function createDropZone(controller) {
  return new Dropzone(controller.element, {
    url: controller.url,
    headers: controller.headers,
    maxFiles: controller.maxFiles,
    maxFilesize: controller.maxFileSize,
    acceptedFiles: controller.acceptedFiles,
    addRemoveLinks: controller.addRemoveLinks,
    autoQueue: false,
    dictRemoveFile: '删除'
    // dictRemoveFileConfirmation: true
    // previewTemplate: '<div>preview</div>'
  })
}

function createListController(source, files) {
  return new ListController(source, files)
}
