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
th.define("th.ui.control.menu.MenuBar", {

    extend : 'th.ui.control.menu.MenuContainer',

    require : {
        views : [ 'th.ui.control.menu.MenuBar' ]
    },
    
    _rootMenuContainer: true,

    /**
     * MenuBar is not a radio
     */
    radio : false,

    /**
     * Registry of radio items: xinstanceid -> instance
     */
    _menuItemRegistry : {},

    /**
     * Selected menu item
     */
    _selectedMenuItem : null,

    /**
     * Div where to put menu items
     */
    _itemContainerDiv : null,

    /**
     * inits the component
     */
    _init : function(theClass) {
        var me = this;
        if (!theClass) {
            theClass = me;
        }
        theClass.parent._init.call(this, theClass.parent);
        
    },

    _getSupportedEventTypes : function(theClass) {
        var me = this;
        if (!theClass) {
            theClass = me;
        }

        var superEventTypes = theClass.parent._getSupportedEventTypes.call(this, theClass.parent);
        var eventTypes = [ 'MenuItemSelected' ];
        return util.mergeArrays(superEventTypes, eventTypes);
    },

    /**
     * Returns div where to put descendants
     */
    _getItemContainerDiv : function() {
        var me = this;
        me.getBodyDiv();// to init only
        return me._itemContainerDiv;
    },
    
    _doRender : function() {
        var me = this;
        var bodyDiv = jQuery(th.ViewTemplateRegistry.getViewTemplate('th.ui.control.menu.MenuBar'));
        me._itemContainerDiv = bodyDiv.find('[data-thid=itemContainer]');
        return bodyDiv;
    },

    _ancestorReady : function(ancestor) {
        var me = this;
        util.throwError('The method must not be invoked', me);
    },

    _registerMenuItem : function(menuItem) {
        var me = this;
        if (menuItem.isRadio() && !me._menuItemRegistry[menuItem.xinstanceid]) {
            me._menuItemRegistry[menuItem.xinstanceid] = menuItem;
        }
    },
    
    select:function(){
        //do nothing
    },

    _deregisterMenuItem : function(menuItem) {
        var me = this;
        if (me._menuItemRegistry[menuItem.xinstanceid]) {
            me._menuItemRegistry[menuItem.xinstanceid] = null;
        }
    },
    
    deactivateSelectedMenuItem: function(){
        var me = this;
        if(me._selectedMenuItem){
            me._checkNavigationLock(function() {
                me._deactivateMenuItem(me._selectedMenuItem);
                me._selectedMenuItem = null;
                me.getEventManager().fireEvent('MenuItemSelected',{source:me,item:null});
            },null);
        }
    },

    _selectMenuItem : function(menuItem) {
        var me = this;
        if (!menuItem.isRadio() || (me._selectedMenuItem == menuItem)) {
            return;
        }
        me._checkNavigationLock(function() {
            if(me._selectedMenuItem){
                me._deactivateMenuItem(me._selectedMenuItem);
            }
            me._selectedMenuItem = menuItem;
            me._activateMenuItem(menuItem);
            me.getEventManager().fireEvent('MenuItemSelected',{source:me,item:menuItem});
        }, null);
    },

    /** 
     * Deactivates currently selected menu item and its parents
     * @param menuItem
     */
    _deactivateMenuItem : function(menuItem) {
        var me = this;
        menuItem._setActive(false);
        var menuItemXclass = 'th.ui.control.menu.MenuItem';
        var ancestor = menuItem.ancestor;
        if (util.reflect.isInstanceOf(ancestor, menuItemXclass)) {
            me._deactivateMenuItem(ancestor);
        }
    },

    /**
     * Activates menu item and its parents
     * @param menuItem
     */
    _activateMenuItem : function(menuItem) {
        var me = this;
        menuItem._setActive(true);
        var menuItemXclass = 'th.ui.control.menu.MenuItem';
        if (util.reflect.isInstanceOf(menuItem.ancestor, menuItemXclass)) {
            me._activateMenuItem(menuItem.ancestor);
        }
    }

});