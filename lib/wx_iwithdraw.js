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
    'sendredpack': 'https://api.mch.weixin.qq.com/mmpaymkttransfers/sendredpack', // 发放红包
    'sendgroupredpack': 'https://api.mch.weixin.qq.com/mmpaymkttransfers/sendgroupredpack', // 发放裂变红包
    'gethbinfo': 'https://api.mch.weixin.qq.com/mmpaymkttransfers/gethbinfo', // 查询红包记录
    'sendminiprogramhb': 'https://api.mch.weixin.qq.com/mmpaymkttransfers/sendminiprogramhb', // 小程序红包
    'transfers': 'https://api.mch.weixin.qq.com/mmpaymkttransfers/promotion/transfers', // 企业付款到零钱
    'gettransferinfo': 'https://api.mch.weixin.qq.com/mmpaymkttransfers/gettransferinfo', // 查询企业付款到零钱
    'pay_bank': 'https://api.mch.weixin.qq.com/mmpaysptrans/pay_bank', // 企业付款到银行卡
    'query_bank': 'https://api.mch.weixin.qq.com/mmpaysptrans/query_bank', // 查询企业付款到银行卡
    'getpublickey': 'https://fraud.mch.weixin.qq.com/risk/getpublickey', // 获取RSA加密公钥
    'send_coupon': 'https://api.mch.weixin.qq.com/mmpaymkttransfers/send_coupon', // 发放代金券
    'query_coupon_stock': 'https://api.mch.weixin.qq.com/mmpaymkttransfers/query_coupon_stock', // 查询代金券批次
    'querycouponsinfo': 'https://api.mch.weixin.qq.com/mmpaymkttransfers/querycouponsinfo', // 查询代金券信息
};
class IWithdraw {
    constructor(options) {
        this._options = {};
        this._options['pfx'] = options.pfx;
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
    }
    // 参数检验
    _checkOptions(properties) {
        if (!this._params.key) throw new Error('缺少partner_key');
        if (!this._params.pfx) throw new Error('缺少pfx');

        properties.forEach(item => {
            if (this._params[item] === undefined || this._params[item] === null) throw new Error('缺少' + item);
        });
    }
    // MD5加密
    _md5(params) {
        let object = {
            ...this._params,
        };
        const exclude = [ 'pfx', 'sign', 'partner_key', 'key' ];

        if (params) {
            object = {
                ...params,
                'key': this._options['key'],
            };
        }

        // 不能把sign_type 带入加密中
        const querystring = Object.keys(object).filter(function(key) {
            return object[key] !== undefined && object[key] !== '' && !exclude.includes(key);
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
        if (object.sign_type === 'HMAC-SHA256') {
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
                'passphrase': this._params.mch_id || this._params.mchid, // 证书秘钥【微信设置为商户号id】
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
                'passphrase': this._params.mch_id || this._params.mchid, // 证书秘钥【微信设置为商户号id】
            })
            .type('xml');

        // application/xml 返回参数是buffer
        return this._xmltojson(result.body.toString());
    }
}
module.exports = IWithdraw;
