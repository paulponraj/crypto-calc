/// <reference path="../d.ts/angularjs/angular.d.ts"/>
/// <reference path="../crypto-lib/cryptolib.d.ts"/>

module CryptoCalcModule {
        
        declare var buffer:any;
        var cryptoCalcCommonModule = angular.module('CryptoCalcModule.common',
         ['ngAnimate']);
         
         
         cryptoCalcCommonModule.factory('cryptolib',function() {
                           
             return (<any>window).cryptolib;

         });
         
         cryptoCalcCommonModule.factory('CryptoCalc',function() {
                           
                  return {
                          
                          encrypt : {},
                          utils: {}
                  }

         });     
         
         cryptoCalcCommonModule.directive('databox', ['$timeout',
            function($timeout:angular.ITimeoutService) {
                   var typesMetadata = {
                         hex:{
                               desc : 'Hexa',
                               regexp : /^(\s*[0-9a-fA-F][0-9a-fA-F]\s*)+$/,
                          },
                          utf8:{
                               desc : 'Utf-8',
                               regexp : /[A-Za-z\u0080-\u00FF ]+/ // weak regexp to lack of support in Ecmascript 5 
                          },
                          ascii:{
                               desc : 'Ascii',
                               regexp : /^[\x00-\x7F]+$/   
                          },
                          base64:{
                               desc : 'Base64',
                               regexp : /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/    
                          }
                   };
                   return {
                       restrict:'E',
                       //replace : true,
                       scope:  {
                          'name' : '@',
                          'rows' : '@',
                          'label' : '@',
                          'model' : '=',
                          'type' : '=',
                          'errorMsg' : '='         
                       },
                        template: function(element:angular.IAugmentedJQuery,
                          attrs:any) {
                            
                           var types = attrs.types ? attrs.types.split(','):null;                                 
                           
                           var errorHtml = element.html();
                           var tpl =  `
                           <div class="container-fluid" style="padding:0">
                                <div class="row vertical-align bottom5">                                   
                                   <div class="col-md-2 col-sm-4 noright-padding">
                                           <span class="bold">{{label}}</span>`;
                                           if (types) {
                                                
                                                tpl+=`<div class="btn-group left5 btn-group-default" data-toggle="buttons">`;
                                                types.forEach(function(val:string,idx:number){
                                                       tpl+=`<label class="btn btn-xs btn-default`;
                                                       if (idx==0) {
                                                             tpl+=` active `;  
                                                       } 
                                                       tpl+=`" ng-click="toggleType($event,'${val}')">
                                                            <input type="radio" name="options" id="option1" autocomplete="off" checked>`;
                                                       tpl+=(<any>typesMetadata)[val].desc;
                                                       tpl+=`</label>`;                                
                                                });
                                                tpl+=`</div>`;
                                                    
                                           }
                                   tpl+=`</div>
                                   
                                   <div class="col-md-1 col-sm-2 bold noside-padding">Chars : {{charsNum}}</div>      
                                   <div class="col-md-1 col-sm-2 bold noside-padding" >Size (bytes): {{size}}</div>
                                   <div class="col-md-8 col-sm-4 noside-padding red bold"> {{errorMsg || typeErrorMsg}}</div>
                                </div>
                                <textarea class="form-control" name="{{name}}" type="text" ng-model="model" rows="{{rows}}" 
                                       ng-class="{'field-error': errorMsg || typeErrorMsg}"`

                             if (attrs.$attr.autofocus) {
                                     tpl+=" autofocus";
                             }
                             if (attrs.$attr.required) {
                                     tpl+=" required";
                             }
                                
                             tpl+="></div>";
                             
                            
                             return tpl;                       
                        } ,           
                        link: function(scope:any,element:angular.IAugmentedJQuery,
                          attrs:any){
                             
                             if (attrs.types) {
                                  scope.type=attrs.types.split(',')[0];   
                             }
                             if (!scope.type) {
                                 scope.type = 'hex';
                             }
                       
                             scope.toggleType = function($event:any,type:string) {
                                  var oldtype = scope.type;
                                  var oldvalue = scope.model;
                                  scope.typeErrorMsg='';
                                  scope.type=type;
                                  scope.model = new buffer.Buffer(oldvalue?oldvalue:'',oldtype).toString(type); 
                             }
                             scope.$on('$destroy',() => {
                                  if (scope.lastError) {
                                      $timeout.cancel(scope.lastError);
                                  }      
                             });
                             
                             scope.reportTypeError = () => {
                                     
                                    scope.lastError = $timeout(() => {
                                    
                                            var typeMetadata = (<any>typesMetadata)[scope.type];
                                            var typeDesc = typeMetadata.desc;
                                            if (scope.type==='hex' && scope.model.length %2 !==0 ) {
                                                 scope.typeErrorMsg = 'Invalid length for '+typeDesc+' string';
                                            }
                                            else {
                                                 scope.typeErrorMsg = 'Invalid characters for type '+typeDesc;    
                                            }
                                    },200); 
                             };
                             
                             scope.$watch('model',function(newValue:any,oldValue:any) {
                                     
                                  var size = 0,charsNum = 0;
                              
                                  if (scope.lastError) {
                                      $timeout.cancel(scope.lastError);
                                  }
                                  
                                  var type = scope.type;
                                  
                                  if (newValue) {
                                    
                                    var validatingRexep = (<any>typesMetadata)[scope.type].regexp;
                                    if (!validatingRexep.test(scope.model)) {
                                           scope.reportTypeError();
                                           return;  
                                    }
                                    try {
                                         var buf = new buffer.Buffer(newValue,type);
                                         size = buf.length;
                                         charsNum = newValue.length;
                                         
                                    }
                                    catch(e) {
                                        scope.reportTypeError();  
                                    } 
                                  }
                                  scope.typeErrorMsg = '';
                                  scope.size = size;
                                  scope.charsNum = charsNum;

                             });
           
                        }
                             
                     }
           
                  
                  }]);

          cryptoCalcCommonModule.directive('pan', 
            function($timeout:any,cryptolib:Cryptolib.CryptoLibStatic) {
                   return {
                       restrict:'E',
                       scope:  {
                          'name' : '@',
                          'model' : '=',
                          'errorMsg' : '='
                       },
                        template: function(element:angular.IAugmentedJQuery,
                          attrs:any) {
                            
                                                               
                           
                           var errorHtml = element.html();
                           var tpl =  `
                           <div class="container-fluid">
                                <div class="row">
                                   <div class="col-md-3 col-sm-3 noside-padding red"> {{errorMsg}}</div>
                                </div>
                                <div class="row">
         
                                 <div class="col-md-2 col-sm-4 noside-padding">
         
                                <input class="form-control" style="width:170px" maxlength="19" size="19" name="{{name}}" type="text" ng-model="model"`
                            
                             if (attrs.ngClass) {
                                     tpl+=" ng-class=\""+attrs.ngClass+"\"";
                             }
                             if (attrs.$attr.autofocus) {
                                     tpl+=" autofocus";
                             }
                             if (attrs.$attr.required) {
                                     tpl+=" required";
                             }
                                
                             tpl+=`>
                             
                             </div>
                             
    
                                  <div class="col-md-3 col-sm-4 noside-padding" style="font-size:11px">
                                      <div class="bold">Issuing Network : {{issuingNetwork}}</div>
                                      <div class="bold" >Check digit: <span ng-show="valid" >{{checkDigit}}</span></div>
                                      
                                   </div>
                                   <div class="col-md-2 col-sm-4 noside-padding" style="font-size:11px"> 
                                        <div class="bold">Account Id: {{accountIdentifier}}</div> 
                                        <div class="bold">Issuer Id: {{issuerIdentificationNumber}}</div>                                       
                                   </div>
                             </div>
                             
                             
                             </div>`;
                             
                            
                             return tpl;    

                        
                                
                                
                        } ,           
                        link: function(scope:any,element:angular.IAugmentedJQuery,
                          attrs:any){
                       
                               
                             scope.$watch('model',function(newValue:any,oldValue:any) {
                                  if (newValue===oldValue) {
                                      return;
                                  }
                                  try {
                                      if (newValue.length >=12) {
                                             
                                              var pan:Cryptolib.Banking.IPan=cryptolib.banking.createPanFromString(newValue);
                                              scope.issuingNetwork=pan.issuingNetwork.name;
                                              scope.accountIdentifier = pan.individualAccountIdentifier;
                                              scope.issuerIdentificationNumber = pan.issuerIdentificationNumber;
                                              scope.checkDigit = pan.checkDigit;
                                              scope.valid = pan.isValid();
                                              return;    
                                      }
      
                                  } 
                                  catch(e) {
                                       // TODO
                                  }
                                  scope.issuingNetwork='';
                                  scope.accountIdentifier = '';
                                  scope.checkDigit='';
                                  scope.issuerIdentificationNumber='';
                                  scope.valid = '';
                                  

                             });
           
                        }
                             
                     }
            });
 
         cryptoCalcCommonModule.directive('symKey', 
            function($timeout:any,cryptolib:Cryptolib.CryptoLibStatic) {
                   return {
                       restrict:'E',
                       //replace : true,
                       scope:  {
                          'name' : '@',
                          'label' : '@',
                          'model' : '=',
                          'cipherAlgo' : '=',
                          'errorMsg' : '='
                       },
                        template: function(element:angular.IAugmentedJQuery,
                          attrs:any) {
                                       
                           var tpl =
                        `
                           <div class="container-fluid noside-padding">
                                <div class="row">
                                   <div class="col-md-1 col-sm-2 bold noright-padding">{{label}}</div>
                                   <div class="col-md-1 col-sm-2 bold noside-padding">KCV: {{kcv}}</div>
                                   <div class="col-md-1 col-sm-2 bold noside-padding">Size: {{size}}</div>
                                   <div class="col-md-3 col-sm-4 bold noside-padding">
                                        <span ng-show="cipherAlgo.name=='DES' || cipherAlgo.name=='3DES'">
                                         Parity: {{parity.valid}}<span ng-show="parity.adjustedKey && !(parity.valid)">, Adjusted: {{parity.adjustedKey.toString('hex')}}</span>
                                        </span>
                                   </div>
                                   <div class="col-md-6 col-sm-2 bold noside-padding red">{{errorMsg}}</div>
                                   
                                </div>
                                <input class="form-control" name="{{name}}" type="text" ng-model="model"`;
                                                       
                             if (attrs.ngClass) {
                                     tpl+=" ng-class=\""+attrs.ngClass+"\"";
                             }
                             if (attrs.$attr.autofocus) {
                                     tpl+=" autofocus";
                             }
                             if (attrs.$attr.required) {
                                     tpl+=" required";
                             }
                                
                             tpl+="></div>";
                             
                             return tpl;   

                        
                        },           
                        link: function(scope:angular.IScope,element:angular.IAugmentedJQuery,
                          attrs:angular.IAttributes){
                             
                            
                             scope['size']=0;
                             scope['kcv']='';
                             scope['parity']='';
                             
                             
                             function updateKeyInfo() {
                                     var keySize = scope['size'],
                                         cipherAlgo = scope['cipherAlgo'];
                                         
                                         // TODO: indexOf not portable
                                         if (typeof keySize !== 'number' || (keySize % 2) !== 0 || keySize < 64 || 
                                                 ! cipherAlgo || cipherAlgo.keyLengths.indexOf(keySize) === -1 ) {
                                                scope['kcv']='';
                                                scope['parity']='';
                                          }
                                          try {
                                               var data:Buffer = new Buffer(scope['model'],'hex');
                                               scope['kcv'] = cryptolib.cipher.computeKcv(data,cipherAlgo,3);
                                               scope['parity'] = cryptolib.cipher.checkAndAdjustParity(data);
                                          }
                                          catch(e) {
                                                scope['kcv']='';
                                                scope['parity']='';
                                          }
                                      
                                         
                             }

                             scope.$watch('cipherAlgo',function(newValue:any,oldValue:any) {                                   
                                     updateKeyInfo();
                                    
                             });
                               
                             scope.$watch('model',function(newValue:any,oldValue:any) {
                                   var keySize = 0;
                                   scope['errorMsg']='';
                                   
                                   if (newValue && (newValue.length%2)===0) {
                                        keySize =  newValue.length*4;
                                   }
                                   else {
                                        keySize = 0;
                                   }
                                   
                                   scope['size']=keySize;
                                   updateKeyInfo();
                                   

                             });
           
                        }
                             
                     }
           
                  
                  });
 
 
          cryptoCalcCommonModule.directive('preventDefault', 
            function() {
                  
                  return {
                      link: function (scope, elem, attrs, ctrl) {
                      
                        elem.bind('click', function (event) {
                            event.preventDefault();
                        });
                       }
                  }   
                          
                          
            });               
                  
   
        

}	

   


	
	
