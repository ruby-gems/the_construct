$(document).on('turbolinks:load', function () {
  let sidebar_nicescroll_opts = {
      className: 'os-theme-thin-dark',
      sizeAutoCapable: true,
      paddingAbsolute: false,
      scrollbars: {
        autoHide: 'move',
        clickScrolling: true
      }
    },
    now_layout_class = null
  // $('body').overlayScrollbars(sidebar_nicescroll_opts)
  var sidebar_sticky = function () {
    if ($('body').hasClass('layout-2')) {
      $('body.layout-2 #sidebar-wrapper').stick_in_parent({
        parent: $('body')
      })
      $('body.layout-2 #sidebar-wrapper').stick_in_parent({ recalc_every: 1 })
    }
  }
  sidebar_sticky()

  var sidebar_nicescroll

  var sidebar_dropdown = function () {
    if ($('.main-sidebar').length) {
      sidebar_nicescroll = $('.main-sidebar').overlayScrollbars(
        sidebar_nicescroll_opts
      )

      $('.main-sidebar .sidebar-menu li a.has-dropdown')
        .off('click')
        .on('click', function () {
          var me = $(this)

          me.parent().find('> .dropdown-menu').slideToggle(500)
          return false
        })
    }
  }

  sidebar_dropdown()

  if ($('#top-5-scroll').length) {
    $('#top-5-scroll')
      .css({
        height: 315
      })
      .overlayScrollbars()
  }

  $('.main-content').css({
    minHeight: $(window).outerHeight() - 108
  })

  $('.nav-collapse-toggle').click(function () {
    $(this).parent().find('.navbar-nav').toggleClass('show')
    return false
  })

  $(document).on('click', function (e) {
    $('.nav-collapse .navbar-nav').removeClass('show')
  })

  var toggle_sidebar_mini = function (mini) {
    let body = $('body')

    if (!mini) {
      body.removeClass('sidebar-mini')
      $('.main-sidebar').css({
        overflow: 'hidden'
      })
      setTimeout(function () {
        sidebar_nicescroll = $('.main-sidebar').overlayScrollbars(
          sidebar_nicescroll_opts
        )
      }, 500)
      $('.main-sidebar .sidebar-menu > li > ul .dropdown-title').remove()
      $('.main-sidebar .sidebar-menu > li > a').removeAttr('data-toggle')
      $('.main-sidebar .sidebar-menu > li > a').removeAttr(
        'data-original-title'
      )
      $('.main-sidebar .sidebar-menu > li > a').removeAttr('title')
    } else {
      console.log('toggle')
      body.addClass('sidebar-mini')
      body.removeClass('sidebar-show')
      sidebar_nicescroll.overlayScrollbars().destroy()
      sidebar_nicescroll = null
      $('.main-sidebar .sidebar-menu > li').each(function () {
        let me = $(this)
        let dropdownMenu = me.find('> .dropdown-menu')
        if (dropdownMenu.length) {
          dropdownMenu.hide()
          dropdownMenu.find('li.dropdown-title').remove()
          if (dropdownMenu.find('li.dropdown-title').length === 0) {
            dropdownMenu.prepend(
              '<li class="dropdown-title pt-3">' +
                me.find('> a').text() +
                '</li>'
            )
          }
        } else {
          me.find('> a').attr('data-toggle', 'tooltip')
          me.find('> a').attr('data-original-title', me.find('> a').text())
          $("[data-toggle='tooltip']").tooltip({
            placement: 'right'
          })
        }
      })
    }
  }

  $("[data-toggle='sidebar']").click(function () {
    var body = $('body'),
      w = $(window)

    if (w.outerWidth() <= 1024) {
      body.removeClass('search-show search-gone')
      if (body.hasClass('sidebar-gone')) {
        body.removeClass('sidebar-gone')
        body.addClass('sidebar-show')
      } else {
        body.addClass('sidebar-gone')
        body.removeClass('sidebar-show')
      }
    } else {
      body.removeClass('search-show search-gone')
      if (localStorage.getItem('sidebar-menu-mini') === null) {
        localStorage.setItem('sidebar-menu-mini', 1)
      } else {
        localStorage.removeItem('sidebar-menu-mini')
        body.removeClass('sidebar-collapse')
      }
      if (body.hasClass('sidebar-mini')) {
        toggle_sidebar_mini(false)
      } else {
        toggle_sidebar_mini(true)
      }
    }

    return false
  })

  // 初始化菜单状态
  if (
    $(window).outerWidth() > 1024 &&
    localStorage.getItem('sidebar-menu-mini') !== null
  ) {
    $('body').addClass('sidebar-collapse')
    toggle_sidebar_mini(true)
  }

  var toggleLayout = function () {
    var w = $(window),
      layout_class = $('body').attr('class') || '',
      layout_classes =
        layout_class.trim().length > 0 ? layout_class.split(' ') : ''

    if (layout_classes.length > 0) {
      layout_classes.forEach(function (item) {
        if (item.indexOf('layout-') != -1) {
          now_layout_class = item
        }
      })
    }

    if (w.outerWidth() <= 1024) {
      if ($('body').hasClass('sidebar-mini')) {
        toggle_sidebar_mini(false)
        sidebar_nicescroll = $('.main-sidebar').overlayScrollbars(
          sidebar_nicescroll_opts
        )
        // sidebar_nicescroll = $('.main-sidebar').getNiceScroll()
      }

      $('body').addClass('sidebar-gone')
      $('body').removeClass('layout-2 layout-3 sidebar-mini sidebar-show')
      $('body')
        .off('click touchend')
        .on('click touchend', function (e) {
          if (
            $(e.target).hasClass('sidebar-show') ||
            $(e.target).hasClass('search-show')
          ) {
            $('body').removeClass('sidebar-show')
            $('body').addClass('sidebar-gone')
            $('body').removeClass('search-show')
          }
        })

      if (now_layout_class == 'layout-3') {
        let nav_second_classes = $('.navbar-secondary').attr('class'),
          nav_second = $('.navbar-secondary')

        nav_second.attr('data-nav-classes', nav_second_classes)
        nav_second.removeAttr('class')
        nav_second.addClass('main-sidebar')

        let main_sidebar = $('.main-sidebar')
        main_sidebar
          .find('.container')
          .addClass('sidebar-wrapper')
          .removeClass('container')
        main_sidebar
          .find('.navbar-nav')
          .addClass('sidebar-menu')
          .removeClass('navbar-nav')
        main_sidebar.find('.sidebar-menu .nav-item.dropdown.show a').click()
        main_sidebar.find('.sidebar-brand').remove()
        main_sidebar.find('.sidebar-menu').before(
          $('<div>', {
            class: 'sidebar-brand'
          }).append(
            $('<a>', {
              href: $('.navbar-brand').attr('href')
            }).html($('.navbar-brand').html())
          )
        )
        // setTimeout(function () {
        //   sidebar_nicescroll = main_sidebar.overlayScrollbars(
        //     sidebar_nicescroll_opts
        //   )
        //   // sidebar_nicescroll = main_sidebar.getNiceScroll()
        // }, 700)

        sidebar_dropdown()
        $('.main-wrapper').removeClass('container')
      }
    } else {
      $('body').removeClass('sidebar-gone sidebar-show')
      if (now_layout_class) $('body').addClass(now_layout_class)

      let nav_second_classes = $('.main-sidebar').attr('data-nav-classes'),
        nav_second = $('.main-sidebar')

      if (
        now_layout_class == 'layout-3' &&
        nav_second.hasClass('main-sidebar')
      ) {
        nav_second.find('.sidebar-menu li a.has-dropdown').off('click')
        nav_second.find('.sidebar-brand').remove()
        nav_second.removeAttr('class')
        nav_second.addClass(nav_second_classes)

        let main_sidebar = $('.navbar-secondary')
        main_sidebar
          .find('.sidebar-wrapper')
          .addClass('container')
          .removeClass('sidebar-wrapper')
        main_sidebar
          .find('.sidebar-menu')
          .addClass('navbar-nav')
          .removeClass('sidebar-menu')
        main_sidebar.find('.dropdown-menu').hide()
        main_sidebar.removeAttr('style')
        main_sidebar.removeAttr('tabindex')
        main_sidebar.removeAttr('data-nav-classes')
        $('.main-wrapper').addClass('container')
        // if (sidebar_nicescroll != null) sidebar_nicescroll.destroy()
      } else if (now_layout_class == 'layout-2') {
        $('body').addClass('layout-2')
      } else {
      }
    }
  }
  toggleLayout()
  $(window).resize(toggleLayout)

  // tooltip
  $("[data-toggle='tooltip']").tooltip()

  // popover
  // $('[data-toggle="popover"]').popover({
  //   container: 'body'
  // })

  // Collapsable
  $('[data-collapse]').each(function () {
    var me = $(this),
      target = me.data('collapse')

    me.click(function () {
      $(target).collapse('toggle')
      $(target).on('shown.bs.collapse', function (e) {
        e.stopPropagation()
        me.html('<i class="fas fa-minus"></i>')
      })
      $(target).on('hidden.bs.collapse', function (e) {
        e.stopPropagation()
        me.html('<i class="fas fa-plus"></i>')
      })
      return false
    })
  })

  // Gallery
  $('.gallery .gallery-item').each(function () {
    var me = $(this)
    me.attr('href', me.data('image'))
    me.attr('title', me.data('title'))
    if (me.parent().hasClass('gallery-fw')) {
      me.css({
        height: me.parent().data('item-height')
      })
      me.find('div').css({
        lineHeight: me.parent().data('item-height') + 'px'
      })
    }
    me.css({
      backgroundImage: 'url("' + me.data('image') + '")'
    })
  })
  if (jQuery().Chocolat) {
    $('.gallery').Chocolat({
      className: 'gallery',
      imageSelector: '.gallery-item'
    })
  }
})
