((root, dom) => {

  const SCROLL_THRESHOLD = 20;

  window.addEventListener('scroll', event => {
    console.log(window.scrollTop + window.innerHeight, document.body.clientHeight);
  });

})(window, document);
