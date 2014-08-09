function listOrders(orders) {
  _.each(orders, function (order) {
    order._status = ({
      TRADE_FINISHED: '交易完成',
      TRADE_CLOSED: '订单已取消',
      WAIT_BUYER_CONFIRM_GOODS: '等待买家确认收货',
      WAIT_SELLER_SEND_GOODS: '等待卖家发货',
      WAIT_BUYER_PAY: '等待买家付款',
      WAIT_SELLER_AGREE: '等待卖家同意退货（发货前）',
      WAIT_SELLER_AGREE_AFTER_SENT: '等待卖家同意退货（发货后）',
      WAIT_BUYER_RETURN_GOODS: '等待买家退货',
      WAIT_SELLER_CONFIRM_GOODS: '等待卖家确认收货',
      REFUND_CLOSED: '已退货（发货前）',
      REFUND_SUCCESS: '已退货（发货后）',
      OFFLINE_TRADE_FINISHED: '交易完成',
      OFFLINE_TRADE_CLOSED: '订单已取消',
      OFFLINE_WAIT_SELLER_CONFIRM_MONEY: '等待卖家确认付款',
      OFFLINE_WAIT_BUYER_CONFIRM_GOODS_AND_PAY: '等待买家收货付款',
      OFFLINE_WAIT_SELLER_SEND_GOODS: '等待卖家发货',
      OFFLINE_CANCEL_ORDER_BEFORE_SEND: '等待卖家同意退货',
      OFFLINE_WAIT_BUYER_RETURN_GOODS: '等待买家退货',
      OFFLINE_WAIT_SELLER_CONFIRM_GOODS: '等待卖家确认收货',
      OFFLINE_REFUND_FINISHED: '已退货'
    })[order.status];
  });
  $orders
    .html(
      JST['orders-orders']({
        // order by id desc
        orders: _.sortBy(orders, function(order) {
          return -order.id;
        })
      })
    );

  $orders.find('.action-box button')
    .on('click', function() {
      var $btn = $(this);
      var id = +$btn.closest('.order-box').attr('data-id');
      var action = $btn.attr('data-action');
      if (action === 'wxpay') {
        return doOrder(id, action);
      }
      ask('确定要' + $btn.text() + '吗？', function(ok) {
        if (!ok) return;
        doOrder(id, action);
      });
    });
}

function doOrder(id, action) {
  actionOrder(id, action, function(ok, msg) {
    if (!ok) {
      return notify(msg || '操作失败');
    }
    notify(msg || '操作成功', 0);
  });
}

var $orders = $('#orders-div');

initPage(function () {
  $(function () {
    /* title */
    setTitle('我的订单 - ' + siteTitle, '我的订单');

    /* active */
    $('#footer').find('.fa-user').closest('a')
      .addClass('active').removeAttr('href');

    /* load orders */
    fetchOrdersList(function (orders) {
      // filter orders
      orders = _.filter(orders, function (order) {
        return order.items.length > 0;
      });

      if (orders.length <= 0) {
        return notify('暂时没有订单', true);
      }

      /* list items */
      listOrders(orders);

      /* ready */
      loadReady();
    });
  });
});
