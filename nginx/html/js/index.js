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
    return rect.top >= 0 && rect.bottom <= (root.innerHeight || dom.documentElement.clientHeight);
  }

  const gallery = dom.querySelector('.js-gallery');
  const fetchImages = () => fetch('/images').then(response => response.json());

  const appendImages = response => {
    const fragment = dom.createDocumentFragment();
    response.images
      .map(renderImage)
      .forEach(fragment.appendChild.bind(fragment));

    gallery.appendChild(fragment);

    [].slice.call(gallery.childNodes, -3).forEach(image => {
      if (!elementIsVisible(image)) {
        image.classList.add('next-screenshot');
        image.classList.add('js-next-screenshot');
      }
    });
  };

  fetchImages().then(appendImages);

  // INFINITE SCROLL
  let animating = false;
  const SCROLL_THRESHOLD = 10;
  const galleryWrapper = dom.querySelector('.js-gallery-wrapper');
  galleryWrapper.addEventListener('scroll', () => {
    const position = galleryWrapper.scrollTop + galleryWrapper.clientHeight;
    const height = gallery.clientHeight;

    if (!animating && position > height - SCROLL_THRESHOLD) {
      animating = true;
      const nextPage = fetchImages();

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

        nextPage.then(appendImages);
        animating = false;
      }, 500);
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
