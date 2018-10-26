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

th.define("th.ui.form.Label",{
    
    extend: 'th.ui.Component',
    
    require:{
        views:['th.ui.form.Label']
    },
    
    text: null,
    
    _text_div: null,
    
    textAlign: 'right',
    
    setText: function(text){
        var me = this;
        me.text = text;
        if(me._text_div){
            me._text_div.html(text);
        }
    },
    
    getText: function(){
        var me = this;
        return me.text;
    },
    
    _doRender : function(){
        var me = this;
        var body = jQuery(th.ViewTemplateRegistry.getViewTemplate('th.ui.form.Label'));
        me._text_div = body.find('[data-thid=text]');
        me._text_div.html(me.text);
        var alignDiv = body.find('[data-thid=align]');
        alignDiv.css('text-align',me.textAlign);
        return body;
    }
});