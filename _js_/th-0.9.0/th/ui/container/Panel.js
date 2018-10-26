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

th.define("th.ui.container.Panel",{
    
    extend: 'th.ui.container.Container',
    
    require:{
        classes:['th.ui.container.window.ErrorMessage'],
        views:['th.ui.container.Panel',
               'th.ui.container.PanelButton']
    },
    
    title: null,
    
    // --------------------------------------------------------------------------------------------
    
    style: null,
    _style_div: null,
    
    // --------------------------------------------------------------------------------------------
    
    _panel_title_div: null,
    
    _alert_button_div: null,
    _alert_message: null,
    
    _entity: null,
    
    /**
     * Title buttons.
     * predefined buttons: help, close
     */
    buttons:[/*{
            type: 'help'
            //optional
            text: 'Name of button',
            //optional, overrides default class, if any
            iconClass:'',
            //onClick callback, scope is the panel object
            click:function(){}
        },
    }*/],
    
    /**
     * if false, then all fields will be recalculated always on setEntity/getEntity
     */
    cacheFormFields: true,
    
    _fieldsCache: null,
    
    _init: function(theClass){
        var me = this;
        if(!theClass){
            theClass = me;
        }
        me.buttons.unshift({
            type: 'alert',
            click: me.__alertClickCallback
        });
        theClass.parent._init.call(this,theClass.parent);
        
        jQuery.each(me.buttons,function(i,config){
            if(!config.type){
                util.throwError('Button config does not have type definition',me);
            }
            if(config.click){
                me.getEventManager().addListener(config.click, me, th.util.toUpperCaseFirstLetter(config.type)+'ButtonClick');
            }
        });
    },
    
    _getSupportedEventTypes: function(theClass){
        var me = this;
        if(!theClass){
            theClass = me;
        }
        
        var superEventTypes = theClass.parent._getSupportedEventTypes.call(this,theClass.parent);
        var eventTypes = [];
        jQuery.each(me.buttons,function(i,config){
            var eventName = th.util.toUpperCaseFirstLetter(config.type)+'ButtonClick';
            eventTypes.push(eventName);
        });
        return util.mergeArrays(superEventTypes,eventTypes);
    },
    
    _doRender:function(theClass){
        var me = this;
        if (!theClass) {
            theClass = me;
        }
        
        var body = jQuery(th.ViewTemplateRegistry.getViewTemplate('th.ui.container.Panel'));
        me._panel_title_div = body.find('[data-thid=title]');
        
        var beforeButtonsDiv = body.find('[data-thid=beforeButtons]');
        me._renderButtonsAfter(beforeButtonsDiv);
        me.setTitle(me.title);
        
        var containerDiv = body.find('[data-thid=containerDiv]');
        var containerBody = theClass.parent._doRender.call(this, theClass.parent);
        containerDiv.append(containerBody);
        
        if(me.stretch || me.height || me.width){
            body.attr('data-stretch',true);
        }else{
            body.attr('data-stretch',false);
        }

        // --------------------------------------------------------------------------------------------

        me._style_div = body;
        me.setStyle(me.style);

        // --------------------------------------------------------------------------------------------
        
        return body;
    },
    
    _renderButtonsAfter:function(beforeButtonsDiv){
        var me = this;
        var tempBefore = beforeButtonsDiv;
        jQuery.each(me.buttons,function(i,config){
            tempBefore = me._renderButtonAfter(tempBefore,config.type,config);
        });
    },
    
    __alertClickCallback:function(){
        var me = this;
        th.create({
            xclass:'th.ui.container.window.ErrorMessage',
            title: 'Error',
            message: me._alert_message,
            buttons:[{
                text: 'Ok'
            }],
        });
    },
    
    _renderButtonAfter:function(beforeDiv,type,config){
        var me = this;
        var buttonView = jQuery(th.ViewTemplateRegistry.getViewTemplate('th.ui.container.PanelButton'));
        var iconDiv = buttonView.find('[data-thid=icon]');
        var iconClass = 'th__icon__'+type;
        if(config.iconClass){
            iconClass = config.iconClass;
        }
        iconDiv.addClass(iconClass);
        if(config.text){
            iconDiv.html(config.text);
        }
        beforeDiv.after(buttonView);
        
        var button = buttonView.find('[data-thid=button]');
        button.click(function(){
            me.getEventManager().fireEvent(th.util.toUpperCaseFirstLetter(type)+'ButtonClick',{source:me});
        });
        if(type=='alert'){
            me._alert_button_div = buttonView;
            me._alert_button_div.hide();
        }
        return buttonView;
    },
    
    setTitle: function(title){
        var me = this;
        me.title = title;
        if(me._panel_title_div){
            me._panel_title_div.html(title);
        }
    },
    
    getTitle: function(){
        var me = this;
        return me.title;
    },
    
    showAlertButton:function(alertMessage){
        var me = this;
        me._alert_button_div.show();
        me._alert_message = alertMessage;
    },
    
    hideAlertButton:function(){
        var me = this;
        me._alert_button_div.hide();
    },
    
    _getFields:function(){
        var me = this;
        if(me.cacheFormFields && me._fieldsCache){
            return me._fieldsCache;
        }
        var myselfSelectorEntry = {
            xclass: me.xclass,
            filter:{
                xinstanceid: me.xinstanceid
            }
        };
        var fieldsSelectorEntry = {
            subclassOf: 'th.ui.form.Field',
            checker: function(instance){
                if(instance.name){
                    return true;
                }else{
                    return false;
                }
            }
        };
        var fieldsArray = th.UiRegistry.findReverse([myselfSelectorEntry,fieldsSelectorEntry]);
        var fieldsMap = {};
        jQuery.each(fieldsArray,function(i,value){
            if(!fieldsMap[value.name]){
                fieldsMap[value.name] = [];
            }
            fieldsMap[value.name].push(value);
        });
        if(me.cacheFormFields){
            me._fieldsCache = fieldsMap;
        }
        return fieldsMap;
    },
    
    reset: function(){
        var me = this;
        jQuery.each(me._getFields(),function(name,fields){
            jQuery.each(fields,function(i,field){
                field.setValue(field.value);
            });
        });
    },
    
    setEntity: function(entity){
        var me = this;
        me._entity = entity;
        me.reset();
        if(entity){
            var fields = me._getFields();
            jQuery.each(entity.getPropertiesNames(),function(i,name){
                if(fields[name]){
                    var value = entity.get(name);
                    jQuery.each(fields[name],function(i,field){
                    	if(field.allowSetValue){
                    		field.setValue(value);
                    	}
                    });
                }
            });
        }
    },
    
    getEntity: function(){
        var me = this;
        if(!me._entity){
            return null;
        }else{
            var fields = me._getFields();
            jQuery.each(me._entity.getPropertiesNames(),function(i,name){
                if(fields[name]){
                    var isSet = false;
                    jQuery.each(fields[name],function(i,field){
                        if(field.allowGetValue){
                            if(isSet){
                                util.throwError('The panel has 2 or more fields with name "'+name+'" that have allowGetValue set to true',me);
                            }else{
                                isSet = true;
                                me._entity.set(name,field.getValue());
                            }
                        }
                    });
                }
            });
            return me._entity;
        }
    },

    // --------------------------------------------------------------------------------------------
    
    setStyle: function(style){
        var me = this;
        me.style = style;
        if(!style) {
            me._style_div.addClass('ordinary_panel');
        } else {
            me._style_div.addClass(style+'_panel');
        }
    },
    
    getStyle: function(){
        var me = this;
        return me.style;
    },

    // --------------------------------------------------------------------------------------------
    
});