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
 * The class represents image link. If url is not set, then the link behaves itself as a image.
 * The class does not check NavigationLock.
 * @author Alexander Akhtyamov
 */
th.define("th.ui.control.menu.MenuLinkImage", {

    extend : 'th.ui.control.menu.MenuItem',
    
    require : {
        views : [ 'th.ui.control.menu.MenuLinkImage',
                  'th.ui.control.menu.MenuLinkImageNotLink']
    },
    
    /**
     * Url where the link image is pointed
     */
    url:null,
    
    /**
     * source url of the image
     */
    imageSource: null,
    
    /**
     * Alt text for the image
     */
    imageAlt: '',
    
    width: 30,

    /**
     * Set to true if you want to add radio behavior to the item
     */
    radio : false,
    
    /**
     * Adds Click event. The event is useless if the url is a hash and somewhere
     * exists onhashchange listener.
     */
    _getSupportedEventTypes : function(theClass) {
        var me = this;
        if (!theClass) {
            theClass = me;
        }
        var superEventTypes = theClass.parent._getSupportedEventTypes.call(this, theClass.parent);
        var eventTypes = [ 'Click' ];
        return util.mergeArrays(superEventTypes, eventTypes);
    },
    
    _doRender : function(){
        var me = this;
        if(!me.imageSource){
            util.throwError('The MenuLinkImage does not have image to be rendered',me);
        }
        
        var view = null;
        if(me.url){
            view = jQuery(th.ViewTemplateRegistry.getViewTemplate('th.ui.control.menu.MenuLinkImage'));
        }else{
            view = jQuery(th.ViewTemplateRegistry.getViewTemplate('th.ui.control.menu.MenuLinkImageNotLink'));
        }
        var widthDiv = view.find('[data-thid=width]');
        widthDiv.css('width',me.width+'px');
        var imageDiv = view.find('[data-thid=image]');
        imageDiv.attr('src',me.imageSource);
        imageDiv.attr('alt',me.imageAlt);
        var tagForClick = null;
        if(me.url){
            var link = view.find('[data-thid=link]');
            link.attr('href',me.url);
            tagForClick = link;
        }else{
            tagForClick = view;
        }
        tagForClick.click(function(){
            me.getEventManager().fireEvent('Click',{source:me});
        });
        return view;
    },

    /**
     * @overriden
     */
    _setActive : function(active) {
        // override me
    }
});