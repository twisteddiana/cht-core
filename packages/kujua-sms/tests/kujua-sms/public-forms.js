var utils = require('kujua-sms/utils'),
    updates = require('kujua-sms/updates'),
    sinon = require('sinon'),
    definitions = require('../../test-helpers/form_definitions'),
    appInfo;

exports.setUp = function (callback) {
    utils = require('views/lib/appinfo');
    appInfo = utils.getAppInfo();
    callback();
};

exports.tearDown = function(callback) {
    if (utils.getAppInfo.restore) {
        utils.getAppInfo.restore();
    }
    if (appInfo.getForm.restore) {
        appInfo.getForm.restore();
    }
    callback();
};

exports['public form has no facility not found error'] = function(test) {
    test.expect(5);
    var getForm = sinon.stub(appInfo, 'getForm').returns(definitions.forms.YYYW);
    sinon.stub(utils, 'getAppInfo').returns(appInfo);

    var req = {
        headers: {"Host": window.location.host},
        form: {
            "from": "+9999999999",
            "message": "1!YYYW!facility#foo",
            "sent_timestamp":"1352399720000"
        }
    };
    var doc = updates.add_sms(null, req)[0];

    test.ok(getForm.alwaysCalledWith('YYYW'));
    test.equals(doc.foo, 'foo'); // make sure form parsed correctly
    test.equals(doc.from, req.form.from);
    test.same(doc.related_entities, { clinic: null });
    test.equals(doc.errors.length, 0);

    test.done();
};

exports['private form has facility not found error'] = function(test) {
    test.expect(5);
    var getForm = sinon.stub(appInfo, 'getForm').returns(definitions.forms.YYYZ);
    sinon.stub(utils, 'getAppInfo').returns(appInfo);
    
    var req = {
        headers: {"Host": window.location.host},
        form: {
            "from": "+9999999999",
            "message": "1!YYYZ!one#two#20111010",
            "sent_timestamp":"1352399720000"
        }
    };
    var doc = updates.add_sms(null, req)[0];

    test.ok(getForm.alwaysCalledWith('YYYZ'));
    test.equals(doc.two, 'two'); // make sure form parsed correctly
    test.equals(doc.from, req.form.from);
    test.same(doc.related_entities, { clinic: null });
    test.equals(doc.errors.length, 1);

    test.done();
};
