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

th.define("th.ui.container.Viewport", {

    extend : 'th.ui.container.Container',
    
    layout : 'th.ui.container.layout.VerticalLayout',

    padding_top : 0,
    padding_right : 0,
    padding_bottom : 0,
    padding_left : 0,
    
    _init : function(theClass) {
        var me = this;
        if (!theClass) {
            theClass = me;
        }
        theClass.parent._init.call(this, theClass.parent);
        
        me.renderTo(document.body);
    },
});