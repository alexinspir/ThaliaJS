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

th.define("th.lang.Controller",{
    
    extend: 'th.lang.Class',
    
    require: [
        'th.net.JsonProxy'/*
        '...'*/
    ],
    
    /**
     * Reference to the application.
     */
    application: null,
    
    /**
     * Reference to the module of controller (if any).
     */
    module: null,
    
    /**
     * Contains array of gateways definitions:
     * [{
     *      id: 'FirstEntity',      xclass: 'app.gateway.FirstEntityGateway'
     * },{
     *      id: 'SecondEntity',     xclass: 'app.gateway.SecondEntityGateway'
     * }]
     * 
     * After init method is called, all of them will be available via get<id>Gateway method,
     * for example if id will be "firstEntity" or "FirstEntity"
     * then the gateway can be obtained via getFirstEntityGateway method call under this object. No parameters are required for the method.
     * <b>Note! all gateways should be "required"</b>
     */
    gateways:[],
    
    /**
     * gateways cache. required to get gateway quickly by id. don't use directly.
     */
    _gateways: {},
    
    selectors: [/*{
        //can be null, then only listeners will be set
        ref: {
            // can be accessible via this.getMyComponentView(); or this.getView('MyComponent');
            id: 'MyComponent', 
            // if isArray==true, then this.getMyComponentView() will return array of results (array can be empty), 
            //otherwise will return found component or null (if results.length>1 will throw an exception)
            //default false
            isArray: false,
            // if cache==true, then selector will be processed on first call (in case of array) 
            // or while result will be non-null (in case of non-array) and result will be cached. 
            // otherwise selector will be calculated each time.
            // default false
            cache: false
        },
        // selector to find component(s).
        // required
        selector: [{xclass: 'app.test.t',filter:{attr:'value'}},
                   {xclass: 'app.test.d',filter:{attr:'value'}}],
        //events to be set on found components. scope is always this controller object
        //if new view component are added to UI registry, then all selectors will be recalculated
        events:{
            // eventname: callback
            // @param eventType string representation of event type
            // @param eventObject object. always contains key 'source'.
            BeforeDispose: function(eventType,eventObject){
                
            }
        },
    }*/],
    
    /**
     * PathManager invokes the method on change of the path
     * @param attrs
     */
    handleRequest:function(path, alias,attrs){
        util.throwError('Override me');
    },
    
    /**
     * selectors cache. required to get selector quickly by id. never use directly.
     */
    _selectors:{},
    
    /**
     * unnamed (without ref) selectors cache. never use directly.
     */
    _unnamedSelectors:[],
    
    createViewComponent: function(xclass){
        var me = this;
        var component = th.UiRegistry.createAndRegister(xclass);
        component.controller = me;
        return component;
    },
    
    /**
     * Application invokes the method to check whether the controller
     * is uses hash (part or URL)
     */
    usesPath: false,

    /**
     * PathManager invokes the method check whether the path relates to the controller.
     * The method must only respond true or false and must not contain any other logic
     */
    _checkPath: function(path){},
    
    /**
     * 
     */
    _handlePath:function(path){
    	
    }
});