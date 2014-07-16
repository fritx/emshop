function listOrders(orders) {
  _.each(orders, function (order) {
    order._status = ({
      OFFLINE_WAIT_SELLER_SEND_GOODS: '等待卖家发货',
      OFFLINE_WAIT_BUYER_CONFIRM_GOODS_AND_PAY: '等待买家收货付款',
      OFFLINE_WAIT_SELLER_CONFIRM_MONEY: '等待卖家确认付款',
      OFFLINE_WAIT_SELLER_AGREE_AFTER_SENT: '等待卖家同意退货',
      OFFLINE_WAIT_BUYER_RETURN_GOODS: '等待买家退货',
      OFFLINE_WAIT_SELLER_CONFIRM_GOODS: '等待卖家确认收货',
      OFFLINE_REFUND_FINISHED: '已退货',
      OFFLINE_TRADE_FINISHED: '交易完成'
    })[order.status];
  });
  $orders
    .html(
      // reverse orders
      JST['orders-orders']({ orders: orders.reverse() })
    );

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
