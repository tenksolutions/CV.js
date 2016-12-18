var validator = (function (window, document, undefined) {
    "use strict";

    var nameElm, numElm, expMonthElm, expYearElm, cvcElm;

    var settings = {
        validation: {
            validate: true,
            formatting: true,
            tooltips: false,
            onBlur: true
        },
        selectors: {
            cardName: 'vjs-card-name',
            cardNumber: 'vjs-card-number',
            cardCVC: 'vjs-card-cvc',
            cardExpMonth: 'vjs-card-exp-month',
            cardExpYear: 'vjs-card-exp-year'
        },
        animation: {
            enabled: false,
            speed: 1000,
            easing: true,
            equation: 'easeInOutExpo', //easeInOutCirc, easeInQuad, easeInOutSine, easeInOutExpo, easeOutCirc, easeOutCubic
        },
        callbacks: {
            success: function () {},
            fail: function () {}
        }
    };

    var providers = [
        {
            name: 'default',
            patterns: [/^/],
            max: [16, 4],
            split: [4, 4, 4, 4]
        },
        {
            name: 'amex',
            patterns: [/^3[47]/],
            max: [15, 4],
            split: [4, 6, 5]
        },
        {
            name: 'discover',
            patterns: [/^(6011|622(12[6-9]|1[3-9][0-9]|[2-8][0-9]{2}|9[0-1][0-9]|92[0-5]|64[4-9])|65)/],
            max: [16, 3],
            split: [4, 4, 4, 4]
        },
        {
            name: 'jcb',
            patterns: [/^35(2[89]|[3-8][0-9])/],
            max: [16, 3],
            split: [4, 4, 4, 4]
        },
        {
            name: 'maestro',
            patterns: [/^(5018|5020|5038|6304|6759|676[1-3])/],
            max: [19, 3],
            split: [4, 4, 4, 4]
        },
        {
            name: 'mastercard',
            patterns: [/^5[1-5]/],
            max: [16, 3],
            split: [4, 4, 4, 4]
        },
        {
            name: 'visa',
            patterns: [/^(4026|417500|4508|4844|491(3|7))/, /^4/],
            max: [16, 3],
            split: [4, 4, 4, 4]
        },
        {
            name: 'dinersclub',
            patterns: [/^3(?:0[0-5]|[68][0-9])/],
            max: [14, 3],
            split: [4, 4, 4, 4]
        }
    ];

    var check = {
        name: function () {
            if (nameElm.value.length === 0)
                return {valid: false, error: 'length', message: 'Name Required', element: nameElm};
            else if (!nameElm.value.match(/^([^0-9]*)$/))
                return {valid: false, error: 'invalid', message: 'Invalid Name', element: nameElm};
            else
                return {valid: true, element: nameElm};
        },
        number: function () {
            if (numElm.value.length === 0)
                return {valid: false, error: 'length', message: 'Card Number Required', element: numElm};
            else if (!validateLuhn(numElm.value.replace(/[^0-9]/gi, '')) || numElm.value.replace(/[^0-9]/gi, '').length <= 11)
                return {valid: false, error: 'invalid', message: 'Invalid Card Number', element: numElm};
            else
                return {valid: true, element: numElm};
        },
        cvc: function () {
            if (cvcElm.value.length === 0)
                return {valid: false, error: 'length', message: 'CVC Required', element: cvcElm};
            else if (!cvcElm.value.match(/^[0-9]{3,4}$/))
                return [{valid: false, error: 'length', message: 'Invalid CVC', element: cvcElm}];
            else
                return {valid: true, element: cvcElm};
        },
        expMonth: function () {
            if (expMonthElm.value.length === 0)
                return {valid: false, error: 'length', message: 'Month Required', element: expMonthElm};
            else if (expMonthElm.tagName == 'SELECT' && expMonthElm.selectedIndex === 0)
                return {valid: false, error: 'invalid', message: 'Invalid Month', element: expMonthElm};
            else
                return {valid: true, element: expMonthElm};
        },
        expYear: function () {
            if (expYearElm.value.length === 0)
                return {valid: false, error: 'length', message: 'Year Required', element: expYearElm};
            else if (expYearElm.tagName == 'SELECT' && expYearElm.selectedIndex === 0)
                return {valid: false, error: 'invalid', message: 'Invalid Year', element: expYearElm};
            else
                return {valid: true, element: expYearElm};
        }
    }

    function validate(r) {
        if (settings.validation.validate === true)
            if (r.valid === true) {
                settings.callbacks.success(r);
            } else if (r.valid === false) {
                validatorTip(r);
                settings.callbacks.fail(r);
            }
    }

    function validateAll() {
        var e = [];
        for (var c in check) {
            var result = check[c]();
            if (result.valid !== true)
                e.push(result);
        }

        if (settings.validation.validate === true) {
            if (e.length === 0) {
                return true;
            } else {
                for (var i = 0; i < e.length; i++) {
                    validatorTip(e[i]);
                }
                return false;
            }
        }
    }

    function validatorTip(e) {
        if (settings.validation.tooltips === true) {
            var p = e.element.parentElement;
            resetTips(p);
            var tip = document.createElement('div');
            tip.innerHTML = e.message;
            tip.setAttribute('class', 'vjs-error-tip');
            p.style.position = 'relative';
            p.appendChild(tip);
            tip.style.marginLeft = '-' + tip.offsetWidth / 2 + 'px';
        }
    }

    function resetTips(e) {
        for (var elm = (this !== undefined) ? this.parentElement : e, tips = elm.querySelectorAll('.vjs-error-tip'), i = 0; i < tips.length; i++)
            elm.removeChild(tips[i]);
    }

    function getCardProvider() {
        for (var result, i = 0; i < providers.length; i++)
            for (var obj = providers[i], p = 0; p < obj.patterns.length; p++)
                if (this.value.match(obj.patterns[p]))
                    result = obj;

        if (typeof result !== undefined) {
            formatCardNumber(this, result);
            if (settings.lastProvider !== result && settings.animation.enabled === true)
                new moveCard(result.name, ((settings.animation.speed / 1000) * 60), (settings.animation.easing) ? settings.animation.equation : null);
            settings.lastProvider = result;
        }
    }

    function formatCardNumber(elm, provider) {
        if (elm.value === elm.lastValue)
            return;

        if (settings.validation.formatting === true) {
            for (var pos = elm.selectionStart, cardNum = elm.value.replace(/[^0-9]/gi, ''), parts = [], i = 0, g = 0; i < cardNum.length; i++) {
                parts[g] = (parts[g] === undefined) ? cardNum[i] : parts[g] + cardNum[i];
                if (parts[g].length === provider.split[g])
                    g++;
            }

            for (var i = pos - 1; i >= 0; i--)
                if (elm.value[i] < '0' || elm.value[i] > '9')
                    pos--;

            pos += Math.floor(pos / provider.split.length);
            elm.maxLength = provider.max[0] + (parts.length - 1);
            elm.value = elm.lastValue = parts.join(' ');
            elm.selectionStart = elm.selectionEnd = pos;
            cvcElm.maxLength = provider.max[1];
        }
    }

    function validateLuhn(v) {
        if (/[^0-9-\s]+/.test(v))
            return false;

        var nCheck = 0, nDigit = 0, bEven = false;
        v = v.replace(/\D/g, '');

        for (var n = v.length - 1; n >= 0; n--) {
            var cDigit = v.charAt(n),
                    nDigit = parseInt(cDigit, 10);

            if (bEven && (nDigit *= 2) > 9)
                nDigit -= 9;

            nCheck += nDigit;
            bEven = !bEven;
        }
        return (nCheck % 10) === 0;
    }

    function applyOptions(s, o) {
        for (var p in o) {
            try {
                if (o[p].constructor === Object)
                    s[p] = applyOptions(s[p], o[p]);
                else
                    s[p] = o[p];
            } catch (e) {
                s[p] = o[p];
            }
        }

        return s;
    }

    function bindEvents() {

        nameElm = document.getElementById(settings.selectors.cardName);
        numElm = document.getElementById(settings.selectors.cardNumber);
        cvcElm = document.getElementById(settings.selectors.cardCVC);
        expMonthElm = document.getElementById(settings.selectors.cardExpMonth);
        expYearElm = document.getElementById(settings.selectors.cardExpYear);

        if (settings.validation.tooltips === true) {
            nameElm[window.addEventListener ? 'addEventListener' : 'attachEvent'](window.addEventListener ? 'click' : 'onclick', resetTips, false);
            numElm[window.addEventListener ? 'addEventListener' : 'attachEvent'](window.addEventListener ? 'click' : 'onclick', resetTips, false);
            cvcElm[window.addEventListener ? 'addEventListener' : 'attachEvent'](window.addEventListener ? 'click' : 'onclick', resetTips, false);
            expMonthElm[window.addEventListener ? 'addEventListener' : 'attachEvent'](window.addEventListener ? 'click' : 'onclick', resetTips, false);
            expYearElm[window.addEventListener ? 'addEventListener' : 'attachEvent'](window.addEventListener ? 'click' : 'onclick', resetTips, false);

            nameElm[window.addEventListener ? 'addEventListener' : 'attachEvent'](window.addEventListener ? 'focus' : 'onfocus', resetTips, false);
            numElm[window.addEventListener ? 'addEventListener' : 'attachEvent'](window.addEventListener ? 'focus' : 'onfocus', resetTips, false);
            cvcElm[window.addEventListener ? 'addEventListener' : 'attachEvent'](window.addEventListener ? 'focus' : 'onfocus', resetTips, false);
            expMonthElm[window.addEventListener ? 'addEventListener' : 'attachEvent'](window.addEventListener ? 'focus' : 'onfocus', resetTips, false);
            expYearElm[window.addEventListener ? 'addEventListener' : 'attachEvent'](window.addEventListener ? 'focus' : 'onfocus', resetTips, false);
        }

        if (settings.validation.onBlur === true) {
            nameElm[window.addEventListener ? 'addEventListener' : 'attachEvent'](window.addEventListener ? 'blur' : 'onblur', function () {
                validate(check.name());
            }, false);
            numElm[window.addEventListener ? 'addEventListener' : 'attachEvent'](window.addEventListener ? 'blur' : 'onblur', function () {
                validate(check.number());
            }, false);
            cvcElm[window.addEventListener ? 'addEventListener' : 'attachEvent'](window.addEventListener ? 'blur' : 'onblur', function () {
                validate(check.cvc());
            }, false);
            expMonthElm[window.addEventListener ? 'addEventListener' : 'attachEvent'](window.addEventListener ? 'blur' : 'onblur', function () {
                validate(check.expMonth());
            }, false);
            expYearElm[window.addEventListener ? 'addEventListener' : 'attachEvent'](window.addEventListener ? 'blur' : 'onblur', function () {
                validate(check.expYear());
            }, false);
        }

        numElm[window.addEventListener ? 'addEventListener' : 'attachEvent'](window.addEventListener ? 'keyup' : 'onkeyup', getCardProvider, false);
        numElm[window.addEventListener ? 'addEventListener' : 'attachEvent'](window.addEventListener ? 'keydown' : 'onkeydown', getCardProvider, false);
        numElm[window.addEventListener ? 'addEventListener' : 'attachEvent'](window.addEventListener ? 'paste' : 'onpaste', getCardProvider, false);
    }

    return{
        init: function (options) {
            settings = applyOptions(settings, options);
            bindEvents();
        },
        validate: validateAll
    };

})(window, document);