(function () {
  function ready(callback) {
    if (document.readyState !== 'loading') {
      callback();
      return;
    }
    document.addEventListener('DOMContentLoaded', callback);
  }

  function initMobileMenu() {
    var button = document.querySelector('.mobile-toggle');
    var panel = document.querySelector('.mobile-panel');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var prev = hero.querySelector('.hero-prev');
    var next = hero.querySelector('.hero-next');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-slide')) || 0);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    start();
  }

  function initCategoryFilter() {
    var input = document.querySelector('.category-filter-input');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card-list] .movie-card'));
    var pills = Array.prototype.slice.call(document.querySelectorAll('.filter-pill'));
    if (!cards.length) {
      return;
    }

    function applyFilter(value) {
      var query = String(value || '').trim().toLowerCase();
      cards.forEach(function (card) {
        var text = (card.getAttribute('data-search') || '').toLowerCase();
        var matched = !query || query === '全部' || text.indexOf(query) !== -1;
        card.classList.toggle('is-filtered-out', !matched);
      });
    }

    if (input) {
      input.addEventListener('input', function () {
        applyFilter(input.value);
      });
    }

    pills.forEach(function (pill) {
      pill.addEventListener('click', function () {
        pills.forEach(function (item) {
          item.classList.remove('is-active');
        });
        pill.classList.add('is-active');
        var value = pill.getAttribute('data-filter') || pill.textContent || '';
        if (input) {
          input.value = value === '全部' ? '' : value;
        }
        applyFilter(value);
      });
    });
  }

  function getQueryValue(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name) || '';
  }

  function movieCard(movie) {
    return [
      '<article class="movie-card">',
      '<a href="' + movie.link + '" class="movie-link">',
      '<div class="movie-poster">',
      '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '<span class="movie-badge">' + escapeHtml(movie.category) + '</span>',
      '<span class="play-float">▶</span>',
      '</div>',
      '<div class="movie-info">',
      '<h3>' + escapeHtml(movie.title) + '</h3>',
      '<p>' + escapeHtml(movie.desc) + '</p>',
      '<div class="movie-meta"><span>★ ' + movie.rating + '</span><span>' + escapeHtml(movie.duration) + '</span></div>',
      '<div class="movie-submeta">' + escapeHtml(movie.meta) + '</div>',
      '</div>',
      '</a>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function initSearchPage() {
    var results = document.getElementById('search-results');
    var input = document.getElementById('search-input');
    if (!results || !window.searchMovies) {
      return;
    }
    var section = document.querySelector('.search-results-section');

    function render(query) {
      var value = String(query || '').trim().toLowerCase();
      if (input) {
        input.value = query || '';
      }
      if (!value) {
        results.innerHTML = '';
        if (section) {
          section.classList.add('is-empty');
        }
        return;
      }
      var matched = window.searchMovies.filter(function (movie) {
        return movie.text.toLowerCase().indexOf(value) !== -1;
      }).slice(0, 80);
      if (section) {
        section.classList.remove('is-empty');
      }
      results.innerHTML = matched.length ? matched.map(movieCard).join('') : '<div class="empty-result">没有找到匹配内容</div>';
    }

    render(getQueryValue('q'));
    if (input) {
      input.addEventListener('input', function () {
        render(input.value);
      });
    }
  }

  ready(function () {
    initMobileMenu();
    initHero();
    initCategoryFilter();
    initSearchPage();
  });

  window.initMoviePlayer = function (source) {
    var video = document.getElementById('movie-player');
    var overlay = document.getElementById('player-overlay');
    if (!video || !overlay || !source) {
      return;
    }
    var started = false;
    var hls = null;

    function playVideo() {
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }

    function start() {
      overlay.classList.add('is-hidden');
      if (started) {
        if (video.paused) {
          playVideo();
        }
        return;
      }
      started = true;
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal && hls) {
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            }
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        playVideo();
      } else {
        video.src = source;
        playVideo();
      }
    }

    overlay.addEventListener('click', start);
    video.addEventListener('click', function () {
      if (!started) {
        start();
        return;
      }
      if (video.paused) {
        playVideo();
      } else {
        video.pause();
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  };
}());
