(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initNavigation() {
        const toggle = document.querySelector("[data-nav-toggle]");
        const menu = document.querySelector("[data-nav-menu]");
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function initHero() {
        const hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
        const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
        if (slides.length <= 1) {
            return;
        }
        let current = 0;
        let timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                start();
            });
        });
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        start();
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function getSearchParams() {
        try {
            return new URLSearchParams(window.location.search);
        } catch (error) {
            return new URLSearchParams("");
        }
    }

    function initFilters() {
        const scopes = Array.from(document.querySelectorAll("[data-filter-scope]"));
        scopes.forEach(function (scope) {
            const list = scope.parentElement ? scope.parentElement.querySelector("[data-filter-list]") : null;
            if (!list) {
                return;
            }
            const cards = Array.from(list.querySelectorAll("[data-movie-card]"));
            const input = scope.querySelector("[data-filter-input]");
            const type = scope.querySelector("[data-filter-type]");
            const year = scope.querySelector("[data-filter-year]");
            const counter = scope.querySelector("[data-filter-count]");
            const params = getSearchParams();
            if (input && params.get("q")) {
                input.value = params.get("q");
            }

            function apply() {
                const query = normalize(input ? input.value : "");
                const typeValue = normalize(type ? type.value : "");
                const yearValue = normalize(year ? year.value : "");
                let visible = 0;
                cards.forEach(function (card) {
                    const haystack = normalize([
                        card.dataset.title,
                        card.dataset.year,
                        card.dataset.type,
                        card.dataset.region,
                        card.dataset.category,
                        card.dataset.tags,
                        card.dataset.genre
                    ].join(" "));
                    const matchesQuery = !query || haystack.includes(query);
                    const matchesType = !typeValue || normalize(card.dataset.type).includes(typeValue) || normalize(card.dataset.genre).includes(typeValue);
                    const matchesYear = !yearValue || normalize(card.dataset.year) === yearValue;
                    const shouldShow = matchesQuery && matchesType && matchesYear;
                    card.classList.toggle("is-hidden", !shouldShow);
                    if (shouldShow) {
                        visible += 1;
                    }
                });
                if (counter) {
                    counter.textContent = "筛选结果：" + visible + " 部";
                }
            }

            [input, type, year].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });
            apply();
        });
    }

    function initPlayers() {
        const players = Array.from(document.querySelectorAll("[data-player]"));
        players.forEach(function (player) {
            const video = player.querySelector("video");
            const button = player.querySelector("[data-play-button]");
            if (!video || !button) {
                return;
            }
            const source = video.getAttribute("data-src");
            let attached = false;
            let hls = null;

            function attachSource() {
                if (attached || !source) {
                    return;
                }
                attached = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                    video.load();
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    return;
                }
                video.src = source;
                video.load();
            }

            function play() {
                attachSource();
                const promise = video.play();
                if (promise && typeof promise.catch === "function") {
                    promise.catch(function () {
                        player.classList.remove("is-playing");
                    });
                }
            }

            button.addEventListener("click", play);
            video.addEventListener("click", function () {
                attachSource();
            });
            video.addEventListener("play", function () {
                player.classList.add("is-playing");
            });
            video.addEventListener("pause", function () {
                player.classList.remove("is-playing");
            });
            video.addEventListener("ended", function () {
                player.classList.remove("is-playing");
            });
            window.addEventListener("beforeunload", function () {
                if (hls && typeof hls.destroy === "function") {
                    hls.destroy();
                }
            });
        });
    }

    ready(function () {
        initNavigation();
        initHero();
        initFilters();
        initPlayers();
    });
}());
