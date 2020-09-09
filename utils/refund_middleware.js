'use strict';
const xml2js = require('xml2js');

module.exports = () => {
    // 用户token验证
    return async (ctx, next) => {
        let paramsJson = null;
        let contentType = ctx.headers['content-type'] || 'application/json';
        if (contentType.indexOf('xml') !== -1) { // xml格式参数获取
            let data = '';
            ctx.req.setEncoding('utf8');
            ctx.req.on('data', function(chunk) {
                data += chunk;
            });
            
            const getxml = await new Promise(function(resolve) {
                    ctx.req.on('end', function() {
                        resolve(data);
                    });
                });
            const parseObj = await new Promise(function(resolve) {
                    xml2js.parseString(getxml, {
                        'explicitArray': false,
                    }, function(err, json) {
                        if (err) throw err;
                        return resolve(json);
                    });
                });
            if (parseObj.xml) delete parseObj.xml._;
            paramsJson = parseObj.xml;
            
        }
        ctx.request.body = paramsJson;
        await next();
    };
};
