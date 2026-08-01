/* ============================================
   EMBER & ASH — script.js
   jQuery-powered interactions
   ============================================ */

$(document).ready(function () {

  /* ============================================
     0-A. AOS — Animate On Scroll Init
     ============================================ */
  AOS.init({
    duration: 800,       // animation duration ms
    easing:   'ease-out-cubic',
    once:     true,      // animate only once per element
    offset:   80,        // trigger 80px before element enters viewport
  });


  /* ============================================
     0-B. DARK / LIGHT MODE TOGGLE
     ============================================ */
  const $themeToggle = $('#themeToggle');
  const THEME_KEY    = 'ea_theme';

  // Apply saved preference on load
  if (localStorage.getItem(THEME_KEY) === 'light') {
    $('body').addClass('light-mode');
  }

  $themeToggle.on('click', function () {
    $('body').toggleClass('light-mode');
    const isLight = $('body').hasClass('light-mode');
    localStorage.setItem(THEME_KEY, isLight ? 'light' : 'dark');

    // Reinit AOS after theme switch (colours may shift)
    AOS.refresh();
  });


  /* ============================================
     1. NAVBAR — scroll effect + hamburger
     ============================================ */
  const $navbar = $('#navbar');
  const $hamburger = $('#hamburger');
  const $navLinks = $('#navLinks');

  // Scroll: add .scrolled class after 60px
  $(window).on('scroll.navbar', function () {
    if ($(this).scrollTop() > 60) {
      $navbar.addClass('scrolled');
    } else {
      $navbar.removeClass('scrolled');
    }
  });

  // Hamburger toggle
  $hamburger.on('click', function () {
    const isOpen = $navLinks.hasClass('open');
    $navLinks.toggleClass('open');
    $hamburger.toggleClass('open');
    $hamburger.attr('aria-expanded', !isOpen);
  });

  // Close mobile menu on nav link click
  $navLinks.find('a').on('click', function () {
    $navLinks.removeClass('open');
    $hamburger.removeClass('open');
    $hamburger.attr('aria-expanded', 'false');
  });


  /* ============================================
     2. SMOOTH SCROLL — offset for fixed navbar
     ============================================ */
  $('a[href^="#"]').on('click', function (e) {
    const target = $(this).attr('href');
    if ($(target).length) {
      e.preventDefault();
      const navH = parseInt(getComputedStyle(document.documentElement)
        .getPropertyValue('--nav-h')) || 72;
      const offsetTop = $(target).offset().top - navH;
      $('html, body').animate({ scrollTop: offsetTop }, 600, 'swing');
    }
  });


  /* ============================================
     3. SCROLL REVEAL — fade-up on scroll
     ============================================ */

  // Add .reveal class to key sections
  $('.about-grid, .menu-card, .gallery-item, .reserve-grid, .strip-item, .section-title, .section-tag')
    .addClass('reveal');

  function checkReveal() {
    const windowBottom = $(window).scrollTop() + $(window).height();
    $('.reveal:not(.visible)').each(function () {
      const elemTop = $(this).offset().top;
      if (windowBottom > elemTop + 60) {
        $(this).addClass('visible');
      }
    });
  }

  $(window).on('scroll.reveal', checkReveal);
  checkReveal(); // run on load


  /* ============================================
     4. MENU FILTER — jQuery show/hide with animation
     ============================================ */
  $('.filter-btn').on('click', function () {
    const $btn = $(this);
    const filter = $btn.data('filter');

    // Update active button
    $('.filter-btn').removeClass('active').attr('aria-selected', 'false');
    $btn.addClass('active').attr('aria-selected', 'true');

    // Filter cards
    if (filter === 'all') {
      $('.menu-card').each(function (i) {
        const $card = $(this);
        setTimeout(function () {
          $card.removeClass('hidden').css({ opacity: 0, transform: 'translateY(20px)' });
          $card.animate({ opacity: 1 }, {
            duration: 350,
            step: function (now) {
              $(this).css('transform', 'translateY(' + (20 * (1 - now)) + 'px)');
            }
          });
        }, i * 60);
      });
    } else {
      $('.menu-card').each(function (i) {
        const $card = $(this);
        const category = $card.data('category');
        if (category === filter) {
          setTimeout(function () {
            $card.removeClass('hidden').css({ opacity: 0, transform: 'translateY(20px)' });
            $card.animate({ opacity: 1 }, {
              duration: 350,
              step: function (now) {
                $(this).css('transform', 'translateY(' + (20 * (1 - now)) + 'px)');
              }
            });
          }, i * 60);
        } else {
          $card.addClass('hidden');
        }
      });
    }
  });


  /* ============================================
     5. GALLERY LIGHTBOX
     ============================================ */
  const $lightbox   = $('#lightbox');
  const $lbImg      = $('#lightboxImg');
  const $lbCaption  = $('#lightboxCaption');
  let currentIndex  = 0;

  // Build image array from gallery
  function getGalleryImages() {
    return $('.gallery-item').map(function () {
      return {
        src: $(this).find('img').attr('src').replace('w=600', 'w=1200'),
        alt: $(this).find('img').attr('alt'),
        caption: $(this).find('.gallery-overlay span').text()
      };
    }).get();
  }

  function openLightbox(index) {
    const images = getGalleryImages();
    currentIndex = index;
    const img = images[index];
    $lbImg.attr({ src: img.src, alt: img.alt });
    $lbCaption.text(img.caption);
    $lightbox.removeAttr('hidden');
    $('body').css('overflow', 'hidden');
  }

  function closeLightbox() {
    $lightbox.attr('hidden', true);
    $('body').css('overflow', '');
  }

  function showLightboxImage(index) {
    const images = getGalleryImages();
    currentIndex = (index + images.length) % images.length;
    const img = images[currentIndex];
    $lbImg.fadeOut(150, function () {
      $(this).attr({ src: img.src, alt: img.alt }).fadeIn(200);
    });
    $lbCaption.text(img.caption);
  }

  // Open on click
  $(document).on('click', '.gallery-item', function () {
    const index = $('.gallery-item').index(this);
    openLightbox(index);
  });

  // Keyboard open
  $(document).on('keydown', '.gallery-item', function (e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const index = $('.gallery-item').index(this);
      openLightbox(index);
    }
  });

  // Close button
  $('#lightboxClose').on('click', closeLightbox);

  // Prev / Next
  $('#lightboxPrev').on('click', function () { showLightboxImage(currentIndex - 1); });
  $('#lightboxNext').on('click', function () { showLightboxImage(currentIndex + 1); });

  // Click outside to close
  $lightbox.on('click', function (e) {
    if ($(e.target).is($lightbox)) closeLightbox();
  });

  // Keyboard navigation
  $(document).on('keydown', function (e) {
    if ($lightbox.attr('hidden') !== undefined) return;
    if (e.key === 'Escape')       closeLightbox();
    if (e.key === 'ArrowLeft')    showLightboxImage(currentIndex - 1);
    if (e.key === 'ArrowRight')   showLightboxImage(currentIndex + 1);
  });


  /* ============================================
     6. RESERVATION FORM — validation + WhatsApp
     ============================================ */

  // ---- WHATSAPP NUMBER ----
  const WHATSAPP_NUMBER = '923240161184';

  // Set min date to today
  const today = new Date().toISOString().split('T')[0];
  $('#resDate').attr('min', today);

  // Helper: show / clear error
  function showError(inputId, errorId, message) {
    $('#' + inputId).addClass('error');
    $('#' + errorId).text(message);
  }
  function clearError(inputId, errorId) {
    $('#' + inputId).removeClass('error');
    $('#' + errorId).text('');
  }

  // Live clear on input
  $('#guestName').on('input',  function () { clearError('guestName',  'nameError'); });
  $('#guestPhone').on('input', function () { clearError('guestPhone', 'phoneError'); });
  $('#resDate').on('change',   function () { clearError('resDate',    'dateError'); });
  $('#resTime').on('change',   function () { clearError('resTime',    'timeError'); });
  $('#guests').on('change',    function () { clearError('guests',     'guestsError'); });

  // Form submit
  $('#reservationForm').on('submit', function (e) {
    e.preventDefault();

    const name      = $.trim($('#guestName').val());
    const phone     = $.trim($('#guestPhone').val());
    const date      = $('#resDate').val();
    const time      = $('#resTime').val();
    const guests    = $('#guests').val();
    const special   = $.trim($('#specialReq').val());

    let isValid = true;

    // Validate Name
    if (!name) {
      showError('guestName', 'nameError', 'Please enter your full name.');
      isValid = false;
    } else if (name.length < 2) {
      showError('guestName', 'nameError', 'Name must be at least 2 characters.');
      isValid = false;
    }

    // Validate Phone
    const phoneRegex = /^[\+]?[\d\s\-\(\)]{7,15}$/;
    if (!phone) {
      showError('guestPhone', 'phoneError', 'Please enter your phone number.');
      isValid = false;
    } else if (!phoneRegex.test(phone)) {
      showError('guestPhone', 'phoneError', 'Please enter a valid phone number.');
      isValid = false;
    }

    // Validate Date
    if (!date) {
      showError('resDate', 'dateError', 'Please select a date.');
      isValid = false;
    }

    // Validate Time
    if (!time) {
      showError('resTime', 'timeError', 'Please select a time.');
      isValid = false;
    }

    // Validate Guests
    if (!guests) {
      showError('guests', 'guestsError', 'Please select number of guests.');
      isValid = false;
    }

    if (!isValid) return;

    /* ------ RESERVATION LIMIT: max 3 per phone number ------ */
    const RES_KEY      = 'ea_reservations';
    const MAX_RES      = 3;
    const allRes       = JSON.parse(localStorage.getItem(RES_KEY) || '{}');
    const phoneClean   = phone.replace(/\s/g, '');           // strip spaces for consistent key
    const prevCount    = allRes[phoneClean] || 0;

    if (prevCount >= MAX_RES) {
      showError('guestPhone', 'phoneError',
        'This number has already made ' + MAX_RES + ' reservations. Please call us directly.');
      return;
    }
    /* ------------------------------------------------------- */

    // Format time to 12-hour
    /*function formatTime(t) {
      const [h, m] = t.split(':').map(Number);
      const ampm = h >= 12 ? 'PM' : 'AM';
      const hour = h % 12 || 12;
      return hour + ':' + String(m).padStart(2, '0') + ' ' + ampm;
    }*/

    // Format date to readable
    function formatDate(d) {
      const dateObj = new Date(d + 'T00:00:00');
      return dateObj.toLocaleDateString('en-PK', {
        weekday: 'long', year: 'numeric',
        month: 'long', day: 'numeric'
      });
    }

    // Build WhatsApp message
    const message =
      '🍽️ *Table Reservation Request*\n' +
      '━━━━━━━━━━━━━━━━━━━━━\n' +
      '👤 *Name:* ' + name + '\n' +
      '📞 *Phone:* ' + phone + '\n' +
      '📅 *Date:* ' + formatDate(date) + '\n' +
      '🕐 *Time:* ' + time + '\n' +
      '👥 *Guests:* ' + guests + '\n' +
      (special ? '📝 *Special Requests:* ' + special + '\n' : '') +
      '━━━━━━━━━━━━━━━━━━━━━\n' +
      'Sent from Ember & Ash website.';

    // Encode and open WhatsApp
    const encodedMsg = encodeURIComponent(message);
    const whatsappURL = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodedMsg;
    window.open(whatsappURL, '_blank');

    // Save reservation count for this phone number
    allRes[phoneClean] = prevCount + 1;
    localStorage.setItem(RES_KEY, JSON.stringify(allRes));

    // Hide form and show Thank You message
    const $form = $('#reservationForm');
    $form.fadeOut(400, function () {
      const thankYouHTML =
        '<div id="thankYouMsg" style="text-align:center; padding: 40px 20px;">' +
          '<div class="ty-icon" aria-hidden="true">✦</div>' +
          '<h3 class="ty-title">Reservation Received!</h3>' +
          '<p class="ty-sub">Thank you, <strong>' + name + '</strong>! Your table request has been sent to us via WhatsApp.</p>' +
          '<div class="ty-details">' +
            '<div class="ty-row"><span>📅 Date</span><strong>' + formatDate(date) + '</strong></div>' +
            '<div class="ty-row"><span>🕐 Time</span><strong>' + time + '</strong></div>' +
            '<div class="ty-row"><span>👥 Guests</span><strong>' + guests + '</strong></div>' +
          '</div>' +
          '<p class="ty-note">We will confirm your booking within 30 minutes on <strong>' + phone + '</strong></p>' +
          '<button id="newReservationBtn" class="btn btn-outline" style="margin-top:24px;">Make Another Reservation</button>' +
        '</div>';

      $('.reserve-form-wrap').html(thankYouHTML);
      $('.reserve-form-wrap').fadeIn(500);

      /*
      // Make another reservation button
      $('#newReservationBtn').on('click', function () {
        $('.reserve-form-wrap').fadeOut(300, function () {
          $(this).html($form[0].outerHTML);
          $(this).fadeIn(400);
          // Re-init date min
          const todayNew = new Date().toISOString().split('T')[0];
          $('#resDate').attr('min', todayNew);
          // Re-bind live clear events
          $('#guestName').on('input',  function () { clearError('guestName',  'nameError'); });
          $('#guestPhone').on('input', function () { clearError('guestPhone', 'phoneError'); });
          $('#resDate').on('change',   function () { clearError('resDate',    'dateError'); });
          $('#resTime').on('change',   function () { clearError('resTime',    'timeError'); });
          $('#guests').on('change',    function () { clearError('guests',     'guestsError'); });
        });
      });*/
      $('#newReservationBtn').on('click', function () {
    location.reload();
});
    });

  });


  /* ============================================
     7. ACTIVE NAV LINK on scroll (highlight current section)
     ============================================ */
  const sections = ['home', 'menu', 'gallery', 'reserve', 'contact'];

  $(window).on('scroll.activenav', function () {
    const scrollPos = $(this).scrollTop() + 100;
    sections.forEach(function (id) {
      const $section = $('#' + id);
      if (!$section.length) return;
      const top    = $section.offset().top;
      const bottom = top + $section.outerHeight();
      if (scrollPos >= top && scrollPos < bottom) {
        $('.nav-links a').removeClass('active');
        $('.nav-links a[href="#' + id + '"]').addClass('active');
      }
    });
  });

}); // end document ready

  /* ============================================
     8. SCROLL TO TOP BUTTON
     ============================================ */
  const $scrollTop = $('#scrollTop');

  $(window).on('scroll.scrolltop', function () {
    if ($(this).scrollTop() > 400) {
      $scrollTop.addClass('visible');
    } else {
      $scrollTop.removeClass('visible');
    }
  });

  $scrollTop.on('click', function () {
    $('html, body').animate({ scrollTop: 0 }, 600, 'swing');
  });