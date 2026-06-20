(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var menuButton = document.querySelector('[data-menu-button]');
        var mobileMenu = document.querySelector('[data-mobile-menu]');

        if (menuButton && mobileMenu) {
            menuButton.addEventListener('click', function () {
                mobileMenu.classList.toggle('hidden');
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
        var current = 0;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

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
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        var params = new URLSearchParams(window.location.search);
        var urlQuery = params.get('q') || '';
        var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-search-box]'));

        searchInputs.forEach(function (input) {
            var targetSelector = input.getAttribute('data-target');
            var target = targetSelector ? document.querySelector(targetSelector) : document;
            var cards = target ? Array.prototype.slice.call(target.querySelectorAll('.movie-card')) : [];

            function applyFilter() {
                var query = input.value.trim().toLowerCase();
                cards.forEach(function (card) {
                    var text = (card.getAttribute('data-search') || card.textContent || '').toLowerCase();
                    card.hidden = query && text.indexOf(query) === -1;
                });
            }

            if (urlQuery && input.id === 'global-search') {
                input.value = urlQuery;
            }

            input.addEventListener('input', applyFilter);
            applyFilter();
        });
    });
})();
