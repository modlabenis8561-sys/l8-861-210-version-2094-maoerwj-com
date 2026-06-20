(function () {
  function startMoviePlayer(options) {
    function init() {
      var video = document.getElementById(options.video);
      var button = document.getElementById(options.button);
      var cover = document.getElementById(options.cover);
      var error = document.getElementById(options.error);
      var started = false;
      var hls = null;

      if (!video || !options.stream) {
        return;
      }

      function showError() {
        if (error) {
          error.hidden = false;
        }
      }

      function hideCover() {
        if (cover) {
          cover.classList.add("is-hidden");
        }
      }

      function playVideo() {
        var action = video.play();
        if (action && typeof action.catch === "function") {
          action.catch(function () {});
        }
      }

      function bindStream() {
        if (started) {
          playVideo();
          return;
        }
        started = true;
        hideCover();

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = options.stream;
          video.addEventListener("loadedmetadata", playVideo, { once: true });
          video.addEventListener("error", showError, { once: true });
          video.load();
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            maxBufferLength: 30,
            enableWorker: true
          });
          hls.loadSource(options.stream);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
          hls.on(window.Hls.Events.ERROR, function (eventName, data) {
            if (data && data.fatal) {
              showError();
            }
          });
          return;
        }

        video.src = options.stream;
        video.addEventListener("error", showError, { once: true });
        video.load();
        playVideo();
      }

      if (button) {
        button.addEventListener("click", bindStream);
      }

      if (cover) {
        cover.addEventListener("click", bindStream);
      }

      video.addEventListener("click", function () {
        if (!started) {
          bindStream();
        }
      });

      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
        }
      });
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", init);
    } else {
      init();
    }
  }

  window.startMoviePlayer = startMoviePlayer;
})();
