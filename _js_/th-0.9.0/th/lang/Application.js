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

th.define("th.lang.Application",{
    
    extend: 'th.lang.Class',
    
    require: {
        classes:[
            'th.net.JsonProxy',
            'th.lang.EventManager',
            'th.lang.NavigationLock',
            'th.lang.PathManager'
        ],
        views:[
            'th.lang.ApplicationLoadingMask'
        ]
    },
    
    _loader_counter : 0,
    _loadingMask: null,
    _loadingMaskNumber: null,
    
    /**
     * Event Manager.
     */
    eventManager: null,
    
    /**
     * Path manager
     */
    pathManager: null,
    
    /**
     * Navigation lock
     */
    navigationLock: null,
    
    /**
     * application version (config version)
     */
    version: '1.0.0',
    
    loggerLevel: 'error',
    
    
    
    /**
     * Framework location:
     * <pre>
     * {
     *      home: '../_js_/'
     * }
     * </pre>
     */
    thaliaConfig: null,
    
    /**
     * Application classes prefix and source location
     * <pre>
     * {
     *      home: '../_js_test/',
     *      prefix: 'app.'
     * }
     * </pre>
     */
    applicationConfig: null,
    
    /**
     * url from were to retrieve modules definitions (json):
     * <pre>
     * {
     *      data: [{
     *          id: 'FirstModule',
     *          home: '/path/to/source/folder/of/first/module/',
     *          prefix: 'prefix.of.first.module',
     *          moduleDeclarationClass: 'prefix.of.first.module.FirstModule'
     *      },{
     *          id: 'SecondModule',
     *          home: '/path/to/source/folder/of/second/module/',
     *          prefix: 'prefix.of.second.module',
     *          moduleDeclarationClass: 'prefix.of.second.module.SecondModule'
     *      }]
     * }
     * 
     * Retrieved data array will be saved at the application under 'modules' property.
     * Each object will also contain "instance" property with module definition instance
     * </pre>
     */
    modulesConfigUrl: null,
    
    /**
     * Array of modules definition that was retrieved from modulesConfigUrl
     */
    modules:[],
    
    /**
     * modules cache. required to get module quickly by id. don't use directly.
     */
    _modules:{},
    
    /**
     * Array of controller definitions
     * [{
     *      id: 'First',      xclass: 'app.controller.FirstController'
     * },{
     *      id: 'Second',     xclass: 'app.controller.SecondController'
     * }]
     * 
     * After init method is called, all of them will be available via get<id>Controller method,
     * for example if id will be "first" or "First"
     * then the view can be obtained via getFirstController method call under this object. No parameters are required for the method.
     * Also: getController(id)
     * <b>Note! all controllers should be "required"</b>
     */
    controllers:[],
    
    /**
     * controllers cache. required to get controller quickly by id. don't use directly.
     */
    _controllers: {},
    
    /**
     * Global ajax interceptor. see th.net.JsonProxyInterceptor
     */
    jsonProxyInterceptorConfig:{
        interceptSuccess: function(response, textStatus, jqXHR){
            return response;
        },
        interceptError: function(jqXHR, textStatus, errorThrown){
            return true;
        }
    },
    
    
    /**
     * Returns supported event types
     */
    _getSupportedEventTypes: function(theClass){
        var eventTypes = [
                'DocumentClick'
        ];
        return eventTypes;
    },
    
    
    
    _init: function(theClass){
        var me = this;
        if(!theClass){
            theClass = me;
        }
        theClass.parent._init.call(this,theClass.parent);
        var supportedEventTypes = me._getSupportedEventTypes();
        var eventManager = th.create("th.lang.EventManager",{
            eventTypes: supportedEventTypes,
            owner: me
        });
        
        me.eventManager = eventManager;
        jQuery(document).click(function(e){
            eventManager.fireEvent('DocumentClick',{
                source:me,
                event:e
            });
        });
        
        me.pathManager = th.create("th.lang.PathManager");
        me.navigationLock = th.create('th.lang.NavigationLock');
    },
    
    /**
     * Returns event manager for the component
     * @returns
     */
    getEventManager: function(){
        var me = this;
        return me.eventManager;
    },
    
    getNavigationLock: function(){
        var me = this;
        return me.navigationLock;
    },
    
    getPathManager: function(){
        var me = this;
        return me.pathManager;
    },
    
    initViews: function(){
        
    },
    
    initControllers: function(){
        
    },
    
    run: function(){
        
    },
    
    /**
     * Returns module by id
     * @param id identifier of the module
     * @returns
     */
    getModule:function(id){
        var me = this;
        if(!id){
            util.throwError('module id should be passed');
        }
        if(me._modules[id]){
            return me._modules[id];
        }else{
            util.throwError('unknown module id: '+id);
        }
    },
    
    /**
     * Returns controller by id
     * @param id identifier of the controller
     * @returns
     */
    getController:function(id){
        var me = this;
        if(!id){
            util.throwError('controller id should be passed');
        }
        if(me._controllers[id]){
            return me._controllers[id];
        }else{
            util.throwError('unknown controller id: '+id);
        }
    },
    
    /**
     * Shows loading mask
     */
    showLoading: function(){
        var me = this;
        if(me._loader_counter>0){
            me._loader_counter++;
            me._loadingMaskNumber.text(me._loader_counter);
            return;
        }
        if(!me._loadingMask){
            me._loader_counter++;
            me._loadingMask = jQuery(th.ViewTemplateRegistry.getViewTemplate('th.lang.ApplicationLoadingMask'));
            me._loadingMaskNumber = me._loadingMask.find('[data-thid=number]');
            me._loadingMaskNumber.text(me._loader_counter);
            jQuery(document.body).append(me._loadingMask);
        }
    },
    
    /**
     * Hides loading mask
     */
    hideLoading: function(){
        var me = this;
        if(me._loader_counter>0){
            me._loader_counter--;
        }
        if(me._loader_counter==0){
            if(me._loadingMask){
                util.dom.disposeElement(me._loadingMask,true,false);
                me._loadingMask = null;
                me._loadingMaskNumber = null;
            }
        }else{
            me._loadingMaskNumber.text(me._loader_counter);
        }
    }
});