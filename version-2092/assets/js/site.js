(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var mobilePanel = document.querySelector('.mobile-panel');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
        var current = 0;

        function showSlide(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-slide')) || 0);
            });
        });

        if (slides.length > 1) {
            setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }
    }

    var params = new URLSearchParams(window.location.search);
    var queryValue = params.get('q') || '';
    var filterInputs = Array.prototype.slice.call(document.querySelectorAll('.filter-input'));

    function normalize(value) {
        return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
    }

    function applyFilter(value) {
        var keyword = normalize(value);
        var lists = Array.prototype.slice.call(document.querySelectorAll('.searchable-list'));

        lists.forEach(function (list) {
            var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
            var visible = 0;

            cards.forEach(function (card) {
                var text = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-tags'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-region'),
                    card.textContent
                ].join(' '));
                var matched = !keyword || text.indexOf(keyword) !== -1;
                card.style.display = matched ? '' : 'none';
                if (matched) {
                    visible += 1;
                }
            });

            var empty = list.parentElement.querySelector('.empty-state');
            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        });
    }

    filterInputs.forEach(function (input) {
        if (queryValue && !input.value) {
            input.value = queryValue;
        }
        input.addEventListener('input', function () {
            applyFilter(input.value);
        });
    });

    if (queryValue || filterInputs.length) {
        applyFilter(queryValue || (filterInputs[0] && filterInputs[0].value) || '');
    }

    var topInputs = Array.prototype.slice.call(document.querySelectorAll('.site-search-input'));
    topInputs.forEach(function (input) {
        if (queryValue) {
            input.value = queryValue;
        }
    });
}());

function initMoviePlayer(src) {
    var video = document.getElementById('moviePlayer');
    var button = document.getElementById('playOverlay');
    if (!video || !src) {
        return;
    }

    var attached = false;

    function attach() {
        if (attached) {
            return;
        }
        attached = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = src;
        } else if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({ enableWorker: true });
            hls.loadSource(src);
            hls.attachMedia(video);
        } else {
            video.src = src;
        }
    }

    function play() {
        attach();
        if (button) {
            button.classList.add('is-hidden');
        }
        var request = video.play();
        if (request && typeof request.catch === 'function') {
            request.catch(function () {
                if (button) {
                    button.classList.remove('is-hidden');
                }
            });
        }
    }

    attach();

    if (button) {
        button.addEventListener('click', play);
    }

    video.addEventListener('click', function () {
        if (video.paused) {
            play();
        }
    });

    video.addEventListener('play', function () {
        if (button) {
            button.classList.add('is-hidden');
        }
    });
}
