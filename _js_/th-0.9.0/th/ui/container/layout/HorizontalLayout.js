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

th.define("th.ui.container.layout.HorizontalLayout", {

    extend : 'th.ui.container.layout.Layout',

    require : {
        views : [ 'th.ui.container.layout.HorizontalLayout', 
                  'th.ui.container.layout.HorizontalLayoutFixedRow', 
                  'th.ui.container.layout.HorizontalLayoutColumnRow', 
                  'th.ui.container.layout.horizontal_layout_fixed_line_column']
    },
    
    /**
     * Array to store order of components
     */
    _order : [],

    /**
     * Root div of the container;
     */
    rootDiv : null,

    
    //
    // Cell types: line, stretch
    //
    container_inner: null,
    _container_inner_div: null,

    setContainerInner: function(container_inner){
        var me = this;
        me.container_inner = container_inner;
        me._container_inner_div.attr('data-inner',container_inner);
    },
    getContainerInner: function(){
        var me = this;
        return me.container_inner;
    },
    //
    //
    //
    /**
     * where to add columns
     */
    __laylout_columnContainer: null,
    
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
        var container = null;
        if(component.stretch && component.width){
        	util.throwError('Both width & stretch are set on the component',component,me);
        } else if (component.stretch) {
            holder.stretch = component.stretch;
            container = me._getColumnContainer(component, position, me._order.length);
        } else if(component.width){
        	holder.width = component.width;
            if(component.container_inner == 'line') {
                container = me._getFixedLineContainer(component, position, me._order.length);
            } else {
                container = me._getFixedContainer(component, position, me._order.length);
            }
        }else {
        	holder.width = component.width;
            if(component.container_inner == 'line') {
                container = me._getFixedLineContainer(component, position, me._order.length);
            } else {
                container = me._getFixedContainer(component, position, me._order.length);
            }
        	//util.throwError('Either width or stretch are not found on the component',component,me);
        }
        holder.div = container.div;
        holder.marginDiv = container.marginDiv;
        holder.widthDiv = container.widthDiv;
        
        if (position == (me._order.length - 1)) {
            me._getContainerDiv().append(holder.div);
        } else {
            var holderToShift = me.registry[me.container.descendants[position].xinstanceid];
            holderToShift.div.before(holder.div);
        }
        
        me.refreshWidthAndMargin();
        
        //console.log(container.div)
        //console.log(component.inner)
        me._container_inner_div = container.div
        me.setContainerInner(component.container_inner)
        //
        //
        //
    },
    
    refreshWidthAndMargin: function(){
    	var me = this;
    	var totalStretch = 0;
        var totalPercent = 0;
        var stretchedComponents = [];
        var visibleHolders = [];
        for(var i=0;i<me._order.length;i++){
            var temp_holder = me._order[i];
            if(!temp_holder.component.isHidden()){
                visibleHolders.push(me._order[i]);
                if(temp_holder.component.stretch){
                    totalStretch+=temp_holder.component.stretch;
                    stretchedComponents.push(temp_holder);
                }
            }
        }
        //fixed width
        for(var i=0;i<visibleHolders.length;i++){
        	var temp_holder = visibleHolders[i];
        	if(temp_holder.width){
        	    temp_holder.widthDiv.css('width',temp_holder.component.width+'px');
        	}
        }
        //coolumn width
        for(var i=0;i<stretchedComponents.length;i++){
            var temp_holder = stretchedComponents[i];
            var stretch = temp_holder.component.stretch;
            var stretchPercent = 0;
            if((i+1)==stretchedComponents.length){
                stretchPercent = 100-totalPercent;
            }else{
                stretchPercent = Math.floor(stretch/totalStretch*100);
            }
            totalPercent+=stretchPercent;
            temp_holder.widthDiv.css("width",stretchPercent+"%");
        }
        //TODO strut
        if(!me.strut){
            me.strut = jQuery(th.ViewTemplateRegistry.getViewTemplate('th.ui.container.layout.HorizontalLayoutColumnRow'));
            me.strut.css('width','100%');
        }
        me.strut.detach();
        
        if(!stretchedComponents.length){// no columns
            me._getContainerDiv().append(me.strut);
        }
        
        
        //margin
        for(var i=0;i<visibleHolders.length;i++){
            var component = visibleHolders[i].component;
            var margin = {
                top : 0,
                right : 0,
                bottom : 0,
                left : 0
            };
            if (i == 0 && me.container.padding_left) {// first or only element - add container left padding
                margin.left += me.container.padding_left;
            }
            if ((i == (visibleHolders.length - 1)) && me.container.padding_right) {// last or only element - add container right padding
                margin.right += me.container.padding_right;
            }
            margin.top += (me.container.padding_top ? me.container.padding_top : 0);
            margin.bottom += (me.container.padding_bottom ? me.container.padding_bottom : 0);

            // add component margin
            margin.top += (component.margin_top ? component.margin_top : 0);
            margin.right += (component.margin_right ? component.margin_right : 0);
            margin.bottom += (component.margin_bottom ? component.margin_bottom : 0);
            margin.left += (component.margin_left ? component.margin_left : 0);
            visibleHolders[i].marginDiv.css("top", margin.top + "px");
            visibleHolders[i].marginDiv.css("bottom", margin.bottom + "px");
            visibleHolders[i].marginDiv.css("right", margin.right + "px");
            visibleHolders[i].marginDiv.css("left", margin.left + "px");
        }
    },

    /**
     * Creates, configures and returns fixed container with rendered component within.
     * 
     * @param component
     * @param forIndex
     *            index of the component in the container
     * @param total
     *            total amount of components in the container
     * @returns {div,marginDiv,widthDiv}
     */
    _getFixedContainer : function(component, forIndex, total) {
        var me = this;
        var container = jQuery(th.ViewTemplateRegistry.getViewTemplate('th.ui.container.layout.HorizontalLayoutFixedRow'));
        var containerDiv = container.find('[data-thid=containerDiv]');
        var result = {};
        result.widthDiv = container.find('[data-thid=widthDiv]');
        component.renderTo(containerDiv);
        result.marginDiv = containerDiv;
        result.div = container;

        return result;
    },
    _getFixedLineContainer : function(component, forIndex, total) {
        var me = this;
        var container = jQuery(th.ViewTemplateRegistry.getViewTemplate('th.ui.container.layout.horizontal_layout_fixed_line_column'));
        var containerDiv = container.find('[data-thid=containerDiv]');
        var result = {};
        result.widthDiv = container.find('[data-thid=widthDiv]');
        component.renderTo(containerDiv);
        result.marginDiv = containerDiv;
        result.div = container;

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
     * @returns {div,marginDiv,widthDiv}
     */
    _getColumnContainer : function(component, forIndex, total) {
        var me = this;
        var container = jQuery(th.ViewTemplateRegistry.getViewTemplate('th.ui.container.layout.HorizontalLayoutColumnRow'));
        var containerDiv = container.find('[data-thid=containerDiv]');
        component.renderTo(containerDiv);
        var result = {};
        result.widthDiv = container;
        result.marginDiv = containerDiv;
        result.div = container;
        
        return result;
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
        me.refreshWidthAndMargin();
    },

    /**
     * Returns root div
     */
    _getRootDiv : function() {
        var me = this;
        if (me.rootDiv) {
            return me.rootDiv;
        }
        var view = jQuery(th.ViewTemplateRegistry.getViewTemplate('th.ui.container.layout.HorizontalLayout'));
        me.rootDiv = view;
        me.__laylout_columnContainer = view.find('[data-thid=columnContainer]');

        return me.rootDiv;
    },

    /**
     * Returns container div where to add components
     */
    _getContainerDiv : function() {
        var me = this;
        me._getRootDiv();
        return me.__laylout_columnContainer;
        
    },
    
    _doHide : function(component,theClass) {
        var me = this;
        if (!theClass) {
            theClass = me;
        }
        theClass.parent._doHide.call(this,component, theClass.parent);
        me.refreshWidthAndMargin();
    },

    _doShow : function(component,theClass) {
        var me = this;
        if (!theClass) {
            theClass = me;
        }
        theClass.parent._doShow.call(this,component, theClass.parent);
        me.refreshWidthAndMargin();
    }

});