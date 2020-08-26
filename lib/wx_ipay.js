'use strict';
const md5 = require('md5');
const xml2js = require('xml2js');
const util = require('../utils/util');
const request = require('superagent');
const crypto = require('crypto');
// xmlBuilder工具
const builder = new xml2js.Builder({
    'headless': true,
    'allowSurrogateChars': true,
    'rootName': 'xml',
    'cdata': true,
});
// 请求路径
const urls = {
    'unifiedorder': 'https://api.mch.weixin.qq.com/pay/unifiedorder', // 统一下单
    'orderquery': 'https://api.mch.weixin.qq.com/pay/orderquery', // 查询订单
    'closeorder': 'https://api.mch.weixin.qq.com/pay/closeorder', // 关闭订单
    'refund': 'https://api.mch.weixin.qq.com/secapi/pay/refund', // 申请退款
    'refundquery': 'https://api.mch.weixin.qq.com/pay/refundquery', // 查询退款
    'downloadbill': 'https://api.mch.weixin.qq.com/pay/downloadbill', // 下载交易账单
    'downloadfundflow': 'https://api.mch.weixin.qq.com/pay/downloadfundflow', // 下载资金账单
    'report': 'https://api.mch.weixin.qq.com/payitil/report', // 交易保障
    'batchquerycomment': 'https://api.mch.weixin.qq.com/billcommentsp/batchquerycomment', // 拉取订单评价数据
    'reverse': 'https://api.mch.weixin.qq.com/secapi/pay/reverse', // 撤销订单
    'micropay': 'https://api.mch.weixin.qq.com/pay/micropay', // 付款码支付
    'authcodetoopenid': 'https://api.mch.weixin.qq.com/tools/authcodetoopenid', // 付款码查询openid
};
// 微信支付相关接口
class IOrder {
    // options 参数值 参考微信支付文档
    constructor(options) {
        this._options = {};
        this._options['appid'] = options.appid;
        this._options['pfx'] = options.pfx;
        this._options['mch_id'] = options.mch_id;
        this._options['key'] = options.partner_key;
        this._options['sign'] = '';

        this._params = {};
    }
    // 添加其他参数
    _otherParams(params) {
        this._params = {
            'nonce_str': util.getNonceStr(),
            ...params,
            ...this._options,
        };
        if (!this._params['sign_type'] || ![ 'MD5', 'HMAC-SHA256' ].includes(this._params['sign_type'])) this._params['sign_type'] = 'MD5';
    }
    // 参数检验
    _checkOptions(properties) {
        if (!this._params.appid) throw new Error('缺少appid');
        if (!this._params.mch_id) throw new Error('缺少mch_id');
        if (!this._params.key) throw new Error('缺少partner_key');

        properties.forEach(item => {
            if (this._params[item] === undefined || this._params[item] === null) throw new Error('缺少' + item);
        });
    }
    // MD5加密
    _md5(params) {
        let object = {
            ...this._params,
        };
        if (params) {
            object = {
                ...params,
                'key': this._options['key'],
            };
        }
        const querystring = Object.keys(object).filter(function(key) {
            return object[key] !== undefined && object[key] !== '' && ![ 'pfx', 'sign', 'partner_key', 'key' ].includes(key);
        }).sort()
            .map(function(key) {
                return key + '=' + object[key];
            })
            .join('&') + '&key=' + object.key;
        return md5(querystring).toUpperCase();
    }
    // HMAC-SHA256 加密
    _hmac(params) {
        let object = {
            ...this._params,
        };
        if (params) {
            object = {
                ...params,
                'key': this._options['key'],
            };
        }

        const querystring = Object.keys(object).filter(function(key) {
            return object[key] !== undefined && object[key] !== '' && ![ 'pfx', 'sign', 'partner_key', 'key' ].includes(key);
        }).sort()
            .map(function(key) {
                return key + '=' + object[key];
            })
            .join('&') + '&key=' + object.key;
        const hash = crypto.createHmac('sha256', this._options['key'])
            .update(querystring)
            .digest('hex');

        return hash.toUpperCase();
    }
    // toxml
    _jsontoxml() {
        const object = {
            ...this._params,
        };
        if (object['sign_type'] === 'HMAC-SHA256') {
            object.sign = this._hmac();
        } else {
            object.sign = this._md5();
        }

        // 移除证书
        delete object['pfx'];
        delete object['key']; // 移除密钥 不然会报{ return_code: 'FAIL', return_msg: '不识别的参数key' }

        // 生成请求统一下单下单xml参数
        const xmlOption = builder.buildObject(object);
        return xmlOption;
    }
    _xmltojson(data) {
        let body = {};
        xml2js.parseString(data, { 'trim': true, 'explicitArray': false }, (err, result) => {
            if (err) {
                // throw new Error(err);
                console.error(err);
                body = {};
            } else {
                body = result.xml;
            }

        });

        return body;
    }
    // 请求
    async _request(name, xmlOption) {
        const url = urls[name];
        let result = await request.post(url)
            .send(xmlOption)
            .pfx({
                'pfx': this._options.pfx, // 证书
                'passphrase': this._options.mch_id, // 证书秘钥【微信设置为商户号id】
            })
            .type('xml');

        return this._xmltojson(result.text);
    }
    // 请求
    async _request2(name, xmlOption) {
        const url = urls[name];
        let result = await request.post(url)
            .send(xmlOption)
            .pfx({
                'pfx': this._options.pfx, // 证书
                'passphrase': this._options.mch_id, // 证书秘钥【微信设置为商户号id】
            })
            .type('xml');

        return result;
    }

}

module.exports = IOrder;
