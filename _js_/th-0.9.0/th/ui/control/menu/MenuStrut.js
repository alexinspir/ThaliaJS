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
 * The class represents strut in menu. 
 * @author Alexander Akhtyamov
 */
th.define("th.ui.control.menu.MenuStrut", {

    extend : 'th.ui.control.menu.MenuItem',
    
    require : {
        views : [ 'th.ui.control.menu.MenuStrut']
    },

    /**
     * Set to true if you want to add radio behavior to the item
     */
    radio : false,
    
    _doRender : function(){
        var me = this;
        var view = jQuery(th.ViewTemplateRegistry.getViewTemplate('th.ui.control.menu.MenuStrut'));
        return view;
    },

    /**
     * @overriden
     */
    _setActive : function(active) {
        // override me
    }
});