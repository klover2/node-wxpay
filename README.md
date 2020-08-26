# node-wxpay3
(支付文档v2)
[普通商户接入文档](https://pay.weixin.qq.com/wiki/doc/api/index.html)

## 前言
本模块集成了大部分微信支付、提现等模块的接口，采用async、await的方式调用，使用者不用在考虑参数加密发送，秘钥发送方式、xml怎么解析、json怎么转成xml等一系列麻烦事。 
## 安装
npm i node-wxpay3 --save

## 使用
1. 支付产品 
此模块集成了付款码支付、jsapi、小程序支付、native、app、h5支付
同时也包括了退款 订单查询等

[查看详细使用](https://github.com/klover2/node-wxpay/blob/master/docs/pay.md)

```bash
const { WxPay } = require('node-wxpay3');
const fs = require('fs');
const wxpay = new WxPay({
    'appid': 'appid',
    'mch_id': '商户id',
    'partner_key': '', // partner_key为商户平台设置的密钥key
    'pfx': fs.readFileSync('./apiclient_cert.p12'), // 证书
});
const util = require('../utils/util');;

(async () => {
    // 创建支付
    const options = {
        'body': 'app支付测试',
        'out_trade_no': util.getNonceStr(),
        'total_fee': 1,
        'spbill_create_ip': 'ip',
        'notify_url': '回调地址', // 微信会发通知到你服务器上的接口路径
        'trade_type': 'APP',
    };
    console.log(options);

    let result = await wxpay.unifiedorder(options);
    console.log(result);
})();
```

2. 支付工具

此模块集成了优惠券发放、红包、提现到零钱、提现到银行卡

[查看详细使用](https://github.com/klover2/node-wxpay/blob/master/docs/withdraw.md)

```bash
const { WxWithdraw } = require('node-wxpay3');
const fs = require('fs');
const util = require('../utils/util');;

const wxwithdeaw = new WxWithdraw({
    'partner_key': '', // key为商户平台设置的密钥key
    'pfx': fs.readFileSync('./apiclient_cert.p12'),
});

(async () => {
    const options = {
        'mch_billno': util.getNonceStr(),
        'mch_id': '商户id',
        'wxappid': 'appid',
        'send_name': '发送红包测试',
        're_openid': '和appid有关联的openid',
        'total_amount': 1,
        'total_num': 1,
        'wishing': '发送红包测试',
        'client_ip': 'ip地址',
        'act_name': '测试',
        'remark': '发送红包测试',
        'scene_id': 'PRODUCT_2',
    };
    let result = await wxwithdeaw.sendredpack(options);
    console.log(result);
})();
```
