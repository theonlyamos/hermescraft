var handleFiles = function(e, slick=false) {
  const target = e.id;
  const files = e.files;

  for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (!file.type.startsWith('image/')) {
          continue
      }

      if (target == 'pageBannerInput'){
          const img = document.getElementById("pageBanner")

          const reader = new FileReader();
          reader.onload = (function (img) {
              return function (e) {
                img.setAttribute('src', e.target.result);
              };
          })(img);
          reader.readAsDataURL(file);
      }
      else if (target == 'sectionImageInput'){
        const img = document.getElementById("sectionImage")

        const reader = new FileReader();
        reader.onload = (function (img) {
            return function (e) {
              img.setAttribute('src', e.target.result);
            };
        })(img);
        reader.readAsDataURL(file);
      }
      else {
          const thumbnail = document.querySelector(`#${slick} .wrap-pic-w img`);
          const activeSlick =  document.querySelector('.slick-active img');

          const reader = new FileReader();
          reader.onload = (function (athumbnail, activeSlick) {
              return function (e) {
                  athumbnail.setAttribute('src', e.target.result);
                  activeSlick.setAttribute('src', e.target.result);

                  if (target == 'thumbnailSelect'){
                      const thumbView = document.getElementById("thumbnail-preview");
                      thumbView.style.backgroundImage = `url(${e.target.result})`;
                  }
              };
          })(thumbnail, activeSlick);
          reader.readAsDataURL(file);
      }
  }
}