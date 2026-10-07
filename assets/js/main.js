(function () {
  // Assemble email links here so the address never appears in plain HTML.
  document.querySelectorAll('.js-email').forEach(function (link) {
    var address = link.dataset.user + '@' + link.dataset.domain;
    link.href = 'mailto:' + address;
    if (link.dataset.show === 'address') link.textContent = address;
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
