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

th.define("th.ui.container.window.Window",{
    
    extend: 'th.ui.container.Panel',
    
    require:{
        views:['th.ui.container.window.Window']
    },
    
    /**
     * If true - show right after create
     */
    closeable: true,
    
    /**
     * do dispose on close button click
     */
    autoDispose: true,
    
    _init: function(theClass){
        var me = this;
        if(!theClass){
            theClass = me;
        }
        if(!me.width || !me.height){
            util.throwError('Both width & height must be set on the window',me);
        }
        if(me.closeable){
            me.buttons.unshift({
                type: 'close',
                click: me._closeButtonCallback
            });
        }
        theClass.parent._init.call(this,theClass.parent);
        
        me.renderTo(document.body);
    },
    
    _closeButtonCallback:function(){
        var me = this;
        if(me.autoDispose){
            me.dispose();
        }else{
            me.hide();
        }
    },
    
    _doRender:function(theClass){
        var me = this;
        if (!theClass) {
            theClass = me;
        }
        
        var body = jQuery(th.ViewTemplateRegistry.getViewTemplate('th.ui.container.window.Window'));
        
        var panelContainer = body.find('[data-thid=panelContainer]');
        var panelBody = theClass.parent._doRender.call(this, theClass.parent);
        panelContainer.append(panelBody);
        panelContainer.css('width',me.width+'px');
        panelContainer.css('height',me.height+'px');
        return body;
    }
});