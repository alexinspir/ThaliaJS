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
 * The class represents links in menu. If url is set, click event will not be fired.
 * The class checks NavigationLock only if url is not set.
 * @author Alexander Akhtyamov
 */
th.define("th.ui.control.menu.MenuLink", {

    extend : 'th.ui.control.menu.MenuItem',
    
    require : {
        views : ['th.ui.control.menu.MenuLink']
    },
    
    /**
     * Url where the link is pointed
     */
    url:null,
    
    /**
     * Text of the link
     */
    text: null,
    
    width: 30,

    /**
     * Set to true if you want to add radio behavior to the item
     */
    radio : false,
    
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
            util.throwError('The MenuLink does not have text to render',me);
        }
        
        var view = jQuery(th.ViewTemplateRegistry.getViewTemplate('th.ui.control.menu.MenuLink'));
        var widthDiv = view.find('[data-thid=width]');
        widthDiv.css('width',me.width+'px');
        var textDiv = view.find('[data-thid=text]');
        textDiv.html(me.text);
        if(me.url){
            textDiv.attr('href',me.url);
        }else{
            textDiv.attr('href','#');
            textDiv.click(function(){
                me.getEventManager().fireEvent('Click',{source:me});
                return false;
            });
        }
        return view;
    },

    /**
     * @overriden
     */
    _setActive : function(active) {
        // override me
    }
});