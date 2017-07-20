((root, dom) => {

  // IMAGES
  const imageTemplate = image => `
    <a class="screenshot" href="/?${ image }">
      <img class="screenshot-image" src="/images/${ image }">
    </a>
  `.trim();

  const heroTemplate = image => `
    <img class="hero-image" src="/images/${ image }">
  `

  const createElement = template => model => {
    const wrapper = dom.createElement('template');
    wrapper.innerHTML = template(model);
    return dom.importNode(wrapper.content, true);
  };

  const renderImage = createElement(imageTemplate);
  const renderHero = createElement(heroTemplate);

  // FETCH
  let count = 0;

  const elementIsVisible = el => {
    const rect = el.getBoundingClientRect();
    return rect.top >= 0 && rect.bottom <= (root.innerHeight || dom.documentElement.clientHeight);
  }

  const gallery = dom.querySelector('.js-gallery');
  const fetchImages = (offset = 0, limit = 9) => fetch(`/images?offset=${ offset }&limit=${ limit }`).then(response => response.json());

  const appendImages = response => {
    const fragment = dom.createDocumentFragment();
    response.images
      .map(renderImage)
      .forEach(fragment.appendChild.bind(fragment));

    gallery.appendChild(fragment);
    count += response.images.length;

    [].slice.call(gallery.childNodes, -3).forEach(image => {
      if (!elementIsVisible(image)) {
        image.classList.add('next-screenshot');
        image.classList.add('js-next-screenshot');
      }
    });
  };

  // INFINITE SCROLL
  let animating = false;
  const SCROLL_THRESHOLD = 10;
  const onScroll = () => {
    const position = dom.body.scrollTop + root.innerHeight;
    const height = gallery.clientHeight;

    if (!animating && position > height - SCROLL_THRESHOLD) {
      animating = true;
      const nextPage = fetchImages(count);

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

      nextPage.then(response => {
        if (!response.images.length) {
          root.removeEventListener('scroll', onScroll);
        }
      });
    }
  };

  // UPLOAD
  const overlay = dom.querySelector('.js-overlay');
  overlay.addEventListener('click', () => {
    overlay.classList.remove('visible');
  });

  const modal = dom.querySelector('.js-modal');
  modal.addEventListener('click', event => {
    event.stopPropagation();
  });

  const uploadToggle = dom.querySelector('.js-upload-toggle');
  uploadToggle.addEventListener('click', () => {
    overlay.classList.toggle('visible');
  });

  const uploadInput = dom.querySelector('.js-upload-input');

  const uploadSubmit = dom.querySelector('.js-upload-submit');
  uploadSubmit.addEventListener('click', () => {
    const data = new FormData();
    data.append('image', uploadInput.files[0]);

    fetch('/images', {
      method: 'POST',
      body: data,
    })
      .then(response => response.json())
      .then(response => {
        gallery.prepend(renderImage(response.path));
        overlay.classList.remove('visible');
      });
  });

  // BOOTSTRAP
  if (root.location.search) {
    const hero = dom.querySelector('.js-hero');
    hero.appendChild(renderHero(root.location.search.slice(1)));
    document.querySelectorAll('.js-hero-page').forEach(node => node.classList.add('visible'));
  } else {
    fetchImages().then(appendImages);
    root.addEventListener('scroll', onScroll);
    document.querySelectorAll('.js-gallery-page').forEach(node => node.classList.add('visible'));
  }


})(window, document);
