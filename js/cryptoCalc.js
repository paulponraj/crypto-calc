var CryptoCalcModule;
(function (CryptoCalcModule) {
    CryptoCalcModule.cryptoCalcModule = angular.module('CryptoCalcModule', ['ngNewRouter', 'CryptoCalcModule.symencrypt', 'CryptoCalcModule.banking', 'CryptoCalcModule.utils']);
    CryptoCalcModule.cryptoCalcModule.controller('AppController', ['$router', '$scope', '$location', AppController]);
    AppController.$routeConfig = [
        { path: '/', redirectTo: '/symencrypt' },
        { path: '/symencrypt', component: 'symencrypt' },
        { path: '/banking', component: 'banking' },
        { path: '/utils', component: 'utils' },
        { path: '/about', component: 'about' }
    ];
    function AppController($router, $scope, $location) {
        var self = this;
        $scope.$watch(function () {
            return $location.path();
        }, function (value) {
            angular.forEach(AppController.$routeConfig, function (val, idx) {
                if (val.path === value) {
                    if (val.components) {
                        self.activeState = val.components.default;
                    }
                }
            });
        });
    }
})(CryptoCalcModule || (CryptoCalcModule = {}));
var CryptoCalcModule;
(function (CryptoCalcModule) {
    var cryptoCalcCommonModule = angular.module('CryptoCalcModule.common', ['ngAnimate']);
    cryptoCalcCommonModule.factory('cryptolib', function () {
        return window.cryptolib;
    });
    cryptoCalcCommonModule.factory('CryptoCalc', function () {
        return {
            encrypt: {},
            utils: {}
        };
    });
    cryptoCalcCommonModule.directive('databox', ['$timeout', function ($timeout) {
        var typesMetadata = {
            hex: {
                desc: 'Hexa',
                regexp: /^(\s*[0-9a-fA-F][0-9a-fA-F]\s*)+$/,
            },
            utf8: {
                desc: 'Utf-8',
                regexp: /[A-Za-z\u0080-\u00FF ]+/
            },
            ascii: {
                desc: 'Ascii',
                regexp: /^[\x00-\x7F]+$/
            },
            base64: {
                desc: 'Base64',
                regexp: /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/
            }
        };
        return {
            restrict: 'E',
            scope: {
                'name': '@',
                'rows': '@',
                'label': '@',
                'model': '=',
                'type': '=',
                'errorMsg': '='
            },
            template: function (element, attrs) {
                var types = attrs.types ? attrs.types.split(',') : null;
                var errorHtml = element.html();
                var tpl = "\n                           <div class=\"container-fluid\" style=\"padding:0\">\n                                <div class=\"row vertical-align bottom5\">                                   \n                                   <div class=\"col-md-2 col-sm-4 noright-padding\">\n                                           <span class=\"bold\">{{label}}</span>";
                if (types) {
                    tpl += "<div class=\"btn-group left5 encodingchooser\"  data-toggle=\"buttons\">";
                    types.forEach(function (val, idx) {
                        tpl += "<label class=\"btn btn-xs btn-default";
                        if (idx == 0) {
                            tpl += " active ";
                        }
                        tpl += "\" ng-click=\"toggleType($event,'" + val + "')\">\n                                                            <input type=\"radio\" name=\"options\" id=\"option1\" autocomplete=\"off\" checked>";
                        tpl += typesMetadata[val].desc;
                        tpl += "</label>";
                    });
                    tpl += "</div>";
                }
                tpl += "</div>\n                                   <div class=\"col-md-4 col-sm-4 noside-padding red\"> {{errorMsg}}</div>\n                                   <div class=\"col-md-2 col-sm-2 bold noside-padding\">Chars : {{charsNum}}</div>      \n                                   <div class=\"col-md-2 col-sm-2 bold noside-padding\" >Size (bytes): {{size}}</div>\n                                </div>\n                                <textarea class=\"form-control\" name=\"{{name}}\" type=\"text\" ng-model=\"model\" rows=\"{{rows}}\" \n                                       ng-class=\"{'field-error': errorMsg}\"";
                if (attrs.$attr.autofocus) {
                    tpl += " autofocus";
                }
                if (attrs.$attr.required) {
                    tpl += " required";
                }
                tpl += "></div>";
                return tpl;
            },
            link: function (scope, element, attrs) {
                if (attrs.types) {
                    scope.type = attrs.types.split(',')[0];
                }
                if (!scope.type) {
                    scope.type = 'hex';
                }
                scope.toggleType = function ($event, type) {
                    var oldtype = scope.type;
                    var oldvalue = scope.model;
                    scope.type = type;
                    scope.model = new buffer.Buffer(oldvalue, oldtype).toString(type);
                };
                scope.$on('$destroy', function () {
                    if (scope.lastError) {
                        $timeout.cancel(scope.lastError);
                    }
                });
                scope.reportDataError = function () {
                    scope.lastError = $timeout(function () {
                        var typeMetadata = typesMetadata[scope.type];
                        var typeDesc = typeMetadata.desc;
                        if (scope.type === 'hex' && scope.model.length % 2 !== 0) {
                            scope.errorMsg = 'Invalid length for ' + typeDesc + ' string';
                        }
                        else {
                            scope.errorMsg = 'Invalid characters for type ' + typeDesc;
                        }
                    }, 200);
                };
                scope.$watch('model', function (newValue, oldValue) {
                    var size = 0, charsNum = 0;
                    scope.errorMsg = '';
                    if (scope.lastError) {
                        $timeout.cancel(scope.lastError);
                    }
                    var type = scope.type;
                    if (newValue) {
                        var validatingRexep = typesMetadata[scope.type].regexp;
                        if (!validatingRexep.test(scope.model)) {
                            scope.reportDataError();
                            return;
                        }
                        try {
                            var buf = new buffer.Buffer(newValue, type);
                            size = buf.length;
                            charsNum = newValue.length;
                        }
                        catch (e) {
                            scope.reportDataError();
                        }
                    }
                    scope.size = size;
                    scope.charsNum = charsNum;
                });
            }
        };
    }]);
    cryptoCalcCommonModule.directive('pan', function ($timeout, cryptolib) {
        return {
            restrict: 'E',
            scope: {
                'name': '@',
                'model': '=',
                'errorMsg': '='
            },
            template: function (element, attrs) {
                var errorHtml = element.html();
                var tpl = "\n                           <div class=\"container-fluid\">\n                                <div class=\"row\">\n                                   <div class=\"col-md-3 col-sm-3 noside-padding red\"> {{errorMsg}}</div>\n                                </div>\n                                <div class=\"row\">\n         \n                                 <div class=\"col-md-2 col-sm-4 noside-padding\">\n         \n                                <input class=\"form-control\" style=\"width:170px\" maxlength=\"19\" size=\"19\" name=\"{{name}}\" type=\"text\" ng-model=\"model\"";
                if (attrs.ngClass) {
                    tpl += " ng-class=\"" + attrs.ngClass + "\"";
                }
                if (attrs.$attr.autofocus) {
                    tpl += " autofocus";
                }
                if (attrs.$attr.required) {
                    tpl += " required";
                }
                tpl += ">\n                             \n                             </div>\n                             \n    \n                                  <div class=\"col-md-3 col-sm-4 noside-padding\" style=\"font-size:11px\">\n                                      <div class=\"bold\">Issuing Network : {{issuingNetwork}}</div>\n                                      <div class=\"bold\" >Check digit: <span ng-show=\"valid\" >{{checkDigit}}</span></div>\n                                      \n                                   </div>\n                                   <div class=\"col-md-2 col-sm-4 noside-padding\" style=\"font-size:11px\"> \n                                        <div class=\"bold\">Account Id: {{accountIdentifier}}</div> \n                                        <div class=\"bold\">Issuer Id: {{issuerIdentificationNumber}}</div>                                       \n                                   </div>\n                             </div>\n                             \n                             \n                             </div>";
                return tpl;
            },
            link: function (scope, element, attrs) {
                scope.$watch('model', function (newValue, oldValue) {
                    if (newValue === oldValue) {
                        return;
                    }
                    try {
                        if (newValue.length >= 12) {
                            var pan = cryptolib.banking.createPanFromString(newValue);
                            scope.issuingNetwork = pan.issuingNetwork.name;
                            scope.accountIdentifier = pan.individualAccountIdentifier;
                            scope.issuerIdentificationNumber = pan.issuerIdentificationNumber;
                            scope.checkDigit = pan.checkDigit;
                            scope.valid = pan.isValid();
                            return;
                        }
                    }
                    catch (e) {
                    }
                    scope.issuingNetwork = '';
                    scope.accountIdentifier = '';
                    scope.checkDigit = '';
                    scope.issuerIdentificationNumber = '';
                    scope.valid = '';
                });
            }
        };
    });
    cryptoCalcCommonModule.directive('symKey', function ($timeout, cryptolib) {
        return {
            restrict: 'E',
            scope: {
                'name': '@',
                'label': '@',
                'model': '=',
                'cipherAlgo': '='
            },
            template: function (element, attrs) {
                var tpl = "\n                           <div class=\"container-fluid\" style=\"padding:0\">\n                                <div class=\"row\">\n                                   <div class=\"col-md-4 col-sm-4 bold\">{{label}}</div>\n                                   <div class=\"col-md-2 col-sm-2 col-md-offset-2 col-sm-offset-2 bold\" ><span ng-show=\"cipherAlgo=='DES' || cipherAlgo=='3DES'\">Parity: {{parity}}</span></div>\n                                   <div class=\"col-md-2 col-sm-2 bold\">KCV: {{kcv}}</div>\n                                   <div class=\"col-md-2 col-sm-2 bold\">Size: {{size}}</div>\n                                   \n                                </div>\n                                <input class=\"form-control\" name=\"{{name}}\" type=\"text\" ng-model=\"model\"";
                if (attrs.ngClass) {
                    tpl += " ng-class=\"" + attrs.ngClass + "\"";
                }
                if (attrs.$attr.autofocus) {
                    tpl += " autofocus";
                }
                if (attrs.$attr.required) {
                    tpl += " required";
                }
                tpl += "></div>";
                return tpl;
            },
            link: function (scope, element, attrs) {
                scope['size'] = 0;
                scope['kcv'] = '';
                scope['parity'] = '';
                function updateKeyInfo() {
                    var keySize = scope['size'], cipherAlgo = scope['cipherAlgo'];
                    if (typeof keySize !== 'number' || (keySize % 2) !== 0 || keySize < 64 || !cipherAlgo || cipherAlgo.keyLengths.indexOf(keySize) === -1) {
                        scope['kcv'] = '';
                        scope['parity'] = '';
                    }
                    try {
                        var data = new Buffer(scope['model'], 'hex');
                        scope['kcv'] = cryptolib.cipher.computeKcv(data, cipherAlgo, 3);
                    }
                    catch (e) {
                        scope['kcv'] = '';
                        scope['parity'] = '';
                    }
                }
                scope.$watchGroup(['cipherAlgo', 'size'], function (newValue, oldValue) {
                    updateKeyInfo();
                });
                scope.$watch('model', function (newValue, oldValue) {
                    var keySize = 0;
                    if (newValue && (newValue.length % 2) === 0) {
                        keySize = newValue.length * 4;
                    }
                    else {
                        keySize = 0;
                    }
                    $timeout(function () {
                        scope.$apply(function () {
                            scope['size'] = keySize;
                        });
                    });
                });
            }
        };
    });
    cryptoCalcCommonModule.directive('preventDefault', function () {
        return {
            link: function (scope, elem, attrs, ctrl) {
                elem.bind('click', function (event) {
                    event.preventDefault();
                });
            }
        };
    });
})(CryptoCalcModule || (CryptoCalcModule = {}));
//# sourceMappingURL=cryptoCalc.js.map