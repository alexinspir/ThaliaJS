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


th.define("th.ui.form.Tablefield",{
    
    extend: 'th.ui.form.Field',
    
    
    require:{
        views:[
            'th.ui.form.Tablefield',
            'th.ui.form.TablefieldColumnHeader',
            'th.ui.form.TablefieldDataRow',
            'th.ui.form.TablefieldDataCell'
        ]
    },
    
    /**
     * Holds descendant components
     */
    descendants: [],
    
    /**
     * Config.
     * set to true if navigation lock should be checked
     */
    checkNavigationLock: false,
    
    __tablefield_rowContainer: null,
    
    //value to reset
    value:[],
    
    _value: [],
    
    __tablefield_entityId_to_entity:{},
    
    /**
     * Config.
     * Name of id field (string) or function that accepts entity and returns entity id (scope - this tree).
     * Required.
     */
    entityId: null,
    
    /**
     * Height of rows
     */
    rowHeight: 28,
    
    showColumnHeaders: true,
    
    columns:[/*{
        // Html text for the column to be set as a column title
        name: null,
        // property name of entity or function that accepts entity and returns value of property.
        // Required if "renderer" is not specified. Cannot be specified together with "renderer".
        property: null,
        // Function that accepts entity and document element and renders value into specified element 
        //or returns component config to be rendered
        renderer: function(entity,containerElement){},
        // width of the column in pixels, required if "stretch" is not specified. conflicts with "stretch" 
        width: 100,
        // width of the column in relative points 
        // (e.g. if there are 3 columns with stretchs: 
        // 1, 2 and 2 then first column will be stretched to get 20% of free space 
        // and other 40% and 40%). required if "width" is not specified. conflicts with "width"
        stretch: 1,
        // if true, then the column will be sortable
        sortable: false
    }*/],
    
    /**
     * holds currently selected entity
     */
    __tablefield_selectedEntity:null,
    
    __tablefield_entityIdToBeSelected:null,
    
    /**
     * map of entityId -> radio,
     * required to select entity
     */
    __tablefield_entityId_to_row: {},
    
    _init: function(theClass){
        var me = this;
        if(!theClass){
            theClass = this;
        }
        theClass.parent._init.call(this,theClass.parent);
        
        if(!me.entityId){
            util.throwError('entityId is not set',me);
        }
        if(!me.columns && !me.columns.length){
            util.throwError('No columns',me);
        }
        var totalStretch = 0;
        var stretchedCount = 0;
        //check config & calculate total stretch
        jQuery.each(me.columns,function(i,column){
            if(!column.property && !column.renderer){
                util.throwError('"property" or "renderer" must be set on the column',column,me);
            }
            if(column.property && column.renderer){
                util.throwError('Both "property" and "renderer" must not be set on the column',column,me);
            }
            if(!column.width && !column.stretch){
                util.throwError('"width" or "stretch" must be set on the column',column,me);
            }
            if(column.width && column.stretch){
                util.throwError('Both "width" or "stretch" must not be set on the column',column,me);
            }
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
                renderer: function(entity,containerElement){
                    th.create('th.ui.form.Label').renderTo(containerElement);
                },
                stretchPercent: 100,
                sortable: false
            })
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
                'SortAscending',
                'SortDescending',
        ];
        return util.mergeArrays(superEventTypes,eventTypes);
    },
    
    /**
     * Returns true if, and only if, the entity is row of the table
     */
    hasEntity:function(entity){
        var me = this;
        return me.hasEntityId(me._extractEntityId(entity));
    },
    
    /**
     * Returns true if, and only if, the entity with the id is row of the table
     */
    hasEntityId:function(entityId){
        var me = this;
        if(me.__tablefield_entityId_to_row && me.__tablefield_entityId_to_row[entityId]){
            return true;
        }
        return false;
    },
    
    /**
     * Returns row entity with specified id or null if no such entity. Does nothing more.
     */
    getEntityById:function(entityId){
        var me = this;
        if(me.__tablefield_entityId_to_row && me.__tablefield_entityId_to_row[entityId]){
            return me.__tablefield_entityId_to_entity[entityId];
        }
        return null;
    },
    
    getSelectedEntity: function(){
        var me = this;
        return me.__tablefield_selectedEntity;
    },
    
    getSelectedEntityId: function(){
        var me = this;
        if(me.__tablefield_selectedEntity){
            var entityId = me._extractEntityId(me.__tablefield_selectedEntity);
            return entityId;
        }else{
            return null;
        }
    },
    
    getSelectedEntityIdToBeSelected: function(){
        var me = this;
        return me.__tablefield_entityIdToBeSelected;
    },
    
    setSelectedEntity: function(entity){
        var me = this;
        if(!entity){
            me.setSelectedEntityId(null);
        }else{
            var newEntityId = me._extractEntityId(entity);
            me.setSelectedEntityId(newEntityId);
        }
    },
    
    setSelectedEntityId: function(newEntityId){
        var me = this;
        var oldEntityId = null;
        if(me.__tablefield_selectedEntity){
            var oldEntityId = me._extractEntityId(me.__tablefield_selectedEntity);
        }
        if(newEntityId==oldEntityId){
            return;
        }
        if(!me.__tablefield_selectedEntity && newEntityId && !me.__tablefield_entityId_to_entity[newEntityId]){
            me.__tablefield_entityIdToBeSelected = newEntityId;
            return;
        }
        me._checkNavigationLock(function(){
            if(newEntityId && !me.__tablefield_entityId_to_entity[newEntityId]){
                me.__tablefield_entityIdToBeSelected = newEntityId;
                me.__tablefield_fireRowSelected0(null,false);
            }else{
                me.__tablefield_entityIdToBeSelected = null;
                me.__tablefield_fireRowSelected0(newEntityId,false);
            }
        }, null);
    },
    
    /**
     * Sets value to the field. Subclasses are overriding the method.
     * @param value - value to set
     */
    setValue: function(value){
        var me = this;
        if(!value){
            value = [];
        }
        if(!me.id){//if is not rendered yet
            me._value = value;
            return;
        }
        me._checkNavigationLock(function(){
            me._value = value;
            me._doRepaint(false);
        }, null);
    },
    
    /**
     * Gets value from the field. Subclasses are overriding the method.
     * @returns value of the field
     */
    getValue: function(){
        var me = this;
        return me._value;
    },
    
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
    
    _doRepaint0:function(){
        var me = this;
        if(!me._value){
            return;
        }
        var previouslySelectedId = null;
        if(me.__tablefield_selectedEntity){
            previouslySelectedId = me._extractEntityId(me.__tablefield_selectedEntity);
        }
        var selectedFound = false;
        me.__tablefield_rowContainer.empty();
        me.__tablefield_entityId_to_row = {};
        me.__tablefield_entityId_to_entity = {};
        jQuery.each(me.descendants,function(i,descendant){
            descendant.dispose();
        });
        me.descendants = [];
        jQuery.each(me._value,function(index,entity){
            var entityId = me._extractEntityId(entity);
            me.__tablefield_entityId_to_entity[entityId] = entity;
            var rowView = jQuery(th.ViewTemplateRegistry.getViewTemplate('th.ui.form.TablefieldDataRow'));
            rowView.css('height',me.rowHeight+'px');
            if(entityId==previouslySelectedId){
                selectedFound = true;
                me.__tablefield_selectedEntity = entity;
                rowView.addClass('selected');
            }
            
            me.__tablefield_entityId_to_row[entityId]=rowView;
            
            rowView.click(function(){
                me.__tablefield_fireRowSelected(entityId);
            });
            
            var cellContainer = rowView;
            jQuery.each(me.columns,function(i,columnConfig){
                var cellView = jQuery(th.ViewTemplateRegistry.getViewTemplate('th.ui.form.TablefieldDataCell'));
                if(columnConfig.stretch){
                    cellView.css('width', columnConfig.stretchPercent+'%');
                }else{
                    cellView.css('width', columnConfig.width+'px');
                }
                var renderer = null;
                if(columnConfig.property){
                    renderer = function(entity,containerElement){
                        th.create({
                            xclass: 'th.ui.form.Label',
                            textAlign: 'left',
                            text: me._extractCellValue(entity, columnConfig.property)
                        }).renderTo(containerElement);
                    };
                }else{
                    renderer = columnConfig.renderer;
                }
                var cmpCfg = renderer(entity,cellView);
                if(cmpCfg){
                    var cmp = th.UiRegistry.createAndRegister(cmpCfg);
                    cmp._setAncestor(me);
                    me.descendants.push(cmp);
                    cmp.renderTo(cellView);
                }
                cellContainer.append(cellView);
            });
            me.__tablefield_rowContainer.append(rowView);
        });
        if(!selectedFound){
            if(previouslySelectedId){
                me.__tablefield_fireRowSelected(null);
            }else{
                var entityIdToBeSelected = me.__tablefield_entityIdToBeSelected;
                if(entityIdToBeSelected && me.__tablefield_entityId_to_entity[entityIdToBeSelected]){
                    me.__tablefield_entityIdToBeSelected = null;
                    me.__tablefield_fireRowSelected(entityIdToBeSelected);
                }
            }
        }
    },
    
    __tablefield_fireRowSelected:function(entityId){
        var me = this;
        me.__tablefield_fireRowSelected0(entityId,true);
    },
    
    __tablefield_fireRowSelected0:function(entityId,checkLock){
        var me = this;
        if(checkLock){
            me._checkNavigationLock(function(){
                me.__tablefield_fireRowSelected00(entityId);
            }, null);
        }else{
            me.__tablefield_fireRowSelected00(entityId);
        }
    },
    
    __tablefield_fireRowSelected00:function(newEntityId){
        var me = this;
        var oldEntityId = null;
        var oldEntity = null;
        if(me.__tablefield_selectedEntity){
            var oldEntityId = me._extractEntityId(me.__tablefield_selectedEntity);
            oldEntity = me.__tablefield_selectedEntity;
        }
        if(newEntityId==oldEntityId){
            return;
        }
        var entity = null;
        if(newEntityId){
            if(!me.__tablefield_entityId_to_entity[newEntityId]){
                util.throwError('Attempt to fire event for unknown entityId');
            }
            entity = me.__tablefield_entityId_to_entity[newEntityId];
        }
        me.__tablefield_selectedEntity = entity;
        if(oldEntityId && me.__tablefield_entityId_to_row[oldEntityId]){
            me.__tablefield_entityId_to_row[oldEntityId].removeClass('selected');
        }
        if(newEntityId){
            me.__tablefield_entityId_to_row[newEntityId].addClass('selected');
        }
        me.getEventManager().fireEvent('SelectionChanged',{
            source      : me, 
            entity      : entity,
            newEntity   : entity,
            oldEntity   : oldEntity
        });
    },
    
    __tablefield_fireColumnAscSorting: function(index,columnConfig){
        var me = this;
        console.log('__tablefield_fireColumnAscSorting');
        me.getEventManager().fireEvent('SortAscending',{
            source    : me, 
            columnIndex : index,
            columnConfig : columnConfig
        });
    },
    
    __tablefield_fireColumnDescSorting: function(index,columnConfig){
        var me = this;
        console.log('__tablefield_fireColumnDescSorting');
        me.getEventManager().fireEvent('SortDescending',{
            source    : me, 
            columnIndex : index,
            columnConfig : columnConfig
        });
    },
    
    _doRender : function(){
        var me = this;
        var body = jQuery(th.ViewTemplateRegistry.getViewTemplate('th.ui.form.Tablefield'));
        me.__tablefield_rowContainer = body.find('[data-thid=rowContaner]');
        //column headers begin
        if(me.showColumnHeaders){
            var colgroup = body.find('[data-thid=colgroup]');
            var columnContainer = body.find('[data-thid=columnContainer]');
            var radioName = util.dom.generateId();
            jQuery.each(me.columns,function(i,columnConfig){
                var col = null;
                if(columnConfig.stretch){
                    col = jQuery('<col width="'+columnConfig.stretchPercent+'%" />');
                }else{
                    col = jQuery('<col width="'+columnConfig.width+'px" />');
                }
                colgroup.append(col);
                
                var columnHeader = jQuery(th.ViewTemplateRegistry.getViewTemplate('th.ui.form.TablefieldColumnHeader'));
                
                var ascRadio = columnHeader.find('[data-thid=ascRadio]');
                var ascRadioLabel = columnHeader.find('[data-thid=ascRadioLabel]');
                
                var descRadio = columnHeader.find('[data-thid=descRadio]');
                var descRadioLabel = columnHeader.find('[data-thid=descRadioLabel]');
                
                
                ascRadio.attr('name',radioName);
                descRadio.attr('name',radioName);
                
                var ascRadioId = util.dom.generateId();
                ascRadio.attr('id',ascRadioId);
                ascRadioLabel.attr('for',ascRadioId);
                
                var descRadioId = util.dom.generateId();
                descRadio.attr('id',descRadioId);
                descRadioLabel.attr('for',descRadioId);
                
                if(columnConfig.sortable){
                    ascRadio.change(function(){
                        me.__tablefield_fireColumnAscSorting(i,columnConfig);
                    });
                    descRadio.change(function(){
                        me.__tablefield_fireColumnDescSorting(i,columnConfig);
                    });
                }else{
                    ascRadio.prop('disabled', true);
                    descRadio.prop('disabled', true);
                }
                
                if(columnConfig.name){
                    var columnName = columnHeader.find('[data-thid=columnName]');
                    columnName.html(columnConfig.name);
                }
                
                columnContainer.append(columnHeader);
            });
        }else{
            var columnHeaderDiv = body.find('[data-thid=columnHeader]');
            columnHeaderDiv.hide();
            var rowDiv = body.find('[data-thid=rowDiv]');
            rowDiv.css("top","0px");
        }
        //column headers finish
        return body;
    },
    
    _extractCellValue:function(entity,property){
        var me = this;
        if(!entity){
            util.throwError('Entity is null',me);
        }
        if(util.type.isFunction(property)){
            return property(entity);
        }else{
            return entity.get(property);
        }
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