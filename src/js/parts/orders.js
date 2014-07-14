function listOrders(orders) {
  _.each(orders, function (order) {
    order.cost = _.reduce(order.items, function (memo, item) {
      return memo + item.price * item.num;
    }, 0);
    order._status = ({
      WAIT_SELLER_SEND_GOODS: '等待卖家发货',
      WAIT_BUYER_CONFIRM_GOODS_AND_PAY: '等待买家收货并付款',
      WAIT_SELLER_AGREE: '等待卖家同意退货 (未发)',
      WAIT_SELLER_AGREE_AFTER_SENT: '等待卖家同意退货 (已发)',
      REFUND_CLOSED: '已退货',
      TRADE_FINISHED: '交易完成'
    })[order.status];
  });
  $orders
    .html(
      // reverse orders
      JST['orders-orders']({ orders: orders.reverse() })
    );

console.log($orders.find('.action-box button'))

  $orders.find('.action-box button')
    .on('click', function() {
      var $btn = $(this);
      var action = $btn.attr('data-action');
      var id = +$btn.closest('.order-box').attr('data-id');
      actionOrder(id, action, function(ok) {
        if (!ok) {
          return notify('操作失败');
        }
        notify('操作成功', 0);
      });
    });
}

var $orders = $('#orders-div');

initPage(function () {
  $(function () {
    /* title */
    setTitle('我的订单 - Great Me', '我的订单');

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
