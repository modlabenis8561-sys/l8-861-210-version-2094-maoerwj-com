(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function attachStream(video, source) {
        if (!video || !source) {
            return null;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            return null;
        }

        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            return hls;
        }

        video.src = source;
        return null;
    }

    ready(function () {
        var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

        players.forEach(function (player) {
            var video = player.querySelector('video');
            var button = player.querySelector('.player-trigger');
            var attached = false;
            var instance = null;

            function start() {
                if (!video) {
                    return;
                }

                if (!attached) {
                    instance = attachStream(video, video.getAttribute('data-stream'));
                    attached = true;
                }

                player.classList.add('is-ready');
                var playPromise = video.play();

                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {
                        player.classList.remove('is-ready');
                    });
                }
            }

            if (button) {
                button.addEventListener('click', start);
            }

            if (video) {
                video.addEventListener('click', function () {
                    if (!attached || video.paused) {
                        start();
                    }
                });

                video.addEventListener('play', function () {
                    player.classList.add('is-ready');
                });

                video.addEventListener('pause', function () {
                    if (video.currentTime === 0) {
                        player.classList.remove('is-ready');
                    }
                });
            }

            window.addEventListener('beforeunload', function () {
                if (instance && typeof instance.destroy === 'function') {
                    instance.destroy();
                }
            });
        });
    });
})();
