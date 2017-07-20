((root, dom) => {

  const SCROLL_THRESHOLD = 10;

  window.addEventListener('scroll', () => {
    const position = document.body.scrollTop + window.innerHeight;
    const height = document.body.clientHeight;

    if (position > height - SCROLL_THRESHOLD) {
      const screenshots = dom.querySelectorAll('.js-next-screenshot');

      screenshots.forEach(screenshot => {
        screenshot.classList.add('animating');
      });

      setTimeout(() => {
        screenshots.forEach(screenshot => {
          screenshot.classList.remove('next-screenshot');
          screenshot.classList.remove('js-next-screenshot');
          screenshot.classList.remove('animating');
        });
      }, 500)
    }
  });

})(window, document);
