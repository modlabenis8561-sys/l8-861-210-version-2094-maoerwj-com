(function () {
  function startPlayer(shell) {
    var video = shell.querySelector("video");
    var button = shell.querySelector(".play-overlay");
    if (!video) {
      return;
    }
    var stream = video.getAttribute("data-stream");
    if (!stream) {
      return;
    }
    if (!video.getAttribute("data-ready")) {
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 90
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        video.hlsController = hls;
      } else {
        video.src = stream;
      }
      video.setAttribute("data-ready", "true");
    }
    if (button) {
      button.classList.add("is-hidden");
    }
    var promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {
        if (button) {
          button.classList.remove("is-hidden");
        }
      });
    }
  }

  function bind() {
    Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(function (shell) {
      var button = shell.querySelector(".play-overlay");
      var video = shell.querySelector("video");
      if (button) {
        button.addEventListener("click", function () {
          startPlayer(shell);
        });
      }
      if (video) {
        video.addEventListener("click", function () {
          if (!video.getAttribute("data-ready")) {
            startPlayer(shell);
          }
        });
        video.addEventListener("play", function () {
          if (button) {
            button.classList.add("is-hidden");
          }
        });
        video.addEventListener("pause", function () {
          if (button && !video.currentTime) {
            button.classList.remove("is-hidden");
          }
        });
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bind);
  } else {
    bind();
  }
})();
