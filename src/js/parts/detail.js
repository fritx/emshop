function showItem(item) {
  $('#item-div')
    .html(
      JST['detail-item']({ item: item })
    );
}

function addToCart(silient, cb) {
  var num = 1;
  if (!item.onSale || num > item.store) {
    return notify('正在补货中，明天才可以购买哦~');
  }

  fetchCartItems(function(items) {
    var itemIn = _.findWhere(items, { id: id });
    if (itemIn) {
      itemIn.num += num;
    } else {
      items.push({
        id: id,
        num: num,
        checked: true
      });
    }
    saveCart(items, function() {
      if (!silient) {
        notify('已加入购物车');
      }
      if (cb) {
        cb();
      }
    });
  });
}

function gotoCart() {
  addToCart(true, function () {
    link('cart/');
  });
}

/* parse parameters */
var id = +params.id;
var item;

initPage(function () {
  $(function () {
    /* load item */
    fetchProduct({ id: id }, function (_item) {
      item = _item;

      if (!item) {
        notify('宝贝不存在', true);
      }

      /* title */
      setTitle(item.title + ' - ' + siteTitle, '宝贝详情');

      /* extend item */
      calcPrice(item);

      item.description = (function(desc) {
        desc = desc.trim();
        desc = desc.replace(
          /<img src="([^"]*)"([^>]*)>/g,
          '<div class="lazy-box unloaded"><img class="lazy" data-original="$1"$2></div>'
        );
        return desc;
      })(item.description);

      /* display item */
      showItem(item);

      /* ready */
      loadReady();
    });
  });
});
