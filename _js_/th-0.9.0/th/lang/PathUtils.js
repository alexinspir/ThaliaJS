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
 * Has a methods to parse string path of format:
 * #!/pathAlias1{attr1=value1&attr2=value2}/pathAlias2{attr3=value3}
 */
th.define("th.lang.PathUtils", {

    extend : 'th.lang.Class',
    
    /**
     * If true, global navigation lock will be checked on each click on back and forward buttons
     */
    checkNavigationLock: true,

    /**
     * Event manager
     */
    eventManager : null,
    
    __lastPath: null,
    
    __ignoreHashChange: false,
    
    _getSupportedEventTypes : function(theClass) {
        var eventTypes = [ 'PathChanged' ];
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
        me.eventManager = eventManager;
        window.addEventListener("hashchange", function(){
            if(me.__ignoreHashChange){
                me.__ignoreHashChange = false;
                return;
            }
            me._checkNavigationLock(function(){
                me.__lastPath = me.parseCurrentHash();
                me._fireChanged(me.__lastPath);
            },function(){
                me._setNewPath0(me.__lastPath,false);
            });
        }, false);
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
        me.getEventManager().fireEvent('PathChanged',{source:me,path:newPath});
    },
    
    setNewPath : function(path){
        var me = this;
        me._setNewPath0(path, true);
    },
    
    _setNewPath0:function(path,setIgnoreMark){
        var me = this;
        if(me.isEqualPath(path, me.__lastPath)){
            console.log('equal path ignored');
            return;
        }
        var hash = me.pathToHash(path);
        me.__lastPath = path;
        if(setIgnoreMark){
            me.__ignoreHashChange = true;
        }
        window.location.hash=hash;
    },
    
    pathToHash: function(path){
        var me = this;
        var hash = '#!';
        for(var i = 0; i<path.length;i++){
            var pathEntry = path[i];
            hash+='/'+pathEntry.alias;
            if(pathEntry.params){
                hash+='{';
                var first = true;
                jQuery.each(pathEntry.params,function(key,value){
                    if(key.length){
                        if(!first){
                            hash+='&';
                        }else{
                            first = false;
                        }
                        hash+=key+'='
                        if(value!==null){
                            hash+=value;
                        }
                    }
                });
                hash+='}';
            }
        }
        return hash;
    },
    
    parseCurrentHash : function() {
        var me = this;
        var hash = window.location.hash;
        if (hash && (hash.length > 2)) {
            var path = me.parseStringPath(hash.substring(2),[]);
            return path;
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
    },
    
    
    isEqualPath:function(path1,path2){
        var me = this;
        if(path1==path2){
            return true;
        }else if(path1==null && path2!=null){
            return false;
        }else if(path2==null && path1!=null){
            return false;
        }
        var hash1 = me.pathToHash(path1);
        var hash2 = me.pathToHash(path2);
        if(hash1===hash2){
            return true;
        }
        return false;
    }

});