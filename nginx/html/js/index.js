((root, dom) => {

  // IMAGES
  const imageTemplate = image => `
    <div class="screenshot" href="/?${ image }">
      <img class="screenshot-image" src="/images/${ image }">
      <div class="screenshot-share">
        <a class="screenshot-share-link" href="#">
          <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="24px" height="24px" viewBox="0 0 24 24" enable-background="new 0 0 24 24" xml:space="preserve">
            <g transform="translate(0, 0)">
              <path d="M22,0H2C0.895,0,0,0.895,0,2v20c0,1.105,0.895,2,2,2h11v-9h-3v-4h3V8.413c0-3.1,1.893-4.788,4.659-4.788
            c1.325,0,2.463,0.099,2.795,0.143v3.24l-1.918,0.001c-1.504,0-1.795,0.715-1.795,1.763V11h4.44l-1,4h-3.44v9H22c1.105,0,2-0.895,2-2
            V2C24,0.895,23.105,0,22,0z"></path>
            </g>
          </svg>
        </a>
        <a class="screenshot-share-link" href="#">
          <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="24px" height="24px" viewBox="0 0 24 24" enable-background="new 0 0 24 24" xml:space="preserve">
            <g transform="translate(0, 0)">
              <path d="M24,4.6c-0.9,0.4-1.8,0.7-2.8,0.8c1-0.6,1.8-1.6,2.2-2.7c-1,0.6-2,1-3.1,1.2c-0.9-1-2.2-1.6-3.6-1.6c-2.7,0-4.9,2.2-4.9,4.9c0,0.4,0,0.8,0.1,1.1C7.7,8.1,4.1,6.1,1.7,3.1C1.2,3.9,1,4.7,1,5.6c0,1.7,0.9,3.2,2.2,4.1C2.4,9.7,1.6,9.5,1,9.1c0,0,0,0,0,0.1c0,2.4,1.7,4.4,3.9,4.8c-0.4,0.1-0.8,0.2-1.3,0.2c-0.3,0-0.6,0-0.9-0.1c0.6,2,2.4,3.4,4.6,3.4c-1.7,1.3-3.8,2.1-6.1,2.1c-0.4,0-0.8,0-1.2-0.1c2.2,1.4,4.8,2.2,7.5,2.2c9.1,0,14-7.5,14-14c0-0.2,0-0.4,0-0.6C22.5,6.4,23.3,5.5,24,4.6z"></path>
            </g>
          </svg>
        </a>
      </div>
    </div>
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
  let transitioning = false;
  const ANIMATION_THRESHOLD = 150;
  const TRANSITION_THRESHOLD = 10;
  const onScroll = () => {
    const position = dom.body.scrollTop + root.innerHeight;
    const height = gallery.clientHeight;

    if (transitioning) { return; }
    const screenshots = dom.querySelectorAll('.js-next-screenshot');

     if (position > height - TRANSITION_THRESHOLD) {
      transitioning = true;
      const nextPage = fetchImages(count);

      screenshots.forEach(screenshot => {
        screenshot.style.transform = '';
        screenshot.classList.add('transitioning');
      });

      setTimeout(() => {
        screenshots.forEach(screenshot => {
          screenshot.classList.remove('next-screenshot');
          screenshot.classList.remove('js-next-screenshot');
          screenshot.classList.remove('transitioning');
        });

        nextPage.then(appendImages);
        transitioning = false;
      }, 500);

      nextPage.then(response => {
        if (!response.images.length) {
          root.removeEventListener('scroll', onScroll);
        }
      });
    } else if (position > height - ANIMATION_THRESHOLD) {
      const distance = (position - (height - ANIMATION_THRESHOLD)) / (ANIMATION_THRESHOLD - TRANSITION_THRESHOLD);

      screenshots[0].style.transform = `translate(${ 20 - distance * 4 }%, ${ 85 - distance * 14 }%) rotate(${ -16 + distance * 6 }deg)`;
      screenshots[1].style.transform = `translate(${ 100 }%, ${ 65 - distance * 22 }%) rotate(${ -4 + distance * 2 }deg)`;
      screenshots[2].style.transform = `translate(${ 180 + distance * 4 }%, ${ 80 - distance * 16 }%) rotate(${ 14 - distance * 6 }deg)`;
    }
  };

  // UPLOAD
  // const overlay = dom.querySelector('.js-overlay');
  // overlay.addEventListener('click', () => {
  //   overlay.classList.remove('visible');
  // });

  // const modal = dom.querySelector('.js-modal');
  // modal.addEventListener('click', event => {
  //   event.stopPropagation();
  // });

  // const uploadToggle = dom.querySelector('.js-upload-toggle');
  // uploadToggle.addEventListener('click', () => {
  //   overlay.classList.toggle('visible');
  // });

  // const uploadInput = dom.querySelector('.js-upload-input');

  // const uploadSubmit = dom.querySelector('.js-upload-submit');
  // uploadSubmit.addEventListener('click', () => {
  //   const data = new FormData();
  //   data.append('image', uploadInput.files[0]);

  //   fetch('/images', {
  //     method: 'POST',
  //     body: data,
  //   })
  //     .then(response => response.json())
  //     .then(response => {
  //       gallery.prepend(renderImage(response.path));
  //       overlay.classList.remove('visible');
  //     });
  // });

  // BOOTSTRAP
  // if (root.location.search) {
  //   const hero = dom.querySelector('.js-hero');
  //   hero.appendChild(renderHero(root.location.search.slice(1)));
  //   document.querySelectorAll('.js-hero-page').forEach(node => node.classList.add('visible'));
  // } else {
    fetchImages().then(appendImages);
    root.addEventListener('scroll', onScroll);
    // document.querySelectorAll('.js-gallery-page').forEach(node => node.classList.add('visible'));
  // }


})(window, document);
