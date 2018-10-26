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
th.define("th.data.Gateway",{
    
    extend: 'th.lang.Class',
    
    /**
     * Reference to the application.
     */
    application: null,
    
    /**
     * Reference to the controller that owns the gateway
     */
    controller:null,
    
    /**
     * Contains xclass (string) of entity.
     */
    entityClass: null,
    
    //TODO what if no id?
    /**
     * Name of ID field of entity
     */
    idFieldName: 'id',
    
    /**
     * base url
     */
    baseUrl: null,
    
    destroyed: false,

    suffixes:{
        list    : '',//get
        get     : '/get?{id}',//get
        remove  : '/remove?{id}',//get
        create  : '/create',//post
        update  : '/update'//post
    },
    
    _urls:{
        list    : null,
        get     : null,
        remove  : null,
        create  : null,
        update  : null
    },
    
    /**
     * the method must not be overrided.
     */
    _init: function(theClass){
        var me = this;
        if(!theClass){
            theClass = me;
        }
        theClass.parent._init.call(this,theClass.parent);
        me._ensureValid();
        me._urls.list = me.baseUrl + me.suffixes.list;
        var getSuffix = me.suffixes.get.replace(/\{id\}/g, me.idFieldName+'={id}');
        me._urls.get = me.baseUrl + getSuffix;
        var removeSuffix = me.suffixes.remove.replace(/\{id\}/g, me.idFieldName+'={id}');
        me._urls.remove = me.baseUrl + removeSuffix;
        me._urls.create = me.baseUrl + me.suffixes.create;
        me._urls.update = me.baseUrl + me.suffixes.update;
    },
    
    _setId: function(urlWithPlaceHolder, id){
        return urlWithPlaceHolder.replace(/\{id\}/g,id);
    },
    
    _ensureValid: function(){
        var me = this;
        if(!me.entityClass){
            util.throwError('Entity class is not set, see gateway below',me);
        }
        if(!me.idFieldName){
            util.throwError('Entity id field name is not set, see gateway below',me);
        }
        if(!me.baseUrl){
            util.throwError('base url is not set, see gateway below',me);
        }
        if(me.suffixes.list!=='' && !me.suffixes.list){
            util.throwError('list url suffix is not set, see gateway below',me);
        }
        if(me.suffixes.get!=='' && !me.suffixes.get){
            util.throwError('get url suffix is not set, see gateway below',me);
        }
        if(me.suffixes.remove!=='' && !me.suffixes.remove){
            util.throwError('remove url suffix is not set, see gateway below',me);
        }
        if(me.suffixes.create!=='' && !me.suffixes.create){
            util.throwError('create url suffix is not set, see gateway below',me);
        }
        if(me.suffixes.update!=='' && !me.suffixes.update){
            util.throwError('update url suffix is not set, see gateway below',me);
        }
    },
    
    
    /**
     * Does list query
     * @param config {
     *      extraParams:    extraParameters to send to server as query parameters.
     *      onError:        function to call back on error, parameters: jqXHR, textStatus, errorThrown.
     *      onSuccess:      function to call back on success, parameters: data, textStatus, jqXHR.
     *      onIntercept:    function to call back if response was captured by the interceptor, no parameters.
     *      messageOnError: if true, then error message will be shown
     *      scope:          scope of callback functions.
     * }
     */
    list: function(config){
        var me = this;
        me._checkDestroyed();
        var jsonProxy = th.application.getJsonProxy();
        jsonProxy.doGet({
            url             : me._urls.list,
            scope           : config.scope,
            extraParams     : config.extraParams,
            onError         : config.onError,
            onIntercept     : config.onIntercept,
            messageOnError  : config.messageOnError,
            onSuccess       : function(data, textStatus, jqXHR){
                var resultData = [];
                if(data.data){
                    for(var i = 0; i<data.data.length;i++){
                        var rawEntry = data.data[i];
                        var entity = th.create(me.entityClass);
                        entity.deserialize(rawEntry);
                        resultData.push(entity);
                    }
                }else{
                    log.error('wrong response format: no data property or data property is not array',data,jqXHR);
                }
                config.onSuccess.call(config.scope || config, resultData, textStatus, jqXHR);
            }
        });
    },
    
    /**
     * Does get query
     * @param id
     * @param config {
     *      extraParams:    extraParameters to send to server as query parameters.
     *      onError:        function to call back on error, parameters: jqXHR, textStatus, errorThrown.
     *      onSuccess:      function to call back on success, parameters: data, textStatus, jqXHR.
     *      onIntercept:    function to call back if response was captured by the interceptor, no parameters.
     *      messageOnError: if true, then error message will be shown
     *      scope:          scope of callback functions.
     * }
     */
    get: function(id, config){
        var me = this;
        me._checkDestroyed();
        var jsonProxy = th.application.getJsonProxy();
        var url = me._setId(me._urls.get, id);
        jsonProxy.doGet({
            url             : url,
            scope           : config.scope,
            extraParams     : config.extraParams,
            onError         : config.onError,
            onIntercept     : config.onIntercept,
            messageOnError  : config.messageOnError,
            onSuccess       : function(data, textStatus, jqXHR){
                var resultData = null;
                if(data.data){
                    var rawEntry = data.data;
                    var entity = th.create(me.entityClass);
                    entity.deserialize(rawEntry);
                    resultData = entity;
                }else{
                    log.error('wrong response format: no data property',data,jqXHR);
                }
                config.onSuccess.call(config.scope || config, resultData, textStatus, jqXHR);
            }
        });
    },
    
    /**
     * Does remove query
     * @param id
     * @param config {
     *      extraParams:    extraParameters to send to server as query parameters.
     *      onError:        function to call back on error, parameters: jqXHR, textStatus, errorThrown.
     *      onSuccess:      function to call back on success, parameters: data, textStatus, jqXHR.
     *      onIntercept:    function to call back if response was captured by the interceptor, no parameters.
     *      messageOnError: if true, then error message will be shown
     *      scope:          scope of callback functions.
     * }
     */
    remove: function(id, config){
        var me = this;
        me._checkDestroyed();
        var jsonProxy = th.application.getJsonProxy();
        var url = me._setId(me._urls.remove, id);
        jsonProxy.doGet({
            url             : url,
            scope           : config.scope,
            extraParams     : config.extraParams,
            onError         : config.onError,
            onIntercept     : config.onIntercept,
            messageOnError  : config.messageOnError,
            onSuccess       : config.onSuccess
        });
    },
    
    /**
     * Does create query
     * @param entity
     * @param config {
     *      onError:        function to call back on error, parameters: jqXHR, textStatus, errorThrown.
     *      onSuccess:      function to call back on success, parameters: data, textStatus, jqXHR.
     *      onIntercept:    function to call back if response was captured by the interceptor, no parameters.
     *      messageOnError: if true and !onError, then error message will be shown
     *      scope:          scope of callback functions.
     * }
     */
    create: function(entity, config){
        var me = this;
        me._checkDestroyed();
        var jsonProxy = th.application.getJsonProxy();
        var json = entity.serialize();
        jsonProxy.doPost({
            url             : me._urls.create,
            scope           : config.scope,
            data            : json,
            onError         : config.onError,
            onIntercept     : config.onIntercept,
            messageOnError  : config.messageOnError,
            onSuccess       : function(data, textStatus, jqXHR){
                var resultData = null;
                if(data.data){
                    var entity = th.create(me.entityClass);
                    entity.deserialize(data.data);
                    resultData = entity;
                }else{
                    log.error('wrong response format: no data property',data,jqXHR);
                }
                config.onSuccess.call(config.scope || config, resultData, textStatus, jqXHR);
            }
        });
    },
    
    /**
     * Does update query
     * @param entity
     * @param config {
     *      onError:        function to call back on error, parameters: jqXHR, textStatus, errorThrown.
     *      onSuccess:      function to call back on success, parameters: data, textStatus, jqXHR.
     *      onIntercept:    function to call back if response was captured by the interceptor, no parameters.
     *      messageOnError: if true, then error message will be shown
     *      scope:          scope of callback functions.
     * }
     */
    update: function(entity, config){
        var me = this;
        me._checkDestroyed();
        var jsonProxy = th.application.getJsonProxy();
        var json = entity.serialize();
        jsonProxy.doPost({
            url             : me._urls.update,
            scope           : config.scope,
            data            : json,
            onError         : config.onError,
            onIntercept     : config.onIntercept,
            messageOnError  : config.messageOnError,
            onSuccess       : function(data, textStatus, jqXHR){
                var resultData = null;
                if(data.data){
                    var entity = th.create(me.entityClass);
                    entity.deserialize(data.data);
                    resultData = entity;
                }else{
                    log.error('wrong response format: no data property',data,jqXHR);
                }
                config.onSuccess.call(config.scope || config, resultData, textStatus, jqXHR);
            }
        });
    },
    
    /**
     * If entity id field is not null then update query will be done, create otherwise
     * @param entity
     * @param config {
     *      onError:        function to call back on error, parameters: jqXHR, textStatus, errorThrown.
     *      onSuccess:      function to call back on success, parameters: data, textStatus, jqXHR.
     *      onIntercept:    function to call back if response was captured by the interceptor, no parameters.
     *      messageOnError: if true, then error message will be shown
     *      scope:          scope of callback functions.
     * }
     */
    save: function(entity, config){
        var me = this;
        me._checkDestroyed();
        if(entity.get(me.idFieldName)){
            me.update(entity, config);
        }else{
            me.create(entity, config);
        }
    },
    
    _checkDestroyed:function(){
        var me = this;
        if(me.destroyed){
            util.throwError("Gateway is destroyed",me);
        }
    },
    
    destroy:function(){
        var me = this;
        if(!me.destroyed){
            me.destroyed = true;
            me.application = null;
            me.controller = null;
        }
    }
    
});