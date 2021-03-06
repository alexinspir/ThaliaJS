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
th.define("th.ui.form.Textfield",{
    
    extend: 'th.ui.form.Field',
    
    require:{
        views:['th.ui.form.Textfield']
    },
    
    _value: null,
    
    
    
    _textfield: null,
    
    /**
     * Sets value for the field
     * @param value
     */
    setValue: function(value){
        var me = this;
        me._value = value;
        if(me._textfield){
            me._textfield.val(value);
        }
    },
    
    /**
     * Return current value of the field
     * @returns
     */
    getValue: function(){
        var me = this;
        if(me._textfield){
            return me._textfield.val();
        }else{
            return me.value;
        }
    },
    
    _doRender : function(){
        var me = this;
        me._textfield = jQuery(th.ViewTemplateRegistry.getViewTemplate('th.ui.form.Textfield'));
        me._textfield.bind("change paste keyup",function(){
            me.getEventManager().fireEvent('Changed',{source:me, value:me._textfield.val()});
        });
        me.setReadOnly(me.readOnly);
        me.setEnabled(me.enabled);
        me.setValue(me.value);
        return me._textfield;
    },
    
    setReadOnly: function(readOnly){
        var me = this;
        if(readOnly){
            me._textfield.prop("readonly",true);
        }else{
            me._textfield.prop("readonly",false);
        }
    },
    
    isReadOnly: function(){
        var me = this;
        return me._textfield.is('[readonly]');
    },
    
    setEnabled: function(enabled){
        var me = this;
        if(me.isEnabled()){
            if(!enabled){
                me._textfield.prop('disabled',true);
                me.getEventManager().fireEvent('Disabled',{source:me});
            }
        }else{
            if(enabled){
                me._textfield.prop('disabled',false);
                me.getEventManager().fireEvent('Enabled',{source:me});
            }
        }
    },
    
    isEnabled: function(){
        var me = this;
        return !me._textfield.is(':disabled'); 
    },
    
    showErrorMask:function(){
        var me = this;
        me._textfield.attr('data-check','error');
    },
    
    hideErrorMask:function(){
        var me = this;
        me._textfield.removeAttr('data-check');
    }
});