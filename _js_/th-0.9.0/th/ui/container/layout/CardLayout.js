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

th.define("th.ui.container.layout.CardLayout", {

    extend : 'th.ui.container.layout.Layout',

    require : {
        views : [ 'th.ui.container.layout.CardLayout',
                  'th.ui.container.layout.CardLayoutRow']
    },

    /**
     * Array to store order of components
     */
    _order : [],

    /**
     * Root div of the container;
     */
    rootDiv : null,
    
    strut: null,

    _doAddComponentAt : function(component, position) {
        var me = this;
        if (me.registry[component.xinstanceid]) {
            util.throwError('Component already added');
        }
        if (position < 0 || position > me._order.length) {
            util.throwError('Index out of bounds exception: ' + position);
        }

        var holder = {};
        me.registry[component.xinstanceid] = holder;

        if (position == me._order.length) {
            me._order.push(holder);
        } else {
            me._order.splice(position, 0, holder);
        }
        holder.component = component;
        holder.div = jQuery(th.ViewTemplateRegistry.getViewTemplate('th.ui.container.layout.CardLayoutRow'));
        component.renderTo(holder.div);
        if (position == (me._order.length - 1)) {
            me._getRootDiv().append(holder.div);
        } else {
            var holderToShift = me.registry[me.container.descendants[position].xinstanceid];
            holderToShift.div.before(holder.div);
        }
        
        var margin = {
            top : 0,
            right : 0,
            bottom : 0,
            left : 0
        };
        
        //add container margin
        margin.top += (me.container.padding_top ? me.container.padding_top : 0);
        margin.bottom += (me.container.padding_bottom ? me.container.padding_bottom : 0);
        margin.right += (me.container.padding_right ? me.container.padding_right : 0);
        margin.left += (me.container.padding_left ? me.container.padding_left : 0);

        // add component margin
        margin.top += (component.margin_top ? component.margin_top : 0);
        margin.right += (component.margin_right ? component.margin_right : 0);
        margin.bottom += (component.margin_bottom ? component.margin_bottom : 0);
        margin.left += (component.margin_left ? component.margin_left : 0);
        
        holder.div.css("top", margin.top + "px");
        holder.div.css("bottom", margin.bottom + "px");
        holder.div.css("right", margin.right + "px");
        holder.div.css("left", margin.left + "px");
        

        for ( var i = 0; i < me._order.length; i++) {
            me._order[i].component.hide();
        }
        component.show();
    },

    _doRemoveComponent : function(component) {
        var me = this;
        var holder = me.registry[component.xinstanceid];
        me.registry[component.xinstanceid] = null;
        for ( var i = 0; i < me._order.length; i++) {
            if (me._order[i].xinstanceid == component.xinstanceid) {
                me._order.splice(i, 1);
                break;
            }
        }
        if (holder) {
            component.getRootDiv().detach();
            util.dom.disposeElement(holder.div, true, true);
        }
    },

    /**
     * Returns root div
     */
    _getRootDiv : function() {
        var me = this;
        if (me.rootDiv) {
            return me.rootDiv;
        }
        var view = jQuery(th.ViewTemplateRegistry.getViewTemplate('th.ui.container.layout.CardLayout'));
        me.rootDiv = view;
        return me.rootDiv;
    },

    /**
     * Returns container div where to add components
     */
    _getContainerDiv : function() {
        var me = this;
        return me._getRootDiv();
    },
    
    hidingInProcess:false,
    
    _doHide : function(component,theClass) {
        var me = this;
        if (!theClass) {
            theClass = me;
        }
        theClass.parent._doHide.call(this,component, theClass.parent);
        if(me.hidingInProcess){
            return;
        }
        me.hidingInProcess = true;
        var somethingIsShown = false;
        for ( var i = 0; i < me._order.length; i++) {
            if(!me._order[i].component.isHidden()){
                somethingIsShown = true;
            }    
        }
        if(!somethingIsShown && me._order.length>=0){
            me._order[0].component.show();
        }
        me.hidingInProcess = false;
    },

    _doShow : function(component,theClass) {
        var me = this;
        if (!theClass) {
            theClass = me;
        }
        theClass.parent._doShow.call(this,component, theClass.parent);
        if(me.hidingInProcess){
            return;
        }
        me.hidingInProcess = true;
        for ( var i = 0; i < me._order.length; i++) {
            if (me._order[i].component.xinstanceid != component.xinstanceid) {
                if(!me._order[i].component.isHidden()){
                    me._order[i].component.hide();
                }
            }
        }
        me.hidingInProcess = false;
    },

});