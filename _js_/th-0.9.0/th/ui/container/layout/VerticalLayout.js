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

th.define("th.ui.container.layout.VerticalLayout", {

    extend : 'th.ui.container.layout.Layout',

    require : {
        views : [ 'th.ui.container.layout.VerticalLayout', 
                  'th.ui.container.layout.VerticalLayoutFlexRow', 
                  'th.ui.container.layout.VerticalLayoutFixedRow', 
                  'th.ui.container.layout.VerticalLayoutStretchingRow' ]
    },

    /**
     * Array to store order of components
     */
    _order : [],

    //
    // 
    //
    
    toolbar: null,
    _toolbar_div: null,

    setToolbar: function(toolbar){
        var me = this;
        me.toolbar = toolbar;
        if(!toolbar) {
            //
        } else {
            me._toolbar_div.addClass('toolbar');
        }
    },
    getToolbar: function(){
        var me = this;
        return me.toolbar;
    },
    //
    //
    //
    /**
     * Root div of the container;
     */
    rootDiv : null,

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
        var container = null;
        if (component.stretch) {
            holder.stretch = component.stretch;
            container = me._getStretchContainer(component, position, me._order.length);
        } else if(component.height){
            container = me._getFixedContainer(component, position, me._order.length);
        }else {
            container = me._getFlexContainer(component, position, me._order.length);
        }
        holder.div = container.div;
        holder.marginCallback = container.marginCallback;
        if (position == (me._order.length - 1)) {
            me._getRootDiv().append(holder.div);
        } else {
            var holderToShift = me.registry[me.container.descendants[position].xinstanceid];
            holderToShift.div.before(holder.div);
        }
        jQuery.each(me._order, function(index, holder) {
            holder.marginCallback.call(me, holder.component, index, me._order.length);
        });
        me.configureLayoutStretch();
        
        
        
        //console.log(container.div)
        //console.log(component.toolbar)
        me._toolbar_div = container.div.children()
        me.setToolbar(component.toolbar)
        //
        //
        //
    },

    /**
     * Returns amount of stretching component in the layout
     */
    _checkForStretchAmount : function() {
        var me = this;
        var found = false;
        jQuery.each(me.registry, function(xinstanceid, holder) {
            if (holder.stretch) {
                if (found) {
                    util.throwError('Critical error: only one stretching component can be added into vertical layout');
                } else {
                    found = true;
                }
            }
        });
    },

    /**
     * Creates, configures and returns stretched container with rendered component within.
     * 
     * @param component
     * @param forIndex
     *            index of the component in the container
     * @param total
     *            total amount of components in the container
     * @returns {div,marginCallback(component,forIndex,total)}
     */
    _getStretchContainer : function(component, forIndex, total) {
        var me = this;
        me._checkForStretchAmount();

        var container = jQuery(th.ViewTemplateRegistry.getViewTemplate('th.ui.container.layout.VerticalLayoutStretchingRow'));
        var containerDiv = container.find('[data-thid=containerDiv]');

        component.renderTo(containerDiv);

        var result = {};
        result.marginCallback = function(component, forIndex, total) {
            var margin = me._calculateMarginAndPadding(component, forIndex, total);
            containerDiv.css("top", margin.top + "px");
            containerDiv.css("bottom", margin.bottom + "px");
            containerDiv.css("right", margin.right + "px");
            containerDiv.css("left", margin.left + "px");
        };
        result.div = container;
        
        if(component.isHidden()){
            result.div.hide();
        }

        return result;
    },

    /**
     * Creates, configures and returns flex container with rendered component within.
     * 
     * @param component
     * @param forIndex
     *            index of the component in the container
     * @param total
     *            total amount of components in the container
     * @returns root div of the container
     */
    _getFlexContainer : function(component, forIndex, total) {
        var me = this;
        var container = jQuery(th.ViewTemplateRegistry.getViewTemplate('th.ui.container.layout.VerticalLayoutFlexRow'));
        var containerDiv = container.find('[data-thid=containerDiv]');
        var paddingDiv = container.find('[data-thid=paddingDiv]');
        component.renderTo(containerDiv);

        var result = {};
        result.div = container;
        result.marginCallback = function(component, forIndex, total) {

            var margin = me._calculateMarginAndPadding(component, forIndex, total);
            paddingDiv.css("padding", margin.top + "px " + margin.right + "px " + margin.bottom + "px " + margin.left + "px");
        };
        if(component.isHidden()){
            result.div.hide();
        }
        return result;
    },
    
    /**
     * Creates, configures and returns fixed container with rendered component within.
     * 
     * @param component
     * @param forIndex
     *            index of the component in the container
     * @param total
     *            total amount of components in the container
     * @returns root div of the container
     */
    _getFixedContainer : function(component, forIndex, total) {
        var me = this;
        var container = jQuery(th.ViewTemplateRegistry.getViewTemplate('th.ui.container.layout.VerticalLayoutFixedRow'));
        var containerDiv = container.find('[data-thid=containerDiv]');
        container.css("height", component.height + "px");
        component.renderTo(containerDiv);

        var result = {};
        result.div = container;
        result.marginCallback = function(component, forIndex, total) {
            var margin = me._calculateMarginAndPadding(component, forIndex, total);
            container.css("height", component.height+margin.top+margin.bottom+"px");
            containerDiv.css("top", margin.top + "px");
            containerDiv.css("bottom", margin.bottom + "px");
            containerDiv.css("right", margin.right + "px");
            containerDiv.css("left", margin.left + "px");
        };
        if(component.isHidden()){
            result.div.hide();
        }
        return result;
    },

    /**
     * Returns {top,right,bottom,left} of specified component
     */
    _calculateMarginAndPadding : function(component, forIndex, total) {
        var me = this;
        var margin = {
            top : 0,
            right : 0,
            bottom : 0,
            left : 0
        };
        if (forIndex == 0 && me.container.padding_top) {// top or only element - add container top padding
            margin.top += me.container.padding_top;
        }
        if ((forIndex == (total - 1)) && me.container.padding_bottom) {// bottom or only element - add container bottom padding
            margin.bottom += me.container.padding_bottom;
        }
        margin.left += (me.container.padding_left ? me.container.padding_left : 0);
        margin.right += (me.container.padding_right ? me.container.padding_right : 0);

        // add component margin
        margin.top += (component.margin_top ? component.margin_top : 0);
        margin.right += (component.margin_right ? component.margin_right : 0);
        margin.bottom += (component.margin_bottom ? component.margin_bottom : 0);
        margin.left += (component.margin_left ? component.margin_left : 0);
        return margin;
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
            component.getBodyDiv().detach();
            util.dom.disposeElement(holder.div, true, true);
        }
        for(var i = 0; i< me._order.length; i++){
            if(me._order[i]==holder){
                me._order.splice(i, 1);
                break;
            }
        }
        jQuery.each(me._order, function(index, holder) {
            holder.marginCallback.call(me, holder.component, index, me._order.length);
        });
        me.configureLayoutStretch();
    },

    /**
     * Returns root div
     */
    _getRootDiv : function() {
        var me = this;
        if (me.rootDiv) {
            return me.rootDiv;
        }
        var view = jQuery(th.ViewTemplateRegistry.getViewTemplate('th.ui.container.layout.VerticalLayout'));
        
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
    
    
    configureLayoutStretch:function(){
        var me = this;
        var stretchFound = false;
        jQuery.each(me.registry,function(xinstanceid,holder){
            if(holder && holder.stretch){
                stretchFound = true;
            }
        });
        if(stretchFound){
            me._getRootDiv().attr('data-stretch',true);
        }else{
            me._getRootDiv().attr('data-stretch',false);
        }
    }

});