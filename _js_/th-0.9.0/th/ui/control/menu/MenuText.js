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
 * The class represents text entry in menu.
 * @author Alexander Akhtyamov
 */
th.define("th.ui.control.menu.MenuText", {

    extend : 'th.ui.control.menu.MenuItem',
    
    require : {
        views : [ 'th.ui.control.menu.MenuText']
    },
    
    /**
     * Text of the link
     */
    text: null,

    radio : false,
    
    __menutext_textDiv:null,
    
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
            util.throwError('The MenuText does not have text to render',me);
        }
        
        var view = jQuery(th.ViewTemplateRegistry.getViewTemplate('th.ui.control.menu.MenuText'));
        if(me.width){
            var widthDiv = view.find('[data-thid=width]');
            widthDiv.css('width',me.width+'px');
        }
        me.__menutext_textDiv = view.find('[data-thid=text]');
        me.__menutext_textDiv.html(me.text);
        view.click(function(){
            me.getEventManager().fireEvent('Click',{source:me});
        });
        return view;
    },
    
    getText:function(){
        return this.text;
    },
    
    setText:function(text){
        var me = this;
        me.text = text;
        me.__menutext_textDiv.html(text);
    },

    /**
     * @overriden
     */
    _setActive : function(active) {
        // override me
    }
});