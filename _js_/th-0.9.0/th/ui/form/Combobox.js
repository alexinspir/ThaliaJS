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
 * Base class for all fields (Textfield, Textarea etc)
 */
th.define("th.ui.form.Combobox",{
    
    extend: 'th.ui.form.Field',
    
    require:{
        views:['th.ui.form.Combobox',
               'th.ui.form.ComboboxOption']
    },
    
    _value:null,
    
    /**
     * Config.
     * Name of id field (string) or function that accepts entity and returns entity id (scope - this tree).
     * Required.
     */
    entityId: null,
    
    /**
     * Config.
     * Name of field that contains name/description of the entity or function that accepts entity
     * and return name/description (scope - this tree).
     */
    entityName : null,/*function(entity){
        return entity.get('...');
    }*/
    
    /**
     * Options (array of entities) of possible values or
     * {
     *  xclass:'',
     *  data: [{},{}]
     * }
     */
    options: [],
    
    __combobox_dropDownCheckbox: null,
    
    __combobox_selectedEntityNameSpan: null,
    
    __combobox_optionContainer: null,
    
    __combobox_EntityId_to_Radio: {},
    
    __combobox_EntityId_to_EntityName:{},
    
    _init: function(theClass){
        var me = this;
        if(!theClass){
            theClass = this;
        }
        theClass.parent._init.call(this,theClass.parent);
        
        if(!me.entityId){
            util.throwError('entityId field should be set',me);
        }
        if(!me.entityName){
            util.throwError('entityName field should be set',me);
        }
        th.application.getEventManager().addListener(me.__combobox_hidePopupOnDocumentClick,me,'DocumentClick');
    },
    
    __combobox_hidePopupOnDocumentClick:function(evtName,evtObject){
        var me = this;
        var target = jQuery(evtObject.event.target);
        if(target.parents('#'+me.id).length>0){
            return;
        }else{
            me.__combobox_dropDownCheckbox.prop('checked',false);
        }
    },
    
    /**
     * options - only array of entities
     */
    setOptions: function(options){
        var me = this;
        me.options = options;
        me.__combobox_EntityId_to_Radio = {};
        me.__combobox_EntityId_to_EntityName = {};
        me.__combobox_optionContainer.empty();
        
        var radioName = util.dom.generateId();
        
        jQuery.each(options,function(i,option){
            var optionId = me._extractEntityId(option);
            var entityName = me._extractEntityName(option);
            me.__combobox_EntityId_to_EntityName[optionId] = entityName;
            
            var optionView = jQuery(th.ViewTemplateRegistry.getViewTemplate('th.ui.form.ComboboxOption'));
            var optionRadio = optionView.find('[data-thid=optionRadio]');
            var optionRadioLabel = optionView.find('[data-thid=optionRadioLabel]');
            
            optionRadio.attr('name',radioName);
            
            var radioId = util.dom.generateId();
            optionRadio.attr('id',radioId);
            optionRadioLabel.attr('for',radioId);
            
            if(me._value && (optionId==me._value)){
                optionRadio.prop('checked',true);
                me.__combobox_selectedEntityNameSpan.html(entityName);
            }
            
            optionRadio.change(function(){
                me.__combobox_onChange(optionId,entityName);
                me.__combobox_hideDropDownList();
            });
            
            var optionName = optionView.find('[data-thid=optionName]');
            optionName.html(entityName);
            
            me.__combobox_optionContainer.append(optionView);
            
            me.__combobox_EntityId_to_Radio[optionId] = optionRadio;
        });
    },
    
    __combobox_onChange: function(optionId,entityName){
        var me = this;
        me._value = optionId;
        me.__combobox_selectedEntityNameSpan.html(entityName);
        me.getEventManager().fireEvent('Changed',{
            source    : me, 
            value     : optionId
        });
    },
    
    __combobox_hideDropDownList: function(){
        var me = this;
        me.__combobox_dropDownCheckbox.prop('checked',false);
    },
    
    getOptions: function(){
        var me = this;
        return me.options;
    },
    
    /**
     * Sets value to the field. Subclasses are overriding the method.
     * @param value - value to set
     */
    setValue: function(value){
        var me = this;
        if((me._value!=value)){
            if(me.__combobox_EntityId_to_Radio[me._value]){
                me.__combobox_EntityId_to_Radio[me._value].prop('checked',false);
            }
            me._value = value;
            if(me.__combobox_EntityId_to_Radio[value]){
                me.__combobox_EntityId_to_Radio[value].prop('checked',true);
                if(me.__combobox_EntityId_to_EntityName[value]){
                    me.__combobox_selectedEntityNameSpan.html(me.__combobox_EntityId_to_EntityName[value]);
                }
            }else{
                me.__combobox_selectedEntityNameSpan.html('');
            }
        }
    },
    
    /**
     * Gets value from the field. Subclasses are overriding the method.
     * @returns value of the field
     */
    getValue: function(){
        var me = this;
        return me._value;
    },

    /**
     * @see #enabled
     * Subclasses are overriding the method.
     * 
     * @param enabled
     */
    setEnabled: function(enabled){
        var me = this;
        var oldValue = me.enabled;
        me.enabled = enabled;
        me.__combobox_setMode();
        if(oldValue != enabled){
            var eventName = enabled?'Enabled':'Disabled';
            me.getEventManager().fireEvent(eventName,{source:me});
        }
    },
    
    /**
     * @see #enabled
     * Subclasses are overriding the method.
     */
    isEnabled: function(){
        var me = this;
        return me.enabled;
    },
    
    /**
     * @see readOnly
     * Subclasses are overriding the method.
     * 
     * @param readOnly
     */
    setReadOnly: function(readOnly){
        var me = this;
        me.readOnly = readOnly;
        me.__combobox_setMode();
    },
    
    /**
     * @see readOnly
     * Subclasses are overriding the method.
     * 
     */
    isReadOnly: function(){
        var me = this;
        return me.readOnly;
    },
    
    __combobox_setMode: function(){
        var me = this;
        me.__combobox_dropDownCheckbox.attr('data-readonly','false');
        me.__combobox_dropDownCheckbox.prop('disabled',false);
        if(me.readOnly){
            me.__combobox_dropDownCheckbox.attr('data-readonly','true');
            me.__combobox_dropDownCheckbox.prop('disabled',true);
        }else if(!me.enabled){
            me.__combobox_dropDownCheckbox.prop('disabled',true);
        }
    },
    
    _doRender : function(){
        var me = this;
        //TODO 
        var body = jQuery(th.ViewTemplateRegistry.getViewTemplate('th.ui.form.Combobox'));
        
        me.__combobox_dropDownCheckbox = body.find('[data-thid=checkbox]');
        var checkBoxLabel = body.find('[data-thid=checkboxLabel]');
        var checkBoxId = util.dom.generateId();
        me.__combobox_dropDownCheckbox.attr('id',checkBoxId);
        checkBoxLabel.attr('for',checkBoxId);
        
        me.__combobox_selectedEntityNameSpan = body.find('[data-thid=selectedEntityName]');
        
        me.__combobox_optionContainer = body.find('[data-thid=optionContainer]');
        
        var options = [];
        if(me.options.xclass){
            jQuery.each(me.options.data,function(i,cfg){
                var entity = th.create(me.options.xclass);
                entity.deserialize(cfg);
                options.push(entity);
            });
        }else{
            options = me.options;
        }
        me.setOptions(options);
        
        me.setValue(me.value);
        
        me.__combobox_setMode();
        
        return body;
    },
    
    showErrorMask:function(){
        //nothing to do
    },
    
    hideErrorMask:function(){
        //nothing to do
    },
    
    _extractEntityId:function(entity){
        var me = this;
        if(!entity){
            util.throwError('Entity is null',me);
        }
        var id = null;
        if(util.type.isFunction(me.entityId)){
            id = me.entityId(entity);
        }else{
            id = entity.get(me.entityId);
        }
        if(id){
            return id;
        }else{
            util.throwError('Entity id is null',entity,me);
        }
    },
    
    _extractEntityName:function(entity){
        var me = this;
        if(!entity){
            util.throwError('Entity is null',me);
        }
        if(util.type.isFunction(me.entityName)){
            return me.entityName(entity);
        }else{
            return entity.get(me.entityName);
        }
    }
    
});