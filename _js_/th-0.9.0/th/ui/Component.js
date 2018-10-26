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

th.define("th.ui.Component",{
    
    extend: 'th.lang.Class',
    
    /**
     * Array of dependencies. e.g. 'name.of.some.Class'
     */
    require: ['th.lang.EventManager'],
    
    /**
     * Event Manager.
     */
    eventManager: null,
    
    /**
     * Ancestor component (always an instance of th.ui.Container)
     */
    ancestor: null,
    
    /**
     * Id of the component (in html)
     */
    id: null,
    
    /**
     * Body div
     */
    bodyDiv:null,
    
    /**
     * Id of loading mask
     */
    _loadingMaskId: null,
    
    /**
     * the property will set to true if the component is desposed.
     */
    disposed: false,
    
    /**
     * Width of the component (in pixels), the property is used only by enclosing container layout.
     */
    width: null,
    /**
     * Height of the component (in pixels), the property is used only by enclosing container layout.
     */
    height: null,
    
    /**
     * Flex of the component,
     */
    stretch: null,
    
    /**
     * Whether the component
     */
    visible: true,
    
	/**
	* Margins to to be set for the component (in pixels from enclosing container)
	* Not all containers support this.
	*/
    margin_top: 0,
    margin_bottom: 0,
    margin_right:0,
    margin_left:0,
    
    /**
     * custom css styles to be set on body div
     */
    cssStyles: {},
    
    
    /**
     * Returns supported event types
     */
    _getSupportedEventTypes: function(theClass){
        return [
                'BeforeHide',
                'AfterHide',
                'BeforeShow',
                'AfterShow',
                'BeforeDispose',
                'AfterDispose',
                'AncestorAdded'
        ];
    },
    
    
    /**
	* inits the component
	*/
    _init: function(theClass){
        var me = this;
        if(!theClass){
            theClass = me;
        }
        theClass.parent._init.call(this,theClass.parent);
        var supportedEventTypes = me._getSupportedEventTypes();
        var eventManager = th.create("th.lang.EventManager",{
            eventTypes: supportedEventTypes,
            owner: me
        });
        me.eventManager = eventManager;
    },
    
    /**
     * Returns event manager of the component
     * @returns
     */
    getEventManager: function(){
        var me = this;
        me._checkDisposed();
        return me.eventManager;
    },
    
    /**
     * never invoke the method. only enclosing container invokes it.
     * @param ancestor
     */
    _setAncestor: function(ancestor){
        var me = this;
        me._checkDisposed();
        if(me.ancestor){
            util.throwError('ancestor is already added');
        }
        me.ancestor = ancestor;
        me.getEventManager().fireEvent('AncestorAdded',{source:me,ancestor:ancestor});
    },
    
    /**
     * renders the component into the specified dom element
     * @param wDomElement where to render
     */
    renderTo: function(domElement){
        var me = this;
        me._checkDisposed();

        jQuery(domElement).append(me.getBodyDiv());
    },
    
    getBodyDiv: function(){
        var me = this;
        me._checkDisposed();
        if(me.bodyDiv){
            return me.bodyDiv;
        }
        me.id = util.dom.generateId();
        me.bodyDiv = me._doRender();
        me.bodyDiv.attr('data-thclass',me.xclass);
        me.bodyDiv.attr('id',me.id);
        
        jQuery.each(me.cssStyles,function(key,value){
            me.bodyDiv.css(key,value);
        });
        if(!me.visible){
            me._doHide();
        }
        return me.bodyDiv;
    },
    
    /**
     * The method is invoked by #getBodyDiv() only once. Descendants should override the method.
     * @returns
     */
    _doRender : function(){
        return jQuery('<div/>');
    },
    
    
    setVisible:function(visible){
        var me = this;
        if(visible){
            me.show();
        }else{
            me.hide();
        }
    },
    
    /**
     * Hides the component
     */
    hide: function(){
        var me = this;
        me._checkDisposed();
        if(me.id && me.visible){
            me.getEventManager().fireEvent('BeforeHide',{source:me});
            me._doHide();
            me.getEventManager().fireEvent('AfterHide',{source:me});
        }
    },
    
	/**
	* hides outer div
	*/
    _doHide:function(){
        var me = this;
        me.visible = false;
        me.getBodyDiv().addClass('hidden');
    },
    
    /**
     * Shows the component
     */
    show: function(){
        var me = this;
        me._checkDisposed();
        if(me.id && !me.visible){
            me.getEventManager().fireEvent('BeforeShow',{source:me});
            me._doShow();
            me.getEventManager().fireEvent('AfterShow',{source:me});
        }
    },
    
	/**
	* shows outer div
	*/
    _doShow:function(){
        var me = this;
        me.visible = true;
        me.getBodyDiv().removeClass('hidden');
    },
    
	/**
	* returns true if the component is hidden
	*/
    isHidden: function(){
        var me = this;
        return !me.visible;
    },
	
	/**
	* returns true if the component is visible
	*/
	isVisible: function(){
		var me = this;
		return me.visible;
	},
    
    /**
     * Disposes the component
     */
    dispose: function(){
        var me = this;
        if(!me.disposed){
            me.getEventManager().fireEvent('BeforeDispose',{source:me});
            util.dom.disposeElement(me.getBodyDiv(),true,true);
            me.id = null;
            me.getEventManager().fireEvent('AfterDispose',{source:me});
            me.disposed = true;
            th.UiRegistry.removeComponent(me);
        }
    },
    
    /**
     * Throws a error if the component is disposed 
     */
    _checkDisposed: function(){
        var me = this;
        if(me.disposed){
            util.throwError("component is disposed",me);
        }
    }
});