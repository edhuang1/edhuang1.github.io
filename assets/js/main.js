(function () {
  // Keep the first ten news items visible, even when they wrap on narrow screens.
  var newsScroll = document.querySelector('.news-scroll');
  if (newsScroll) {
    var newsList = newsScroll.querySelector('.news-list');
    var newsItems = newsList.querySelectorAll('li');
    var sizeNews = function () {
      if (newsItems.length <= 10) {
        newsScroll.style.maxHeight = 'none';
        return;
      }
      var lastVisible = newsItems[9];
      var bottomMargin = parseFloat(getComputedStyle(lastVisible).marginBottom) || 0;
      newsScroll.style.maxHeight = (lastVisible.getBoundingClientRect().bottom - newsScroll.getBoundingClientRect().top + newsScroll.scrollTop + bottomMargin) + 'px';
    };
    sizeNews();
    window.addEventListener('resize', sizeNews);
    if (window.ResizeObserver) new ResizeObserver(sizeNews).observe(newsList);
    if (document.fonts) document.fonts.ready.then(sizeNews);
  }

  // The page only shows "user [at] domain"; the real address is assembled on click,
  // so it never appears in the HTML or the rendered page for scrapers to harvest.
  document.querySelectorAll('.js-email').forEach(function (link) {
    link.addEventListener('click', function (event) {
      event.preventDefault();
      window.location.href = 'mailto:' + link.dataset.user + '@' + link.dataset.domain;
    });
  });

  // Show BibTeX inline. Without JavaScript the link still opens the .txt file.
  document.querySelectorAll('.js-bibtex').forEach(function (link) {
    var block = link.closest('.paper-box-text').querySelector('.bibtex-block');
    if (!block) return;
    var code = block.querySelector('code');
    var copy = block.querySelector('.bibtex-copy');

    link.addEventListener('click', function (event) {
      event.preventDefault();
      if (!block.hidden) {
        block.hidden = true;
        return;
      }
      if (block.dataset.loaded) {
        block.hidden = false;
        return;
      }
      fetch(link.href)
        .then(function (response) {
          if (!response.ok) throw new Error(response.status);
          return response.text();
        })
        .then(function (text) {
          code.textContent = text.trim();
          block.dataset.loaded = '1';
          block.hidden = false;
        })
        .catch(function () {
          window.location.href = link.href;
        });
    });

    copy.addEventListener('click', function () {
      var done = function () {
        copy.textContent = 'Copied';
        setTimeout(function () { copy.textContent = 'Copy'; }, 1500);
      };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(code.textContent).then(done);
      } else {
        var range = document.createRange();
        range.selectNodeContents(code);
        var selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        document.execCommand('copy');
        selection.removeAllRanges();
        done();
      }
    });
  });
})();
