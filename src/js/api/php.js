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
  o.way = o.way || ({
    'id': 'id',
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
          name: order.consumer_name,
          tel: order.telephone,
          address: order.address,
          pay_way: order.payway,
          message: order.message,
          items: xItems,
          cost: +order.discount_price,
          price: +order.price,
          discount: order.coupons_message,
          returnable: !!order.returnable,
          express: order.expressno ? [
            order.company + ' ' + order.expressno
          ] : [],
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
function fetchOrderInfo(cb) {
  var localInfo = store.get('order_info');
  $.get('../getaddress.php', function(data) {
    var onlineInfo = JSON.parse(data);
    var info = _.defaults({
      signer_name: onlineInfo.consumer_name,
      signer_tel: onlineInfo.telephone,
      signer_addr: onlineInfo.address,
      payer_tel: onlineInfo.payer_telephone
    }, localInfo);
    cb(info);
  });
}
function saveOrder(oItems, info, cb) {
  saveOrderInfo(info, function () {
    validate(function(ok) {
      if (!ok) return cb(false);
      checkCoupon(info.coupon, function(ok) {
        if (!ok) return cb(0);
        $.post('../orderaction.php?action=order', {
          consumer_name: info.signer_name,
          telephone: info.signer_tel,
          address: info.signer_addr,
          payer_telephone: info.payer_tel,
          payway: info.pay_way,
          message: info.message,
          coupons: info.coupon,
          products_id: _.pluck(oItems, 'id').join(','),
          products_amounts: _.pluck(oItems, 'num').join(',')
        }, function (data) {
          if (!/^\d+$/.test(data)) return cb(false, null, data);
          cb(true, parseInt(data));
        });
      });
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
function saveData(data, cb) {
  fetchOrderInfo(function(info) {
    info.area = data.area.title;
    saveOrderInfo(info, function() {
      $.post('../setarea.php', {
        area_id: data.area.id
      }, function (area) {
        $.post('../setconsumer.php', {
          consumerOPID: data.opid
        }, function () {
          cb(!!area);
        });
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
function linkWxpay(id) {
  link('../wxpay/jsapicall.php?showwxpaytitle=1&id=' + id);
}
function linkAfterOrder(id) {
  linkWxpay(id);
}
function actionOrder(id, action, cb) {
  validate(function(ok) {
    if (!ok) return cb(false);
    if (action === 'wxpay') {
      return linkWxpay(id);
    }
    if (_.contains([
      'WAIT_SELLER_AGREE', 'WAIT_SELLER_AGREE_AFTER_SENT'
    ], action)) {
      $.get('../wxpay/tenpay/index.php?id=' + id, tenpayOrder);
    } else if (action === 'WAIT_SELLER_CONFIRM_GOODS') {
      $.get('../wxpay/tenpay/buyersend.php?id=' + id, tenpayOrder);
    } else {
      doOrder();
    }
  });
  function tenpayOrder(data) {
    if (data !== 'success') {
      return cb(false, '微信请求失败,请稍后重试');
    }
    doOrder();
  }
  function doOrder() {
    $.post('../orderaction.php?action=' + action, {
      order_id: id
    }, function(data) {
      cb(data === 'ok');
    });
  }
}
function checkCoupon(code, cb) {
  $.get('../checkcoupons.php', {
    coupons: code
  }, function(data) {
    data = JSON.parse(data)
    cb({
      times: +data.unused_time,
      message: data.message
    });
  });
}
function validate(cb) {
  $.get('../verification.php', function(data) {
    data = JSON.parse(data);
    if (data.status === 'yes') return cb(true);
    $.get('../verification.php', {
      vcode: _encrypt(data.randcode)
    }, function(data) {
      data = JSON.parse(data);
      return cb(data.status === 'yes');
    });
  });
}
function _encrypt(str) {}
