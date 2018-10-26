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

th.define("th.lang.EventManager",{
    
    extend: 'th.lang.Class',
    
    eventTypes:[],
    
    owner: null,
    
    _typesToListeners: {},
    
    _init: function(theClass){
        var me = this;
        if(!theClass){
            theClass = this;
        }
        theClass.parent._init.call(this,theClass.parent);
        for(var i=0;i<me.eventTypes.length;i++){
            var eventType = me.eventTypes[i];
            me._typesToListeners[eventType]=[];
        }
    },
    
    /**
     * 
     * @param callback callback function
     * @param scope callback scope
     * @param eventTypes array of interesting event types
     */
    addListener: function(listenerFunctionCallback,scope,evtTypes){
        var me = this;
        me._checkDestroy();
        if(!listenerFunctionCallback){
            util.throwError('callback function cannot be null; see EventManager owner below:',me.owner);
        }
        if(!scope){
            util.throwError('callback scope cannot be null; see EventManager owner below:',me.owner);
        }
        if(!evtTypes){
            util.throwError('event types cannot be null; see EventManager owner below:',me.owner);
        }
        
        var eventTypes = evtTypes;
        if(util.type.isString(eventTypes)){
            eventTypes = [evtTypes];
        }
        
        if(eventTypes.length===0){
            util.throwError('array of event types cannot be empty; see EventManager owner below:',me.owner);
        }
        var listener = {
                callback: listenerFunctionCallback,
                scope: scope
        };
        for(var i=0;i<eventTypes.length;i++){
            me._checkForEventType(eventTypes[i]);
        }
        for(var i=0;i<eventTypes.length;i++){
            var eventType = eventTypes[i];
            if(me._checkForListener(eventType, listenerFunctionCallback)==-1){
                me._typesToListeners[eventType].push(listener);
            }
            
        }
    },
    
    removeListener: function(listenerFunction){
        var me = this;
        me._checkDestroy();
        for(var i=0;i<me.eventTypes.length;i++){
            var eventType = me.eventTypes[i];
            var listenerIndex = me._checkForListener(eventType, listenerFunction);
            if(listenerIndex!==-1){
                me._typesToListeners[eventType].splice(listenerIndex,1);
            }
        }
    },
    
    fireEvent: function(eventType,eventObject){
        var me = this;
        me._checkDestroy();
        me._checkForEventType(eventType);
        for(var i=0;i<me._typesToListeners[eventType].length;i++){
            var callback = me._typesToListeners[eventType][i].callback;
            var scope = me._typesToListeners[eventType][i].scope;
            callback.call(scope,eventType,eventObject);
        }
    },
    
    _checkForEventType: function(eventType){
        var me = this;
        me._checkDestroy();
        for(var i=0;i<me.eventTypes.length;i++){
            var knownEventType = me.eventTypes[i];
            if(eventType==knownEventType){
                return;
            }
        }
        util.throwError('unknown event type: '+eventType+'; see EventManager owner below:',me.owner);
    },
    
    _checkForListener: function(eventType, listenerFunction){
        var me = this;
        me._checkDestroy();
        for(var i=0;i<me._typesToListeners[eventType].length;i++){
            if(me._typesToListeners[eventType][i].callback===listenerFunction){
                return i;
            }
        }
        return -1;
    },
    
    destroy: function(){
        var me = this;
        me.eventTypes = null;
        me._typesToListeners = null;
        me.owner = null;
    },
    
    _checkDestroy: function(){
        var me = this;
        if(!me.eventTypes || !me._typesToListeners){
            util.throwError("event manager is destroyed");
        }
    }
    
});