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
th.define("th.ui.form.Filefield",{//TODO 
    
    extend: 'th.ui.form.Field',
    
    require:{
        views:['th.ui.form.Filefield','th.ui.form.FilefieldInput']
    },
    
    noFileText:'Select File',
    uploadFileText: 'Upload',
    
    url: null,
    
    
    
    __filefield_fileInputContainer: null,
    
    __filefield_selectFileContainer:null,
    __filefield_selectFileLabel:null,
    __filefield_selectFileText:null,
    
    __filefield_fileIsSelectedContainer:null,
    __filefield_fileIsSelectedLabel:null,
    
    __filefield_deleteButtonContainer:null,
    __filefield_deleteButton:null,
    
    __filefield_startUploadButtonContainer:null,
    __filefield_startUploadButton:null,
    __filefield_startUploadButtonText:null,
    
    __filefield_uploadingIndicatorContainer:null,
    
    __filefield_iframe:null,
    
    
    __filefield_oidInput:null,
    __filefield_fidInput:null,
    __filefield_fileInput:null,
    
    __filefield_fileId: null,
    __filefield_oid:null,
    __filefield_iframeName:null,
    
    __filefield_submit:false,
    
    _getSupportedEventTypes: function(theClass){
        var me = this;
        if(!theClass){
            theClass = me;
        }
        
        var superEventTypes = theClass.parent._getSupportedEventTypes.call(this,theClass.parent);
        var eventTypes = [
                'UploadStarted',
                'UploadFinished'
        ];
        return util.mergeArrays(superEventTypes,eventTypes);
    },
    
    _init: function(theClass){
        var me = this;
        if(!theClass){
            theClass = this;
        }
        theClass.parent._init.call(this,theClass.parent);
        
        if(!me.url){
            util.throwError('No url to configure Filefield: specify url where to upload file',me);
        }
    },
    
    /**
     * Sets value for the field
     * @param value
     */
    setValue: function(value){
        var me = this;
        me.__filefield_oid = value;
    },
    
    /**
     * Return current value of the field
     * @returns
     */
    getValue: function(){
        var me = this;
        return me.__filefield_oid;
    },
    
    reset:function(){
        var me = this;
        var inputBody = jQuery(th.ViewTemplateRegistry.getViewTemplate('th.ui.form.FilefieldInput'));
        me.__filefield_form = inputBody;
        me.__filefield_form.attr('action',me.url);
        me.__filefield_oidInput = inputBody.find('[data-thid=oidInput]');
        me.__filefield_fidInput = inputBody.find('[data-thid=fidInput]');
        me.__filefield_fileInput = inputBody.find('[data-thid=fileInput]');
        
        
        me.__filefield_fileId = util.dom.generateId();//me.__filefield_fileId
        if(!me.__filefield_iframeName){
            me.__filefield_iframeName = util.dom.generateId();
            me.__filefield_iframe.attr('name',me.__filefield_iframeName);
        }

        me.__filefield_form.attr('target',me.__filefield_iframeName);
        
        me.__filefield_fileInput.attr('id',me.__filefield_fileId);
        me.__filefield_selectFileLabel.attr('for',me.__filefield_fileId);
        me.__filefield_fileIsSelectedLabel.attr('for',me.__filefield_fileId);
        
        me.__filefield_fidInput.val(me.__filefield_fileId);
        
        me.__filefield_fileInputContainer.empty();
        me.__filefield_fileInputContainer.append(inputBody);
        
        me.__filefield_selectFileContainer.removeClass('hidden');
        me.__filefield_fileIsSelectedContainer.addClass('hidden');
        me.__filefield_deleteButtonContainer.addClass('hidden');
        me.__filefield_startUploadButtonContainer.addClass('hidden');
        
        me.__filefield_fileInput.change(function(){
            me.__filefield_fileSelected();
        });
    },
    
    _doRender : function(){
        var me = this;
        var body = jQuery(th.ViewTemplateRegistry.getViewTemplate('th.ui.form.Filefield'));
        me.__filefield_fileInputContainer = body.find('[data-thid=fileInputContainer]');
        
        me.__filefield_selectFileContainer = body.find('[data-thid=selectFileContainer]');
        me.__filefield_selectFileLabel = body.find('[data-thid=selectFileLabel]');
        me.__filefield_selectFileText = body.find('[data-thid=selectFileText]');
        
        
        me.__filefield_fileIsSelectedContainer = body.find('[data-thid=fileIsSelectedContainer]');
        me.__filefield_fileIsSelectedLabel = body.find('[data-thid=fileIsSelectedLabel]');
        
        me.__filefield_deleteButtonContainer = body.find('[data-thid=deleteButtonContainer]');
        me.__filefield_deleteButton = body.find('[data-thid=deleteButton]');
        
        me.__filefield_startUploadButtonContainer = body.find('[data-thid=startUploadButtonContainer]');
        me.__filefield_startUploadButton = body.find('[data-thid=startUploadButton]');
        me.__filefield_startUploadButtonText = body.find('[data-thid=startUploadButtonText]');
        
        me.__filefield_uploadingIndicatorContainer = body.find('[data-thid=uploadingIndicatorContainer]');
        
        me.__filefield_iframe = body.find('[data-thid=iframe]');
        
        me.__filefield_selectFileText.html(me.noFileText);
        me.__filefield_startUploadButtonText.html(me.uploadFileText);
        
        me.__filefield_deleteButton.click(function(){
            me.__filefield_deleteFileButtonClick();
        });
        
        me.__filefield_startUploadButton.click(function(){
            me.__filefield_startUploadButtonClick();
        });
        
        me.reset();
        
        me.__filefield_iframe.load(function(evt){
            me.__filefield_iframeLoaded();
        });
        
        me.__filefield_fileIsSelectedContainer.addClass('hidden');
        me.__filefield_deleteButtonContainer.addClass('hidden');
        me.__filefield_startUploadButtonContainer.addClass('hidden');
        me.__filefield_uploadingIndicatorContainer.addClass('hidden');
        
        me.setReadOnly(me.readOnly);
        me.setEnabled(me.enabled);
        return body;
    },
    
    __filefield_fileSelected:function(){
        var me = this;
        var value = me.__filefield_fileInput.val();
        if(!value){
            me.__filefield_fileSelected0(null);
            return;
        }
        var file = me.__filefield_fileInput[0].files[0];
        me.__filefield_fileSelected0(file);
    },
    
    __filefield_fileSelected0:function(file){
        var me = this;
        if(!file){
            me.getEventManager().fireEvent('Changed',{source:me,file:null});
            me.__filefield_selectFileContainer.removeClass('hidden');
            me.__filefield_fileIsSelectedContainer.addClass('hidden');
            me.__filefield_deleteButtonContainer.addClass('hidden');
            me.__filefield_startUploadButtonContainer.addClass('hidden');
        }else{
            me.__filefield_fileIsSelectedLabel.text(file.name);
            me.__filefield_selectFileContainer.addClass('hidden');
            me.__filefield_fileIsSelectedContainer.removeClass('hidden');
            me.__filefield_deleteButtonContainer.removeClass('hidden');
            me.__filefield_startUploadButtonContainer.removeClass('hidden');
            me.getEventManager().fireEvent('Changed',{source:me,file:file});
        }
    },
    
    __filefield_deleteFileButtonClick:function(){
        var me = this;
        me.reset();
    },
    
    __filefield_startUploadButtonClick:function(){
        var me = this;
        if(!me.__filefield_oid){
            util.throwError('No oid to pass to server',me);
            return;
        }
        me.__filefield_oidInput.val(me.__filefield_oid);
        me.getEventManager().fireEvent('UploadStarted',{source:me, fid:me.__filefield_fileId, oid: me.__filefield_oid});
        me.__filefield_submit = true;
        me.__filefield_form.submit();
    },
    
    __filefield_iframeLoaded:function(){
        var me = this;
        if(me.__filefield_submit){
            me.__filefield_submit = false;
            me.getEventManager().fireEvent('UploadFinished',{source:me, fid:me.__filefield_fileId, oid: me.__filefield_oid});
            me.reset();
        }
    },
    
    setReadOnly: function(readOnly){
        //non implemented yet
    },
    
    isReadOnly: function(){
        return false;
    },
    
    setEnabled: function(enabled){
        //non implemented yet
    },
    
    isEnabled: function(){
        return true;
    }
});