((root, dom) => {

  const SCROLL_THRESHOLD = 10;

  window.addEventListener('scroll', () => {
    const position = document.body.scrollTop + window.innerHeight;
    const height = document.body.clientHeight;

    if (position > height - SCROLL_THRESHOLD) {
      dom.querySelectorAll('.js-next-screenshot').forEach(screenshot => {
        screenshot.classList.add('animating');
      });
    }
  });

})(window, document);
