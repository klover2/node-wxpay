'use strict';
const IOrder = require('./wx_ipay');
const util = require('../utils/util');

// 支付
class Pay extends IOrder {
    constructor({ appid, mch_id, partner_key, pfx }) {
        super({ appid, mch_id, partner_key, pfx });
    }
    // 初始化参数 请求
    async init(params, name, properties) {
        this._otherParams(params);
        this._checkOptions(properties);
        this._xml = this._jsontoxml();

        const result = await this._request(name, this._xml);
        return result;
    }
    // md5加密 暴露给外部调用
    md5(params) {
        return this._md5(params);
    }
    // HMAC-SHA256 加密 暴露给外部调用
    hmac(params) {
        return this._hmac(params);
    }
    // xml 转json 暴露给外部调用
    xmltojson(data) {
        return this._xmltojson(data);
    }
    // 统一下单
    async unifiedorder(params) {
        // 必传参数
        const properties = [ 'body', 'out_trade_no', 'total_fee', 'spbill_create_ip', 'notify_url', 'trade_type' ];
        if (params.trade_type === 'JSAPI') properties.push('openid');
        if (params.trade_type === 'NATIVE') properties.push('product_id');
        if (params.trade_type === 'MWEB') properties.push('scene_info');

        const result = await this.init(params, 'unifiedorder', properties);

        const { prepay_id, return_code, return_msg, result_code } = result;
        if (return_code !== 'SUCCESS' || result_code !== 'SUCCESS') return result;

        // 参数处理
        let _data = {};
        switch (this._params.trade_type) {
        case 'JSAPI':
            _data['appId'] = this._params.appid;
            _data['timeStamp'] = `${parseInt((+new Date()) / 1000)}`;
            _data['package'] = `prepay_id=${prepay_id}`;
            _data['nonceStr'] = util.getNonceStr().toLowerCase();
            _data['signType'] = params['sign_type'];
            if (params['sign_type'] === 'HMAC-SHA256') {
                _data['paySign'] = this._hmac(_data);
            } else {
                _data['paySign'] = this._md5(_data);
            }

            break;
        case 'APP':
            _data['appid'] = this._params.appid;
            _data['timestamp'] = `${parseInt((+new Date()) / 1000)}`;
            _data['partnerid'] = this._params.mch_id;
            _data['prepayid'] = prepay_id;
            _data['package'] = 'Sign=WXPay';
            _data['noncestr'] = util.getNonceStr().toLowerCase();
            if (params['sign_type'] === 'HMAC-SHA256') {
                _data['sign'] = this._hmac(_data);
            } else {
                _data['sign'] = this._md5(_data);
            }
            break;
        case 'NATIVE': // pc端网站 模式二 (未测试)
            _data = { // 把code_url 生成图片
                ...result,
            };
            break;
        case 'MWEB':
        // 手机浏览器中支付  https://wx.tenpay.com/cgi-bin/mmpayweb-bin/checkmweb?prepay_id=wx20161110163838f231619da20804912345&package=1037687096&redirect_url=https%3A%2F%2Fwww.wechatpay.com.cn
        // redirect_url 支付成功需要进入的页面 可以让前端拼接 (未测试)
            _data = {
                ...result,
            };
            break;
        default:
            console.error('trade_type参数有误');
            _data = {};
        }

        const req_data = {
            ...this._params,
        };
        delete req_data['pfx'];
        delete req_data['key'];
        delete req_data['sign'];

        return {
            req_data, // 创建订单的参数 用于回调验证
            ..._data,
            return_code,
            return_msg,
            result_code,
        };
    }
    // 支付回调验证
    callback_check(data) {
        let _sign = '';
        if (data.sign_type === 'HMAC-SHA256') {
            _sign = this._hmac(data);
        } else {
            _sign = this._md5(data);
        }
        return data.sign === _sign; // boolean true 成功
    }
    // 订单查询
    async orderquery(params) {
        // 必传参数
        const properties = [];
        if (!params.transaction_id && !params.out_trade_no) throw new Error('缺少参数transaction_id或out_trade_no!');

        let reuslt = await this.init(params, 'orderquery', properties);
        return reuslt;
    }
    // 关闭订单
    async closeorder(params) {
        const properties = [ 'out_trade_no' ];
        let reuslt = await this.init(params, 'closeorder', properties);
        return reuslt;
    }
    // 申请退款
    async refund(params) {
        if (!params.transaction_id && !params.out_trade_no) throw new Error('缺少参数transaction_id或out_trade_no!');
        if (!this._params.pfx) throw new Error('缺少pfx');
        const properties = [ 'out_refund_no', 'total_fee', 'refund_fee' ];
        let reuslt = await this.init(params, 'refund', properties);
        return reuslt;
    }
    // 查询退款
    async refundquery(params) {
        if (!params.transaction_id && !params.out_trade_no && !params.out_refund_no && !params.refund_id) {
            throw new Error('缺少参数transaction_id或out_trade_no或refund_id或out_refund_no!');
        }
        const properties = [];
        let reuslt = await this.init(params, 'refundquery', properties);
        return reuslt;
    }
    // 下载交易账单
    async downloadbill(params) {
        this._otherParams(params);
        const properties = [ 'bill_date' ];
        this._checkOptions(properties);
        this._xml = this._jsontoxml();

        const result = await this._request2('downloadbill', this._xml);

        if (result.status !== 200 && result.statusCode !== 200) return result;
        // 参数处理
        if (result.type === 'application/x-gzip') {
            return {
                'data': result.body,
                'return_code': 'SUCCESS',
            };
        } else if (result.type === 'text/plain') {
            if (result.text.indexOf('<xml>') !== -1) return this._xmltojson(result.text);
            return {
                'data': result.text,
                'return_code': 'SUCCESS',
            };
        }
        return result;
    }
    // 下载资金账单
    async downloadfundflow(params) {
        this._otherParams(params);
        if (params.sign_type !== 'HMAC-SHA256') throw new Error('请选择HMAC-SHA256加密！');
        if (!this._params.pfx) throw new Error('缺少pfx');
        const properties = [ 'bill_date', 'account_type' ];
        this._checkOptions(properties);
        this._xml = this._jsontoxml();

        const result = await this._request2('downloadfundflow', this._xml);

        if (result.status !== 200 && result.statusCode !== 200) return result;
        // 参数处理
        if (result.type === 'application/x-gzip') {
            return {
                'data': result.body,
                'return_code': 'SUCCESS',
                'result_code': 'SUCCESS',
            };
        } else if (result.type === 'text/plain') {
            if (result.text.indexOf('<xml>') !== -1) return this._xmltojson(result.text);
            return {
                'data': result.text,
                'return_code': 'SUCCESS',
                'result_code': 'SUCCESS',
            };
        }
        return result;
    }
    // 交易保障
    async report(params) {
        const properties = [ 'interface_url', 'execute_time_', 'return_code', 'result_code', 'user_ip' ];
        let reuslt = await this.init(params, 'report', properties);
        return reuslt;
    }
    // 拉取订单评价数据
    async batchquerycomment(params) {
        this._otherParams(params);
        const properties = [ 'begin_time', 'end_time', 'offset', 'limit' ];
        if (!this._params.pfx) throw new Error('缺少pfx');
        this._checkOptions(properties);
        this._xml = this._jsontoxml();


        const result = await this._request2('batchquerycomment', this._xml);

        if (result.status !== 200 && result.statusCode !== 200) return result;
        // 参数处理
        if (result.type === 'text/html') {
            if (result.text.indexOf('<xml>') !== -1) {
                return this._xmltojson(result.text);
            }
            return {
                'data': result.text,
                'return_code': 'SUCCESS',
                'result_code': 'SUCCESS',
            };
        }
        return result;
    }
    // 付款码支付
    async micropay(params) {
        const properties = [ 'body', 'out_trade_no', 'total_fee', 'spbill_create_ip', 'auth_code' ];
        let reuslt = await this.init(params, 'micropay', properties);
        return reuslt;
    }
    // 撤销订单(只支持付款码支付的订单才可以撤销，统一下单生成的订单不能撤销)
    async reverse(params) {
        if (!params.transaction_id && !params.out_trade_no) throw new Error('缺少参数transaction_id或out_trade_no!');
        const properties = [];
        let reuslt = await this.init(params, 'reverse', properties);
        return reuslt;
    }
    // 付款码查询openid
    async authcodetoopenid(params) {
        const properties = [ 'auth_code' ];
        let reuslt = await this.init(params, 'authcodetoopenid', properties);
        return reuslt;
    }
}
module.exports = Pay;
