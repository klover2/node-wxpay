'use strict';
// 微信提现相关接口
const IWithdraw = require('./wx_iwithdraw');
const urlencode = require('urlencode');
const util = require('../utils/util');
// const NodeRSA = require('node-rsa');
const crypto = require('crypto');

class Withdraw extends IWithdraw {
    constructor({ partner_key, pfx }) {
        super({ partner_key, pfx });
    }
    // md5加密 暴露给外部调用
    md5(params) {
        return this._md5(params);
    }
    // HMAC-SHA256 加密 暴露给外部调用
    hmac(params) {
        return this._hmac(params);
    }
    // 公钥加密
    publicEncrypt(publicKey, data) {
        // const clientKey = new NodeRSA(publicKey);
        // // 在node-rsa模块中加解密默认使用 pkcs1_oaep ,而在js中加密解密默认使用的是 pkcs1
        // clientKey.setOptions({ 'encryptionScheme': 'pkcs1_oaep' }); //  RSA_PKCS1_OAEP_PADDING
        // let encrypted = clientKey.encrypt(data, 'base64');
        // return encrypted;

        return crypto.publicEncrypt(publicKey, Buffer.from(data)).toString('base64');
    }
    async init(params, name, properties) {
        this._otherParams(params);
        this._checkOptions(properties);
        this._xml = this._jsontoxml();

        const result = await this._request(name, this._xml);
        return result;
    }
    // 发放红包
    async sendredpack(params) {
        delete params['sign_type']; // 必须移除 不然会报密钥错误
        const properties = [ 'mch_billno', 'mch_id', 'wxappid', 'send_name', 're_openid', 'total_amount', 'total_num',
            'wishing', 'client_ip', 'act_name', 'remark' ];
        let result = await this.init(params, 'sendredpack', properties);
        return result;
    }
    // 发放裂变红包
    async sendgroupredpack(params) {
        delete params['sign_type']; // 必须移除 不然会报密钥错误
        const properties = [ 'mch_billno', 'mch_id', 'wxappid', 'send_name', 're_openid', 'total_amount', 'total_num',
            'amt_type', 'wishing', 'wishing', 'remark' ];
        let result = await this.init(params, 'sendgroupredpack', properties);
        return result;
    }
    // 查询红包记录
    async gethbinfo(params) {
        delete params['sign_type']; // 必须移除 不然会报密钥错误
        const properties = [ 'mch_billno', 'mch_id', 'appid', 'bill_type' ];
        let result = await this.init(params, 'gethbinfo', properties);
        return result;
    }
    // 小程序红包
    async sendminiprogramhb(params) {
        delete params['sign_type']; // 必须移除 不然会报密钥错误
        const properties = [ 'mch_billno', 'mch_id', 'wxappid', 'send_name', 're_openid', 'total_amount', 'total_num', 'wishing', 'client_ip',
            'act_name', 'remark', 'notify_way' ];
        let result = await this.init(params, 'sendminiprogramhb', properties);

        const _data = {};
        if (result.return_code === 'SUCCESS' && result.result_code === 'SUCCESS' && result.package) {

            _data['timestamp'] = `${parseInt((+new Date()) / 1000)}`;
            _data['package'] = urlencode(result.package);
            _data['signType'] = 'MD5';
            _data['nonceStr'] = util.getNonceStr().toLowerCase();
            _data['paySign'] = this._md5(_data);

            _data['return_code'] = 'SUCCESS';
            _data['result_code'] = 'SUCCESS';
            return _data;
        }
        return result;
    }
    // 企业付款到零钱
    async transfers(params) {
        delete params['sign_type']; // 必须移除 不然会报密钥错误
        const properties = [ 'mch_appid', 'mchid', 'partner_trade_no', 'openid', 'check_name', 'amount', 'desc' ];
        if (params['check_name'] === 'FORCE_CHECK' && !params['re_user_name']) throw new Error('缺少 re_user_name');
        let result = await this.init(params, 'transfers', properties);
        return result;
    }
    // 查询企业付款到零钱
    async gettransferinfo(params) {
        delete params['sign_type']; // 必须移除 不然会报密钥错误
        const properties = [ 'partner_trade_no', 'mch_id', 'appid' ];
        let result = await this.init(params, 'gettransferinfo', properties);
        return result;
    }
    // 获取RSA加密公钥API
    async getpublickey(params) {
        const properties = [ 'mch_id', 'sign_type' ];
        this._otherParams(params);
        this._checkOptions(properties);
        this._xml = this._jsontoxml();

        const result = await this._request2('getpublickey', this._xml);
        return result;
    }
    // 企业付款到银行卡
    async pay_bank(params) {
        delete params['sign_type']; // 必须移除 不然会报密钥错误
        const properties = [ 'partner_trade_no', 'mch_id', 'enc_bank_no', 'enc_true_name', 'bank_code', 'amount' ];
        let result = await this.init(params, 'pay_bank', properties);
        return result;
    }
    // 查询企业付款到银行卡
    async query_bank(params) {
        delete params['sign_type']; // 必须移除 不然会报密钥错误
        const properties = [ 'partner_trade_no', 'mch_id' ];
        let result = await this.init(params, 'query_bank', properties);
        return result;
    }
    // 发放代金券
    async send_coupon(params) {
        delete params['sign_type']; // 必须移除 不然会报密钥错误
        const properties = [ 'coupon_stock_id', 'mch_id', 'openid_count', 'partner_trade_no', 'openid', 'appid' ];
        let result = await this.init(params, 'send_coupon', properties);
        return result;
    }
    // 查询代金券批次
    async query_coupon_stock(params) {
        delete params['sign_type']; // 必须移除 不然会报密钥错误
        const properties = [ 'coupon_stock_id', 'mch_id', 'appid' ];
        let result = await this.init(params, 'query_coupon_stock', properties);
        return result;
    }
    // 查询代金券信息
    async querycouponsinfo(params) {
        delete params['sign_type']; // 必须移除 不然会报密钥错误
        const properties = [ 'coupon_id', 'mch_id', 'appid', 'openid', 'stock_id' ];
        let result = await this.init(params, 'querycouponsinfo', properties);
        return result;
    }
}
module.exports = Withdraw;
