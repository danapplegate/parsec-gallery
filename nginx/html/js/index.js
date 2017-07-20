((root, dom) => {

  // IMAGES
  const imageTemplate = image => `
    <div class="screenshot">
      <img class="screenshot-image" src="${ image }">
    </div>
  `.trim();

  const createElement = template => model => {
    const wrapper = dom.createElement('template');
    wrapper.innerHTML = template(model);
    return dom.importNode(wrapper.content, true);
  };

  const renderImage = createElement(imageTemplate);

  // FETCH
  const elementIsVisible = el => {
    const rect = el.getBoundingClientRect();
    return rect.top >= 0 && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight);
  }

  const gallery = document.querySelector('.js-gallery');
  const fetchImages = () => (
    fetch('/images')
      .then(response => response.json())
      .then(response => {
        const fragment = document.createDocumentFragment();
        response.images
          .map(renderImage)
          .forEach(fragment.appendChild.bind(fragment));

        gallery.appendChild(fragment);

        [].slice.call(gallery.childNodes, -3).forEach(image => {
          image.classList.add('next-screenshot');
          image.classList.add('js-next-screenshot');
        });
      })
  );

  fetchImages();

  // INFINITE SCROLL
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

  // UPLOAD
  const uploader = dom.querySelector('.uploader');
  uploader.addEventListener('change', () => {
    const data = new FormData();
    data.append('image', uploader.files[0]);

    fetch('/images', {
      method: 'POST',
      body: data,
    });
  });

})(window, document);
