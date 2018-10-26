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
 * Base class for all menu items, including menu itself
 * 
 * @author Alexander Akhtyamov
 */
th.define("th.ui.control.menu.MenuItem", {

    extend : 'th.ui.control.Control',

    /**
     * Set to true if you want to add radio behavior to the item
     */
    radio : false,

    /**
     * @see #radio
     */
    isRadio : function() {
        var me = this;
        return me.radio;
    },

    /**
     * Invoke the method if you want to select the item. If item is not a radio
     * item, then the method will do nothing. Otherwise root container will be
     * involved to deselect another menu item and select this one.
     * 
     * @param selected
     *            true/fase
     */
    select : function() {
        var me = this;
        if (me.ancestor) {
            me._select0();
        }else{
            var callback = function(){
                me._select0();
            };
            me.getEventManager().addListener(callback,me,'AncestorAdded');
        }
    },
    
    _select0:function(){
        var me = this;
        var containerXclass = 'th.ui.control.menu.MenuContainer';
        if (!util.reflect.isInstanceOf(me.ancestor, containerXclass)) {
            util.throwError('MenuItem can be added only into MenuContainer, see ancestor and the object below', ancestor, me);
        }
        me.ancestor._selectMenuItem(me);
    },

    /**
     * Only root container can invoke the method. Purpose of the method is
     * confirmation of selection (or cancelation).
     * 
     * @param selected
     *            true/false
     */
    _setActive : function(active) {
        // override me
    }
});