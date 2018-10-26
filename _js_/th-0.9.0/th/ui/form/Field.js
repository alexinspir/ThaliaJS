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
th.define("th.ui.form.Field",{
    
    extend: 'th.ui.Component',
    
    /**
     * name of the field. the name is used to set/get value of the field to/from an Entity.
     * mapping is: name of the field <-> name of property in an entity.
     */
    name: null,
    
    /**
     * If true, then value of the field can be set from corresponding entity property.
     * The field is used only by Panels.
     * 
     * @see #name
     */
    allowSetValue: true,
    
    /**
     * If true, then value of the field can be used to populate corresponding entity property.
     * The field is used only by Panels.
     * 
     * @see #name
     */
    allowGetValue: true,
    
    /**
     * whether to enable the field (relates only to UI rendering and behavior).
     */
    enabled: true,
    
    /**
     * whether to set the field read only (relates only to UI rendering and behavior).
     */
    readOnly: false,
    
    /**
     * Function that accepts value of the field and returns true if the value is valid, false otherwise.
     * scope of the function is the field object.
     */
    validator: null,
    
    
    _init: function(theClass){
        var me = this;
        if(!theClass){
            theClass = this;
        }
        theClass.parent._init.call(this,theClass.parent);
        
        if(me.validator){
        	me._setValidator(me.validator, false);
        }
    },
    
    /**
     * @see th.ui.Component#_getSupportedEventTypes(theClass);
     * 
     * @param theClass
     * @returns
     */
    _getSupportedEventTypes: function(theClass){
        var me = this;
        if(!theClass){
            theClass = me;
        }
        
        var superEventTypes = theClass.parent._getSupportedEventTypes.call(this,theClass.parent);
        var eventTypes = [
                'Enabled',
                'Disabled',
                /* subclasses must fire the event on value change*/
                'Changed'
        ];
        return util.mergeArrays(superEventTypes,eventTypes);
    },
    
    /**
     * Sets new validator and unsubcribes old validator
     * @param validator - new validator
     */
    setValidator:function(validator){
    	var me = this;
    	me._setValidator(validator, true);
    },
    
    /**
     * Sets new validator.
     * @param validator - new validator
     * @param unsubsribePrevious - whether to unsubscribe old validator
     */
    _setValidator: function(validator,unsubsribePrevious){
    	var me = this;
    	if(unsubsribePrevious && me.validator){
    		me.getEventManager().removeListener(me.validator);
    	}
    	if(validator){
    		me.validator = validator;
    		me.getEventManager().addListener(
        			function(eventType,eventObject){
        				me.validate();
        			},
        			me,
        			['Changed']
        	);
    	}
    },
    
    /**
     * Validates value of the field using #validator.
     * If Validator is not set, then throws an error.
     * @returns {Boolean}
     */
    validate: function(){
    	var me = this;
    	me._checkDisposed();
    	if(!me.validator){
    		util.throwError('Validator is required to validate value',me);
    	}
    	var valid = me.validator.call(me, me.getValue());
    	if(valid){
    		me.hideErrorMask();
    	}else{
    		me.showErrorMask();
    	}
    	return valid;
    },
    
    /**
     * Sets value to the field. Subclasses are overriding the method.
     * @param value - value to set
     */
    setValue: function(value){
        util.throwError('the method should be overriden');
    },
    
    /**
     * Gets value from the field. Subclasses are overriding the method.
     * @returns value of the field
     */
    getValue: function(){
        util.throwError('the method should be overriden');
    },

    /**
     * @see #enabled
     * Subclasses are overriding the method.
     * 
     * @param enabled
     */
    setEnabled: function(enabled){
        util.throwError('the method should be overriden');
    },
    
    /**
     * @see #enabled
     * Subclasses are overriding the method.
     * 
     */
    isEnabled: function(){
        util.throwError('the method should be overriden');
    },
    
    /**
     * @see readOnly
     * Subclasses are overriding the method.
     * 
     * @param readOnly
     */
    setReadOnly: function(readOnly){
        util.throwError('the method should be overriden');
    },
    
    /**
     * @see readOnly
     * Subclasses are overriding the method.
     * 
     */
    isReadOnly: function(){
        util.throwError('the method should be overriden');
    },
    
    /**
     * Shows error mask.
     * Subclasses are overriding the method.
     * 
     */
    showErrorMask:function(){
        util.throwError('the method should be overriden');
    },
    
    /**
     * Hides error mask.
     * Subclasses are overriding the method.
     * 
     */
    hideErrorMask:function(){
        util.throwError('the method should be overriden');
    }
    
});