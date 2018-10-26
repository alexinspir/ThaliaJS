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

th.define("th.ui.container.Container", {

    extend : 'th.ui.Component',

    require : {
        classes : [ 'th.ui.container.layout.VerticalLayout' ]
    },
    
    /**
     * Default properties to be set to all children (unless they are defined there)
     */
    defaults : {},

    /**
     * Layout of the container. xclass can be set directly: layout: 'th.ui.container.layout.VerticalLayout'
     */
    layout : {
        xclass : 'th.ui.container.layout.VerticalLayout'
    },

    /**
     * Descendants
     */
    descendants : [],
    
    // --------------------------------------------------------------------------------------------
    
    shape: null,
    _shape_div: null,
    
    classes: null,
    _classes_div: null,
    
    // --------------------------------------------------------------------------------------------
    
    /**
     * Paddings to to be set to this container
     */
    padding_top : 0,
    padding_right : 0,
    padding_bottom : 0,
    padding_left : 0,

    _getSupportedEventTypes : function(theClass) {
        var me = this;
        if (!theClass) {
            theClass = me;
        }

        var superEventTypes = theClass.parent._getSupportedEventTypes.call(this, theClass.parent);
        var eventTypes = [ 'DescendantAdded', 'DescendantRemoved' ];
        return util.mergeArrays(superEventTypes, eventTypes);
    },

    _init : function(theClass) {
        var me = this;
        if (!theClass) {
            theClass = me;
        }
        theClass.parent._init.call(this, theClass.parent);
        // setup layout
        var layoutXclass = null;
        if (util.type.isString(me.layout)) {
            layoutXclass = me.layout;
        } else {
            if (!me.layout.xclass) {
                util.throwError('Unable to find layout to be used', me);
            }
            layoutXclass = me.layout.xclass;
        }
        
        me.layout = th.create(layoutXclass);
        me.layout.container = me;
    },

    _initDescendants : function() {
        var me = this;
        var descendantsCfgs = me.descendants;
        me.descendants = [];
        jQuery(descendantsCfgs).each(function(index, value) {
            util.reflect.setDefaultProperties(value,me.defaults);
            var component = th.UiRegistry.createAndRegister(value);
            me.addDescendant(component);
        });
    },

    getBodyDiv : function(theClass) {
        var me = this;
        if (!theClass) {
            theClass = me;
        }
        
        var bodyDiv = theClass.parent.getBodyDiv.call(this, theClass.parent);
        
        // ----------------------------------------------------------------------------------------
        //
        //
        me._shape_div = bodyDiv.children('[data-thid=columnContainer]')
        me.setShape(me.shape)
        //
        me._classes_div = bodyDiv.children('[data-thid=columnContainer]')
        me.setClasses(me.classes)
        //
        //
        // ----------------------------------------------------------------------------------------
        
        return bodyDiv;
    },

    _getDescendantIndex : function(component) {
        var me = this;
        var index = -1;
        for ( var i = 0; i < me.descendants.length; i++) {
            if (me.descendants[i].xinstanceid == component.xinstanceid) {
                index = i;
                break;
            }
        }
        return index;
    },

    addDescendant : function(component) {
        var me = this;
        var index = me._getDescendantIndex(component);
        if (index != -1) {
            util.throwError('The component is already added, see the component and the container below', component, me);
        }
        me.addDescendantAt(component, me.descendants.length);
    },

    addDescendantAt : function(component, position) {
        var me = this;
        if (me._getDescendantIndex(component) != -1) {
            util.throwError('The component is already added, see the component and the container below', component, me);
        }
        me.layout.addComponentAt(component, position);
        me.descendants.push(component);
        component._setAncestor(me);
        me._fireDescendantAdded(component);
    },

    _fireDescendantAdded : function(component) {
        var me = this;
        me.getEventManager().fireEvent('DescendantAdded', {
            source : me,
            descendant : component
        });
    },

    removeDescendant : function(component) {
        var me = this;
        var index = me._getDescendantIndex(component);
        if (index == -1) {
            util.throwError('Uknown component');
        }
        me.layout.removeComponent(component);
        me.descendants.splice(index, 1);
        me._fireDescendantRemoved(component);
    },

    removeDescendantAt : function(position) {
        var me = this;
        if (position < 0 || position >= me.descendants.length) {
            util.throwError('Index out of bounds exception: ' + position);
        }
        me.removeDescendant(me.descendants[position]);
    },
    
    removeAllDescendants: function(){
        var me = this;
        while(me.descendants.length){
            me.removeDescendantAt(0);
        }
    },

    _fireDescendantRemoved : function(component) {
        var me = this;
        me.getEventManager().fireEvent('DescendantRemoved', {
            source : me,
            descendant : component
        });
    },
    
    dispose: function(theClass){
        var me = this;
        if (!theClass) {
            theClass = me;
        }
        if(!me.disposed){
            jQuery.each(me.descendants,function(i,descendant){
                descendant.dispose();
            });
            theClass.parent.dispose.call(this, theClass.parent);
        }
    },

    _doRender : function() {
        var me = this;
        me._initDescendants();
        return me.layout._getRootDiv();
    },
    
    find:function(selector){
        var me = this;
        var sel = selector.slice(0);
        var myselfSelectorEntry = {
            xclass: me.xclass,
            filter:{
                xinstanceid: me.xinstanceid
            }
        }
        sel.unshift(myselfSelectorEntry);
        return th.UiRegistry.find(sel);
    },
    
    // --------------------------------------------------------------------------------------------
    //
    //
    setShape: function(shape){
        var me = this;
        me.shape = shape;
        if(!shape) {
            me._shape_div.attr('data-outer','stretch');
        } else {
            me._shape_div.attr('data-outer',shape);
        }
    },
    getShape: function(){
        var me = this;
        return me.shape;
    },
    //
    //
    //
    setClasses: function(classes){
        var me = this;
        me.classes = classes;
        if(!classes) {
            //
        } else {
            me._classes_div.addClass(classes);
        }
    },
    getClasses: function(){
        var me = this;
        return me.classes;
    }
    //
    //
    // --------------------------------------------------------------------------------------------
    
});