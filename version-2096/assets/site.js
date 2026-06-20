import { H as Hls } from './hls-vendor-dru42stk.js';

const qs = (selector, root = document) => root.querySelector(selector);
const qsa = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function htmlEscape(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function bindMenu() {
  const button = qs('[data-menu-button]');
  const nav = qs('[data-mobile-nav]');
  if (!button || !nav) return;
  button.addEventListener('click', () => {
    nav.classList.toggle('open');
  });
}

function bindSearchForms() {
  qsa('[data-site-search]').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const input = qs('input', form);
      const value = input ? input.value.trim() : '';
      if (value) {
        window.location.href = `./search.html?q=${encodeURIComponent(value)}`;
      }
    });
  });
}

function bindHero() {
  const root = qs('[data-hero]');
  if (!root) return;
  const slides = qsa('[data-hero-slide]', root);
  const dots = qsa('[data-hero-dot]', root);
  const prev = qs('[data-hero-prev]', root);
  const next = qs('[data-hero-next]', root);
  if (!slides.length) return;
  let index = 0;
  let timer = null;

  const show = (nextIndex) => {
    index = (nextIndex + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle('active', i === index));
    dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
  };

  const start = () => {
    stop();
    timer = window.setInterval(() => show(index + 1), 5600);
  };

  const stop = () => {
    if (timer) window.clearInterval(timer);
  };

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      show(i);
      start();
    });
  });

  if (prev) prev.addEventListener('click', () => {
    show(index - 1);
    start();
  });

  if (next) next.addEventListener('click', () => {
    show(index + 1);
    start();
  });

  root.addEventListener('mouseenter', stop);
  root.addEventListener('mouseleave', start);
  show(0);
  start();
}

function bindLocalFilters() {
  const panel = qs('[data-filter-panel]');
  if (!panel) return;
  const input = qs('[data-filter-input]', panel);
  const chips = qsa('[data-filter-chip]', panel);
  const cards = qsa('[data-card]');
  let active = '';

  const apply = () => {
    const query = input ? input.value.trim().toLowerCase() : '';
    cards.forEach((card) => {
      const hay = [
        card.dataset.title,
        card.dataset.tags,
        card.dataset.genre,
        card.dataset.region,
        card.dataset.year,
        card.dataset.type
      ].join(' ').toLowerCase();
      const okQuery = !query || hay.includes(query);
      const okChip = !active || hay.includes(active.toLowerCase());
      card.style.display = okQuery && okChip ? '' : 'none';
    });
  };

  if (input) input.addEventListener('input', apply);
  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const value = chip.dataset.filterChip || '';
      active = active === value ? '' : value;
      chips.forEach((item) => item.classList.toggle('active', item === chip && active));
      apply();
    });
  });
}

function makeCard(movie) {
  const tags = (movie.tags || []).slice(0, 3).map((tag) => `<span class="pill">${htmlEscape(tag)}</span>`).join('');
  return `
    <article class="movie-card" data-card data-title="${htmlEscape(movie.title)}" data-tags="${htmlEscape((movie.tags || []).join(' '))}" data-genre="${htmlEscape(movie.genre)}" data-region="${htmlEscape(movie.region)}" data-year="${htmlEscape(movie.year)}" data-type="${htmlEscape(movie.type)}">
      <a href="${htmlEscape(movie.url)}" aria-label="${htmlEscape(movie.title)}">
        <div class="poster">
          <img src="${htmlEscape(movie.cover)}" alt="${htmlEscape(movie.title)}封面" loading="lazy">
          <span class="poster-shade"></span>
          <span class="pill poster-year">${htmlEscape(movie.year)}</span>
          <span class="play-badge">▶</span>
        </div>
        <div class="card-body">
          <h3 class="card-title">${htmlEscape(movie.title)}</h3>
          <p class="card-desc">${htmlEscape(movie.oneLine)}</p>
          <div class="card-meta">${tags || `<span class="pill">${htmlEscape(movie.type)}</span>`}</div>
        </div>
      </a>
    </article>`;
}

function bindSearchPage() {
  const root = qs('[data-search-page]');
  if (!root || !window.SEARCH_DATA) return;
  const input = qs('[data-search-input]', root);
  const results = qs('[data-search-results]', root);
  const params = new URLSearchParams(window.location.search);
  const initial = params.get('q') || '';
  if (input) input.value = initial;

  const render = () => {
    const query = input ? input.value.trim().toLowerCase() : '';
    if (!query) {
      results.innerHTML = '<div class="empty-state">输入片名、标签、地区或类型，快速查找想看的内容。</div>';
      return;
    }
    const items = window.SEARCH_DATA.filter((movie) => {
      const hay = [movie.title, movie.oneLine, movie.region, movie.type, movie.genre, ...(movie.tags || [])].join(' ').toLowerCase();
      return hay.includes(query);
    }).slice(0, 240);
    results.innerHTML = items.length
      ? `<div class="movie-grid">${items.map(makeCard).join('')}</div>`
      : '<div class="empty-state">没有找到相关内容，换个关键词再试。</div>';
  };

  if (input) input.addEventListener('input', render);
  const form = qs('[data-search-form]', root);
  if (form) form.addEventListener('submit', (event) => {
    event.preventDefault();
    render();
  });
  render();
}

function bindPlayers() {
  qsa('[data-player]').forEach((player) => {
    const video = qs('video', player);
    const cover = qs('[data-player-cover]', player);
    const button = qs('[data-player-button]', player);
    if (!video) return;
    const stream = video.dataset.stream || '';
    let ready = false;
    let hls = null;

    const prepare = () => {
      if (ready || !stream) return;
      ready = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (Hls && Hls.isSupported()) {
        hls = new Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }
    };

    const play = () => {
      prepare();
      if (cover) cover.classList.add('is-hidden');
      const promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(() => {});
      }
    };

    if (cover) cover.addEventListener('click', play);
    if (button) button.addEventListener('click', (event) => {
      event.stopPropagation();
      play();
    });
    video.addEventListener('click', () => {
      if (!ready) play();
    });
    window.addEventListener('beforeunload', () => {
      if (hls) hls.destroy();
    });
  });
}

bindMenu();
bindSearchForms();
bindHero();
bindLocalFilters();
bindSearchPage();
bindPlayers();
