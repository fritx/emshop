function listOrders(orders) {
  _.each(orders, function (order) {
    order.cost = _.reduce(order.items, function (memo, item) {
      return memo + item.price * item.num;
    }, 0);
    order.status = ({
      WAIT_SELLER_SEND_GOODS: '等待卖家发货',
      WAIT_BUYER_CONFIRM_GOODS: '等待买家收货',
      TRADE_FINISHED: '交易完成'
    })[order.status];
  });
  $('#orders-div')
    .html(
      // reverse orders
      JST['orders-orders']({ orders: orders.reverse() })
    );
}

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
