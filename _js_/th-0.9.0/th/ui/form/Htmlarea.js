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
th.define("th.ui.form.Htmlarea",{
    
    extend: 'th.ui.form.Field',
    
    require:{
        views:['th.ui.form.Htmlarea']
    },
    
    _readOnly: false,
    _enabled: true,
    
    fileUploadEnabled:false,
    
    
    __htmlarea__menuDiv: null,
    __htmlarea__boldCheckbox: null,
    __htmlarea__italicCheckbox: null,
    __htmlarea__underlineCheckbox: null,
    __htmlarea__strikethroughCheckbox: null,
    __htmlarea__codeButton: null,
    __htmlarea__uploadButton:null,
    __htmlarea__editableDiv:null,
    __htmlarea__editableDivId:null,
    __htmlarea__webKitFixInput:null,
    
    __htmlarea__currentFormatState:{
        bold          : false,
        italic        : false,
        underline     : false,
        strikethrough : false
    },
    
    __htmlarea__selectionRange:null,
    
    __htmlarea__codeEditorWindow:null,
    
    
    _getSupportedEventTypes: function(theClass){
        var me = this;
        if(!theClass){
            theClass = me;
        }
        
        var superEventTypes = theClass.parent._getSupportedEventTypes.call(this,theClass.parent);
        var eventTypes = [
                'FileUploadClick'
        ];
        return util.mergeArrays(superEventTypes,eventTypes);
    },
    
    /**
     * Sets value for the field
     * @param value
     */
    setValue: function(value){
        var me = this;
        if(me.__htmlarea__editableDiv){
            me.__htmlarea__editableDiv.html(value);
        }
    },
    
    /**
     * Return current value of the field
     * @returns
     */
    getValue: function(){
        var me = this;
        if(me.__htmlarea__editableDiv){
            return me.__htmlarea__editableDiv.html();
        }else{
            return me.value;
        }
    },
    
    insertLink:function(url){
        var me = this;
        me.__htmlarea__restoreSelection();
        document.execCommand("CreateLink", false, url);
        me.__htmlarea__saveSelection();
        me.__htmlarea__setButtonsToActualState();
    },
    
    _doRender : function(){
        var me = this;
        var body = jQuery(th.ViewTemplateRegistry.getViewTemplate('th.ui.form.Htmlarea'));//th.ui.form.Htmlarea
        me.__htmlarea__menuDiv = body.find('[data-thid=menuDiv]');
        me.__htmlarea__boldCheckbox = body.find('[data-thid=boldCheckbox]');
        me.__htmlarea__italicCheckbox = body.find('[data-thid=italicCheckbox]');
        me.__htmlarea__underlineCheckbox = body.find('[data-thid=underlineCheckbox]');
        me.__htmlarea__strikethroughCheckbox = body.find('[data-thid=strikethroughCheckbox]');
        me.__htmlarea__codeButton = body.find('[data-thid=codeButton]');
        me.__htmlarea__uploadButton = body.find('[data-thid=uploadButton]');
        me.__htmlarea__editableDiv = body.find('[data-thid=editableDiv]');
        me.__htmlarea__webKitFixInput = body.find('[data-thid=webKitFixInput]');
        
        me.__htmlarea__editableDivId = util.dom.generateId();
        me.__htmlarea__editableDiv.attr('id',me.__htmlarea__editableDivId);
        
        var boldCheckboxLabel = body.find('[data-thid=boldCheckboxLabel]');
        var italicCheckboxLabel = body.find('[data-thid=italicCheckboxLabel]');
        var underlineCheckboxLabel = body.find('[data-thid=underlineCheckboxLabel]');
        var strikethroughCheckboxLabel = body.find('[data-thid=strikethroughCheckboxLabel]');
        
        var boldId = util.dom.generateId();
        var italicId = util.dom.generateId();
        var underlineId = util.dom.generateId();
        var strikethroughId = util.dom.generateId();
        
        me.__htmlarea__boldCheckbox.attr('id',boldId);
        boldCheckboxLabel.attr('for',boldId);
        
        me.__htmlarea__italicCheckbox.attr('id',italicId);
        italicCheckboxLabel.attr('for',italicId);
        
        me.__htmlarea__underlineCheckbox.attr('id',underlineId);
        underlineCheckboxLabel.attr('for',underlineId);
        
        me.__htmlarea__strikethroughCheckbox.attr('id',strikethroughId);
        strikethroughCheckboxLabel.attr('for',strikethroughId);
        
        
        me.__htmlarea__boldCheckbox.change(function(){
            me.__htmlarea__boldButtonChange();
        });
        me.__htmlarea__italicCheckbox.change(function(){
            me.__htmlarea__italicButtonChange();
        });
        me.__htmlarea__underlineCheckbox.change(function(){
            me.__htmlarea__underlineButtonChange();
        });
        me.__htmlarea__strikethroughCheckbox.change(function(){
            me.__htmlarea__strikethroughButtonChange();
        });
        me.__htmlarea__codeButton.click(function(){
            me.__htmlarea__codeButtonClick();
        });
        me.__htmlarea__uploadButton.click(function(){
            me.__htmlarea__uploadButtonClick();
        });
        
        me.__htmlarea__editableDiv.bind("change paste keyup mouseup",function(){
            if(me.__htmlarea__editableDiv.attr('contenteditable')){
                me.__htmlarea__saveSelection();
                me.__htmlarea__saveCurrentFormatState();
                me.__htmlarea__setButtonsToActualState();
            }
        });
        
        //the code below relates to a web kit bug: https://gist.github.com/shimondoodkin/1081133
        if(/AppleWebKit\/([\d.]+)/.exec(navigator.userAgent)) {
            me.__htmlarea__editableDiv.blur(function(){
                me.__htmlarea__webKitFixInput[0].setSelectionRange(0,0);
                me.__htmlarea__webKitFixInput.blur();
            });
        }
        
        if(!me.fileUploadEnabled){
            body.find('[data-thid=uploadButtonContainer]').hide();
        }
        
        if(me.stretch || me.height || me.width){
            body.attr('data-stretch',true);
        }else{
            body.attr('data-stretch',false);
        }
        
        me.setReadOnly(me.readOnly);
        me.setEnabled(me.enabled);
        me.setValue(me.value);
        return body;
    },
    
    __htmlarea__setButtonsToActualState:function(){
        var me = this;
        me.__htmlarea__boldCheckbox.prop("checked",document.queryCommandState("bold"));
        me.__htmlarea__italicCheckbox.prop("checked",document.queryCommandState("italic"));
        me.__htmlarea__underlineCheckbox.prop("checked",document.queryCommandState("underline"));
        me.__htmlarea__strikethroughCheckbox.prop("checked",document.queryCommandState("strikethrough"));
    },
    
    __htmlarea__saveCurrentFormatState:function(){
        var me = this;
        me.__htmlarea__currentFormatState.bold=document.queryCommandState("bold");
        me.__htmlarea__currentFormatState.italic=document.queryCommandState("italic");
        me.__htmlarea__currentFormatState.underline=document.queryCommandState("underline");
        me.__htmlarea__currentFormatState.strikethrough=document.queryCommandState("strikethrough");
    },
    
    __htmlarea__applyFormatState:function(){
        var me = this;
        if(document.queryCommandState("bold")!=me.__htmlarea__currentFormatState.bold){
            document.execCommand("bold", false, null);
        }
        if(document.queryCommandState("italic")!=me.__htmlarea__currentFormatState.italic){
            document.execCommand("italic", false, null);
        }
        if(document.queryCommandState("underline")!=me.__htmlarea__currentFormatState.underline){
            document.execCommand("underline", false, null);
        }
        if(document.queryCommandState("strikethrough")!=me.__htmlarea__currentFormatState.strikethrough){
            document.execCommand("strikethrough", false, null);
        }
    },
    
    __htmlarea__saveSelection:function(){
        var me = this;
        var selection = window.getSelection();
        if(selection.rangeCount){
            me.__htmlarea__selectionRange=window.getSelection().getRangeAt(0);
        }
    },
    
    __htmlarea__restoreSelection:function(){
        var me = this;
        window.getSelection().removeAllRanges();
        if(me.__htmlarea__selectionRange){
            window.getSelection().addRange(me.__htmlarea__selectionRange);
        }
    },
    
    __htmlarea__boldButtonChange:function(){
        var me = this;
        me.__htmlarea__restoreSelection();
        me.__htmlarea__currentFormatState.bold = !me.__htmlarea__currentFormatState.bold;
        
        me.__htmlarea__applyFormatState();
        me.__htmlarea__saveSelection();
        me.__htmlarea__setButtonsToActualState();
    },
    
    __htmlarea__italicButtonChange:function(){
        var me = this;
        me.__htmlarea__restoreSelection();
        me.__htmlarea__currentFormatState.italic = !me.__htmlarea__currentFormatState.italic;
        me.__htmlarea__applyFormatState();
        me.__htmlarea__saveSelection();
        me.__htmlarea__setButtonsToActualState();
    },
    
    __htmlarea__underlineButtonChange:function(){
        var me = this;
        me.__htmlarea__restoreSelection();
        me.__htmlarea__currentFormatState.underline = !me.__htmlarea__currentFormatState.underline;
        me.__htmlarea__applyFormatState();
        me.__htmlarea__saveSelection();
        me.__htmlarea__setButtonsToActualState();
    },
    
    __htmlarea__strikethroughButtonChange:function(){
        var me = this;
        me.__htmlarea__restoreSelection();
        me.__htmlarea__currentFormatState.strikethrough = !me.__htmlarea__currentFormatState.strikethrough;
        me.__htmlarea__applyFormatState();
        me.__htmlarea__saveSelection();
        me.__htmlarea__setButtonsToActualState();
    },
    
    __htmlarea__codeButtonClick:function(){
        var me = this;
        if(!me.__htmlarea__codeEditorWindow){
            me.__htmlarea__codeEditorWindow = th.UiRegistry.createAndRegister('th.ui.container.window.Window',{
                title: 'Edit raw html code',
                xname: 'codeEditorWindow',
                width: 1000,
                height: 500,
                visible: false,
                autoDispose: false,
                layout:{
                    xclass: 'th.ui.container.layout.VerticalLayout',
                },
                padding_top: 5,
                padding_right: 5,
                padding_bottom: 5,
                padding_left: 5,
                descendants:[{
                    xclass  : 'th.ui.form.Textarea',
                    xname   : 'htmlCode',
                    stretch : 1
                },{
                    xclass: 'th.ui.container.Container',
                    layout: 'th.ui.container.layout.HorizontalLayout',
                    height: 30,
                    descendants:[{
                        xclass: 'th.ui.container.Container',
                        stretch: 1,
                    },{
                        xclass:'th.ui.control.Button',
                        width: 50,
                        margin_top: 2,
                        text: 'Apply',
                        click: function(){
                           me.setValue(me.__htmlarea__codeEditorWindow.find([{xclass  : 'th.ui.form.Textarea'}])[0].getValue());
                           me.__htmlarea__codeEditorWindow.hide();
                        }
                    },{
                        xclass: 'th.ui.container.Container',
                        width: 20,
                    },{
                        xclass:'th.ui.control.Button',
                        width: 50,
                        margin_top: 2,
                        text: 'Cancel',
                        click: function(){
                            me.__htmlarea__codeEditorWindow.hide();
                        }
                    },{
                        xclass: 'th.ui.container.Container',
                        stretch: 1,
                    }]
                }]
            });
        }
        me.__htmlarea__codeEditorWindow.find([{xclass  : 'th.ui.form.Textarea'}])[0].setValue(me.getValue());
        
        me.__htmlarea__codeEditorWindow.show();
    },
    
    __htmlarea__uploadButtonClick:function(){
        var me = this;
        me.__htmlarea__editableDiv[0].focus();
        me.__htmlarea__saveSelection();
        me.getEventManager().fireEvent('FileUploadClick',{source:me});
    },
    
    setReadOnly: function(readOnly){
        var me = this;
        if(!me._enabled){
            return;
        }
        if(readOnly){
            me._readOnly = true;
        }else{
            me._readOnly = false;
        }
        me.__htmlarea__setReadOnly(readOnly);
    },
    
    __htmlarea__setReadOnly:function(readOnly){
        var me = this;
        if(readOnly){
            me.__htmlarea__menuDiv.addClass('hidden');
            me.__htmlarea__editableDiv.removeAttr("contenteditable");
        }else{
            me.__htmlarea__menuDiv.removeClass('hidden');
            me.__htmlarea__editableDiv.attr("contenteditable",true);
        }
    },
    
    isReadOnly: function(){
        var me = this;
        return me._readOnly;
    },
    
    setEnabled: function(enabled){
        var me = this;
        if(me.isEnabled()){
            if(!enabled){
                me._enabled = false;
                me.__htmlarea__setReadOnly(true);
                me.getEventManager().fireEvent('Disabled',{source:me});
            }
        }else{
            if(enabled){
                me._enabled = true;
                if(me.isReadOnly()){
                    me.__htmlarea__setReadOnly(false);
                }
                me.getEventManager().fireEvent('Enabled',{source:me});
            }
        }
    },
    
    isEnabled: function(){
        var me = this;
        return me._enabled;
    },
    
    dispose: function(theClass){
        var me = this;
        if(!theClass){
            theClass = me;
        }
        if(!me.disposed){
            theClass.parent.dispose.call(this,theClass.parent);
            if(me.__htmlarea__codeEditorWindow){
                me.__htmlarea__codeEditorWindow.dispose();
                me.__htmlarea__codeEditorWindow = null;
            }
        }
    }
});