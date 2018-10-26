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
 * Base class for all other classes.
 * 
 * parent methods can be called in this way:
 * if parent method is:
 * <pre>
 * 	methodName: function(arg1,arg2){...}
 * </pre>
 * then it can be called in the form:
 * <pre>
 * methodName: function(arg1, arg2, arg3, theClass){
 * 	if(!theClass){
 *     theClass = this;
 * 	}
 * 	theClass.parent.methodName.call(this, arg1, arg2, theClass.parent);
 * }
 * </pre>
 * 
 * 
 * @author Alexander Akhtyamov
 */
th.define("th.lang.Class",{
    
    /**
     * Array of dependecies. e.g. 'name.of.some.Class'
     */
    require: [],
    /* or this way
    require: {
        classes:[],
        views:['th.ui.form.Textfield']// th/ui/form/Textfield.view.html
    },
    */
    
    /**
     * the method is invoked after class is bound 
     * (ex: parent is set, superclass methods are inherited and so on).
     * use theClass instead of "this".
     * 
     * NEVER INVOKE parent._afterBinding !!!
     * @param theClass link to the class, never null, ClassRegistry passes the parameter.
     */
    _afterBinding: function(theClass){
        
    },
    
    
    /**
     * The method is invoked immediatelly after instance is created.
     * sample of body that invokes parent method:
     * 
     * <pre>
     * 
     * if(!theClass){
     *     theClass = this;
     * }
     * theClass.parent._init.call(this,theClass.parent);
     * 
     * </pre>
     * 
     * @param theClass link to the class instance (in inheritance graph) or null. if null, "this" should be used instead.
     */
    _init: function(theClass){
        
    },
    
    /**
     * Destroyes the object and deletes all properties
     */
    destroy: function(){
        var me = this;
        var keys = [];
        jQuery.each(me,function(key,value){
            if(me.hasOwnProperty(key)){
                keys.push(key);
            }
        });
        jQuery.each(keys,function(i,key){
            delete me[key];
        });
        me.destroyed = true;
    }
});