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
 * Represents breadcrumbs
 * @author Alexander Akhtyamov
 */
th.define("th.ui.control.menu.Breadcrumbs", {

    extend : 'th.ui.control.Control',

    require : {
        views : [ 
            'th.ui.control.menu.Breadcrumbs',
            'th.ui.control.menu.BreadcrumbsItem'
        ]
    },
    
    /**
     * Container where to add path entries
     */
    __breadcrumbs__entriesContainer: null,
    
    /**
     * Array of:
     * <pre>
     * {
     *  name : 'Name of pathEntry',
     *  callback: function(){},
     *  scope: aScope
     * }
     * </pre>
     */
    _path:[],
    
    /**
     * Sets breadcrumbs, removes old path and sets new one.
     * callback & scope of pathEntries are not required.
     */
    setPath:function(path){
    	var me = this;
    	me._checkNavigationLock(function() {
    		me._path = path?path:[];
    		me.__breadcrumbs__entriesContainer.empty();
        	jQuery.each(me._path,function(i,pathEntry){
        		if(!pathEntry.name){
        			util.throwError('path entry does not have a name',me,pathEntry.name);
        		}
        		var entryView = jQuery(th.ViewTemplateRegistry.getViewTemplate('th.ui.control.menu.BreadcrumbsItem'));
        		var link = entryView.find('[data-thid=link]');
        		link.html(pathEntry.name);
        		if(pathEntry.callback){
            		link.attr('href','#');
            		link.click(function(evt){
            			pathEntry.callback.call(pathEntry.scope);
            			return false;
            		});
        		}else{
        			link.click(function(evt){
            			return false;
            		});
        		}
        		
        		me.__breadcrumbs__entriesContainer.append(entryView);
        	});
        }, null);
    },
    
    _doRender : function() {
        var me = this;
        var view = jQuery(th.ViewTemplateRegistry.getViewTemplate('th.ui.control.menu.Breadcrumbs'));
        me.__breadcrumbs__entriesContainer = view.find('[data-thid=entriesContainer]');
        return view;
    },
});