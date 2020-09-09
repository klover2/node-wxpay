# 支付产品
注： `noncestr`、 `sigin` 不需要传入，所必须的参数值请看微信文档，`sign_type`支持MD5,HMAC-SHA256,不传默认MD5

1. [统一下单](https://pay.weixin.qq.com/wiki/doc/api/jsapi.php?chapter=9_1)

```bash
  const options = {
            'body': 'app支付测试',
            'out_trade_no': '',
            'total_fee': 1,
            'spbill_create_ip': 'ip',
            'notify_url': '回调地址',
            'trade_type': 'APP', // app支付 其他支付传入不同的支付类型
        };
        console.log(options);

        let result = await wxpay.unifiedorder(options);
返回：
  {
    'appid': 'appid',
    'timestamp': '1597973115',
    'partnerid': '',
    'prepayid': 'wx21092516083844351bbe681e84561f0000',
    'package': 'Sign=WXPay',
    'noncestr': '8a16f1b3c827dc91bb41',
    'sign': '',
    'return_code': 'SUCCESS',
    'return_msg': 'OK',
    'result_code': 'SUCCESS',
};
```
2. [回调验证](https://pay.weixin.qq.com/wiki/doc/api/jsapi.php?chapter=9_7&index=8)
```bash
通知url必须为直接可访问的url，不能携带参数。示例：notify_url：“https://pay.weixin.qq.com/wxpay/pay.action”

由于微信返回是数据流 (本人用的是koa)
在入口文件配置
const bodyParser = require('koa-bodyparser');
App.use(bodyParser());

// 路由
const { RefundMiddleware } = require('node-wxpay3')

router.post('/refund', RefundMiddleware(), async ctx => {
  console.log(ctx.request.body)

  let result = wxpay.callback_check(ctx.request.body)
====》 result = true 则校验成功
});

```

3. [查询订单](https://pay.weixin.qq.com/wiki/doc/api/jsapi.php?chapter=9_2)
```bash
let result = await wxpay.orderquery({
            'out_trade_no': 'b2e19799f934259f68e5',
        });
        
        // return_code 、result_code、trade_state
        if (result.return_code === 'SUCCESS' && result.result_code === 'SUCCESS' && result.trade_state === 'SUCCESS') {
            // 支付成功
        }
        
```

4. [关闭订单](https://pay.weixin.qq.com/wiki/doc/api/jsapi.php?chapter=9_3)
```bash
 let result = await wxpay.closeorder({
            'out_trade_no': '027ee8c8666b9b7f3b6b',
        });
```

5. [申请退款](https://pay.weixin.qq.com/wiki/doc/api/jsapi.php?chapter=9_4)
```bash
 let result = await wxpay.refund({
            'out_trade_no': 'b2e19799f934259f68e5',
            'out_refund_no': '',
            'total_fee': 1,
            'refund_fee': 1,
        });
```

6. [查询退款](https://pay.weixin.qq.com/wiki/doc/api/jsapi.php?chapter=9_5)
```bash
let result = await wxpay.refundquery({
            // 'out_trade_no': 'b2e19799f934259f68e5',
            'out_refund_no': '06842fae86d842468e40', // 最好使用退款单号
        });
```

7. [下载交易账单](https://pay.weixin.qq.com/wiki/doc/api/jsapi.php?chapter=9_6)
```bash
 let result = await wxpay.downloadbill({
            'bill_date': moment().subtract(2, 'days').format('YYYYMMDD'), //
            'bill_type': 'ALL',
            // 'tar_type': 'GZIP',
        });

如果选择了'tar_type': 'GZIP' 则返回数据是buffer,可以使用下面方法保存文件到本地
        // fs.writeFile('test.gz', result.data, function(err) {
        //     if (!err) {
        //         console.log('文件已保存');
        //     }
        // });
如果没有选择，则返回是一个表格一样的text文本
// {
        //     data: '交易时间,公众账号ID,商户号,特约商户号,设备号,微信订单号,商户订单号,用户标识,交易类型,交易状态,付款银行,货币种类,应结订单金额,代金券金额,微信退款单号,商户退款单号,退款金额,充值券退款金额,退款类型,退款状态,商品名称,商户数据包,手续费,费率,订单金额,申请退款金额,费率备注\r\n' +
        //       '总交易单数,应结订单总金额,退款总金额,充值券退款总金额,手续费总金额,订单总金额,申请退款总金额\r\n' +
        //       '`3,`1299.02,`0.00,`0.00,`7.79000,`1299.02,`0.00\r\n',
        //     return_code: 'SUCCESS'
        //   }
```

8. [下载资金账单](https://pay.weixin.qq.com/wiki/doc/api/jsapi.php?chapter=9_18&index=7)
```bash
 let result = await wxpay.downloadfundflow({
            'bill_date': moment().format('YYYYMMDD'), //
            'account_type': 'Basic',
            'sign_type': 'HMAC-SHA256', // 只允许HMAC-SHA256加密
            'tar_type': 'GZIP',
        });
        //和下载交易账单一样
```

9. [交易保障](https://pay.weixin.qq.com/wiki/doc/api/jsapi.php?chapter=9_8&index=9)
```bash
let result = await wxpay.report({
            'interface_url': 'https://api.mch.weixin.qq.com/pay/unifiedorder',
            'execute_time_': 1,
            'return_code': 'SUCCESS',
            'result_code': 'SUCCESS',
            'user_ip': 'ip',
        });
```

10. [拉取订单评价数据](https://pay.weixin.qq.com/wiki/doc/api/jsapi.php?chapter=9_17&index=11)
```bash
 let result = await wxpay.batchquerycomment({
            'sign_type': 'HMAC-SHA256',// 只允许HMAC-SHA256加密
            'begin_time': moment().subtract(20, 'days').format('YYYYMMDD') + '000000',
            'end_time': moment().add(1, 'days').format('YYYYMMDD') + '000000', // 结束时间不能超过今天 否则会报系统繁忙，清稍后再试
            'offset': 0,
            'limit': 100, // limit 是必传 不然会报商户签名错误
        });
        
        // 有数据 返回txt
        // `11927 第一行返回当前查询到的数据最后一条的offset
        // `2020-08-19 10:20:08,`4200000704202008194687169781,`5,`还好 // 从第二行开始，每一行表示一笔交易单的评论信息，各参数以逗号隔开， 参数前增加`符号，为标准键盘1左边键的字符。参数内容依次为：评论的时间，支付订单号，评论星级，评论内容
        // {
        //     data: '`11927\n`2020-08-19 10:20:08,`4200000704202008194687169781,`5,`还好\n',
        //     return_code: 'SUCCESS',
        //     result_code: 'SUCCESS'
        //   }
```

11. [付款码支付](https://pay.weixin.qq.com/wiki/doc/api/micropay.php?chapter=9_10&index=1)
```bash
 const options = {
            'body': '付款码测试',
            'out_trade_no': '',
            'total_fee': 1,
            'spbill_create_ip': 'ip',
            'auth_code': '13412341234123412',
        };
        console.log(options);

        const result = await wxpay.micropay(options);
```

12. [撤销订单](https://pay.weixin.qq.com/wiki/doc/api/micropay.php?chapter=9_11&index=3)
```bash
// (只支持付款码支付的订单才可以撤销，统一下单生成的订单不能撤销)
 const result = await wxpay.reverse({
            'out_trade_no': '838b361a0d5c8d098e6b',
        });
        console.log(result);
```
13. [付款码查询openid](https://pay.weixin.qq.com/wiki/doc/api/micropay.php?chapter=9_13&index=9)
```bash
 const result = await wxpay.authcodetoopenid({
            'auth_code': '13564556465464',
        });
        console.log(result);
```