/* Copyright 2014 Alexander Akhtyamov & Ilya Bogdanov.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
th.define("th.net.JsonProxy",{
    
    extend: 'th.lang.Class',
    
    require: [
        'th.net.JsonProxyInterceptor',
        'th.ui.container.window.ErrorMessage'
    ],
    
    /**
     * Instance of th.net.JsonProxyInterceptor
     */
    interceptor: null,
    
    _afterBinding: function(theClass){
        util.addAccessors(theClass, 'interceptor');
    },

    /**
     * Does get ajax.
     * Config should contains 6 properties:
     *      url:            string url.
     *      extraParams:    extraParameters to send to server as query parameters.
     *      onError:        function to call back on error, parameters: jqXHR, textStatus, errorThrown.
     *      onSuccess:      function to call back on success, parameters: data, textStatus, jqXHR.
     *      onIntercept:    function to call back if response was captured by the interceptor, no parameters.
     *      messageOnError: if true then error message will be shown
     *      scope:          scope of callback functions.
     *      
     * @param config 
     */
    doGet: function(config){
        var me = this;
        if(!config){
            util.throwError('config object cannot be null');
        }
        if(!config.url){
            util.throwError('config object must contain url');
        }
        
        jQuery.ajax({
            url: config.url,
            type: 'GET',
            cache: false,
            data: config.extraParams || {},
            dataType: 'json',
            error: function(jqXHR, textStatus, errorThrown){
                var scope = config.scope || this;
                var callOnError = false;
                if(me.interceptor){
                    var invokeCallback = me.interceptor.interceptError(jqXHR, textStatus, errorThrown);
                    if(invokeCallback){
                        callOnError = true;
                    }else if(config.onIntercept){
                        config.onIntercept.call(scope);
                    }
                }else{
                    callOnError =true;
                }
                if(callOnError){
                    if(config.onError){
                        config.onError.call(scope, jqXHR, textStatus, errorThrown);
                    }
                    if(config.messageOnError){
                        var msg = 'Unable to load data by url:<br/>'+
                            config.url+'<br/>'+
                            'Text status: '+textStatus+
                            ';</br>Error: '+errorThrown;
                        log.error(msg, textStatus, errorThrown, jqXHR);
                        th.create({
                            xclass:'th.ui.container.window.ErrorMessage',
                            title: 'Error',
                            message: msg,
                            buttons:[{
                                text: 'Ok',
                                callback:function(){},
                                scope: me
                            }],
                        });
                    }
                }
            },
            success: function(data, textStatus, jqXHR){
                var scope = config.scope || this;
                if(me.interceptor){
                    var inteceptedData = me.interceptor.interceptSuccess(data, textStatus, jqXHR);
                    if(inteceptedData && config.onSuccess){
                        config.onSuccess.call(scope, inteceptedData, textStatus, jqXHR);
                    }else if(config.onIntercept){
                        config.onIntercept.call(scope);
                    }
                }else{
                    config.onSuccess.call(scope, data, textStatus, jqXHR);
                }
            }
        });
    },
    
    /**
     * Does post ajax.
     * Config should contains 6 properties:
     *      url:            string url.
     *      data:           data to be send to server.
     *      onError:        function to call back on error, parameters: jqXHR, textStatus, errorThrown.
     *      onSuccess:      function to call back on success, parameters: data, textStatus, jqXHR.
     *      onIntercept:    function to call back if response was captured by the interceptor, no parameters.
     *      scope:          scope of callback functions.
     * @param config
     */
    doPost: function(config){
        var me = this;
        if(!config){
            util.throwError('config object cannot be null');
        }
        if(!config.url){
            util.throwError('config object must contain url');
        }
        if(!config.data){
            util.throwError('config object must contain data');
        }
        jQuery.ajax({
            type: 'POST',
            url: config.url,
            cache: false,
            data: JSON.stringify(config.data),
            contentType: 'application/json;charset=UTF-8',
            dataType: 'json',
            error: function(jqXHR, textStatus, errorThrown){
                var scope = config.scope || this;
                var callOnError = false;
                if(me.interceptor){
                    var invokeCallback = me.interceptor.interceptError(jqXHR, textStatus, errorThrown);
                    if(invokeCallback){
                        callOnError = true;
                    }else if(config.onIntercept){
                        config.onIntercept.call(scope);
                    }
                }else{
                    callOnError =true;
                }
                if(callOnError){
                    if(config.onError){
                        config.onError.call(scope, jqXHR, textStatus, errorThrown);
                    }
                    if(config.messageOnError){
                        var msg = 'Unable to load data by url:<br/>'+
                            config.url+'<br/>'+
                            'Text status: '+textStatus+
                            ';</br>Error: '+errorThrown;
                        log.error(msg, textStatus, errorThrown, jqXHR);
                        th.create({
                            xclass:'th.ui.container.window.ErrorMessage',
                            title: 'Error',
                            message: msg,
                            buttons:[{
                                text: 'Ok',
                                callback:function(){},
                                scope: me
                            }],
                        });
                    }
                }
            },
            success: function(data, textStatus, jqXHR){
                var scope = config.scope || this;
                if(me.interceptor){
                    var inteceptedData = me.interceptor.interceptSuccess(data, textStatus, jqXHR);
                    if(inteceptedData && config.onSuccess){
                        config.onSuccess.call(scope, inteceptedData, textStatus, jqXHR);
                    }else if(config.onIntercept){
                        config.onIntercept.call(scope);
                    }
                }else{
                    config.onSuccess.call(scope, data, textStatus, jqXHR);
                }
            }
        });
    }/*,
    
    config:{
        url: '',
        data: {},
        onError: function(jqXHR, textStatus, errorThrown){},
        onSuccess: function(data, textStatus, jqXHR){},
        onIntercept: function(){},
        scope: null
    }*/
});