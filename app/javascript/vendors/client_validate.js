$(document).on('turbolinks:load', function () {
  window.ClientSideValidations.formBuilders['BootstrapForm::FormBuilder'] = {
    add: function (element, settings, message) {
      const wrapperElement = element.parent()
      let errorElement = wrapperElement.find('div' + '.invalid-feedback')

      // console.log(settings, wrapperElement)
      if (!errorElement.length) {
        errorElement = $('<' + 'div' + '>', {
          class: 'invalid-feedback',
          text: message
        })
        wrapperElement.append(errorElement)
      }

      wrapperElement.addClass(settings.wrapper_error_class)
      element.addClass('is-invalid')
      errorElement.text(message)
    },

    remove: function (element, settings) {
      const wrapperElement = element.parent()
      const errorElement = wrapperElement.find('div' + '.invalid-feedback')

      wrapperElement.removeClass(settings.wrapper_error_class)
      element.removeClass('is-invalid')
      errorElement.remove()
    }
  }
})
