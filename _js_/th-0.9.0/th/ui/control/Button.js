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
 * Represents button
 * @author Alexander Akhtyamov
 */
th.define("th.ui.control.Button",{
    
    extend: 'th.ui.control.Control',
    
    require: {
        views: ['th.ui.control.Button']
    },

    // --------------------------------------------------------------------------------------------
    //
    //
    outer: null,
    _outer_div: null,
    
    style: null,
    _style_div: null,
    
    icon: null,
    icon_left: null,
    icon_right: null,
    
    icon_span: null,
    icon_left_span: null,
    icon_right_span: null,
    
    setOuter: function(outer){
        var me = this;
        me.outer = outer;
        me._outer_div.attr('data-stretch',outer);
    },
    setStyle: function(style){
        var me = this;
        me.style = style;
        if(!style) {
          me._style_div.addClass('ordinary_push_button');
        } else {
            me._style_div.addClass(style+'_push_button');
        }
    },
    setIcon: function(icon){
        var me = this;
        me.icon = icon;
        me.icon_span.addClass(icon);
    },
    setIconLeft: function(icon_left){
        var me = this;
        me.icon_left = icon_left;
        me.icon_left_span.addClass(icon_left);
    },
    setIconRight: function(icon_right){
        var me = this;
        me.icon_right = icon_right;
        me.icon_right_span.addClass(icon_right);
    },
    //
    //
    // --------------------------------------------------------------------------------------------
    
    
    
    text: null,
    
    click: null,/*function(eventName, eventObject){
        
    },*/
    
    __button_textDiv: null,
    
    __button_bodyDiv: null,
    
    _init: function(theClass){
        var me = this;
        if(!theClass){
            theClass = me;
        }
        theClass.parent._init.call(this,theClass.parent);
        if(me.click){
            if(!util.type.isFunction(me.click)){
                util.throwError('click callback is not a function');
            }
            me.getEventManager().addListener(me.click,me,'Click');
        }
    },
    
    /**
     * Returns supported event types
     * @param theClass
     * @returns
     */
    _getSupportedEventTypes: function(theClass){
        var me = this;
        if(!theClass){
            theClass = me;
        }
        var superEventTypes = theClass.parent._getSupportedEventTypes.call(this,theClass.parent);
        var eventTypes = [
                'Click'
        ];
        return util.mergeArrays(superEventTypes,eventTypes);
    },
    
    /**
     * Disables the control, subclasses must override the method
     */
    _doDisable:function(){
        var me = this;
        me.__button_buttonDiv.attr("disabled","disabled");
    },
    
    /**
     * Enables the component, subclasses must override the component
     */
    _doEnable:function(){
        var me = this;
        me.__button_buttonDiv.removeAttr("disabled");
    },
    
    _doRender:function(theClass){
        var me = this;
        if (!theClass) {
            theClass = me;
        }
        me.__button_bodyDiv = jQuery(th.ViewTemplateRegistry.getViewTemplate('th.ui.control.Button'));
        me.__button_buttonDiv = me.__button_bodyDiv.find('[data-thid=button]');
        
        me.__button_textDiv = me.__button_bodyDiv.find('[data-thid=text]');
        me.__button_textDiv.html(me.text);
        if(me.height){
            me.__button_bodyDiv.css('height',me.height+'px');
        }
        me.__button_bodyDiv.click(function(evt){
            me.__onButtonClick(evt);
        });
        if(!me.enabled){
            me.enabled = true;
            me.setEnabled(false);
        }
        
        // ----------------------------------------------------------------------------------------
        //
        //
        me._outer_div = me.__button_bodyDiv
        me._style_div = me.__button_buttonDiv

        if(!me.text) { me.__button_textDiv.hide() }
        
        if(me.icon) {
        	var span = $('<span/>').attr('data-thid', 'icon');
        	me.__button_buttonDiv.prepend(span)
            me.icon_span = me.__button_bodyDiv.find('[data-thid=icon]');
            me.setIcon(me.icon);
        }
        if(me.icon_left) {
        	var span = $('<span/>').attr('data-thid', 'icon_left');
        	me.__button_buttonDiv.prepend(span)
            me.icon_left_span = me.__button_bodyDiv.find('[data-thid=icon_left]');
            me.setIconLeft(me.icon_left);
        }
        if(me.icon_right) {
        	var span = $('<span/>').attr('data-thid', 'icon_right');
        	me.__button_buttonDiv.append(span)
            me.icon_right_span = me.__button_bodyDiv.find('[data-thid=icon_right]');
            me.setIconRight(me.icon_right);
        }
        
        me.setStyle(me.style);
        
        if(!me.outer) {
        	me.setOuter('true');
        } else {
	        me.setOuter(me.outer);
        }
        //
        //
        // ----------------------------------------------------------------------------------------

        return me.__button_bodyDiv;
        
    },
    
    __onButtonClick : function(evt){
        var me = this;
        me._checkNavigationLock(function(){
            me.getEventManager().fireEvent('Click',{source:me});
        },null);
    },
    
    setText:function(newText){
        var me = this;
        me.text = newText;
        if(me.__button_textDiv){
            me.__button_textDiv.html(newText);
        }
    },

    getText:function(){
        var me = this;
        return me.text;
    }
    
});