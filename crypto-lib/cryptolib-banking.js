var error = require('./cryptolib-error');
var util = require('./cryptolib-util');
function mod10ComputeCheckDigit(apan) {
    var sum = 0;
    apan.split('').reverse().forEach(function (value, index) {
        if (index % 2 === 0) {
            var doubledDigit = parseInt(value, 10) * 2;
            sum += (doubledDigit > 9 ? (doubledDigit - 9) : doubledDigit);
        }
        else {
            sum += parseInt(value, 10);
        }
    });
    var sumMod10 = sum % 10;
    return sumMod10 === 0 ? '0' : (10 - sumMod10).toString();
}
var Pan = (function () {
    function Pan() {
    }
    Pan.prototype.formatForIso9564Pin = function () {
        var last13Digits = util.takeLast(this.rawValue, 13);
        return last13Digits.substring(0, 12);
    };
    Pan.prototype.isValid = function () {
        return mod10ComputeCheckDigit(this.rawValue.substring(0, this.rawValue.length - 1)) === this.rawValue.substring(this.rawValue.length - 1);
    };
    Pan.fromString = function (pan) {
        var aPan = new Pan();
        aPan.issuerIdentificationNumber = pan.substring(0, 6);
        aPan.majorIndustryIdentifer = pan.substring(0, 1);
        aPan.bankIdentificationNumber = aPan.issuerIdentificationNumber;
        var panWithoutIssuer = pan.substring(6);
        aPan.individualAccountIdentifier = panWithoutIssuer.substring(0, panWithoutIssuer.length - 1);
        aPan.checkDigit = pan.substring(pan.length - 1);
        aPan.rawValue = pan;
        var allNetworks = issuingNetwork.getAll();
        for (var i = 0; i < allNetworks.length; i++) {
            if (allNetworks[i].iinRegexp.test(pan)) {
                var exclusions = allNetworks[i].exclusions;
                var excluded = false;
                for (var j = 0; exclusions && j < exclusions.length && !excluded; j++) {
                    excluded = exclusions[j].test(pan);
                }
                if (!excluded) {
                    aPan.issuingNetwork = allNetworks[i];
                    break;
                }
            }
        }
        ;
        if (!aPan.issuingNetwork) {
            error.raiseInvalidArg('PAN is not issued');
        }
        return aPan;
    };
    return Pan;
})();
var issuingNetwork = {
    Amex: {
        name: 'American Express',
        iinRegexp: /^3[47]\d{13}$/,
        active: true,
        lengths: {
            min: 15,
            max: 15
        }
    },
    Bankcard: {
        name: 'Bankcard',
        iinRegexp: /^(5610\d{12}|56022[1-5]\d{10})$/,
        active: false,
        lengths: {
            min: 16,
            max: 16
        }
    },
    ChinaUnionPay: {
        name: 'China UnionPay',
        iinRegexp: /^62\d{14,17}$/,
        active: true,
        lengths: {
            min: 16,
            max: 19
        }
    },
    DinersClubCarteBlanche: {
        name: 'Diners Club Carte Blanche',
        iinRegexp: /^30[0-5]\d{11}$/,
        active: true,
        lengths: {
            min: 14,
            max: 14
        }
    },
    DinersClubEnRoute: {
        name: 'Diners Club En Route',
        iinRegexp: /^(2014|2149)\d{11}$/,
        active: false,
        lengths: {
            min: 15,
            max: 15
        }
    },
    DinersClubInternational: {
        name: 'Diners Club International',
        iinRegexp: /^(30[0-5]\d{11}|309\d{11}|36\d{12}|3[8-9]\d{12})$/,
        active: true,
        lengths: {
            min: 14,
            max: 14
        }
    },
    DiscoverCard: {
        name: 'Discover Card',
        iinRegexp: /^(6011\d{12}|62212[6-9]\d{10}|6221[3-9][0-9]\d{10}|622[3-8][0-9][0-9]\d{10}|6229[01][0-9]\d{10}|62292[0-5]\d{10}|64[4-9]\d{13}|65\d{14})$/,
        active: true,
        lengths: {
            min: 16,
            max: 16
        }
    },
    InterPayment: {
        name: 'InterPayment',
        iinRegexp: /^636\d{13,16}$/,
        active: true,
        lengths: {
            min: 16,
            max: 19
        }
    },
    InstaPayment: {
        name: 'InstaPayment',
        iinRegexp: /^63[7-9]\d{13,16}$/,
        active: true,
        lengths: {
            min: 16,
            max: 19
        }
    },
    JCB: {
        name: 'JCB',
        iinRegexp: /^(352[8-9]{12}|35[3-8][0-9]\d{12})$/,
        active: true,
        lengths: {
            min: 16,
            max: 16
        }
    },
    Laser: {
        name: 'Laser',
        iinRegexp: /^(6304\d{12,15}|6706\d{12,15}|6771\d{12,15}|6709\d{12,15})$/,
        active: false,
        lengths: {
            min: 16,
            max: 19
        }
    },
    Maestro: {
        name: 'Maestro',
        iinRegexp: /^(50[0-9][0-9][0-9][0-9]\d{6,13}|5[6-9][0-9][0-9][0-9][0-9]\d{6,13}|6[0-9][0-9][0-9][0-9][0-9]\d{6,13})$/,
        active: true,
        exclusions: [
            /^60110[0-9]\d{6,13}$/,
            /^6011[234][0-9]\d{6,13}$/,
            /^601174\d{6,13}$/,
            /^60117[7-9]\d{6,13}$/,
            /^(60118[6-9]\d{6,13}|60119[0-9]\d{6,13})$/,
            /^64[4-9][0-9][0-9][0-9]\d{6,13}$/,
            /^65[0-9][0-9][0-9][0-9]\d{6,13}$/
        ],
        lengths: {
            min: 12,
            max: 19
        }
    },
    Dankort: {
        name: 'Dankort',
        iinRegexp: /^5019\d{12}$/,
        active: false,
        lengths: {
            min: 16,
            max: 16
        }
    },
    MasterCardNotActive: {
        name: 'Mastercard',
        iinRegexp: /^(222[1-9][0-9][0-9]\d{10}|22[3-6][0-9][0-9][0-9]\d{10}|227[0-1][0-9][0-9]\d{10}|22720[0-9][0-9]\d{10})$/,
        active: false,
        lengths: {
            min: 16,
            max: 16
        }
    },
    MasterCard: {
        name: 'MasterCard',
        iinRegexp: /^5[1-5]\d{14}$/,
        active: true,
        lengths: {
            min: 16,
            max: 16
        }
    },
    Solo: {
        name: 'Solo',
        iinRegexp: /^6334-6767\d{12,15}$/,
        active: false,
        lengths: {
            min: 16,
            max: 19
        }
    },
    Switch: {
        name: 'Switch',
        iinRegexp: /^(4903\d{12,15}|4905\d{12,15}|4911\d{12,15}|4936\d{12,15}|564182\d{10,13}|633110\d{10,13}|6333\d{12,15}|6759\d{12,15})$/,
        active: false,
        lengths: {
            min: 16,
            max: 19
        }
    },
    Visa: {
        name: 'Visa',
        iinRegexp: /^4\d{12,15}$/,
        active: true,
        lengths: {
            min: 13,
            max: 16
        }
    },
    UATP: {
        name: 'UATP',
        iinRegexp: /^1\d{14}$/,
        active: true,
        lengths: {
            min: 15,
            max: 15
        }
    },
    getAll: function () {
        return [
            issuingNetwork.Amex,
            issuingNetwork.Bankcard,
            issuingNetwork.ChinaUnionPay,
            issuingNetwork.Dankort,
            issuingNetwork.DinersClubEnRoute,
            issuingNetwork.DinersClubInternational,
            issuingNetwork.DiscoverCard,
            issuingNetwork.MasterCard,
            issuingNetwork.InstaPayment,
            issuingNetwork.InterPayment,
            issuingNetwork.JCB,
            issuingNetwork.Laser,
            issuingNetwork.Maestro,
            issuingNetwork.MasterCard,
            issuingNetwork.MasterCardNotActive,
            issuingNetwork.Solo,
            issuingNetwork.Switch,
            issuingNetwork.UATP,
            issuingNetwork.Visa
        ];
    }
};
var banking = {
    createPanFromString: function (pan) {
        return Pan.fromString(pan);
    },
    computeCheckDigit: function (pan) {
        return mod10ComputeCheckDigit(pan);
    },
    issuingNetwork: issuingNetwork
};
module.exports = banking;
//# sourceMappingURL=cryptolib-banking.js.map