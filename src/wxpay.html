<!DOCTYPE html>
<html>
<head>
  <base href="../s/">
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
  <meta name="keywords" content="月饼, 邮政, 江门, 商城, 订单, 微信">
  <meta name="description" content="江门邮政月饼商城">
  <title>邮政商城</title>
  <link rel="stylesheet" href="css/_deps.css">
  <link rel="stylesheet" href="css/_site.css">
</head>
<body>

  <header id="header"><div class="pure-g"><div class="pure-u-1-6"><div class="header-box"><a onclick="revert()" class="header-btn back-btn"><i class="fa fa-2x fa-spinner fa-spin"></i></a></div></div><div class="pure-u-2-3"><div class="header-box"><div class="title-text">微信支付</div></div></div><div class="pure-u-1-6"><div class="header-box"></div></div></div></header>
  <div id="content"><div class="content-inner"></div></div>

  <footer id="footer"><div class="pure-g"><div class="pure-u-1-3"><div class="footer-box"><a href="home/"><i class="fa fa-home"></i><div>主页</div></a></div></div><div class="pure-u-1-3"><div class="footer-box"><a href="orders/"><i class="fa fa-user"></i><div>我的订单</div></a></div></div><div class="pure-u-1-3"><div class="footer-box"><a href="cart/"><i class="fa fa-shopping-cart"></i><div>购物车</div></a></div></div></div></footer>

  <script src="js/_deps.js"></script>
  <script src="js/_site.js"></script>
  <script>
    var data = <?php echo $jj; ?>;

    var timeout = setTimeout(function() {
      notify('微信环境加载失败', 'orders/');
    }, 10000);

    if (window.WeixinJSBridge) {
      wxReady();
    } else {
      $(document).on('WeixinJSBridgeReady', wxReady);
    }

    function wxReady() {
      clearTimeout(timeout);
      loadReady();
      ask('确定提交订单,并进入微信支付吗?', function(ok) {
        if (!ok) return link('orders/');
        WeixinJSBridge.invoke('getBrandWCPayRequest', data, function(res) {
          //if (res.err_msg !== 'get_brand_wcpay_request:ok') {
          //  return notify('您已取消本次微信支付', 'orders/');
          //}
          link('orders/');
        });
      });
    }
  </script>
</body>
</html>