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
 * Base class for all menu containers, including menu itself
 * 
 * @author Alexander Akhtyamov
 */
th.define("th.ui.control.menu.MenuContainer", {

    extend : 'th.ui.control.menu.MenuItem',
    
    _rootMenuContainer: false,

    /**
     * Default properties to be set to all children (unless they are defined there)
     */
    defaults : {},

    /**
     * this array for descendant configs. After rendering of the component, the
     * descendants configs will be replaced by their objects
     */
    descendants : [],

    /**
     * inits the component
     */
    _init : function(theClass) {
        var me = this;
        if (!theClass) {
            theClass = me;
        }
        theClass.parent._init.call(this, theClass.parent);
        
        
        var callback = function(){
            if(me._rootMenuContainer){
               return; 
            }
            var containerXclass = 'th.ui.control.menu.MenuContainer';
            if (!util.reflect.isInstanceOf(me.ancestor, containerXclass)) {
                util.throwError('Ancestor must be instance of ' + containerXclass, me.ancestor, me);
            }
            jQuery.each(me.descendants, function(i, menuItem) {
                me._registerMenuItem(menuItem);
            });
        };
        me.getEventManager().addListener(callback,me,'AncestorAdded');
        me._initMenuItems();
    },

    /**
     * Initiates descendants
     */
    _initMenuItems : function() {
        var me = this;
        var descendantsCfgs = me.descendants;
        me.descendants = [];
        jQuery(descendantsCfgs).each(function(index, value) {
            util.reflect.setDefaultProperties(value,me.defaults);
            var component = th.UiRegistry.createAndRegister(value);
            me.addMenuItem(component);
        });
    },

    /**
     * Returns div where to put descendants.
     */
    _getItemContainerDiv : function() {
        util.throwError('Override me', me);
    },

    /**
     * Adds menu item to the menu (as last)
     * 
     * @param menuItem
     */
    addMenuItem : function(menuItem) {
        var me = this;
        me.addMenuItemAt(menuItem, me.descendants.length);
    },

    /**
     * Adds menu item at specified position
     * 
     * @param menuItem
     * @param position
     */
    addMenuItemAt : function(menuItem, position) {
        var me = this;
        if (position < 0 || position > me.descendants.length) {
            util.throwError('Position index is out of bounds', me);
        }
        me.descendants.splice(position,0,menuItem);
        menuItem._setAncestor(me);
        
        if (me.descendants.length === (position+1)) {//last
            
            me._getItemContainerDiv().append(menuItem.getBodyDiv());
        } else {
            me.descendants[position+1].getBodyDiv().before(menuItem.getBodyDiv());

        }
        me._registerMenuItem(menuItem);
    },

    /**
     * Removes menu item
     * 
     * @param menuItem
     */
    removeMenuItem : function(menuItem) {
        var me = this;
        var found = false;
        var index = -1;
        jQuery.each(me.descendants, function(i, knownItem) {
            if (knownItem === menuItem) {
                found = true;
                index = i;
            }
        });
        if (!found) {
            util.throwError('Unknown menu item', menuItem, me);
        }
        menuItem.getBodyDiv().detach();
        me.descendants.splice(index, 1);
        me._deregisterMenuItem(menuItem);
        return menuItem;
    },

    /**
     * Removes menu items at specified position
     * 
     * @param position
     */
    removeMenuItemAt : function(position) {
        var me = this;
        if (position < 0 || position >= me.descendants.length) {
            util.throwError('Position index is out of bounds', me);
        }
        return me.removeMenuItem(me.descendants[position]);
    },

    /**
     * Removes all menu items from the menu container
     */
    removeAllMenuItems : function() {
        var me = this;
        var descs = me.descendants.slice(0);
        jQuery.each(descs, function(i, menuItem) {
            me.removeMenuItem(menuItem);
        });
        return descs;
    },

    /**
     * Registers menu item
     * 
     * @param menuItem
     */
    _registerMenuItem : function(menuItem) {
        var me = this;
        if (me.ancestor) {
            me.ancestor._registerMenuItem(menuItem);
        }
    },

    /**
     * Deregisters menu item
     * 
     * @param menuItem
     */
    _deregisterMenuItem : function(menuItem) {
        var me = this;
        if (me.ancestor) {
            me.ancestor._deregisterMenuItem(menuItem);
        }
    },

    /**
     * Menu items invoke the method when they want to be selected
     * 
     * @param menuItem
     *            menuItem to be selected
     */
    _selectMenuItem : function(menuItem){
        var me = this;
        if (me.ancestor) {
            me.ancestor._selectMenuItem(menuItem);
        }
    }

});