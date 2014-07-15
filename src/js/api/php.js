function fetchShop(cb) {
  $.get('../gettags.php', function (data) {
    var shop = JSON.parse(data);
    // TODO: php side has no banner yet
    shop.banner = shop.banner || (shop.banners && shop.banners[0]) || {
      alt: 'Great Me',
      src: 'content/shop/banners/0.jpg',
      url: null
    };
    cb({
      brands: shop.brands,
      tags: shop.tags,
      banner: {
        alt: shop.banner.alt,
        src: shop.banner.src,
        href: tran(shop.banner.url)
      },
      boards: _.map(shop.advs, function (adv) {
        return {
          alt: adv.alt,
          src: adv.src,
          href: tran(adv.url)
        };
      })
    });
  });
  function tran(url) {
    return url.replace('http://greatme.org/s/detail.html', 'detail/');
  }
}
function fetchProductsList(opt, cb) {
  opt = opt || {};
  var brand = opt.brand, tags = opt.tags,
    keyword = opt.keyword,
    orderVal = opt.orderVal, orderKey = opt.orderKey;
  var o = {}, url;
  o.way = ({
    'sales': 'sales',
    'price': 'low_price'
  })[orderKey] + '_' + ({
    '-1': 'DESC',
    '1': 'ASC'
  })[orderVal];

  if (keyword) {
    url = '../search.php';
    o.keyword = keyword;
  } else {
    url = '../getgoodslist.php';
    if (brand) {
      o.brand = brand;
    } else if (tags) {
      o.tags = tags[0];
    }
  }

  $.get(url, o, function (data) {
    var dItems = JSON.parse(data);
    var items = _.map(dItems, parseItem);
    cb(items);
  });
}
function fetchProduct(opt, cb) {
  $.get('../getgoods.php?id=' + opt.id, function (data) {
    var dItems = JSON.parse(data);
    var item = parseItem(dItems && dItems[0]);
    cb(item);
  });
}
function fetchCart(cb) {
  fetchCartItems(function(cItems) {
    if (cItems.length <= 0) {
      return cb(cItems);
    }
    async.map(cItems, function (cItem, next) {
      fetchProduct({ id: cItem.id }, function (item) {
        if (item == null) {
          return next(null, item);
        }
        var xItem = _.extend(cItem, {
          title: item.title,
          image: item.image,
          store: item.store,
          onSale: item.onSale,
          _price: item._price
        });
        next(null, xItem);
      });
    }, function (err, xItems) {
      cb(_.compact(xItems));
    });
  });
}
function fetchCurrOrder(cb) {
  fetchCurrOrderItems(function(oItems) {
    async.map(oItems, function (oItem, next) {
      fetchProduct({ id: oItem.id }, function (item) {
        if (!item) {
          return next(null, null);
        }
        var xItem = _.extend(oItem, {
          _price: item._price
        });
        next(null, xItem);
      });
    }, function (err, xItems) {
      cb(_.compact(xItems));
    });
  });
}
function fetchOrdersList(cb) {
  $.get('../orderaction.php?action=get', {
    consumerOPID: 'consumerOPID'  // testing
  }, function(data) {
    var orders = JSON.parse(data);
    if (orders.length <= 0) {
      return cb(orders);
    }
    async.map(orders, function (order, next) {
      var ids = order.products_id.split(',');
      var amounts = order.products_amounts.split(',');
      var dItems = _.map(ids, function(id, i) {
        return {
          id: id,
          num: amounts[i]
        };
      });
      async.map(dItems, function (dItem, next) {
        fetchProduct({ id: dItem.id }, function (item) {
          if (!item) {
            return next(null, null);
          }
          var xItem = _.extend(dItem, {
            title: item.title,
            image: item.image,
            price: item._price
          });
          next(null, xItem);
        });
      }, function (err, xItems) {
        order.items = _.compact(xItems);
        if (order.items.length <= 0) {
          return next(null, null);
        }
        var xOrder = {
          id: +order.id,
          area: order.area,
          signer_name: order.consumer_name,
          signer_tel: order.telephone,
          signer_addr: order.address,
          payer_tel: order.payer_telephone,
          pay_way: order.payway,
          message: order.message,
          items: xItems,
          cost: +order.price,
          status: order.pStatus
        };
        next(null, xOrder);
      });
    }, function (err, xOrders) {
      cb(_.compact(xOrders));
    });
  });
}
function checkAllOnSale(oItems, cb) {
  async.every(oItems, function (oItem, next) {
    fetchProduct({ id: oItem.id }, function (item) {
      next(checkOnSale(item, oItem.num));
    });
  }, function (ok) {
    cb(ok);
  });
}
function saveOrder(oItems, info, cb) {
  saveOrderInfo(info, function () {
    $.post('../orderaction.php?action=order', {
      consumer_name: info.signer_name,
      telephone: info.signer_tel,
      address: info.signer_addr,
      payer_telephone: info.payer_tel,
      payway: info.pay_way,
      message: info.message,
      products_id: _.pluck(oItems, 'id').join(','),
      products_amounts: _.pluck(oItems, 'num').join(',')
    }, function (data) {
      cb(data === 'ok');
    });
  });
}
function parseItem(dItem) {
  if (!dItem) {
    return null;
  }
  var item = {
    id: +dItem.id,
    title: dItem.title,
    description: dItem.description,
    image: dItem.small_url,
    imageLarge: dItem.large_url,
    sales: +dItem.sales,
    store: +dItem.kucun,
    onSale: dItem.on_sale === '1',
    promotingPrice: dItem.low_price ? +dItem.low_price : null,
    shopPrice: +dItem.middle_price,
    marketPrice: +dItem.high_price
  };
  calcPrice(item);
  return item;
}
function fetchAreasList(cb) {
  $.get('../getarealist.php', function (data) {
    var areas = JSON.parse(data);
    cb(_.map(areas, function (area) {
      return {
        id: +area.id,
        title: area.areaname
      };
    }));
  });
}
function saveArea(area, cb) {
  fetchOrderInfo(function(info) {
    info.area = area.title;
    saveOrderInfo(info, function() {
      $.post('../setarea.php', {
        area_id: area.id
      }, function (area) {
        cb(!!area);
      });
    });
  });
}
function setDormsList(cb) {
  $.get('../getdormitories.php', function (data) {
    area.dorms = JSON.parse(data);
    cb();
  });
}
function actionOrder(id, action, cb) {
  $.post('../orderaction.php?action=' + action, {
    order_id: id
  }, function(data) {
    cb(data === 'ok');
  });
}
