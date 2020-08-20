# 支付工具
注： `noncestr`、 `sigin` 不需要传入，所必须的参数值请看微信文档，`sign_type`支持MD5,HMAC-SHA256,不传默认MD5

1. [发放红包接口](https://pay.weixin.qq.com/wiki/doc/api/tools/cash_coupon.php?chapter=13_4&index=3)
```bash
// 只支持MD5加密
const options = {
            'mch_billno': chance.hash({ 'length': 20 }),
            'mch_id': '商户id',
            'wxappid': 'appid',
            'send_name': '发送红包测试',
            're_openid': 'openid',
            'total_amount': 1,
            'total_num': 1,
            'wishing': '发送红包测试',
            'client_ip': 'ip',
            'act_name': '测试',
            'remark': '发送红包测试',
            'scene_id': 'PRODUCT_2',
        };
        let result = await wxwithdeaw.sendredpack(options);
```

2. [发放裂变红包](https://pay.weixin.qq.com/wiki/doc/api/tools/cash_coupon.php?chapter=13_5&index=4)
```bash
// 只支持MD5加密
 const options = {
            'mch_billno': chance.hash({ 'length': 20 }),
            'mch_id': '商户id',
            'wxappid': 'appid',
            'send_name': '发送红包测试',
            're_openid': 'openid',
            'total_amount': 3,
            'total_num': 3,
            'wishing': '发送红包测试',
            'client_ip': 'ip',
            'act_name': '测试',
            'remark': '发送红包测试',
            'amt_type': 'ALL_RAND',
            'scene_id': 'PRODUCT_2',
        };
        let result = await wxwithdeaw.sendgroupredpack(options);
```

3. [查询红包记录](https://pay.weixin.qq.com/wiki/doc/api/tools/cash_coupon.php?chapter=13_6&index=5)
```bash
 const options = {
            'mch_billno': 'e4dacc29c5df86cf436f',
            'mch_id': '商户id',
            'appid': 'appid',
            'bill_type': 'MCHT',
        };
        let result = await wxwithdeaw.gethbinfo(options);
```

4. [发放小程序红包](https://pay.weixin.qq.com/wiki/doc/api/tools/cash_coupon.php?chapter=18_2&index=3)
```bash
  const options = {
            'mch_billno': chance.hash({ 'length': 20 }),
            'mch_id': '商户id',
            'wxappid': 'appid',
            'send_name': '发送红包测试',
            're_openid': 'openid',
            'total_amount': 1,
            'total_num': 1,
            'wishing': '发送红包测试',
            'client_ip': 'ip',
            'act_name': '测试',
            'remark': '发送红包测试',
            'notify_way': 'MINI_PROGRAM_JSAPI',
            'scene_id': 'PRODUCT_2',
        };
        let result = await wxwithdeaw.sendminiprogramhb(options);
```

5. [企业付款到零钱](https://pay.weixin.qq.com/wiki/doc/api/tools/mch_pay.php?chapter=14_2)
```bash
 const options = {
            'mch_appid': 'appid',
            'mchid': '商户id',
            'partner_trade_no': chance.hash({ 'length': 20 }),
            'openid': 'openid',
            'check_name': 'NO_CHECK',
            'amount': 1,
            'desc': '提现到零钱测试',
        };
        const result = await wxwithdeaw.transfers(options);
```

6. [查询企业付款到零钱](https://pay.weixin.qq.com/wiki/doc/api/tools/mch_pay.php?chapter=14_3)
```bash
 const result = await wxwithdeaw.gettransferinfo({
            'partner_trade_no': '67b1cc7faa9d67fe454a',
            'mch_id': '商户号',
            'appid': 'appid',
        });

        console.log(result);
```

7. [企业付款到银行卡](https://pay.weixin.qq.com/wiki/doc/api/tools/mch_pay.php?chapter=24_2)
```bash
const publicKey = fs.readFileSync('./public.pem').toString(); // 需要先调用第8条把公钥下载到本地
        const options = {
            'mch_id': '商户id',
            'partner_trade_no': chance.hash({ 'length': 20 }),
            'enc_bank_no': wxwithdeaw.verifySign(publicKey, '383939310301023003183813910'),
            'enc_true_name': wxwithdeaw.verifySign(publicKey, 'klover'),
            'bank_code': '1003',
            'amount': 1,
            'desc': '提现到银行卡测试',
        };
        console.log(options);
        const result = await wxwithdeaw.pay_bank(options);
```

8. [获取RSA加密公钥API](https://pay.weixin.qq.com/wiki/doc/api/tools/mch_pay.php?chapter=24_7&index=4)
```bash
let result = await wxwithdeaw.getpublickey({
            'mch_id': '商户id',
            'sign_type': 'HMAC-SHA256',
        });
        console.log(result);

        // fs.writeFile('public.pem', result.pub_key, function(err) {
        //     if (err) return console.log(err);
        //     console.log('下载成功');
        // });
```

9. [查询企业付款到银行卡](https://pay.weixin.qq.com/wiki/doc/api/tools/mch_pay.php?chapter=24_3)
```bash
 const result = await wxwithdeaw.query_bank({
            'mch_id': '商户id',
            'partner_trade_no': '2f576dbf46b602ee2d23',
        });
        console.log(result);
```

10. [发放代金券](https://pay.weixin.qq.com/wiki/doc/api/tools/sp_coupon.php?chapter=12_3&index=4)
```bash
const result = await wxwithdeaw.send_coupon({
            'coupon_stock_id': '122',
            'openid_count': 1,
            'partner_trade_no': chance.hash({ 'length': 20 }),
            'openid': 'openid',
            'appid': 'appid',
            'mch_id': '商户id',
        });
        console.log(result);
```

11. [查询代金券批次](https://pay.weixin.qq.com/wiki/doc/api/tools/sp_coupon.php?chapter=12_4&index=5)
```bash
 const result = await wxwithdeaw.query_coupon_stock({
            'coupon_stock_id': '122',
            'appid': 'appid',
            'mch_id': '商户id'
        });
        console.log(result);
```

12. [查询代金券信息](https://pay.weixin.qq.com/wiki/doc/api/tools/sp_coupon.php?chapter=12_5&index=6)
```bash
const result = await wxwithdeaw.querycouponsinfo({
            'coupon_id': '122',
            'openid': 'openid',
            'appid': 'appid',
            'mch_id': '商户id',
            'stock_id': 1,
        });
        console.log(result);
```