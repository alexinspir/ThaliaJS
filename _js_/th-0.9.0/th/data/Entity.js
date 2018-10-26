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

th.define("th.data.Entity",{
    
    extend: 'th.lang.Class',
    
    __uid__: null,
    
    /**
     * Properties definition.
     */
    properties:null,/*{
        "id":{type: 'int',array:false},
        "anotherEntity":{type: 'a.b.c.AnotherEntity',array:false}
    }*/
    
    _propertiesNames:[],

    deserialized: false,
    destroyed: false,
    
    data:null,/*{
        "id":"9754",
        "anotherEntity":{}
    }*/
    
    /**
     * internal, do not use directly
     */
    _data:{},
    
    _init: function(theClass){
        var me = this;
        if(!theClass){
            theClass = me;
        }
        theClass.parent._init.call(this,theClass.parent);
        me.__uid__ = util.reflect.generateUniqueId();
        if(!me.properties){
            util.throwError('properties should be declared',me);
        }
        jQuery.each(me.properties,function(key,value){
            me._propertiesNames.push(key);
        });
        if(me.data){
            me.deserialize(me.data);
        }
    },
    
    getPropertiesNames: function(){
        var me = this;
        return me._propertiesNames.slice(0);
    },
    
    hasProperty:function(propertyName){
        var me = this;
        return jQuery.inArray(propertyName,me._propertiesNames);
    },
    
    get: function(propertyName){
        var me = this;
        if(!propertyName){
            util.throwError('property name must be provided');
        }
        me._checkDestroyed();
        if(!me.properties[propertyName]){
            util.throwError('Requested unknown property: '+propertyName+'; of entity: '+me.xclass+';');
        }
        var value = me._data[propertyName];
        if(value==null){
            return null;
        }else{
            return value;
        }
    },
    
    set: function(propertyName,newValue){
        var me = this;
        if(!propertyName){
            util.throwError('property name must be provided');
        }
        me._checkDestroyed();
        if(!me.properties[propertyName]){
            util.throwError('Attempt to set value of unknown property: '+propertyName+'; of entity: '+me.xclass+';');
        }
        var oldValue = me._data[propertyName];
        me._data[propertyName] = newValue;
        return oldValue;
    },
    
    destroy:function(){
        var me = this;
        me.data = null;
        me._data = null;
        me.properties = null;
        me.destroyed = true;
    },
    
    _checkDestroyed:function(){
        var me = this;
        if(me.destroyed){
            util.throwError('The entity is destroyed');
        }
    },
    
    deserialize: function(data){
        var me = this;
        me._checkDestroyed();
        jQuery.each(data,function(key,value){
            if(!key){
                util.throwError('empty property name detected (value: '+value+'); entity: '+me.xclass+';', me, data);
            }
            if(me._data[key]){
                util.throwError('duplicate property: '+key+'; of entity: '+me.xclass+';', me, data);
            }
            var definition = me.properties[key];
            if(!definition){
                util.throwError('unknown property: '+key+'; of entity: '+me.xclass+'; property does not match to definition', me, data);
            }
            var convertedValue = me._convertFieldFromRaw(definition, value);
            me._data[key]=convertedValue;
        });
        return me;
    },
    
    serialize: function(){
        var me = this;
        me._checkDestroyed();
        var result = {};
        jQuery.each(me.properties,function(propertyName,propertyDefinition){
            var value = me._data[propertyName];
            var convertedValue = me._convertFieldToRaw(propertyDefinition, value);
            result[propertyName] = convertedValue;
        });
        return result;
    },
    
    clone:function(){
        var me = this;
        me._checkDestroyed();
        var clone = th.create(me.xclass);
        clone.deserialize(me.serialize());
        return clone;
    },
    
    _convertFieldToRaw: function(definition,value){
        var me = this;
        if(!definition.type){
            util.throwError("property definition does not have type specified; entity: "+me.xclass);
        }
        if(me.converters[definition.type]){//simple
            return me.converters[definition.type].toJson(value);
        }else{
            var xclass = definition.type;
            if(!th.isKnownClass(xclass)){
                util.throwError('property definition has unkown type specified: '+xclass+'; entity: '+me.xclass);
            }
            if(definition.array){
                if(!value || !value.length){
                    return null;
                }else{
                    var resultArray = [];
                    jQuery.each(value,function(i,v){
                        resultArray.push(v.serialize());
                    });
                    return resultArray;
                }
            }else{
                value.serialize();
            }
        }
    },
    
    _convertFieldFromRaw: function(definition,value){
        var me = this;
        if(!definition.type){
            util.throwError("property definition does not have type specified; entity: "+me.xclass);
        }
        if(me.converters[definition.type]){//simple
            return me.converters[definition.type].fromJson(value);
        }else{//another entity
            var xclass = definition.type;
            if(!th.isKnownClass(xclass)){
                util.throwError('property definition has unkown type specified: '+xclass+'; entity: '+me.xclass);
            }
            if(definition.array){
                var resultArray = [];
                if(!value){
                    return resultArray;
                }
                jQuery.each(value,function(i,v){
                    var entity = th.create(xclass);
                    resultArray.push(entity.deserialize(v));
                });
                return resultArray;
            }else{
                if(!value){
                    return null;
                }
                var entity = th.create(xclass);
                return entity.initialize(value);
            }
        }
    },
    
    
    converters:{
        int:{
            fromJson: function(value){
                if(value==null){
                    return null;
                }else{
                    return parseInt(value);
                }
            },
            toJson: function(value){
                if(value==null){
                    return null;
                }else{
                    return parseInt(value);
                }
            }
        },
        float:{
            fromJson: function(value){
                if(value==null){
                    return null;
                }else{
                    return parseFloat(value);
                }
            },
            toJson: function(value){
                if(value==null){
                    return null;
                }else{
                    return parseFloat(value);
                }
            }
        },
        string:{
            fromJson: function(value){
                if(value){
                    return value;
                }else{
                    return null;
                }
            },
            toJson: function(value){
                if(value){
                    return value;
                }else{
                    return null;
                }
            }
        },
        boolean:{
            fromJson: function(value){
                if(value===true || value==="true"){
                    return true;
                }else{
                    return false;
                }
            },
            toJson: function(value){
                if(value===true || value==="true"){
                    return true;
                }else{
                    return false;
                }
            }
        },
        timestamp:{
            fromJson: function(value){
                if(value){
                    return new Date(value);
                }else{
                    return null;
                }
            },
            toJson: function(value){
                if(value){
                    return value.getTime();
                }else{
                    return null;
                }
            }
        }
    }
    
});