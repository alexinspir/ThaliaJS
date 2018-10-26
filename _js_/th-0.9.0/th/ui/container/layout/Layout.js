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

th.define("th.ui.container.layout.Layout", {

    extend : 'th.lang.Class',

    /**
     * container that is using the layout
     */
    container : null,
    
    /**
     * Component registry: xinstanceid -> config object{component,div,stretch}
     * Subclasses must populate it
     */
    registry:{},

    _checkForContainer : function() {
        var me = this;
        if (!me.container) {
            util.throwError('container is not set', me);
        }
    },

    addComponent : function(component) {
        var me = this;
        me._checkForContainer();
        me.addComponentAt(component, me.container.descendants.length);
    },

    addComponentAt : function(component, position) {
        var me = this;
        var descLength = me.container.descendants.length;
        if (position < 0 || position > descLength) {
            util.throwError('Index our of bounds: ' + position + '; bounds: 0 - ' + descLength + ' (+1);', me);
        }
        me._doAddComponentAt(component, position);
        me._subscribeForHiding(component);
    },

    _doAddComponentAt : function(component, position) {
        var me = this;
        util.throwError('Override me', me);
    },

    removeComponent : function(component) {
        var me = this;
        me._unsubscribeForHidding(component);
        me._doRemoveComponent(component);
    },

    _doRemoveComponent : function(component) {
        var me = this;
        util.throwError('Override me', me);
    },

    removeComponentAt : function(position) {
        var me = this;
        me._checkForContainer();
        var descLength = me.container.descendants.length;
        if (position < 0 || position >= descLength) {
            util.throwError('Index our of bounds: ' + position + '; bounds: 0 - ' + descLength + ';', me);
        }
        me.removeComponent(me.container.descendants[0]);
    },

    _doHide : function(component) {
        var me = this;
        var holder = me.registry[component.xinstanceid];
        if(holder && holder.div){
            holder.div.hide();
        }
    },

    _doShow : function(component) {
        var me = this;
        var holder = me.registry[component.xinstanceid];
        if(holder && holder.div){
            holder.div.show();
        }
    },

    _subscribeForHiding : function(component) {
        var me = this;
        
        component.getEventManager().addListener(me._hidingListener, me, [ 'AfterShow', 'AfterHide' ]);
    },

    /**
     * Callback method that is used as hide/show listener
     * @param component
     */
    _unsubscribeForHidding : function(component) {
        var me = this;
        component.getEventManager().removeListener(me._hidingListener);
    },

    _hidingListener : function(eventType, eventObject) {
        var me = this;
        switch (eventType) {
            case 'AfterShow':
                me._doShow(eventObject.source);
                break;
            case 'AfterHide':
                me._doHide(eventObject.source);
                break;
            default:
                util.throwError('Unknown event type: '+eventType,me);
        }
    },
    
    /**
     * Returns root div
     */
    _getRootDiv:function(){
        var me = this;
        util.throwError('Override me', me);
    }
});