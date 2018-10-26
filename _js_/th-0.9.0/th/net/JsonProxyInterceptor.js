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
th.define("th.net.JsonProxyInterceptor",{
    
    extend: 'th.lang.Class',
    
    /**
     * Intercepts success response
     * @param response returned object
     * @param textStatus response status
     * @param jqXHR 
     * @returns {Object} modified reponse object or null.
     */
    interceptSuccess: function(response, textStatus, jqXHR){
        return response;
    },
    
    /**
     * Intercepts error response
     * @param jqXHR
     * @param textStatus {String}
     * @param errorThrown {String}
     * @returns {Boolean} true if error callback should be called. false - intercept callback.
     */
    interceptError: function(jqXHR, textStatus, errorThrown){
        return true;
    }
});