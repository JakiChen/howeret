(function($) {

	"use strict";

	var App = {

		win: $(window),
		ww: window.innerWidth,
		wh: window.innerHeight,
		ajax_first_load: false,
		ajax_loading: false,
		ajax_location: '',


		init: function() {
			App.ajax_handle_click();
			App.ajax_handle_popstate();
			App.main_nav();
			App.trigger();
			App.popup();
			App.contact_form();
			App.shortcodes();

			App.win.on('load', function() {
				$('body').waitForImages({
					finished: function() {
						setTimeout(function() {
							$('.loader-mask').addClass('hide');
							$('.header').addClass('loaded');

							App.resize_header();

							setTimeout(function() {
								App.reveals();
							}, 300);
						}, 1000);
					},
					waitForAll: true
				});
			});

			App.win.on('resize', function() {
				App.ww = window.innerWidth;
				App.wh = window.innerHeight;

				App.main_nav();

				$('.custom_mfpopup .frame').css('height', (App.wh - 160) + 'px');
				$('.custom_mfpopup img').css({
					'margin-top': ($('.custom_mfpopup .frame').height() - $('.custom_mfpopup img').height()) / 2
				});
			});
		},


		ajax_handle_click: function() {
			$('body').on('click', '.ajax_link', function(event) {
				event.preventDefault();

				var page = $(this).attr('href');

				if (!App.ajax_loading)
					App.ajax(page, true);

				App.ajax_first_load = true;
			});
		},
		ajax_handle_popstate: function() {
			$(window).on('popstate', function() {
				if (App.ajax_first_load) {
					var newPageArray = location.pathname.split('/'),
						newPage = newPageArray[newPageArray.length - 1];

					if (!App.ajax_loading && App.ajax_location != newPage)
						App.ajax(newPage, false);
				}

				App.ajax_first_load = true;
			});
		},
		ajax: function(page, bool) {
			App.ajax_loading = true;
			App.ajax_location = page;

			$('.reveal').removeClass('reveal-in');
			$('.loader-mask').removeClass('hide');
			$('.header').removeClass('loaded');

			setTimeout(function() {
				$('html, body').animate({
					scrollTop: 0
				}, 10);

				setTimeout(function() {
					$('#main').load(page + ' #main_content', function(data) {
						App.main_nav();
						App.popup();
						App.shortcodes();

						$('#main_content').waitForImages({
							finished: function() {
								App.ajax_loading = false;

								App.win.trigger('load');

								var page_title = data.match(/<title>(.*?)<\/title>/);
								document.title = page_title[1];

								if (page != window.location && bool) {
									window.history.pushState({
										path: page
									}, '', page);
								}
							},
							waitForAll: true
						});
					});
				}, 500);
			}, 1000);
		},


		main_nav: function() {
			$('.menu li:has(ul)').find('a:first').addClass('parent');

			if (App.ww > 800) {
				$('.main-nav').show();
				$('.trigger').hide().removeClass('active');
				$('.mobile-nav').hide().removeClass('visible');

				$('.menu li:has(ul)').off('mouseenter mouseleave');
				$('.menu li:has(ul)').find('a').off('click');

				$('.menu li:has(ul)').on('mouseenter', function() {
					$(this).find('ul').show();
					$(this).find('ul:first').addClass('visible');
				}).on('mouseleave', function() {
					$(this).find('ul').hide();
					$(this).find('ul:first').removeClass('visible');
				});

				$('.menu li:has(ul)').find('a').on('click', function() {
					var parent = $(this).parent(),
						submenu = $(this).next('ul');

					if (parent.children('ul').length == 0) return true;
					else return false;
				});
			} else {
				$('.main-nav').hide();
				$('.trigger').show();
				$('.mobile-nav').show();

				$('.menu li:has(ul)').children('ul').hide();
				$('.menu li:has(ul)').off('mouseenter mouseleave');
				$('.menu li:has(ul)').find('a').off('click');

				$('.menu li:has(ul)').find('a').on('click', function() {
					var parent = $(this).parent(),
						submenu = $(this).next('ul');

					if (submenu.is(':visible'))
						parent.find('ul').slideUp(300);

					if (submenu.is(':hidden')) {
						parent.siblings().find('ul').slideUp(300);
						submenu.slideDown(300);
					}

					if (parent.children('ul').length == 0) return true;
					else return false;
				});
			}
		},
		trigger: function() {
			$('body').on('click', '.header .trigger', function() {
				$(this).toggleClass('active');
				$('.mobile-nav').html($('.main-nav').html()).toggleClass('visible');

				App.main_nav();
			});
		},


		resize_header: function() {
			App.win.on('scroll', function() {
				var scroll = $(this).scrollTop();

				if (scroll > 100) {
					$('.header').addClass('small');
				} else {
					$('.header').removeClass('small');
				}
			});
		},


		reveals: function() {
			App.win.on('scroll', function() {
				$('.entry').each(function(i) {
					var $this = $(this),
						el_top = $this.offset().top,
						win_bottom = App.wh + App.win.scrollTop();

					if (el_top < win_bottom) {
						$this.delay(i * 150).queue(function() {
							$this.find('.entry_imageoverlay').addClass('hide');

							setTimeout(function() {
								$this.find('.entry_imagewrap').addClass('loaded');
							}, 200);
						});
					}
				});

				$('.reveal').each(function(i) {
					var $this = $(this),
						el_top = $this.offset().top,
						win_bottom = App.wh + App.win.scrollTop();

					if (el_top < win_bottom) {
						$this.delay(i * 100).queue(function() {
							$this.addClass('reveal-in');
						});
					}
				});
			}).scroll();
		},


		popup: function() {
			$('.popup_link').on('click', function(e) {
				var src = $(this).attr('href'),
					video = '',
					title = typeof($(this).data('title')) !== "undefined" ? $(this).data('title') : '',
					current = $('.popup_link').index($(this)),
					total = $('.popup_link').length,
					frame_height = App.wh - 160;

				var meta = '<div class="meta">';
				meta += '<span class="title">' + title + '</span>';
				meta += '<div class="close"><span></span></div>';
				meta += '</div>';

				var frame = '<div class="frame" style="height:' + frame_height + 'px">';
				if (src.indexOf('.mp4') != -1) {
					frame += '<div class="video"><video autoplay controls><source src="' + src + ' type="video/mp4"></video></div>';
				} else if (src.indexOf('youtube') != -1) {
					frame += '<iframe src="' + src + '?showinfo=0&controls=0&rel=0&autoplay=1" frameborder="0"></iframe>';
				} else if (src.indexOf('vimeo') != -1) {
					frame += '<iframe src="' + src + '?autoplay=1&byline=0&portrait=0" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>';
				} else {
					frame += '<img src="' + src + '">';
				}
				frame += '</div>';

				var nav = '<div class="nav">';
				nav += '<div class="prev"><span></span></div>';
				nav += '<div class="next"><span></span></div>';
				nav += '</div>';

				$.magnificPopup.open({
					items: {
						src: '<div class="custom_mfpopup">' + meta + frame + nav + '</div>',
						type: 'inline'
					}
				});

				$('.custom_mfpopup img').css({
					'margin-top': ($('.custom_mfpopup .frame').height() - $('.custom_mfpopup img').height()) / 2
				});

				$('.custom_mfpopup .close').on('click', function() {
					$.magnificPopup.instance.close();
				});

				if (current == 0) {
					$('.custom_mfpopup .nav .prev').addClass('disabled');
				}

				if (current == total - 1) {
					$('.custom_mfpopup .nav .next').addClass('disabled');
				}

				$('.custom_mfpopup .nav .next').on('click', function() {
					if (current < total - 1) {
						current++;

						var i = $('.popup_link').eq(current);
						src = i.attr('href');
						title = i.data('title');

						$('.custom_mfpopup .meta .title').text(title);

						if (src.indexOf('.mp4') != -1) {
							video = '<div class="video"><video autoplay controls><source src="' + src + ' type="video/mp4"></video></div>';
							$('.custom_mfpopup .frame img').remove();
							$('.custom_mfpopup .frame').append(video);
						} else if (src.indexOf('youtube') != -1) {
							video = '<iframe src="' + src + '?showinfo=0&controls=0&rel=0&autoplay=1" frameborder="0"></iframe>';
							$('.custom_mfpopup .frame img').remove();
							$('.custom_mfpopup .frame').append(video);
						} else if (src.indexOf('vimeo') != -1) {
							video = '<iframe src="' + src + '?autoplay=1&byline=0&portrait=0" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>';
							$('.custom_mfpopup .frame img').remove();
							$('.custom_mfpopup .frame').append(video);
						} else {
							$('.custom_mfpopup .frame iframe').remove();
							$('.custom_mfpopup .frame').html('<img src="' + src + '">');
						}

						$('.custom_mfpopup img').css({
							'margin-top': ($('.custom_mfpopup .frame').height() - $('.custom_mfpopup img').height()) / 2
						});

						if (current == total - 1) {
							$(this).addClass('disabled');
						}

						if (!current == 0) {
							$('.custom_mfpopup .nav .prev').removeClass('disabled');
						}
					}
				});

				$('.custom_mfpopup .nav .prev').on('click', function() {
					if (current > 0) {
						current--;

						var i = $('.popup_link').eq(current);
						src = i.attr('href');
						title = i.data('title');

						$('.custom_mfpopup .meta .title').text(title);

						if (src.indexOf('.mp4') != -1) {
							video = '<div class="video"><video autoplay controls><source src="' + src + ' type="video/mp4"></video></div>';
							$('.custom_mfpopup .frame img').remove();
							$('.custom_mfpopup .frame').append(video);
						} else if (src.indexOf('youtube') != -1) {
							video = '<iframe src="' + src + '?showinfo=0&controls=0&rel=0&autoplay=1" frameborder="0"></iframe>';
							$('.custom_mfpopup .frame img').remove();
							$('.custom_mfpopup .frame').append(video);
						} else if (src.indexOf('vimeo') != -1) {
							video = '<iframe src="' + src + '?autoplay=1&byline=0&portrait=0" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>';
							$('.custom_mfpopup .frame img').remove();
							$('.custom_mfpopup .frame').append(video);
						} else {
							$('.custom_mfpopup .frame iframe').remove();
							$('.custom_mfpopup .frame').html('<img src="' + src + '">');
						}

						$('.custom_mfpopup img').css({
							'margin-top': ($('.custom_mfpopup .frame').height() - $('.custom_mfpopup img').height()) / 2
						});

						if (current == 0) {
							$(this).addClass('disabled');
						}

						if (current < total) {
							$('.custom_mfpopup .nav .next').removeClass('disabled');
						}
					}
				});

				e.preventDefault();
			});
		},


		contact_form: function() {
			$('#contact_form #submit').on('click', function() {
				var action = $('#contact_form').attr('action');

				$('#contact_messages').slideUp(500, function() {
					$('#contact_messages').hide();
					$('#submit').attr('disabled', 'disabled');

					$.post(action, {
						name: $('#name').val(),
						email: $('#email').val(),
						message: $('#message').val()
					}, function(data) {
						document.getElementById('contact_messages').innerHTML = data;
						$('#contact_messages').slideDown(500);
						$('#submit').removeAttr('disabled');
						if (data.match('success') != null)
							$('#contact_form').slideUp(500);
					});
				});

				return false;
			});
		},


		shortcodes: function() {
			// background
			$('[data-bg]').each(function() {
				var bg = $(this).data('bg');

				$(this).css({
					'background-image': 'url(' + bg + ')',
					'background-size': 'cover',
					'background-position': 'center center',
					'background-repeat': 'no-repeat'
				});
			});

			$('[data-bg-color]').each(function() {
				var bg = $(this).data('bg-color');

				$(this).css('background-color', bg);
			});

			// magnific popup
			var popup = $('.magnific-popup');

			popup.each(function() {
				var gallery = $(this).data('gallery') == true ? 1 : 0;

				popup.magnificPopup({
					delegate: 'a',
					type: 'image',
					gallery: {
						enabled: gallery
					}
				});
			});

			// owl slider
			$('.slider').each(function() {
				var slider = $(this),
					dots = slider.data('dots') == true ? 1 : 0,
					arrows = slider.data('arrows') == true ? 1 : 0,
					items = typeof(slider.data('items')) !== "undefined" ? parseInt(slider.data('items'), 10) : 1,
					margin = typeof(slider.data('margin')) !== "undefined" ? parseInt(slider.data('margin'), 10) : 0;

				slider.owlCarousel({
					autoplay: true,
					smartSpeed: 1000,
					items: items,
					loop: true,
					nav: arrows,
					dots: dots,
					margin: margin,
					navText: ['', '']
				});
			});
		}
	}

	App.init();

})(jQuery);
