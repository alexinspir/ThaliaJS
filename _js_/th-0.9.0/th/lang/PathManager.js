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
 * Manages pathes history. Has a method to parse string path of format:
 * #!/pathAlias1{attr1=value1&attr2=value2}/pathAlias2{attr3=value3}
 * The managers is designed to work with a controller that subcribes for events 
 * and invokes controller on any external change or sets new path if it should be changed.
 * @Deprecated
 */
th.define("th.lang.PathManager", {

    extend : 'th.lang.Class',

    //array of pathes
    _pathes : [],
    _currentPathIndex: -1,
    
    /**
     * If true, global navigation lock will checked 
     * for lock on any attempts to set new path or refreshing.
     */
    checkNavigationLock: false,

    /**
     * Event manager
     */
    eventManager : null,

    /**
     * Returns supported event types
     */
    _getSupportedEventTypes : function(theClass) {
        var eventTypes = [ 'Changed' ];
        return eventTypes;
    },

    _init : function(theClass) {
        var me = this;
        if (!theClass) {
            theClass = me;
        }
        theClass.parent._init.call(this, theClass.parent);
        var supportedEventTypes = me._getSupportedEventTypes();
        var eventManager = th.create("th.lang.EventManager", {
            eventTypes : supportedEventTypes,
            owner : me
        });
        me.navigationLock = th.create('th.lang.NavigationLock');
        me.eventManager = eventManager;
        //TODO handle me.interceptBrowserNavigation
    },

    getEventManager : function() {
        var me = this;
        return me.eventManager;
    },
    
    /**
     * Checks global navigation lock. scope is always this object.
     * @param ok okay callback
     * @param cancel cancel callback
     */
    _checkNavigationLock: function(ok,cancel){
        var me = this;
        if(me.checkNavigationLock){
        	th.application.getNavigationLock().checkLock({
                ok: ok,
                cancel:cancel,
                scope:me
            });
        }else{
        	ok.call(me);
        }
    },
    
    _fireChanged:function(newPath){
    	var me = this;
    	me.getEventManager().fireEvent('Changed',{source:me,path:newPath});
    },

    /**
     * Grubs hash from URI and parses it to path object. 
     * After that applies the path and notifies all listeners.
     */
    refresh : function() {
        var me = this;
        var hash = window.location.hash;
        if (hash && (hash.length > 2)) {
        	var path = me.parseStringPath(hash.substring(2),[]);
        	if(path.length){
        		me._checkNavigationLock(function(){
        			me.__setPathQuietly(path);
                    me._fireChanged(path);
            	}, null);
        	}
        }
    },
    
    /**
     * <b>Never invoke the method directory.</b> 
     * Sets path quietly, without notification of listeners.
     * Does not have additional checkings.
     */
    __setPathQuietly:function(path){
    	var me = this;
    	var pathes = me._pathes;
		if((me._pathes.length-1)!=me._currentPathIndex){
			pathes = me._pathes.slice(0,me._currentPathIndex+1);
		}
		pathes.push(path);
		me._pathes = pathes;
        me._currentPathIndex = me._pathes.length-1;
        me._fireChanged(path);
    },
    
    /**
     * Sets path (object) as current one. If there was done history back,
     * and then the method invoked, then remaining part 
     * (that should be shown on forward) will be removed from histroy at all.
     * Notifies all listeners.
     */
    setPath : function(path) {
    	var me = this;
    	if(path && path.length){
    		me._checkNavigationLock(function(){
    			me.__setPathQuietly(path);
                me._fireChanged(path);
        	}, null);
    	}else{
    		util.throwError('The path is empty!',me,path);
    	}
    },

    /**
     * Returns current path (object) or null if there is no pathes in history.
     */
    getPath : function() {
    	var me = this;
    	if(me._currentPathIndex>=0){
    		return me._pathes[me._currentPathIndex];
    	}else{
    		return null;
    	}
    },

    /**
     * Changes hash in the URI to previous value (if any).
     * Notifies all listeners.
     */
    back : function() {
        var me = this;
        if(me._currentPathIndex>0){
        	me._checkNavigationLock(function(){
    			var path = me._pathes[me._currentPathIndex-1];
    			me._currentPathIndex--;
                me._fireChanged(path);
        	}, null);
        }
    },
    
    /**
     * Changes hash in the URI to next value (if any).
     */
    forward : function() {
    	var me = this;
        if(me._currentPathIndex+1<me._pathes.length){
        	me._checkNavigationLock(function(){
    			var path = me._pathes[me._currentPathIndex+1];
    			me._currentPathIndex++;
                me._fireChanged(path);
        	}, null);
        }
    },

    
    parseStringPath : function(stringPath, path) {
        var me = this;
        if (stringPath.indexOf('/') != 0) {
            log.info('path does not start with /: '+stringPath);
            return path;
        }
        var currentIndex = 1;
        var alias = '';
        var attrsReached = false;
        // extract alias
        for (; currentIndex < stringPath.length; currentIndex++) {
            var currentChar = stringPath.charAt(currentIndex);
            if (currentChar == '/') {
                break;
            }
            if (currentChar == '{') {
                attrsReached = true;
                break;
            }
            alias += currentChar;
        }
        // extract attributes
        var attrs = {};
        if (attrsReached) {
            var attrEndIndex = stringPath.indexOf('}', currentIndex);
            if (attrEndIndex == -1) {// wrong alias
                log.info('Parameters are not finish with {: '+stringPath);
                return path;
            }
            var attrsString = stringPath.substring(currentIndex+1, attrEndIndex);
            console.log(attrsString);
            var attrStrings = attrsString.split('&');
            for ( var i = 0; i < attrStrings.length; i++) {
                var attrString = attrStrings[i];
                var key = null;
                var value = null;
                var assignIndex = attrString.indexOf('=');
                if (assignIndex == -1) {
                    key = attrString;
                } else {
                    key = attrString.substring(0, assignIndex);
                    var valueIndex = assignIndex + 1;
                    if (valueIndex < attrString.length) {
                        value = attrString.substring(valueIndex);
                    }
                }
                if(key.length==0){
                    log.info('param key is empty: '+stringPath);
                    return path;
                }
                if(!attrs[key]){
                    attrs[key] = [];
                }
                attrs[key].push(value);
            }
            currentIndex=attrEndIndex+1;
        }
        path.push({
            alias : alias,
            params : attrs
        });
        if(currentIndex>=stringPath.length){
            return path;
        }else{
            return me.parseStringPath(stringPath.substring(currentIndex), path);
        }
    }

});