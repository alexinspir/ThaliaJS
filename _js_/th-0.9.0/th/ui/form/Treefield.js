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
 * Represents tree. All leafs are value of the tree.
 */
th.define("th.ui.form.Treefield",{
    
    extend: 'th.ui.form.Field',
    
    require:{
        views:[
            'th.ui.form.Treefield',
            'th.ui.form.TreefieldColumnCell',
            'th.ui.form.TreefieldColumnContainer',
            'th.ui.form.TreefieldLeaf',
            'th.ui.form.TreefieldLeafContainer'
        ]
    },
    
    descendants: [],
    
    
    columns:[/*{
        //name of the column
        name: 'a name',
        // width of the column, incompatible with "stretch"
        width: 0,
        //stretch of the column, incompatible with "width"
        stretch: 0
    }*/],
    
    /**
     * Config.
     * If true, then the tree will be expanded by default.
     */
    expanded: false,
    
    /**
     * Config.
     * set to true if navigation lock should be checked
     */
    checkNavigationLock: false,
    
    /**
     * Config.
     * Height of each leaf.
     */
    leafHeight: 28,
    
    /**
     * Config.
     * Name of id field (string) or function that accepts entity and returns entity id (scope - this tree).
     * Required.
     */
    entityId : null/*function(entity){
        return entity.get('...');
    }*/,
    
    /**
     * Config.
     * Name of field that contains name/description of the entity or function that accepts entity
     * and return name/description (scope - this tree).
     */
    entityName : null/*function(entity){
        return entity.get('...');
    }*/,
    
    /**
     * Config.
     * Name of children field (string) or function that accepts entity 
     * and returns array of children entities (scope - this tree).
     * Null value will be interpreted as empty array.
     */
    entityChildren : null/*function(entity){
        return entity.get('...');
    }*/,
    
    /**
     * Config.
     * Returns <b>config</b> for right container of the leaf. Container height should be equals to #leafHeight.
     * After container is set, the container <b>will not</b> have parent.
     */
    rightContainerCreator:null/*function(entity){
        return {...}
    }*/,
    
    /**
     * Config.
     * Returns <b>config</b> for left container of the leaf. Container height should be equals to #leafHeight.
     * After container is set, the container <b>will not</b> have parent.
     */
    leftContainerCreator:null/*function(entity){
        return {...}
    }*/,
    
    _rootLeafsContainer:null,
    __treefield_treeContainer:null,
    
    _value:[],
    
    _selectedEntity: null,
    
    __treefield_entityIdToBeSelected: null,
    
    _leafs:null,
    
    _init: function(theClass){
        var me = this;
        if(!theClass){
            theClass = this;
        }
        theClass.parent._init.call(this,theClass.parent);
        
        if(!me.entityId){
            util.throwError('entityId field should be set',me);
        }
        if(!me.entityName){
            util.throwError('entityName field should be set',me);
        }
        if(!me.entityChildren){
            util.throwError('entityChildren field should be set',me);
        }
        if(me.columns && me.columns.length){
            jQuery.each(me.columns,function(i,columnCfg){
                if(!columnCfg.name){
                    util.throwError('Column config does not have name',me);
                }
                if(!columnCfg.width && !columnCfg.stretch){
                    util.throwError('Column config must have "width" OR "stretch" property',me);
                }
                if(columnCfg.width && columnCfg.stretch){
                    util.throwError('Column config must have "width" OR "stretch" property',me);
                }
            });
        }
    },
    
    /**
     * @see th.ui.Component#_getSupportedEventTypes(theClass);
     * 
     * @param theClass
     * @returns
     */
    _getSupportedEventTypes: function(theClass){
        var me = this;
        if(!theClass){
            theClass = me;
        }
        
        var superEventTypes = theClass.parent._getSupportedEventTypes.call(this,theClass.parent);
        var eventTypes = [
                'SelectionChanged',
                'LeafClick'
        ];
        return util.mergeArrays(superEventTypes,eventTypes);
    },
    
    /**
     * Returns true if, and only if, the entity is leaf of the tree
     */
    hasEntity:function(entity){
        var me = this;
        return me.hasEntityId(me._extractEntityId(entity));
    },
    
    /**
     * Returns true if, and only if, the entity with the id is leaf of the tree
     */
    hasEntityId:function(entityId){
        var me = this;
        if(me._leafs && me._leafs[entityId]){
            return true;
        }
        return false;
    },
    
    /**
     * Returns leaf option with specified id or null if no such entity. Does nothing more.
     */
    getEntityById:function(entityId){
        var me = this;
        if(me._leafs && me._leafs[entityId]){
            return me._leafs[entityId].entity;
        }
        return null;
    },
    
    /**
     * Selects specified entity.
     * @param entity entity to be selected
     * @param throwEvent if false, then SelectionChanged event will not be thrown
     */
    setSelectedEntity: function(entity){
        var me = this;
        if(!entity){
            me.removeSelection();
            return;
        }
        me.setSelectedEntityId(me._extractEntityId(entity));
    },
    
    /**
     * Selects specified entity.
     * @param entityId id of entity to be selected
     * @param throwEvent if false, then SelectionChanged event will not be thrown
     */
    setSelectedEntityId: function(entityId){
        var me = this;
        if(!entityId){
            me.removeSelection();
            return;
        }
        if(!me._leafs[entityId]){
            me.__treefield_entityIdToBeSelected = entityId;
            me.removeSelection();
            return;
        }
        me.scrollTo(entityId);
        if(me._selectedEntity){
            var currentlySelectedId = me._extractEntityId(me._selectedEntity);
            if(entityId==currentlySelectedId){
                return;
            }
        }
        
        me._handleSelection(entityId, true);
    },
    
    /**
     * Selects specified entity.
     * @param entity entity to be selected
     * @param throwEvent if false, then SelectionChanged event will not be thrown
     */
    setSelectedEntitySilently: function(entity){
        var me = this;
        return me.setSelectedEntityIdSilently(me._extractEntityId(entity));
    },
    
    /**
     * Selects specified entity silently (events will not be throws, lock manager will not be checked).
     * @param entityId id of entity to be selected
     * @param throwEvent if false, then SelectionChanged event will not be thrown
     */
    setSelectedEntityIdSilently: function(entityId){
        var me = this;
        if(!me._leafs[entityId]){
            util.throwError('Unknwon entity id: '+entityId);
        }
        me._handleSelection0(entityId, false);
    },
    
    /**
     * Returns selected entity or null if no selected entity
     */
    getSelectedEntity:function(){
        var me = this;
        return me._selectedEntity;
    },
    
    /**
     * Returns selected entity id or null if no selected entity
     */
    getSelectedEntityId:function(){
        var me = this;
        var entity = me.getSelectedEntity();
        if(entity){
            return me._extractEntityId(entity);
        }else{
            return null;
        }
    },
    
    removeSelection:function(){
        var me = this;
        var selectedEntity = me._selectedEntity;
        if(!selectedEntity){
            return;
        }
        me._handleSelection(null,true);
    },
    
    expandAll:function(){
        var me = this;
        jQuery.each(me._leafs,function(id,conf){
            me.expandById(id);
        });
    },
    
    expand:function(entity){
        var me = this;
        if(!entity){
            util.throwError('entity is null',me);
        }
        me.expandById(me._extractEntityId(entity));
    },
    
    expandById:function(entityId){
        var me = this;
        if(!entityId){
            util.throwError('entityid is null',me);
        }
        if(!me._leafs[entityId]){
            util.throwError('No such entity (id: '+entityId+')', me);
        }
        me._leafs[entityId].expandCheckbox.prop('checked', true);
    },
    
    collapseAll:function(){
        var me = this;
        jQuery.each(me._leafs,function(id,conf){
            me.collapseById(id);
        });
    },
    
    collapse:function(entity){
        var me = this;
        if(!entity){
            util.throwError('entity is null', me);
        }
        me.collapseById(me._extractEntityId(entity));
    },
    
    collapseById:function(entityId){
        var me = this;
        if(!entityId){
            util.throwError('entityid is null', me);
        }
        if(!me._leafs[entityId]){
            util.throwError('No such entity (id: '+entityId+')', me);
        }
        me._leafs[entityId].expandCheckbox.prop('checked', false);
    },

    setValue: function(value){
        var me = this;
        if(!me.id){//if is not rendered yet
            me._value = value;
            return;
        }
        me._checkNavigationLock(function(){
            me._value = value;
            me._doRepaint(false);
        }, null);
    },

    getValue: function(){
        var me = this;
        return me._value;
    },
    
    /**
     * Repaints the tree
     */
    repaint:function(){
        var me = this;
        me._doRepaint(true);
    },
    
    _doRepaint:function(checkLock){
        var me = this;
        if(!me.id){
            util.throwError('Tree is not rendered yet',me);
        }
        if(checkLock){
            me._checkNavigationLock(function(){
                me._doRepaint0();
            },null);
        }else{
            me._doRepaint0();
        }
    },
    
    scrollTo:function(entityId){
        var me = this;
        if(entityId){
            var scrollTopContainer = me.__treefield_treeContainer.scrollTop();
            var offsetTopButton = me._leafs[entityId].button.offset().top;
            var offsetTopContainer = me.__treefield_treeContainer.offset().top;
            var resultOffset = offsetTopButton-offsetTopContainer+scrollTopContainer;

            me.__treefield_treeContainer.animate({scrollTop: resultOffset}, 390);
        }
    },
    
    _doRepaint0:function(){
        var me = this;
        me._leafs = {};
        var selectedEntity = me._selectedEntity;
        me._selectedEntity = null;
        if(selectedEntity){
            me._handleSelection0(null,true);
        }
        me._rootLeafsContainer.empty();
        jQuery.each(me.descendants,function(i,descendant){
            descendant.dispose();
        });
        me.descendants = [];
        me._renderLeafs(me._value, me._rootLeafsContainer);
        if(selectedEntity){
            var selectedId = me._extractEntityId(selectedEntity);
            if(me._leafs[selectedId]){
                me._handleSelection0(null,true);
            }
        }
        var entityIdToBeSelected = me.__treefield_entityIdToBeSelected;
        
        if(entityIdToBeSelected && me.hasEntityId(entityIdToBeSelected)){
            me.__treefield_entityIdToBeSelected = null;
            me._handleSelection0(entityIdToBeSelected,true);
            me.scrollTo(entityIdToBeSelected);
        }
    },
    
    _renderLeafs:function(entities,parentDiv){
        var me = this;
        if(entities==null || !entities.length){
            return;
        }
        jQuery.each(entities,function(i,entity){
            var id = me._extractEntityId(entity);
            if(me._leafs[id]){
                util.throwError('Entity duplicate found',me);
            }
            me._leafs[id]={};
            
            var leafBody = jQuery(th.ViewTemplateRegistry.getViewTemplate('th.ui.form.TreefieldLeaf'));
            var expandCheckbox = leafBody.find('[data-thid=expandCheckbox]');
            var expandCheckboxLabel = leafBody.find('[data-thid=expandCheckboxLabel]');
            
            var checkboxId = util.dom.generateId();
            expandCheckbox.attr('id',checkboxId);
            expandCheckboxLabel.attr('for',checkboxId);
            
            var button = leafBody.find('[data-thid=button]');
            var callback = function(evt){
                me._handleSelection(id, true);
            };
            button.click(callback);
            
            var leafName = leafBody.find('[data-thid=name]');
            var name = me._extractEntityName(entity);
            leafName.html(name);
            
            
            var betweenContainerDiv = leafBody.find('[data-thid=betweenContainer]');
            
            if(me.leftContainerCreator){
                var leftConfig = me.leftContainerCreator(entity);
                if(leftConfig){
                    var container = me._createContainer(leftConfig);
                    betweenContainerDiv.before(container);
                }
            }
            
            if(me.rightContainerCreator){
                var rightConfig = me.rightContainerCreator(entity);
                if(rightConfig){
                    var container = me._createContainer(rightConfig);
                    betweenContainerDiv.after(container);
                }
            }
            
            var leafsContainer = leafBody.find('[data-thid=leafsContainer]');
            parentDiv.append(leafBody);
            
            var children = me._extractEntityChildren(entity);
            if(children && children.length){
                me._renderLeafs(children, leafsContainer);
                leafBody.attr('data-aggregative','true');
            }else{
                expandCheckbox.remove();
                leafBody.attr('data-aggregative','false');
            }
            
            me._leafs[id].entity = entity;
            me._leafs[id].id = id;
            me._leafs[id].expandCheckbox = expandCheckbox;
            me._leafs[id].button = button;
        });
    },
    
    _createContainer:function(leafContainerConfig){
        var me = this;
        var leafBody = jQuery(th.ViewTemplateRegistry.getViewTemplate('th.ui.form.TreefieldLeafContainer'));
        var widthDiv = leafBody.find('[data-thid=width]');
        widthDiv.css('width',leafContainerConfig.width+'px');
        var containerDiv = leafBody.find('[data-thid=container]');
        
        var cmp = th.UiRegistry.createAndRegister(leafContainerConfig);
        cmp._setAncestor(me);
        me.descendants.push(cmp);
        cmp.renderTo(containerDiv);

        return leafBody;
    },
    
    _handleSelection:function(newSelectedId,checkLock){
        var me = this;
        
        if(checkLock){
            me._checkNavigationLock(function(){
                me.getEventManager().fireEvent('LeafClick',{
                    source    : me, 
                    entity    : newSelectedId?me._leafs[newSelectedId].entity:null,
                });
            },null);
        }else{
            me.getEventManager().fireEvent('LeafClick',{
                source    : me, 
                entity    : newSelectedId?me._leafs[newSelectedId].entity:null,
            });
        }
        checkLock = false;
        
        if(me._selectedEntity){
            var oldSelectedId = me._extractEntityId(me._selectedEntity);
            if(newSelectedId==oldSelectedId){
                return;//nothing to do;
            }
        }
        if(checkLock){
            me._checkNavigationLock(function(){
                me._handleSelection0(newSelectedId, true);
            },null);
        }else{
            me._handleSelection0(newSelectedId, true);
        }
    },
    
    _handleSelection0:function(newSelectedId,throwEvent){
        var me = this;
        var oldEntity = null;
        if(me._selectedEntity){//deselect previous
            var oldSelectedId = me._extractEntityId(me._selectedEntity);
            me._markLeafAsNonSelected(oldSelectedId);
            oldEntity = me._leafs[oldSelectedId];
        }
        if(newSelectedId){
            me._selectedEntity = me._leafs[newSelectedId].entity;
            me._markLeafAsSelected(newSelectedId);
        }else{
            me._selectedEntity = null;
        }
        if(throwEvent){
            me.getEventManager().fireEvent('SelectionChanged',{
                source    : me, 
                newEntity : me._selectedEntity,
                oldEntity : oldEntity
            });
        }
    },
    
    _markLeafAsSelected:function(entityId){
        var me = this;
        var leafCfg = me._leafs[entityId];
        if(!leafCfg){
            util.throwError('Unknown entity id: '+entityId,me);
        }
        leafCfg.button.addClass('selected');
    },
    
    _markLeafAsNonSelected:function(entityId){
        var me = this;
        var leafCfg = me._leafs[entityId];
        if(!leafCfg){
            util.throwError('Unknown entity id: '+entityId,me);
        }
        leafCfg.button.removeClass('selected');
    },
    
    _doRender : function(){
        var me = this;
        var body = jQuery(th.ViewTemplateRegistry.getViewTemplate('th.ui.form.Treefield'));
        me._rootLeafsContainer = body.find('[data-thid=rootLeafsContainer]');
        me.__treefield_treeContainer = body.find('[data-thid=treeContainer]');
        if(me.columns && me.columns.length){
            var columnHeader = jQuery(th.ViewTemplateRegistry.getViewTemplate('th.ui.form.TreefieldColumnContainer'));
            columnHeader.css('height','20px');
            var colgroup = columnHeader.find('[data-thid=headerColgroup]');
            
            var totalStretch = 0;
            var stretchedCount = 0;
            
            jQuery.each(me.columns,function(i,column){
                if(column.stretch){
                    totalStretch+=column.stretch;
                    stretchedCount++;
                }
            });
            if(totalStretch){
                //calculate percentage
                var totalPercent = 0;
                for(var i=0;i<me.columns.length;i++){
                    var column = me.columns[i];
                    if(column.stretch){
                        var column = me.columns[i];
                        var stretch = column.stretch;
                        var stretchPercent = 0;
                        if((i+1)==stretchedCount){
                            stretchPercent = 100-totalPercent;
                        }else{
                            stretchPercent = Math.floor(stretch/totalStretch*100);
                        }
                        totalPercent+=stretchPercent;
                        column.stretchPercent = stretchPercent;
                    }
                }
            }else{
                me.columns.push({
                    stretchPercent: 100
                })
            }
            
            jQuery.each(me.columns,function(i,column){
                if(column.stretchPercent){
                    colgroup.append(jQuery('<col width="'+column.stretchPercent+'%" />'));
                }else{
                    colgroup.append(jQuery('<col width="'+column.width+'px" />'));
                }
            });
            
            var columnCellContainer = columnHeader.find('[data-thid=headerColumnContainer]');
            jQuery.each(me.columns,function(i,columnCfg){
                var columnCell = jQuery(th.ViewTemplateRegistry.getViewTemplate('th.ui.form.TreefieldColumnCell'));
                var textTag = columnCell.find('[data-thid=text]');
                textTag.html(columnCfg.name);
                columnCellContainer.append(columnCell);
            });
            me.__treefield_treeContainer.css('top','20px');
            me.__treefield_treeContainer.before(columnHeader);
        }
        
        return body;
    },
    
    
    _extractEntityId:function(entity){
        var me = this;
        if(!entity){
            util.throwError('Entity is null',me);
        }
        var id = null;
        if(util.type.isFunction(me.entityId)){
            id = me.entityId(entity);
        }else{
            id = entity.get(me.entityId);
        }
        if(id){
            return id;
        }else{
            util.throwError('Entity id is null',entity,me);
        }
    },
    
    _extractEntityName:function(entity){
        var me = this;
        if(!entity){
            util.throwError('Entity is null',me);
        }
        if(util.type.isFunction(me.entityName)){
            return me.entityName(entity);
        }else{
            return entity.get(me.entityName);
        }
    },
    
    _extractEntityChildren:function(entity){
        var me = this;
        if(!entity){
            util.throwError('Entity is null',me);
        }
        if(util.type.isFunction(me.entityChildren)){
            return me.entityChildren(entity);
        }else{
            return entity.get(me.entityChildren);
        }
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

    setEnabled: function(enabled){
        util.throwError('The method is unsupported');
    },
    
    isEnabled: function(){
        util.throwError('The method is unsupported');
    },
    
    setReadOnly: function(readOnly){
        util.throwError('The method is unsupported');
    },
    
    isReadOnly: function(){
        util.throwError('The method is unsupported');
    },

    showErrorMask:function(){
        util.throwError('The method is unsupported');
    },

    hideErrorMask:function(){
        util.throwError('The method is unsupported');
    },
    
    
    dispose: function(theClass){
        var me = this;
        if (!theClass) {
            theClass = me;
        }
        if(!me.disposed){
            jQuery.each(me.descendants,function(i,descendant){
                descendant.dispose();
            });
            me.descendants = [];
        }
        theClass.parent.dispose.call(this, theClass.parent);
    }
    
});