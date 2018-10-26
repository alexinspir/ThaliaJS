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
 * The class represents buttons in menu.
 * @author Alexander Akhtyamov
 */
th.define("th.ui.control.menu.MenuButton", {

    extend : 'th.ui.control.menu.MenuItem',
    
    require : {
        views : [ 'th.ui.control.menu.MenuButton']
    },
    
    /**
     * Text of the button
     */
    text: null,
    
    width: 30,

    radio : false,
    
    /**
     * Marks the button as selected on click. This option is usefull if the button is a radio item.
     */
    hightlightOnClick: false,
    
    /**
     * Adds Click event. The event is useless if the url is a hash and somewhere
     * exists onhashchange listener.
     */
    _getSupportedEventTypes : function(theClass) {
        var me = this;
        if (!theClass) {
            theClass = me;
        }
        var superEventTypes = theClass.parent._getSupportedEventTypes.call(this, theClass.parent);
        var eventTypes = [ 'Click' ];
        return util.mergeArrays(superEventTypes, eventTypes);
    },
    
    _doRender : function(){
        var me = this;
        if(!me.text){
            util.throwError('The MenuButton does not have text to render',me);
        }
        
        var view = jQuery(th.ViewTemplateRegistry.getViewTemplate('th.ui.control.menu.MenuButton'));
        
        var widthDiv = view.find('[data-thid=width]');
        widthDiv.css('width',me.width+'px');
        var textDiv = view.find('[data-thid=text]');
        textDiv.html(me.text);
        var buttonTag = view.find('[data-thid=button]');
        buttonTag.click(function(){
            me._checkNavigationLock(function(){
                if(me.hightlightOnClick){
                    me.select();
                }
                me.getEventManager().fireEvent('Click',{source:me});
            },null);
        });
        return view;
    },

    /**
     * @overriden
     */
    _setActive : function(active) {
        var me = this;
        var activeDiv = me.getBodyDiv().find('[data-thid=button]');
        var isActive = activeDiv.hasClass('selected');
        if(active){
            activeDiv.addClass('selected');
        }else{
            activeDiv.removeClass('selected');
        }
    }
});