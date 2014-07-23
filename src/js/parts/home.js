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
  $('#tags-div').find('.menu')
    .append(
      JST['home-tags']({ tags: tags })
    );
}

function toggleBrands() {
  if (brands.length <= 0) {
    return notify('暂时没有品牌');
  }
  $('#brands-btn').toggleClass('active');
  $('#brands-div').toggleClass('none');
  $('#tags-div').addClass('none');
}
function toggleTags() {
  if (tags.length <= 0) {
    return notify('暂时没有分类');
  }
  $('#tags-btn').toggleClass('active');
  $('#tags-div').toggleClass('none');
  $('#brands-div').addClass('none');
}

var brands;
var tags;

initPage(function () {
  $(function () {
    /* title */
    setTitle(siteTitle);

    /* active */
    $('#footer').find('.fa-home').closest('a')
      .addClass('active').removeAttr('href');

    /* load shop */
    fetchShop(function (shop) {
      brands = shop.brands;
      tags = shop.tags;

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
