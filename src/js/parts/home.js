function showBanner(banner) {
  $('#banner').find('.lazy-box')
    .html(
      JST['home-banner']({ banner: banner })
    );
}

function listBoards(boards) {
  $('#boards-div')
    .html(
      JST['home-boards']({ boards: boards })
    );
}

function listBrands() {
  $('#brands-div').find('.menu')
    .append(
      JST['home-brands']({ brands: brands })
    );
}

function showBrands() {
  if (brands.length <= 0) {
    return notify('暂时没有品牌');
  }
  $('#brands-btn').toggleClass('active');
  $('#brands-div').toggleClass('none');
}

var brands;

initPage(function () {
  $(function () {
    /* title */
    setTitle('Great Me');

    /* active */
    $('#footer').find('.fa-home').closest('a')
      .addClass('active').removeAttr('href');

    /* load shop */
    fetchShop(function (shop) {
      brands = _.map(shop.brands, function (brand) {
        return {
          name: brand
        };
      });

      /* display banner */
      showBanner(shop.banner);

      /* display boards */
      listBoards(shop.boards);

      /* display brands */
      listBrands();

      /* ready */
      loadReady();
    });
  });
});
