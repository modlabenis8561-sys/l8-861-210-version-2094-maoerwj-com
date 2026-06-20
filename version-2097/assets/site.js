(function () {
  var body = document.body;
  var base = body.getAttribute("data-base") || "./";

  function join(url) {
    if (!url) {
      return url;
    }
    if (/^(https?:)?\/\//.test(url) || url.charAt(0) === "/" || url.indexOf("#") === 0) {
      return url;
    }
    return base + url;
  }

  function text(value) {
    return String(value || "").toLowerCase();
  }

  var toggle = document.querySelector("[data-nav-toggle]");
  var nav = document.querySelector("[data-nav]");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        slide.classList.toggle("is-active", position === current);
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle("is-active", position === current);
      });
    }

    function next() {
      show(current + 1);
    }

    function start() {
      stop();
      timer = window.setInterval(next, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    var nextButton = hero.querySelector("[data-hero-next]");
    var prevButton = hero.querySelector("[data-hero-prev]");
    if (nextButton) {
      nextButton.addEventListener("click", function () {
        next();
        start();
      });
    }
    if (prevButton) {
      prevButton.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    start();
  }

  var panel = document.querySelector("[data-search-panel]");
  var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-search]"));
  var index = window.MovieSearchIndex || [];

  function renderSearch(query) {
    if (!panel) {
      return;
    }
    var value = text(query).trim();
    if (!value) {
      panel.hidden = true;
      panel.innerHTML = "";
      return;
    }
    var terms = value.split(/\s+/).filter(Boolean);
    var results = index.filter(function (item) {
      var bag = text([item.title, item.meta, (item.tags || []).join(" "), item.oneLine].join(" "));
      return terms.every(function (term) {
        return bag.indexOf(term) !== -1;
      });
    }).slice(0, 10);
    if (!results.length) {
      panel.innerHTML = '<div class="search-empty">没有找到匹配影片</div>';
      panel.hidden = false;
      return;
    }
    panel.innerHTML = results.map(function (item) {
      return '<a class="search-item" href="' + join(item.url) + '">' +
        '<img src="' + join(item.cover) + '" alt="' + escapeHtml(item.title) + '">' +
        '<span><strong>' + escapeHtml(item.title) + '</strong><small>' + escapeHtml(item.meta) + '</small></span>' +
        '</a>';
    }).join("");
    panel.hidden = false;
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  inputs.forEach(function (input) {
    input.addEventListener("input", function () {
      renderSearch(input.value);
    });
    input.addEventListener("focus", function () {
      renderSearch(input.value);
    });
  });

  document.addEventListener("click", function (event) {
    if (!panel || panel.hidden) {
      return;
    }
    var inSearch = event.target.closest("[data-search]") || event.target.closest("[data-search-panel]");
    if (!inSearch) {
      panel.hidden = true;
    }
  });

  Array.prototype.slice.call(document.querySelectorAll("[data-local-filter]")).forEach(function (input) {
    input.addEventListener("input", function () {
      var query = text(input.value).trim();
      var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
      cards.forEach(function (card) {
        var haystack = text(card.getAttribute("data-text"));
        card.hidden = query && haystack.indexOf(query) === -1;
      });
    });
  });
})();
