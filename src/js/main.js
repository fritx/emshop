function searchToParams(search) {
  if (arguments.length === 0) {
    search = location.href;
  }
  var pat = /([^?=&#]*)=([^?=&#]+)/g, params = {};
  decodeURIComponent(search)
    .replace(pat, function (a, b, c) {
      if (b in params) {
        if (!_.isArray(params[b])) {
          params[b] = [params[b]];
        }
        params[b].push(c);
      } else {
        params[b] = c;
      }
    });
  return params;
}

function paramsToSearch(params) {
  return _.reduce(params, function (str, val, key) {
    if (val == null) return str;
    var arr = _.isArray(val) ? val : [val];
    return str + (str ? '&' : '?') +
      _.reduce(arr, function (segs, v) {
        return segs + (segs ? '&' : '') + key + '=' + encodeURIComponent(v);
      }, '');
  }, '');
}

function loadReady() {
  _.delay(function () {
    $('.back-btn').find('i').toggleClass('fa-spinner fa-spin fa-angle-left');
  }, 300);
  // show content
  //$('#content').removeClass('none');
  // jquery lazyload
  // placeholder not work due to zepto
  $('img.lazy').lazyload({
    load: function () {
      $(this).closest('.lazy-box').removeClass('unloaded');
    },
    threshold: 200,
    effect: 'fadeIn'
  });
}

function toggleFooter(show) {
  var $footer = $('#footer');
  if (show) {
    $footer.removeClass('none');
  } else {
    $footer.addClass('none');
  }
}
function makeFooterToggle() {
  var $window = $(window);
  var H = $window.height();
  $window.on('resize', _.debounce(function () {
    var h = $window.height();
    if (h < 0.7 * H) {
      toggleFooter(false);
    } else {
      // fix weixin keyboard toggle bug
      $window.scrollTop($window.scrollTop() - 1);
      toggleFooter(true);
    }
    H = h;
  }, 300));
}

function revert(params) {
  if (history.length <= 2) return link('home/', params);
  history.back();
}
function link(href, _params) {
  if (href === true) href = location.href;
  var matched = /^([^\?]*)(.*)$/.exec(href);
  var path = matched[1];
  var search = matched[2];
  var newParams = searchToParams(search);
  _.extend(newParams, _params);
  // prepend area
  newParams = _.extend({
    area: area && area.id
  }, newParams);
  location.href = path + paramsToSearch(newParams);
}
function notify(msg, back) {
  // message
  alertify.alert(msg, function () {
    // redirect
    if (back === true) {
      revert();
    } else if (back === 0) {
      link(true);
    } else if (_.isString(back)) {
      link(back);
    } else if (_.isFunction(back)) {
      back();
    }
  });
}
function ask(msg, cb) {
  alertify.confirm(msg, cb);
}

function calcPrice(item) {
  item._price = item.promotingPrice != null ?
    item.promotingPrice :
    item.shopPrice;
}
function checkOnSale(item, num) {
  return item.onSale && item.store >= (num || 0);
}
function saveOrderInfo(info, cb) {
  store.set('order_info', info);
  cb();
}
function fetchCartItems(cb) {
  var items = store.get('cart_items');
  cb(items);
}
function saveCart(xItems, cb) {
  store.set('cart_items', _(xItems).chain().map(function (xItem) {
    return _.pick(xItem, ['id', 'num', 'checked']);
  }).sortBy('id').value());
  cb();
}
function fetchCurrOrderItems(cb) {
  var items = store.get('curr_order_items');
  cb(items);
}
function saveCurrOrder(xItems, cb) {
  store.set('curr_order_items', _(xItems)
    .chain().map(function (xItem) {
      return _.pick(xItem, ['id', 'num']);
    }).sortBy('id').value());
  cb();
}

function setTitle(title, shortTitle) {
  $('title').text(title);
  $('.title-text').text(shortTitle || title);
}

function getVal($el) {
  if ($el.attr('type') === 'radio') {
    return $el.filter(':checked').val();
  }
  if ($el.attr('type') === 'checkbox') {
    return $el.filter(':checked').map(function() {
      return $(this).val();
    });
  }
  return $el.val();
}

/* init */
var siteTitle = $('title').text();
var params = searchToParams();
var area, opid;

if (!$().text || !store.enabled) {
  notify('你的浏览器没跟上时代啊!');
  throw new Error('Browser too bad.');
}

_.templateSettings = {
  evaluate: /{{([\s\S]+?)}}/g,
  interpolate: /{{=([\s\S]+?)}}/g,
  escape: /{{-([\s\S]+?)}}/g
};

alertify.set({
  labels: {
    ok: '好的',
    cancel: '不要'
  }
});

store.set('cart_items', store.get('cart_items') || []);
store.set('curr_order_items', store.get('curr_order_items') || []);
store.set('order_info', store.get('order_info') || {});
store.set('wx_opid', store.get('wx_opid') || 'consumerOPID');

opid = params.consumerOPID || store.get('wx_opid');
store.set('wx_opid', opid);
if (params.consumerOPID) {
  link(location.href, { consumerOPID: null });
}

$(function () {
  /* toggling footer */
  makeFooterToggle();

  /* delegate links */
  $(document).delegate('[href]', 'click', function (e) {
    if (!(e.ctrlKey || e.shiftKey || e.metaKey)) {
      e.preventDefault();
      link($(this).attr('href'));
    }
  });
});

function initPage(cb) {
  fetchAreasList(function (areas) {
    fetchOrderInfo(function(info) {
      area = params.area ? _.findWhere(areas, { id: +params.area }) :
        _.findWhere(areas, { title: info.area }) || areas[0];
      if (!area) {
        notify('你的地区信息为空啊!');
        throw new Error('Empty area.');
      }
      if (!params.area) return link(location.href);

      saveData({
        area: area, opid: opid
      }, function (ok) {
        if (!ok) {
          notify('你的地区信息不正确啊!');
          throw new Error('Invalid area.');
        }

        cb();
      });
    });
  });
}
