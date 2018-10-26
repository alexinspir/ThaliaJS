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

(function(){
    var callbacks = [];
    var msg = "to-avoid-maximum-stack-size";
    window.addEventListener("message", function(evt){
        if (evt.source == window && evt.data == msg) {
            evt.stopPropagation();
            if (callbacks.length > 0) {
                var callback = callbacks.shift();
                callback.fn.call(callback.sc);
            }
        }
    }, true);
    window.runInNewStack = function(callback,scope){
        callbacks.push({
            fn:callback,
            sc:scope
        });
        window.postMessage(msg, "*");
    };
})();

var th = {
        
        
        
        /**
         * 
         * @param application config
         */
        onReady: function(config){
            if(th.application){
                util.throwError("Another application is already created");
            }
            $( document ).ready(function() {
                th._onReady(config);
            });
        },
        
        _onReady:function(config){
            var applicationXclass = 'th.lang.Application';
            
            if(!config){
                util.throwError("application config must be passed");
            }
            if(config.version && config.version!=='1.0.0'){
                util.throwError("unknown version: "+config.version);
            }
            if(config.developmentMode){
                th.developmentMode = true;
            }
            th._configureLogger(config);
            th._configureClassLoader(config,function(){
                log.trace('Loading of requirements');
                th.ClassRegistry.setLoadDependencies(true);
                if(!th.ClassRegistry.isKnownClass(applicationXclass)){
                    th.ClassLoader.loadClass(applicationXclass);
                }
                if(config.require){
                    for(var i=0;i<config.require.length;i++){
                        var requiredClass = config.require[i];
                        th.ClassLoader.loadClass(requiredClass);
                    }
                    if(th.ClassLoader.modules.length){
                        for(var i=0;i<th.ClassLoader.modules.length;i++){
                            var module = th.ClassLoader.modules[i];
                            if(module.compressed && module.compressed.scripts){
                                var scriptUrl = module.home+module.id+'.js';
                                th.ClassLoader.loadScript(scriptUrl);
                            }else{
                                th.ClassLoader.loadClass(module.moduleDeclarationClass);
                            }
                            //TODO load module views
                        }
                        log.trace('Modules config is applied');
                    }
                }
                th.ClassLoader.runOnReady({
                    callback: function(){
                        log.trace('Requirements are loaded');
                        log.trace('Binding of classes');
                        th.ClassRegistry._bindClasses();
                        log.trace('Classes are bound');
                        log.trace('Creating of the application');
                        var application = th.ClassRegistry.createInstance(applicationXclass,config);
                        log.trace('the application is created');
                        log.trace('Configuring of the application');
                        th._configureApplication(application);
                        log.trace('The application is configured');
                        th.application=application;
                        log.trace('Running of the application');
                        application.initViews();
                        th.UiRegistry.enableEvents(true);
                        application.initControllers();
                        application.run();
                        
                    },
                    scope: th
                });
            },{
                callback: function(url){
                    var msg = 'unable to load script: '+url;
                    alert(msg);
                    th.util.throwError(msg);
                },
                scope:th
            });
        },
        
        _configureApplication: function(application){
            log.trace('Instantiating of the json proxy');
            th._createJsonProxy(application);
            log.trace('The json proxy is instantiated');
            //configure controllers
            log.trace('Starting of application controllers instantiation');
            th._createControllers(application, application.controllers);
            log.trace('Application controllers are instantiated');
            //configure modules
            log.trace('Starting of application modules instantiation');
            var noModules = true;
            for(var i=0;i<application.modules.length;i++){
                noModules = false;
                var moduleConfig = application.modules[i];
                if(!moduleConfig.id){
                    util.throwError('module config does not have id');
                }
                if(!moduleConfig.home){
                    util.throwError('module config does not have home');
                }
                if(!moduleConfig.prefix){
                    util.throwError('module config does not have prefix');
                }
                if(!moduleConfig.moduleDeclarationClass){
                    util.throwError('module config does not have moduleDeclarationClass');
                }
                var module = th._createModule(moduleConfig.moduleDeclarationClass, moduleConfig.id, application);
                moduleConfig.instance = module;
            }
            if(noModules){
                log.trace('Application modules not found');
            }else{
                log.trace('Application modules are instantiated');
            }
            
        },
        
        _createControllers:function(application,controllerDefs){
            for(var i=0;i<controllerDefs.length;i++){
                var controllerDef = controllerDefs[i];
                if(!controllerDef.id){
                    util.throwError('controller definition does not have id');
                }
                if(!controllerDef.xclass){
                    util.throwError('controller definition does not have xclass');
                }
                var controller = th._createController(controllerDef.xclass, controllerDef.id, application, application, null);
            }
        },
        
        _createJsonProxy: function(application){
            var jsonProxy = th.ClassRegistry.createInstance("th.net.JsonProxy");
            if(application.jsonProxyInterceptorConfig){
                var jsonProxyInterceptor = th.ClassRegistry.createInstance("th.net.JsonProxyInterceptor",application.jsonProxyInterceptorConfig);
                jsonProxy.interceptor = jsonProxyInterceptor;
            }
            application.getJsonProxy = function(){
                return jsonProxy;
            };
        },
        
        /**
         * Creates and configures module. creates shortcut in the application.
         * @param xclass classname of the module
         * @param id identifier of the module
         * @param application the application
         * @returns create module
         */
        _createModule:function(xclass,id,application){
            var module = null;
            //TODO
            return module;
        },
        
        /**
         * Creates controller instance, sets it to owner, puts links to application and module (if any) inside the controller.
         * init method will not be invoked.
         * @param xclass classname of controller 
         * @param id identifier of the controller instance
         * @param owner application or module that ownes the controller
         * @param application the app
         * @param module module of the controller
         * @returns just created controller instance.
         */
        _createController:function(xclass, id, owner,application,module){
            log.trace('Configuring of'+(module?' module':'')+' controller '+id+' ('+xclass+')');
            var controller = th.ClassRegistry.createInstance(xclass);
            controller.application = application;
            if(module){
                controller.module = module;
            }
            var shortcutMethodName = 'get'+util.toUpperCaseFirstLetter(id)+'Controller';
            util.reflect.addMethod(owner, shortcutMethodName, function(){
                return controller;
            });
            owner._controllers[id] = controller;
            
            // configure gateways
            log.trace('Configuring of gateways of controller '+id);
            controller.getGateway = function(id){
                var me = controller;
                if(!id){
                    util.throwError('gateway id should be passed');
                }
                if(me._gateways[id]){
                    return me._gateways[id];
                }else{
                    util.throwError('unknown gateway id: '+id);
                }
            };
            var noGateways = true;
            for(var i=0;i<controller.gateways.length;i++){
                noGateways = false;
                var gatewayDef = controller.gateways[i];
                if(!gatewayDef.id){
                    util.throwError('gateway definition does not have id, see controller below',controller);
                }
                if(!gatewayDef.xclass){
                    util.throwError('gateway definition does not have xclass, see controller below',controller);
                }else if(!th.isKnownClass(gatewayDef.xclass)){
                    util.throwError('gateway with xclass "'+gatewayDef.xclass+'" is not registered, see controller below',controller);
                }
                th._createGateway(gatewayDef.xclass, gatewayDef.id, application, controller);
            }
            if(noGateways){
                log.trace('No gateways found for controller '+id);
            }else{
                log.trace('Gateways of controller '+id+' are configured');
            }
            log.trace((module?'Module c':'C')+'ontroller '+id+' ('+xclass+') is configured');
            log.trace('Configuring of selectors of controller '+id);
            controller.getView = function(viewId){
                var me = controller;
                if(!viewId){
                    util.throwError('view ref id should be passed');
                }
                if(me._selectors[viewId]){
                    return me._selectors[viewId].ref();
                }else{
                    util.throwError('unknown view ref id: '+viewId);
                }
            };
            var selectors = th._concatControllerSelectors(null, controller.selectors);
            jQuery.each(selectors,function(index,selector){
                th._configureControllerSelector(controller, selector);
            });
            if(selectors.length=0){
                log.trace('No selectors found for controller '+id);
            }else{
                log.trace('Selectors of controller '+id+' are configured');
            }
            return controller;
        },
        
        _concatControllerSelectors:function(parentSelectors, selectors){
            var parent = [];
            if(parentSelectors){
                parent = parentSelectors.slice(0);
            }
            var result = [];
            jQuery.each(selectors,function(index,selector){
                selector.selector = parent.concat(selector.selector);
                result.push(selector);
                if(!selector.selector){
                    return;
                }
                if(selector.descendants){
                    result = result.concat(th._concatControllerSelectors(selector.selector, selector.descendants));
                }
            });
            return result;
        },
        
        _configureControllerSelector: function(controller,selector){
            if(!selector.selector){
                util.throwError('selector must be specified. see controller below',controller);
            }
            if(selector.ref && !selector.ref.id){
                util.throwError('ref id of selector must be specified. see controller below',controller);
            }
            var selectorCacheObject = {};
            selectorCacheObject.selCfg = selector;
            selectorCacheObject.controller = controller;
            selectorCacheObject.updateEvents = function(){
                var me = selectorCacheObject;
                if(me.selCfg.events){
                    var foundComponents = th.UiRegistry.find(me.selCfg.selector);
                    jQuery.each(foundComponents,function(index,foundComponent){
                        jQuery.each(me.selCfg.events,function(event,callback){
                            foundComponent.getEventManager().addListener(callback,me.controller,event);
                        });
                    });
                }
            };
            selectorCacheObject.listener = function(){
                var me = selectorCacheObject;
                
                me.updateEvents();
            };
            selectorCacheObject.persistedResult = null;
            if(selectorCacheObject.selCfg.ref){
                selectorCacheObject.ref = function(){
                    var me = selectorCacheObject;
                    if(!me.selCfg.ref.cache){
                        return me.refRaw();
                    }else{
                        if(!me.persistedResult){
                            me.persistedResult = me.refRaw();
                        }
                        return me.persistedResult;
                    }
                };
                selectorCacheObject.refRaw = function(){
                    var me = selectorCacheObject;
                    var foundComponents = th.UiRegistry.find(me.selCfg.selector);
                    if(me.selCfg.ref.isArray){
                        return foundComponents;
                    }else{
                        if(foundComponents.length==0){
                            return null;
                        }else if(foundComponents.length==1){
                            return foundComponents[0];
                        }else{
                            util.throwError('Selector ref is configured to return only one value, '+
                                    'but 2 or more found. see controller and selector configs later',me.controller,me.selCfg); 
                        }
                    }
                };
            }
            
            if(selectorCacheObject.selCfg.ref){
                var selectorRefId = selectorCacheObject.selCfg.ref.id;
                if(controller._selectors[selectorRefId]){
                    util.throwError('Selector ref id duplicate is found. see controller below',controller);
                }
                controller._selectors[selectorRefId] = selectorCacheObject;
                var shortcutMethodName = 'get'+util.toUpperCaseFirstLetter(selectorRefId)+'View';
                util.reflect.addMethod(controller, shortcutMethodName, function(){
                    return selectorCacheObject.ref();
                });
                
            }else{
                controller._unnamedSelectors.push(selectorCacheObject);
            }
            
            th.UiRegistry.addOnChangeListener(selectorCacheObject.listener, selectorCacheObject);
        },
        
        _createGateway: function(xclass,id,application,controller){
            log.trace('Configuring gateway '+id);
            if(controller._gateways[id]){
                util.throwError('Gateway id duplicate is found. see controller below',controller);
            }
            var gateway = th.ClassRegistry.createInstance(xclass);
            gateway.application = application;
            gateway.controller = controller;
            
            var shortcutMethodName = 'get'+util.toUpperCaseFirstLetter(id)+'Gateway';
            util.reflect.addMethod(controller, shortcutMethodName, function(){
                return gateway;
            });
            controller._gateways[id] = gateway;
            log.trace('Gateway '+id+' is configured');
            return gateway;
        },
        
        _configureClassLoader: function(config, configurationCallback, classLoaderOnErrorCallBack){
            log.trace('Configuring of ClassLoader...');
            if (typeof config.developmentMode === "undefined") {
                config.developmentMode = true;
            }
            th.ClassLoader.developmentMode = config.developmentMode;
            if(!configurationCallback){
                util.throwError("usage error: no configuration callback");
            }
            th.util.type.ensureFunction(configurationCallback, "usage error: configuration callback should be a function");
            if(!config.thaliaConfig || !config.thaliaConfig.home){
                util.throwError("application config does not contain thalia home");
            }
            th.util.type.ensureString(config.thaliaConfig.home, "config error: thalia home should be a string");
            if(!config.applicationConfig || !config.applicationConfig.home){
                util.throwError("application config does not contain application home");
            }
            th.util.type.ensureString(config.applicationConfig.home, "config error: application home should be a string");
            if(!config.applicationConfig || !config.applicationConfig.prefix){
                util.throwError("application config does not contain application prefix");
            }
            th.util.type.ensureString(config.applicationConfig.prefix, "config error: application prefix should be a string");
            th.ClassLoader.thaliaHome = config.thaliaConfig.home;
            th.ClassLoader.applicationHome = config.applicationConfig.home;
            th.ClassLoader.applicationPrefix = config.applicationConfig.prefix;
            if(classLoaderOnErrorCallBack){
                th.ClassLoader.runOnError(classLoaderOnErrorCallBack);
            }
            log.trace('Retrieving of modules configuration');
            if(config.modulesConfigUrl){
                jQuery.ajax({
                    url: config.modulesConfigUrl,
                    type: 'GET',
                    cache: false,
                    dataType: 'json',
                    error: function(jqXHR, textStatus, errorThrown){
                        var msg = 'critical error: unable to load modules config';
                        alert(msg);
                        th.util.throwError(msg);
                    },
                    success:function(data, textStatus, jqXHR){
                        log.trace('Modules config is loaded');
                        if(!data.modules){
                            var msg = "wrong modules config";
                            alert(msg);
                            th.util.throwError(msg);
                        }
                        jQuery.each(data.modules,function(i,module){
                            if(!module.id){
                                util.throwError('module id must be specified',module);
                            }
                            if(!module.home){
                                util.throwError('module home must be specified',module);
                            }
                            if(!module.prefix){
                                util.throwError('module prefix must be specified',module);
                            }
                            if(!module.moduleDeclarationClass){
                                util.throwError('module declaration class must be specified',module);
                            }
                        });
                        th.ClassLoader.modules = data.modules;
                        config.modules = data.modules;
                        log.trace('ClassLoader is configured');
                        configurationCallback();
                    }
                });
            }else{
                log.trace('Modules configuration not found');
                log.trace('ClassLoader is configured');
                configurationCallback();
            }
        },
        
        _configureLogger: function(config){
            var loggerLevel = config.loggerLevel;
            if(!loggerLevel || loggerLevel==='error'){
                th.logger.traceEnabled = false;
                th.logger.debugEnabled = false;
                th.logger.infoEnabled = false;
            }else if(loggerLevel==='info'){
                th.logger.traceEnabled = false;
                th.logger.debugEnabled = false;
            }else if(loggerLevel==='debug'){
                th.logger.traceEnabled = false;
            }else if(loggerLevel!=='trace'){
                var msg = 'Unknown logger level: '+loggerLevel;
                log.error(msg);
                throw new Error(msg);
            }
        },
        
        define: function(){
            th.ClassRegistry.defineClass.apply(th.ClassRegistry,arguments);
        },
        
        
        isKnownClass: function(xclass){
            return th.ClassRegistry.isKnownClass(xclass);
        },
        
        create: function(xclassOrCfgWithXclass,configOrNothing){
            var xcls = xclassOrCfgWithXclass;
            var cfg = configOrNothing;
            if(!util.type.isString(xcls) && !cfg){// cfg instead of xclass
                var tmpCfg = jQuery.extend({},xcls);
                if(!tmpCfg.xclass){
                    util.throwError("xclass is not specified inside config object",tmpCfg);
                }
                xcls = tmpCfg.xclass;
                delete tmpCfg.xclass;
                cfg = tmpCfg;
            }
            if(!cfg){
                cfg = {};
            }
            return th.ClassRegistry.createInstance(xcls,cfg);
        }
};

th.logger = {
        traceEnabled    : true,
        debugEnabled    : true,
        infoEnabled     : true,
        errorEnabled    : true,
        
        
        log : function(type, args){
            console.log(type+' '+args[0]);
            for(var i =1; i < args.length; i++){
                console.log(args[i]);
            }
        },
        
        /**
         * 
         * @param message
         * @param exception
         * @param objects
         */
        trace : function (){
            if(!this.traceEnabled){
                return;
            }
            this.log('TRACE', arguments);
        },
        
        /**
         * 
         * @param message
         * @param exception
         * @param objects
         */
        debug : function (){
            if(!this.debugEnabled){
                return;
            }
            this.log('DEBUG', arguments);
        },
        
        /**
         * 
         * @param message
         * @param objects
         */
        info : function(){
            if(!this.infoEnabled){
                return;
            }
            this.log('INFO', arguments);
        },
        
        /**
         * 
         * @param message
         * @param objects
         */
        error : function(){
            if(!this.errorEnabled){
                return;
            }
            this.log('ERROR', arguments);
        }
};
var log = th.logger;

th.util = {
        reflect:{
            /**
             * Adds getter and setter to object of the property
             * @param object
             * @param propertyName
             */
            addAccessors: function(object, propertyName){
                var me = th.util.reflect;
                me.addGetter(object, propertyName);
                me.addSetter(object, propertyName);
            },
            
            /**
             * Adds setter to object for the property
             * @param object 
             * @param propertyName
             */
            addSetter: function(object, propertyName){
                var me = th.util.reflect;
                me._addAccessor(object, 'set', propertyName, function(newValue){
                    object[propertyName]=newValue;
                });
            },
            
            /**
             * Adds getter to object for the property
             * @param object
             * @param propertyName
             */
            addGetter: function(object, propertyName){
                var me = th.util.reflect;
                me._addAccessor(object, 'get', propertyName, function(){
                    return object[propertyName];
                });
            },
            
            /**
             * Adds accessor to the object
             * @param object        - object where to add accessor
             * @param prefix        - prefix of accessor (get|set)
             * @param propertyName  - name of property
             * @param method        - body of accessor
             */
            _addAccessor: function(object, prefix, propertyName, method){
                var me = th.util.reflect;
                var capitalizedProperty = th.util.toUpperCaseFirstLetter(propertyName);
                var setterName = prefix+capitalizedProperty;
                me.addMethod(object, setterName, method);
            },
            
            /**
             * Adds method to the object with specified name
             * @param object
             * @param methodName
             * @param method
             * @throws Error if methodName is already defined on the object
             */
            addMethod: function(object, methodName, method){
                if(object[methodName]){
                    var msg = methodName+' already defined under object, see next console entry for the object';
                    log.error(msg,object);
                    throw new Error(msg);
                }
                object[methodName] = method;
            },
            
            /**
             * converts xclass to path
             */
            xclassToPath: function(xclass){
                var me = th.util.reflect;
                if(!xclass){
                    me.throwError('xclass is undefined');
                }
                util.type.ensureString(xclass, "xclass should be a string");
                return xclass.replace(/\./g,'/')+'.js';
            },
            
            /**
             * extracts class name from xclass
             */
            xclassToName: function(xclass){
                var me = th.util.reflect;
                if(!xclass){
                    me.throwError('xclass is undefined');
                }
                util.type.ensureString(xclass, "xclass should be a string");
                var firstIndex = xclass.lastIndexOf(".")+1;
                return xclass.substring(firstIndex,xclass.length);
            },
            
            /**
             * @param instance
             * @param xclass
             * @returns true if, and only if, the instance is an instance of xclass (or child)
             */
            isInstanceOf: function(instance, xclass){
                if(instance.xclass == xclass){
                    return true;
                }else if(instance.parent){
                    return util.reflect.isInstanceOf(instance.parent,xclass);
                }
                return false;
            },
            
            _uniqueIdCounter: 100500,
            
            /**
             * Generates unique id for html tags 
             */
            generateUniqueId: function(){
                var me = th.util.reflect;
                var id = me._uniqueIdCounter++;
                return id;
            },
            
            setDefaultProperties: function(configObject,defaults){
                if(defaults){
                    jQuery.each(defaults,function(property,value){
                        if(!configObject[property]){
                            configObject[property] = value;
                        }
                    });
                }
            }
        },
        
        type:{
            
            /**
             * checks whether the v is string
             */
            isString: function(v){
                if(typeof v === 'string'){
                    return true;
                }else{
                    return false;
                }
            },
            
            /**
             * if v is not string, then throws new Error(errMsg)
             */
            ensureString: function(v,errMsg){
                var me = th.util.type;
                if(!me.isString(v)){
                    me.throwError(errMsg);
                }
                return true;
            },
            
            /**
             * checks whether the v is function
             */
            isFunction: function(v){
                if(typeof v === 'function'){
                    return true;
                }else{
                    return false;
                }
            },
            
            /**
             * if v is not function, then throws new Error(errMsg)
             */
            ensureFunction: function(v,errMsg){
                var me = th.util.type;
                if(!me.isFunction(v)){
                    me.throwError(errMsg);
                }
                return true;
            },
            
            /**
             * checks whether the v is number
             */
            isNumber: function(v){
                return isNaN(v);
            },
            
            /**
             * if v is not number, then throws new Error(errMsg)
             */
            ensureNumber: function(v,errMsg){
                var me = th.util.type;
                if(!me.isNumber(v)){
                    me.throwError(errMsg);
                }
                return true;
            },
            
            /**
             * checks whether the v is boolean
             */
            isBoolean: function(v){
                if(typeof v === 'boolean'){
                    return true;
                }else{
                    return false;
                }
            },
            
            /**
             * if v is not boolean, then throws new Error(errMsg)
             */
            ensureBoolean: function(v,errMsg){
                var me = th.util.type;
                if(!me.isBoolean(v)){
                    me.throwError(errMsg);
                }
                return true;
            },
            
            convertTimeToIsoString:function(timeMillis){
                var date = new Date(timeMillis);
                var month = date.getMonth();
                var day = date.getDate();
                var hours = date.getHours();
                var minutes = date.getMinutes();
                var seconds = date.getSeconds();
                month   = ''+(month<10  ?'0':'')+month;
                day     = ''+(day<10    ?'0':'')+day;
                hours   = ''+(hours<10  ?'0':'')+hours;
                minutes = ''+(minutes<10?'0':'')+minutes;
                seconds = ''+(seconds<10?'0':'')+seconds;
                return date.getFullYear()+'-'+month+'-'+day+' '+hours+':'+minutes+':'+seconds;
            }
        },
        
        dom:{
            _counter: 100500,
            
            /**
             * Generates unique id for html tags 
             */
            generateId: function(){
                var me = th.util.dom;
                var id = 'th'+me._counter++;
                if(jQuery("#"+id).length == 0){
                    return id;
                }else{
                    return me.generateId();
                }
            },
            
            _domGarbage: null,
            
            disposeElement: function(element,doRemoveFromParent,ignoreNullElement){
                var me = th.util.dom;
                if(!ignoreNullElement && !element){
                    util.throwError("element cannot be null");
                }
                if(!element){
                    return;
                }
                
                if(!me._domGarbage){
                    var garbageDiv = document.createElement('div');
                    garbageDiv.setAttribute("id", "domGarbage");
                    document.body.appendChild(garbageDiv);
                    me._domGarbage = jQuery(garbageDiv);
                    me._domGarbage.hide();
                }
                
                var el = jQuery(element);
                if(doRemoveFromParent){
                    el.remove();
                }
                me._domGarbage.append(el);
                me._domGarbage.html("");
            }
        },
        
        /**
         * Converts first letter of the string to uppercase and returns new string
         * @param str       - String whose first letter should be capitalized
         * @throws Error    - if str is not string or str is empty
         */
        toUpperCaseFirstLetter: function(str){
            //var me = th.util;
            if(typeof str !== 'string'){
                var errMsg = 'str is not string ('+(typeof str)+')';
                log.error(errMsg);
                throw new Error(errMsg);
            }
            if(!str || str.length<1){
                var errMsg = 'Empty string';
                log.error(errMsg);
                throw new Error(errMsg);
            }
            var firstChar = str.charAt(0);
            var capitalizedFirstChar = firstChar.toUpperCase();
            var remaningPart = str.substring(1,str.length);
            return capitalizedFirstChar+remaningPart;
        },
        
        /**
         * logs and throws error
         */
        throwError: function(){
            log.error.apply(log,arguments);
            throw new Error(arguments[0]);
        },
        
        /**
         * accepts arrays to merge. excludes duplicates by equality operator (==)
         * @returns new array contains elements of passed arrays (without duplicates).
         */
        mergeArrays: function(){
            var result = [];
            for(var i=0;i<arguments.length;i++){
                var array = arguments[i];
                for(var j=0;j<array.length;j++){
                    var item = array[j];
                    if(jQuery.inArray(item,result)==-1){
                        result.push(item);
                    }
                }
            }
            return result;
        },
        
        /**
         * Removes all occurrences of item in array. modifies array that is passed.
         * @param item item to remove
         * @param array from where to remove
         * @returns true if component found and removed. false otherwise.
         */
        removeFromArray: function(item, array){
            var index = -1;
            var result = false;
            while((index=jQuery.inArray(item,array))!=-1){
                array.splice(index, 1);
                result=true;
            }
            return result;
        }
        
};
var util = th.util;

th.ClassLoader = {
        
        developmentMode: false,
        
        /*============= INITIAL CONFIGURATION BEGIN =============*/
        /**
         * prefix for thalia classes
         */
        thaliaPrefix: 'th',
    
        /**
         * home directory of thalia
         */
        thaliaHome: null,
    
        /**
         * modules configuration, array of objects:
         * <pre>
         * {
         *      prefix: 'hdm.adapter.idp.http.basic'
         *      home: '/http-basic-idp-adapter/_js_/'
         * }
         * </pre>
         */
        modules:[],
    
        /**
         * Prefix of the application classes, eg 'hd' or 'some.app'
         */
        applicationPrefix: null,
    
        /**
         * home directory of the application
         */
        applicationHome: null,
    
        /**
         * if an error is happened on class loading AND the property is set to true, the ClassLoader will stop further loading.
         */
        haltOnError: true,
    
        /*============= INITIAL CONFIGURATION END =============*/
        /*============= STATE CONFIGURATION BEGIN =============*/
    
        /**
         * Array of URLs of class files to be loaded
         */
        _pendingClasses: [],
    
        /**
         * is set to true if, and only if, the ClassLoader is loading a script.
         */
        _isLoading: false,
        
        /**
         * Number of views that are loading now
         */
        _loadingViewsNumber:0,
    
        /**
         * object callback:
         * <pre>
         * {
         *      callback: function
         *      scope: object
         * }
         * </pre>
         * After ALL class files in the queue are successfully loaded the callback function will be called on the scope object (no parameters will be passed).
         * If at least one class file was not loaded (due to error) and haltOnError set to true the callback will not be called.
         */
        _onReadyCallback: null,
    
        /**
         * object callback:
         * <pre>
         * {
         *      callback: function
         *      scope: object
         * }
         * </pre>
         * If a class file is not succesfully loaded the callback function will be called on the scope object (url of class file will be sent as parameter).
         */
        _onErrorCallback: null,
    
        /**
         * the property is set to true if, and only if, at least one of class files was not successfully loaded.
         */
        _isLoadingError: false,
        /*============= STATE CONFIGURATION END =============*/
    
        /**
         * checks callback object
         */
        _checkCallbackObject: function(callbackObject){
            if(!callbackObject){
                var msg = 'callback object is not passed';
                log.error(msg);
                throw new Error(msg);
            }
            if(!callbackObject.callback){
                var msg = 'callback object does not have callback function';
                log.error(msg);
                throw new Error(msg);
            }
            if(!callbackObject.scope){
                var msg = 'callback object does not have scope, the callback will be called on empty object';
                log.trace(msg);
                callbackObject.scope = {};
            }
        },
    
        /**
         * The method should be called only BEFORE any file is passed to loadScript or loadClass methods.
         * @see th.ClassLoader#_onErrorCallback
         */
        runOnError: function(callbackObject){
            var me = th.ClassLoader;
            me._checkCallbackObject(callbackObject);
            var callback = callbackObject.callback;
            var scope = callbackObject.scope;
            me._onErrorCallback = {
                    callback: callback,
                    scope: scope
            };
        },
    
        /**
         * The method should be called only AFTER all files are passed to loadScript or loadClass methods.
         * @see th.ClassLoader#_onReadyCallback
         */
        runOnReady: function(callbackObject){
            var me = th.ClassLoader;
            me._checkCallbackObject(callbackObject);
            var callback = callbackObject.callback;
            var scope = callbackObject.scope;
            me._onReadyCallback = {
                    callback: callback,
                    scope: scope
            };
            me._runOnReadyCallbackIfReady();
        },
    
        /**
         * runs onReadyCallback if (ready and no errors) or (ready and haltOnError is set to false)
         * @see th.ClassLoader#_onReadyCallback
         */
        _runOnReadyCallbackIfReady: function(){
            var me = th.ClassLoader;
            if(!me._isLoading && !me._loadingViewsNumber && me._pendingClasses.length==0 && me._onReadyCallback){
                if(!me._isLoadingError || !me.haltOnError){
                    var callback = me._onReadyCallback.callback;
                    var scope = me._onReadyCallback.scope;
                    callback.call(scope);
                }
            }
        },
        
        /**
         * runs onErrorCallback
         * @see th.ClassLoader#_onErrorCallback
         */
        _runOnErrorCallback: function(url){
            var me = th.ClassLoader;
            if(me._onErrorCallback){
                var callback = me._onErrorCallback.callback;
                var scope = me._onErrorCallback.scope;
                callback.call(scope, url);
            }
        },
    
        /**
         * throws an error if _isLoadingError AND haltOnError properties are set to true.
         */
        _checkForError: function(){
            var me = th.ClassLoader;
            if(me._isLoadingError && me.haltOnError){
                var msg = "ClassLoader is halted";
                th.util.throwError(msg);
            }
        },
        
        _validateConfiguration:function(){
            var me = th.ClassLoader;
            if(!me.thaliaHome){
                th.util.throwError('thaliaHome is not set');
            }
            if(!me.thaliaPrefix){
                th.util.throwError('thaliaPrefix is not set');
            }
            if(!me.applicationHome){
                th.util.throwError('applicationHome is not set');
            }
            if(!me.applicationPrefix){
                th.util.throwError('applicationPrefix is not set');
            }
        },
    
        /**
         * returns path for xclass. 
         * checks thalia prefix first, then application prefix, then all modules. 
         * Throws an error if no matches found.
         */
        _getPathForClass: function(xclass){
            var me = th.ClassLoader;
            me._validateConfiguration();
            
            var xclassPath = th.util.reflect.xclassToPath(xclass);
            if(xclass.indexOf(me.thaliaPrefix)==0){
                return me.thaliaHome+xclassPath;
            }
            
            if(xclass.indexOf(me.applicationPrefix)==0){
                return me.applicationHome+xclassPath;
            }
            
            for(var i=0;i<me.modules.length;i++){
                var module = me.modules[i];
                if(xclass.indexOf(module.prefix)==0){
                    return module.home+xclassPath;
                }
            }
            
            th.util.throwError('cannot find home directory for class: '+xclass);
        },
        
        _getPathForViewTemplate: function(viewTemplate){
            var me = th.ClassLoader;
            me._validateConfiguration();
            var viewPath = viewTemplate.replace(/\./g,'/') +'.view.html';
            if(viewTemplate.indexOf(me.thaliaPrefix)==0){
                return me.thaliaHome+viewPath;
            }
            
            if(viewTemplate.indexOf(me.applicationPrefix)==0){
                return me.applicationHome+viewPath;
            }
            
            for(var i=0;i<me.modules.length;i++){
                var module = me.modules[i];
                if(viewTemplate.indexOf(module.prefix)==0){
                    return module.home+viewPath;
                }
            }
        },
        
        /**
         * Loads class by xclass
         */
        loadClass: function(xclass){
            var me = th.ClassLoader;
            me.loadScript(me._getPathForClass(xclass));
        },
    
        /**
         * loads script file by the url. 
         * If ClassLoader is loading another classfile/script the url will be pushed into queue for further loading
         */
        loadScript: function(url){
            var me = th.ClassLoader;
            
            me._checkForError();
            
            if(me._isLoading){
                me._pendingClasses.push(url);
                return;
            }
            me._isLoading = true;
            runInNewStack(function(){
                jQuery.ajax({
                    url: url,
                    dataType: 'text',
                    success: function(data){
                        var msg = 'script file '+url+' successfully loaded';
                        log.trace(msg);
                        var head = document.getElementsByTagName('head')[0];
                        var script = document.createElement('script');
                        script.type = 'text/javascript';
                        script.text = data+'\nth.ClassLoader._scriptLoaded();';
                        head.appendChild(script);
                    },
                    error: function(jqXHR, testStatus, error){
                        var msg = 'Unable to load script file, error message: '+testStatus+'; see error and jqXHR below.';
                        log.error(msg, error,jqXHR);
                        if(me._onErrorCallback){
                            me._runOnErrorCallback(url);
                        }
                        me._isLoadingError = true;
                        me._scriptLoaded();
                    },
                    async: true,
                    cache: !me.developmentMode
                });
            },me);
            
        },
        
        loadViewTemplate:function(templateName){
            var me = th.ClassLoader;
            
            me._checkForError();
            
            var path = me._getPathForViewTemplate(templateName);
            
            me._loadingViewsNumber++;
            
            jQuery.ajax({
                url: path,
                dataType: 'text',
                success: function(data){
                    var msg = 'view file '+path+' successfully loaded';
                    log.trace(msg);
                    th.ViewTemplateRegistry.addViewTemplate(templateName, data);
                    me._loadingViewsNumber--;
                    me._viewLoaded();
                },
                error: function(jqXHR, testStatus, error){
                    var msg = 'Unable to load view template file, error message: '+testStatus+'; see error and jqXHR below.';
                    log.error(msg, error,jqXHR);
                    if(me._onErrorCallback){
                        me._runOnErrorCallback(path);
                    }
                    me._isLoadingError = true;
                    me._loadingViewsNumber--;
                    me._viewLoaded();
                },
                async: true,
                cache: !me.developmentMode
            });
        },
        
        /**
         * the methods is invoked after each script load.
         */
        _scriptLoaded: function(){
            var me = th.ClassLoader;
            me._isLoading = false;
            if(me._pendingClasses.length==0){
                me._runOnReadyCallbackIfReady();
            }else{
                var next = me._pendingClasses.shift();
                me.loadScript(next);
            }
        },
        
        /**
         * the methods is invoked after each view load.
         */
        _viewLoaded:function(){
            var me = th.ClassLoader;
            me._runOnReadyCallbackIfReady();
        }
};

th.ViewTemplateRegistry = {
        _registry: {},
        
        addViewTemplate:function(viewTemplateName,templateText){
            var me = th.ViewTemplateRegistry;
            if(!viewTemplateName){
                util.throwError('ViewTemplate name must be provided');
            }
            if(!templateText){
                util.throwError('ViewTemplate text must be provided');
            }
            if(me._registry[viewTemplateName]){
                util.throwError('ViewTemplate with name "'+viewTemplateName+'" is already added');
            }
            me._registry[viewTemplateName] = templateText;
        },
        
        getViewTemplate:function(viewTemplateName){
            var me = th.ViewTemplateRegistry;
            if(me._registry[viewTemplateName]){
                return me._registry[viewTemplateName];
            }else{
                util.throwError('Unknown ViewTemplate: '+viewTemplateName);
            }
        },
        
        isKnownViewTemplate:function(viewTemplateName){
            var me = th.ViewTemplateRegistry;
            if(me._registry[viewTemplateName]){
                return true;
            }else{
                return false;
            }
        }
};

th.ClassRegistry = {
        
        /**
         * Registry
         */
        _registry: {},
        
        _loadDependcies: false,
        
        setLoadDependencies:function(load){
            var me = th.ClassRegistry;
            me._loadDependcies = load;
        },
        
        isLoadDependencies:function(){
            var me = th.ClassRegistry;
            return me._loadDependcies;
        },
        
        isKnownClass: function(xclass){
            var me = th.ClassRegistry;
            if(me._registry[xclass]){
                return true;
            }else{
                return false;
            }
        },
        
        /**
         * Returns class from registry
         */
        _getClass: function(xclass){
            var me = th.ClassRegistry;
            var obj = me._registry[xclass];
            return obj;
        },
        
        /**
         * Adds class in the registry
         */
        _addClass: function(classObject){
            var me = th.ClassRegistry;
            if(!classObject.xclass){
                util.throwError('Unable to register class without xclass property',classObject);
            }
            var tmpObject = me._getClass(classObject.xclass);
            if(tmpObject && !tmpObject._isLoadingStub){
                util.throwError('Class '+classObject.xclass+' already registered, unable to override; ' 
                		+'Seems like a copy&paste issue: please check that filename & classname are equals everywhere;'
                		+' see new class and old class objects for details)',classObject,tmpObject);
            }
            me._registry[classObject.xclass] = classObject;
            return classObject;
        },
        
        /**
         * Updates class in the registry
         */
        _updateClass: function(classObject){
            var me = th.ClassRegistry;
            if(!classObject.xclass){
                util.throwError('Unable to update class without xclass property',object);
            }
            me._registry[classObject.xclass] = classObject;
            return classObject;
        },
        
        /**
         * Loads class if it was not loaded before
         */
        _loadClass: function(xclass){
            var me = th.ClassRegistry;
            var config = me._getClass(xclass);
            if(!config){
                me._addClass({
                    xclass: xclass,
                    _isLoadingStub: true
                });
                th.ClassLoader.loadClass(xclass);
            }
        },
        
        /**
         * binds all classes
         */
        _bindClasses: function(){
            var me = th.ClassRegistry;
            for(var xclass in me._registry){
                if(me._registry.hasOwnProperty(xclass)){
                    me._bindClass(xclass);
                }
            }
        },
        
        /**
         * Binds class
         */
        _bindClass: function(xclass){
            var me = th.ClassRegistry;
            var config = me._getClass(xclass);
            if(!config){
                util.throwError('Critical error, unable to find component: '+xclass);
            }
            if(config._isBound){
                return;
            }
            if(config.extend){
                var parentConfig = me._getClass(config.extend);
                if(!parentConfig){
                    util.throwError('Parent class '+xclass+' is not defined');
                }
                if(parentConfig._isLoadingStub){
                    util.throwError('Parent class '+config.extend+' not found');
                }
                if(!parentConfig._isBound){
                    me._bindClass(parentConfig.xclass);
                    parentConfig = me._getClass(config.extend);
                }
                config = me._extend(parentConfig,config,true);
            }else{
                config = jQuery.extend(true,{},config);
            }
            config._isBound = true;
            if(config._afterBinding && util.type.isFunction(config._afterBinding)){
                config._afterBinding(config);
            }
            me._updateClass(config);
        },
        
        /**
         * Defines class
         */
        defineClass: function(xclass, config){
            var me = th.ClassRegistry;
            config.xclass = xclass;
            me._addClass(config);
            //parent processing
            if(config.extend){
                if(me.isLoadDependencies()){
                    me._loadClass(config.extend);
                }
            }
            //require processing
            if(config.require){
                if(config.require instanceof Array){
                    for(var i = 0; i < config.require.length; i++){
                        var requiredComponent = config.require[i];
                        th.util.type.ensureString(requiredComponent, 'required defintions on object '+xclass+' must be instances of String');
                        if(me.isLoadDependencies()){
                            me._loadClass(requiredComponent);
                        }
                    }
                }else{
                    if(config.require.classes){
                        if(!(config.require.classes instanceof Array)){
                            util.throwError('\"require.classes\" property on object '+xclass+' must be an instance of Array');
                        }
                        for(var i = 0; i < config.require.classes.length; i++){
                            var requiredComponent = config.require.classes[i];
                            th.util.type.ensureString(requiredComponent, 'required.classes defintions on object '+xclass+' must be instances of String');
                            if(me.isLoadDependencies()){
                                me._loadClass(requiredComponent);
                            }
                        }
                    }
                    if(config.require.views){
                        if(!(config.require.views instanceof Array)){
                            util.throwError('\"require.views\" property on object '+xclass+' must be an instance of Array');
                        }
                        for(var i = 0; i < config.require.views.length; i++){
                            var requiredView = config.require.views[i];
                            th.util.type.ensureString(requiredView, 'required.views defintions on object '+xclass+' must be instances of String');
                            if(me.isLoadDependencies()){
                                th.ClassLoader.loadViewTemplate(requiredView);
                            }
                        }
                    }
                }
            }
        },
        
        /**
         * Creates instance of a class.
         */
        createInstance: function(xclass, config){
            var me = th.ClassRegistry;

            if(!xclass){
                util.throwError('class name should be passed');
            }
            if(!config){
                config = {};
            }
            var parentConfig = me._getClass(xclass);
            if(!parentConfig){
                util.throwError('Class '+xclass+' is not defined');
            }
            var xclass = parentConfig.xclass;
            var xinstanceid = '$'+Math.floor(Math.random()*(new Date().getTime()));
            var object = me._extend(parentConfig,config,false);
            object.xclass = xclass;
            object.xinstanceid = xinstanceid;
            object.extend = parentConfig.xclass;
            if(object._init && util.type.isFunction(object._init)){
                object._init.call(object);
            }
            return object;
        },
        
        _nonInheritedMethods:[
             '_afterBinding'
         ],
        
        /**
         * Extends child from parent
         */
        _extend: function(parent, child,deepCopyChildConfig){
            var me = th.ClassRegistry;
            var child_1 = jQuery.extend(deepCopyChildConfig?true:false,{},child);
            var parent_1 = jQuery.extend(true,{},parent);
            for(property in parent_1){
                if(typeof parent_1[property] === "function"){
                    if(!child_1[property]){
                        me._extendMethod(child_1, property);
                    }
                }
            }
            var child_2 = jQuery.extend(deepCopyChildConfig?true:false,{},parent_1,child_1);
            child_2.parent = parent_1;
            for(var i = 0;i<me._nonInheritedMethods.length;i++){
                delete child_2[me._nonInheritedMethods[i]];
            }
            return child_2;
        },
        
        
        /**
         * creates method that is only invoking corresponding superclass method
         */
        _extendMethod: function(object, methodName){
            var me = th.ClassRegistry;
            object[methodName]=function(){
                var args = Array.prototype.slice.call(arguments);
                var superClass = this.parent;
                if(args.length>0){
                    var tmpSuperClass = args.pop();
                    //delete this trace
                    /*if(this===tmpSuperClass){
                        console.log('=========================Warning: self detected: '+this.xclass+':'+methodName+'=========================');
                    }*/
                    //delete this trace
                    if(this!==tmpSuperClass && me._isSuperClass(this,tmpSuperClass)){
                        superClass = tmpSuperClass.parent;
                    }else{
                        args.push(tmpSuperClass);
                    }
                }
                args.push(superClass);
                return superClass[methodName].apply(this,args);
            };
        },
        
        
        /**
         * checks whether the parent is superclass of child. The method is designed to be used only to extend methods.
         * @param child
         * @param parent
         * @return true if (the child is subclass of the parent) OR (the child is same as the parent)
         */
        _isSuperClass: function(child, parent){
            var me = th.ClassRegistry;
            if(child===parent){
                return true;
            }
            if(child.parent){
                if(parent===child.parent){
                    return true;
                }else{
                    return me._isSuperClass(child.parent,parent);
                }
            }else{
                return false;
            }
        },
        
        exportListOfClasses: function(prefix){
            var me = th.ClassRegistry;
            var result = [];
            jQuery.each(me._registry,function(xclass,classObject){
                if(!prefix || (xclass.indexOf(prefix)==0)){
                    result.push(xclass);
                }
            });
            return result;
        }
};

th.UiRegistry = {
    registry:{},
    
    putOutEvents: true,
    
    listeners: [],
    
    addOnChangeListener: function(listenerCallback,scope){
        var me = th.UiRegistry;
        jQuery.each(me.listeners,function(index,listener){
            if(listener.callback===listenerCallback){
                util.throwError('UiRegistry  on change listener is already added (1->stored listener, 2->new scope)',listener,scope);
            }
        });
        me.listeners.push({
            callback: listenerCallback,
            scope: scope
        });
    },
    
    removeOnChangeListener: function(listenerCallback){
        var me = th.UiRegistry;
        for(var i=0;i<me.listeners.length;i++){
            if(me.listeners[i].callback==listenerCallback){
                me.listeners.splice(i, 1);
                return;
            }
        }
    },
    
    fireOnChangeEvent: function(){
        var me = th.UiRegistry;
        if(me.putOutEvents){
            return;
        }
        jQuery.each(me.listeners,function(index,listener){
            listener.callback.call(listener.scope);
        });
    },
    
    enableEvents: function(runChange){
        var me = th.UiRegistry;
        if(!me.putOutEvents){
            util.throwError('events are already enabled');
        }
        me.putOutEvents = false;
        if(runChange){
            me.fireOnChangeEvent();
        }
    },
    
    /**
     * adds component to the registry
     */
    addComponent: function(component){
        var me = th.UiRegistry;
        if(!component.xclass){
            util.throwError('Unable to add component without xclass property',component);
        }
        component.getEventManager().addListener(me.fireOnChangeEvent,me,'AncestorAdded');
        var xclass = component.xclass;
        if(!me.registry[xclass]){
            me.registry[xclass] = [];
        }
        var array = me.registry[xclass];
        for(var i = 0; i<array.length; i++){
            if(array[i]===component){
                util.throwError('Component already registered',component);
            }
        }
        array.push(component);
        me.fireOnChangeEvent();
    },
    
    removeComponent: function(component){
        var me = th.UiRegistry;
        if(!component.xclass){
            util.throwError('Unable to remove component without xclass property',component);
        }
        var xclass = component.xclass;
        if(!me.registry[xclass]){
            return;
        }
        var array = me.registry[xclass];
        for(var i = 0; i<array.length; i++){
            if(array[i]===component){
                array.splice(i,1);
                return;
            }
        }
    },
    /* selector demo
        selector: [{xclass: 'app.test.t',filter:{attr:'value'}},
                   {xclass: 'app.test.d',filter:{attr:'value'}}]
    }],*/
    
    
    /**
     * Searches for component that matches selector. calculates selector from parent to child.
     */
    findReverse: function(selector){
        var me = th.UiRegistry;
        me._validateSelector(selector);
        var result = [];
        var firstEntry = selector[0];
        if(firstEntry.xclass && me.registry[firstEntry.xclass]){
            result = me._checkComponentsForSelectorReverse(me.registry[firstEntry.xclass], selector);
        }else{
            jQuery.each(me.registry,function(xclass,components){
                result = result.concat(me._checkComponentsForSelectorReverse(components, selector));
            });
        }
        return result;
    },
    
    
    _checkComponentsForSelectorReverse:function(components,selector){
        var me = th.UiRegistry;
        var result = [];
        var firstEntry = selector[0];
        var isLast = (selector.length==1);
        var remainedSelector = [];
        if(!isLast){
            remainedSelector = selector.slice(1);
        }
        jQuery.each(components,function(i,component){
            if(me._checkComponentForSelectorEntry(component, firstEntry)){
                if(isLast){
                    result.push(component);
                }else if(component.descendants){
                    result = result.concat(me._checkComponentsForSelectorReverse(component.descendants, remainedSelector));
                }
            }else if(component.descendants){
                result = result.concat(me._checkComponentsForSelectorReverse(component.descendants, selector));
            }
        });
        return result;
    },
    
    _checkComponentForSelectorEntry: function(component,selEntry){
        if(selEntry.xclass){
            if(component.xclass!==selEntry.xclass){
                return false;
            }
        }
        if(selEntry.subclassOf){
            if(!util.reflect.isInstanceOf(component, selEntry.subclassOf)){
                return false;
            }
        }
        if(selEntry.checker){
            if(!selEntry.checker(component)){
                return false;
            }
        }
        if(selEntry.filter){
            for(var propertyName in selEntry.filter){
                if(selEntry.filter.hasOwnProperty(propertyName)){
                    if(selEntry.filter[propertyName]!=component[propertyName]){
                        return false;
                    }
                }
            }
        }
        return true;
    },
    
    /**
     * Searches for component that matches selector. calculates selector from child to parent.
     * @param selector
     */
    find: function(selector){
        var me = th.UiRegistry;
        me._validateSelector(selector);
        var result = [];
        var lastSelEntry = selector[selector.length-1];
        if(lastSelEntry.xclass){
            var xclass = lastSelEntry.xclass;
            if(me.registry[xclass]){
                jQuery.each(me.registry[xclass],function(index,value){
                    if(me._checkComponentForSelector(value, selector,true)){
                        result.push(value);
                    }
                });
            }
        }else{
            jQuery.each(me.registry,function(xclass,instances){
                jQuery.each(instances,function(index,value){
                    if(me._checkComponentForSelector(value, selector,true)){
                        result.push(value);
                    }
                });
            });
        }
        return result;
    },
    
    _validateSelector:function(selector){
        if(!selector){
            util.throwError('Selector cannot be null');
        }
        if(selector.length<1){
            util.throwError('Selector cannot be empty');
        }
        jQuery.each(selector,function(index,entry){
            if(!entry.xclass && !entry.subclassOf && !entry.checker && !entry.filter){
                util.throwError("Selector entry must have specifiedn xclass or(and) subclassOf or(and) checker",selector);
            }
        }); 
     },
    
    _checkComponentForSelector:function(component,selector,first){
        var me = th.UiRegistry;
        var sel = selector.slice(0);
        var selEntry = sel.pop();
        
        var cmpMatched = me._checkComponentForSelectorEntry(component,selEntry);
        if(!cmpMatched && first){
            return false;
        }
        var _sel = cmpMatched?sel:selector;
        if(_sel.length==0){
            return cmpMatched;
        }else if(component.ancestor){
            return me._checkComponentForSelector(component.ancestor,_sel);
        }
        return false;
    },
    
    
    _checkComponentForSelectorEntry00: function(component,selectorEntry){
        var xclass = component.xclass;
        if(xclass === selectorEntry.xclass){
            if(selectorEntry.filter){
                for(var propertyName in selectorEntry.filter){
                    if(selectorEntry.filter.hasOwnProperty(propertyName)){
                        if(selectorEntry.filter[propertyName]!=component[propertyName]){
                            return false;
                        }
                    }
                }
            }
            return true;
        }else{
            return false;
        }
    },
    
    
    
    
    createAndRegister: function(xclassOrCfgWithXclass,configOrNothing){
        var me = th.UiRegistry;
        var component = th.create(xclassOrCfgWithXclass,configOrNothing);
        me.addComponent(component);
        return component;
    }
    
};