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


/**
 * Base class for all controls (Button, ToggleButton, LinkButton etc)
 * @author Alexander Akhtyamov
 */
th.define("th.ui.control.Control",{
    
    extend: 'th.ui.Component',
    
    /**
     * set to false if the component should be enabled from the start
     */
    enabled: true,
    
    /**
     * set to true if navigation lock should be checked
     */
    checkNavigationLock: false,
    
    /**
     * Returns supported event types
     * @param theClass
     * @returns
     */
    _getSupportedEventTypes: function(theClass){
        var me = this;
        if(!theClass){
            theClass = me;
        }
        
        var superEventTypes = theClass.parent._getSupportedEventTypes.call(this,theClass.parent);
        var eventTypes = [
                'BeforeDisable',
                'AfterDisable',
                'BeforeEnable',
                'AfterEnable'
        ];
        return util.mergeArrays(superEventTypes,eventTypes);
    },
    
    /**
     * Checks global navigation lock. scope is always this control object.
     * @param ok okay callback
     * @param cancel cancel callback
     */
    _checkNavigationLock: function(ok,cancel){
        var me = this;
        if(me.checkNavigationLock){
        	th.application.getNavigationLock().checkLock({
                ok: ok,
                cancel:cancel,
                scope:me
            });
        }else{
        	ok.call(me);
        }
    },
    
    /**
     * Disables the control
     */
    disable:function(){
        var me = this;
        me._checkDisposed();
        if(me.enabled){
            me.getEventManager().fireEvent('BeforeDisable',{source:me});
            me.enabled = false;
            me._doDisable();
            me.getEventManager().fireEvent('AfterDisable',{source:me});
        }
    },
    
    /**
     * Disables the control, subclasses must override the method
     */
    _doDisable:function(){
        util.throwError('the method should be overriden');
    },
    
    /**
     * Enables the control
     */
    enable:function(){
        var me = this;
        me._checkDisposed();
        if(!me.enabled){
            me.getEventManager().fireEvent('BeforeEnable',{source:me});
            me.enabled = true;
            me._doEnable();
            me.getEventManager().fireEvent('AfterEnable',{source:me});
        }
    },
    
    /**
     * Enables the component, subclasses must override the component
     */
    _doEnable:function(){
        util.throwError('the method should be overriden');
    },
    
    /**
     * Enables/Disables the control
     * @param enabled true if the control must be enabled
     */
    setEnabled: function(enabled){
        var me = this;
        if(enabled){
            me.enable();
        }else{
            me.disable();
        }
    }
});