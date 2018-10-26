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

th.define("th.lang.NavigationLock",{
    
    extend: 'th.lang.Class',
    
    require:[
        'th.ui.container.window.WarningMessage'
    ],
    
    locked: false,
    message: null,
    scope: null,
    unlockCallback: null,
    
    lock:function(message,scope,forceUnlockCallback){
        if(!message){
            util.throwError('Lock message is null');
        }
        //TODO разобраться в чтом что это за хуиту я написал
        if(!((scope && forceUnlockCallback) || (!scope && !forceUnlockCallback))){
            util.throwError('Both unlock callback & scope should be specified together');
        }
        if(this.locked){
            util.throwError('Navigation is already locked');
        }
        this.locked = true;
        this.message = message;
        this.scope = scope;
        this.unlockCallback = forceUnlockCallback;
    },
    
    unlock:function(){
        this.locked = false;
        this.message = null;
        this.scope = null;
        this.unlockCallback = null;
    },
    
    /**
     * 
     * @param callbackObject {
     *      ok: function(callbackObject){},
     *      cancel: function(callbackObject){},
     *      scope: object
     * }
     */
    checkLock:function(callbackObject){
        var me = this;
        if(!callbackObject){
            util.throwError('callback object cannot be null');
        }
        if(!callbackObject.ok){
            util.throwError('ok callback function cannot be null');
        }
        if(!callbackObject.scope){
            util.throwError('callback scope cannot be null');
        }
        if(me.locked){
            th.create({
                xclass:'th.ui.container.window.WarningMessage',
                title: 'Warning',
                message: me.message,
                buttons:[{
                    text: 'Ok',
                    callback:function(){
                        if(me.unlockCallback){
                            me.unlockCallback.call(me.scope);
                        }
                        me.unlock();
                        callbackObject.ok.call(callbackObject.scope,callbackObject);
                    },
                    scope: me
                },{
                    text: 'Cancel',
                    callback:function(){
                        if(callbackObject.cancel){
                            callbackObject.cancel.call(callbackObject.scope,callbackObject);
                        }
                    },
                    scope: me
                }],
            });
        }else{
            callbackObject.ok.call(callbackObject.scope,callbackObject);
        }
    }
});