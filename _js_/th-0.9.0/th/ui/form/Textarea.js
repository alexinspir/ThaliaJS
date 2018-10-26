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
th.define("th.ui.form.Textarea",{
    
    extend: 'th.ui.form.Field',
    
    require:{
        views:['th.ui.form.Textarea']
    },
    
    
    
    __textarea__textarea: null,
    
    /**
     * Sets value for the field
     * @param value
     */
    setValue: function(value){
        var me = this;
        if(me.__textarea__textarea){
            me.__textarea__textarea.val(value);
        }
    },
    
    /**
     * Return current value of the field
     * @returns
     */
    getValue: function(){
        var me = this;
        if(me.__textarea__textarea){
            return me.__textarea__textarea.val();
        }else{
            return me.value;
        }
    },
    
    _doRender : function(){
        var me = this;
        var body = jQuery(th.ViewTemplateRegistry.getViewTemplate('th.ui.form.Textarea'));
        me.__textarea__textarea = body.find('[data-thid=textarea]');
        me.__textarea__textarea.bind("change paste keyup mouseup",function(){
            me.getEventManager().fireEvent('Changed',{source:me, value:me.getValue()});
        });
        me.setReadOnly(me.readOnly);
        me.setEnabled(me.enabled);
        me.setValue(me.value);
        return body;
    },
    
    setReadOnly: function(readOnly){
        var me = this;
        if(readOnly){
            me.__textarea__textarea.prop("readonly",true);
        }else{
            me.__textarea__textarea.prop("readonly",false);
        }
    },
    
    isReadOnly: function(){
        var me = this;
        return me.__textarea__textarea.is('[readonly]');
    },
    
    setEnabled: function(enabled){
        var me = this;
        if(me.isEnabled()){
            if(!enabled){
                me.__textarea__textarea.prop('disabled',true);
                me.getEventManager().fireEvent('Disabled',{source:me});
            }
        }else{
            if(enabled){
                me.__textarea__textarea.prop('disabled',false);
                me.getEventManager().fireEvent('Enabled',{source:me});
            }
        }
    },
    
    isEnabled: function(){
        var me = this;
        return !me.__textarea__textarea.is(':disabled'); 
    }
});