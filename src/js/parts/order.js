function showForm(info) {
  // default fields
  fields = [
    [
      {
        readonly: true,
        title: '地　区',
        key: 'area',
        value: area.title
      },
      {
        title: '收货人',
        key: 'signer_name'
      },
      {
        title: '收货人电话',
        key: 'signer_tel'
      },
      {
        title: '收货人地址',
        key: 'signer_addr'
      },
      {
        title: '付款人电话',
        key: 'payer_tel'
      }
    ],
    [
      {
        title: '付款方式',
        key: 'pay_way',
        type: 'select',
        list: {
          '货到付款': 'offline'
        }
      },
      {
        title: '使用优惠券',
        key: 'coupon'
      }
    ],
    [
      {
        key: 'message',
        placeholder: '备注信息'
      }
    ]
  ];
  _fields = _.flatten(fields);

  // fill info
  if (info) {
    _.each(_fields, function (field) {
      field.value = info[field.key] || field.value;
    });
  }
  $('#form-div')
    .html(JST['order-order']({
      fields: fields,
      cost: _.reduce(oItems, function (memo, oItem) {
        return memo + oItem._price * oItem.num;
      }, 0)
    }));
}

function emptyCurrOrder(cb) {
  fetchCart(function (cItems) {
    /* cut from cart items */
    _.each(oItems, function (oItem) {
      var cItem = _.findWhere(cItems, { id: oItem.id });
      if (cItem != null) {
        cItem.num -= oItem.num;
      }
    });
    cItems = _.filter(cItems, function (cItem) {
      return cItem.num > 0;
    });

    saveCart(cItems, function () {
      saveCurrOrder(oItems = [], function () {
        cb();
      });
    });
  });
}

function toggleButton(ok) {
  if (ok) {
    $('.submit-btn').removeAttr('disabled');
  } else {
    $('.submit-btn').attr('disabled', true);
  }
}

function submitOrder() {
  // disable submit button
  toggleButton(false);
  var info = _.reduce(_fields, function (memo, field) {
    var $el = $('[name='+ field.key +']');
    memo[$el.attr('name')] = getVal($el);
    return memo;
  }, {});
  if (_.some([
    'area', 'signer_name', 'signer_tel', 'signer_addr',
    'payer_tel', 'pay_way'
  ], function (key) {
    return info[key] === '';
  })) {
    notify('订单填写不完整');
    return toggleButton(true);
  }
  if (!info.coupon) return confirmOrder(oItems, info);
  checkCoupon(info.coupon, function(data) {
    if (!data) {
      notify('优惠券码不正确');
      return toggleButton(true);
    }
    notify(data.message, function() {
      if (data.times < 1) return toggleButton(true);
      confirmOrder(oItems, info);
    });
  });
}

function confirmOrder(oItems, info) {
  ask('确定提交订单?', function (ok) {
    if (!ok) {
      return toggleButton(true);
    }
    saveOrder(oItems, info, function (ok) {
      if (!ok) {
        toggleButton(true);
        return notify('部分商品仍在补货中，可以先购买其他的~');
      }
      emptyCurrOrder(function () {
        notify([
          '提交成功！',
          '我们将会在送货前通知您。',
        ].join(''), 'orders/');
      });
    });
  });
}

/* variables */
var fields, _fields;
var oItems;
var $coupon;

initPage(function () {
  $(function () {
    /* title */
    setTitle('确认下单 - Great Me', '确认下单');

    /* load order */
    fetchCurrOrder(function (_oItems) {
      oItems = _oItems;

      if (oItems.length <= 0) {
        return notify('没有勾选的宝贝', true);
      }

      fetchOrderInfo(function (info) {
        setDormsList(function () {
          /* list items */
          showForm(info);
          $coupon = $('[name="coupon"]');

          /* ready */
          loadReady();
        });
      });
    });
  });
});
