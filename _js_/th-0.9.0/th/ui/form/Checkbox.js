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

th.define("th.ui.form.Checkbox",{
    
    extend: 'th.ui.form.Field',
    
    require:{
        views:['th.ui.form.Checkbox']
    },
    
    /**
     * Value to be used to set intially (or on reset of panel)
     */
    value: false,
    
    _checkbox:null,
    
    _fireChange:function(){
        var me = this;
        me.getEventManager().fireEvent('Changed',{source:me,value:me.getValue()});
    },
    
    getValue: function(){
        var me = this;
        return me._checkbox.is(':checked');
    },
    
    setValue: function(value){
        var me = this;
        if(value){
            me._checkbox.prop("checked",true);
        }else{
            me._checkbox.prop("checked",false);
        }
    },

    setEnabled: function(enabled){
        var me = this;
        var fireDisabled = false;
        var fireEnabled = false;
        if(me.isEnabled()){
            if(!enabled){
                fireDisabled = true;
            }
        }else{
            if(enabled){
                fireEnabled = true;
            }
        }
        me._setEnabledAndReadOnlyStyles(enabled,me.isReadOnly());
        me.enabled = enabled;
        if(fireDisabled){
            me.getEventManager().fireEvent('Disabled',{source:me});
        }
        if(fireEnabled){
            me.getEventManager().fireEvent('Enabled',{source:me});
        }
    },
    
    isEnabled: function(){
        var me = this;
        return me.enabled; 
    },
    
    _setEnabledAndReadOnlyStyles:function(enabled,readOnly){
        var me = this;
        if(!me._checkbox){
            return;
        }
        if(!enabled){
            me._checkbox.prop('disabled',true);
            me._checkbox.attr('data-readonly','false');
        }else if(readOnly){
            me._checkbox.prop('disabled',true);
            me._checkbox.attr('data-readonly','true');
        }else{
            me._checkbox.prop('disabled',false);
            me._checkbox.removeAttr('data-readonly');
        }
    },
    
    setReadOnly: function(readOnly){
        var me = this;
        me.readOnly = readOnly;
        me._setEnabledAndReadOnlyStyles(me.isEnabled(), readOnly);
    },
    
    isReadOnly: function(){
        var me = this;
        return me.readOnly;
    },
    
    _doRender : function(){
        var me = this;
        var body = jQuery(th.ViewTemplateRegistry.getViewTemplate('th.ui.form.Checkbox'));
        
        me._checkbox = body.find('[data-thid=checkbox]');
        var label = body.find('[data-thid=label]');
        
        var id = util.dom.generateId();
        
        me._checkbox.attr('id',id);
        label.attr('for',id);
        
        if(me.height){
            body.css('height',me.height+'px');
        }
        me._checkbox.change(function(){
            me._fireChange();
        });
        
        me.setReadOnly(me.readOnly);
        me.setEnabled(me.enabled);
        me.setValue(me.value);
        return body;
    },

    showErrorMask:function(){
        //nothing to do
    },
    
    hideErrorMask:function(){
        //nothing to do
    }
});