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

th.define("th.ui.container.window.Message",{
    
    extend: 'th.ui.Component',
    
    require : {
        views : [ 'th.ui.container.window.Message',
                  'th.ui.container.window.MessageButton']
    },
    
    /**
     * do dispose on any button click
     */
    autoDispose: true,
    
    /**
     * Title of message window
     */
    title:'',
    
    /**
     * body html
     */
    message: '',
    
    /**
     * Buttons config
     * {
     *   text:'Ok',
     *   callback: function(){},
     *   scope: me
     * }
     */
    buttons:[],
    
    
    _init: function(theClass){
        var me = this;
        if(!theClass){
            theClass = me;
        }
        theClass.parent._init.call(this,theClass.parent);
        me._validateMyself();
        me.renderTo(document.body);
    },
    
    getType: function(){
        util.throwError('the method should be overriden');
    },
    
    /**
     * renders the component into the specified dom element
     * @param wDomElement where to render
     */
    _doRender: function(){
        var me = this;
        var mainView = jQuery(th.ViewTemplateRegistry.getViewTemplate('th.ui.container.window.Message'));
        var typeDiv = mainView.find('[data-thid=type]');
        var type = me.getType();
        if(!type){
           util.throwError('No message type',me);
        }
        typeDiv.attr('data-type',type);
        var titleDiv = mainView.find('[data-thid=title]');
        titleDiv.html(me.title);
        var messageDiv = mainView.find('[data-thid=message]');
        messageDiv.html(me.message);
        
        //buttons
        var beforeDiv = mainView.find('[data-thid=beforeButtons]');
        
        jQuery.each(me.buttons,function(index,btnCfg){
            var buttonView = jQuery(th.ViewTemplateRegistry.getViewTemplate('th.ui.container.window.MessageButton'));
            var buttonTag = buttonView.find('[data-thid=button]');
            var buttonText = buttonView.find('[data-thid=buttonText]');
            buttonText.html(btnCfg.text);
            buttonTag.click(function(){
                if(btnCfg.callback){
                    btnCfg.callback.call(btnCfg.scope);
                }
                if(me.autoDispose){
                    me.dispose();
                }
            });
            beforeDiv.after(buttonView);
            beforeDiv = buttonView;
        });
        return mainView;
    },
    
    _validateMyself: function(config){
        var me = this;
        if(me.buttons.length==0){
            util.throwError('At least one button should be added into the message window',me);
        }
        jQuery.each(me.buttons,function(index,btnCfg){
            if(!btnCfg.text){
                util.throwError('Button config has no text');
            }
        });
    }
});