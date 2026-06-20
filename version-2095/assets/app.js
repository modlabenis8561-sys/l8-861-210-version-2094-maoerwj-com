(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function setupMenu() {
        var toggle = qs('[data-menu-toggle]');
        var nav = qs('[data-mobile-nav]');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function setupHero() {
        var hero = qs('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = qsa('[data-hero-slide]', hero);
        var dots = qsa('[data-hero-dot]', hero);
        var prev = qs('[data-hero-prev]', hero);
        var next = qs('[data-hero-next]', hero);
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === index);
            });
        }

        function auto() {
            clearInterval(timer);
            timer = setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                auto();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                auto();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                auto();
            });
        });
        show(0);
        auto();
    }

    function setupFilters() {
        qsa('[data-filter-panel]').forEach(function (panel) {
            var scope = panel.parentElement ? qs('.filter-scope', panel.parentElement) : null;
            if (!scope) {
                return;
            }
            var cards = qsa('[data-card]', scope);
            var input = qs('[data-filter-input]', panel);
            var category = qs('[data-filter-category]', panel);
            var year = qs('[data-filter-year]', panel);
            var region = qs('[data-filter-region]', panel);
            var type = qs('[data-filter-type]', panel);

            function apply() {
                var query = normalize(input && input.value);
                var catValue = normalize(category && category.value);
                var yearValue = normalize(year && year.value);
                var regionValue = normalize(region && region.value);
                var typeValue = normalize(type && type.value);
                cards.forEach(function (card) {
                    var text = normalize(card.getAttribute('data-search'));
                    var matchText = !query || text.indexOf(query) !== -1;
                    var matchCat = !catValue || normalize(card.getAttribute('data-category')) === catValue;
                    var matchYear = !yearValue || normalize(card.getAttribute('data-year')) === yearValue;
                    var matchRegion = !regionValue || normalize(card.getAttribute('data-region')) === regionValue;
                    var matchType = !typeValue || normalize(card.getAttribute('data-type')) === typeValue;
                    card.hidden = !(matchText && matchCat && matchYear && matchRegion && matchType);
                });
            }

            [input, category, year, region, type].forEach(function (control) {
                if (control) {
                    control.addEventListener('input', apply);
                    control.addEventListener('change', apply);
                }
            });

            var params = new URLSearchParams(window.location.search);
            var q = params.get('q');
            if (q && input) {
                input.value = q;
            }
            apply();
        });
    }

    function setupImages() {
        qsa('img').forEach(function (img) {
            img.addEventListener('error', function () {
                img.classList.add('image-error');
            });
        });
    }

    function setupPlayers() {
        qsa('.movie-player').forEach(function (shell) {
            var video = qs('video', shell);
            var cover = qs('.player-cover', shell);
            var source = shell.getAttribute('data-video');
            var hls = null;
            var ready = false;

            if (!video || !source) {
                return;
            }

            function attach() {
                if (ready) {
                    return;
                }
                ready = true;
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({ enableWorker: true, lowLatencyMode: false });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                } else {
                    video.src = source;
                }
                video.controls = true;
            }

            function start() {
                attach();
                if (cover) {
                    cover.classList.add('is-hidden');
                }
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {
                        video.controls = true;
                    });
                }
            }

            if (cover) {
                cover.addEventListener('click', start);
            }
            video.addEventListener('click', function () {
                if (!ready || video.paused) {
                    start();
                }
            });
            window.addEventListener('beforeunload', function () {
                if (hls) {
                    hls.destroy();
                }
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMenu();
        setupHero();
        setupFilters();
        setupImages();
        setupPlayers();
    });
}());
