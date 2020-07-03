/*
 * 
 * @author Junaid Iqbal
 */
(function(factory){
    if(typeof define === 'function' && define.amd) {
	// AMD
	define(['jquery', 'datatables.net'], function($){
	    return factory($, window, document);
	});
    }
    else if(typeof exports === 'object') {
	// CommonJS
	module.exports = function(root, $) {
	    if(!root) {
		root = window;
	    }
	    
	    if(!$ || !$.fn.dataTable) {
		$ = require('datatables.net')(root, $).$;
	    }
	    
	    return factory($, root, root.document);
	};
    }
    else {
	// Browser
	factory( jQuery, window, document );
    }
}(function($, window, document) {
    'use strict'
    
    var DataTable = $.fn.dataTable;
    
    var ColumnSearch = function(settings){
	var dt = new DataTable.Api(settings);
	this.s = {
		dt: dt,
		ctx: dt.settings()[0]
	}
	
	if(this.s.ctx.columnSearch) {
	    return;
	}
	
	settings.columnSearch = this;
	
	this.init();
    }
    
    ColumnSearch.prototype = {
	    "init": function(){
		var that = this,
			dt = this.s.dt,
			ctx = this.s.ctx,
			$searchHeader = $('<tr class="dt-column-search"/>');
		
		var hasColumnSearch = false;
		
		dt.columns(":visible").every(function(column, row, index){
		    var $columnSearchHeader = $('<th class="border-left-0"/>');
		    $searchHeader.append($columnSearchHeader);
		   
		    if(ctx.aoColumns[column].columnSearch) {
			hasColumnSearch = true;
			
			var columnProps 	= {};
			
			if(typeof ctx.aoColumns[column].columnSearch !== "boolean") {
			    $.extend(columnProps, ctx.aoColumns[column].columnSearch);
			}
			
			columnProps.idx			= index;
			columnProps.dtColumnIndex	= column;
			columnProps.type 		= columnProps.type ? columnProps.type : "string";
			columnProps.nTh			= $columnSearchHeader;
			columnProps.mData		= ctx.aoColumns[column].mData;
			
			if(!that.data) {
			    that.data = [];
			    that.indexes = [];
			}
			
			that.indexes.push(column)
			that.data.push(columnProps);
			that.renderField(column);
		    }
		});
		
		if(hasColumnSearch) {
//		    $(ctx.nTHead).prepend($searchHeader);
		    $(ctx.nTHead.lastChild).before($searchHeader);
		    
		    //set indexes for references
		    that.iDisplayIndexes = that.pluck("idx");
		    that.iDTColumnIndexes = that.pluck("dtColumnIndex");
		    
		    $(ctx.nTableWrapper).on("change", 'thead tr.dt-column-search th input[type="text"], thead tr.dt-column-search th input[type="number"], thead tr.dt-column-search th select', function(e) {
			that.onInputChangeEvent(e);
		    })
		}
		
		if(hasColumnSearch && ctx.oInit.fixedColumns) {
		    dt.on("draw.dt.fixedColumns", function(){
			if(that.s.ctx._oFixedColumns) {
			    var fixedColumnDrawCallback = that.s.ctx._oFixedColumns.s.fnDrawCallback;
			    
			    var fixedColumnDrawCallbackForPlugin = function(left, right) {
				var sort = that.s.ctx.aaSorting,
				    previousFixedSumRow = $("thead tr.dt-column-search", left.header),
				    visibleColumnIndex = 0,
				    fixedSearchColumnsRow = $('<tr class="dt-column-search"/>');
				
				if(previousFixedSumRow.length) {
				    previousFixedSumRow.remove();
				    $("thead tr th.sorting", left.header).removeClass("sorting_asc sorting_desc");
				}
				
				for(var i = 0; i < this.s.iLeftColumns; i++) {
				    if(this.s.dt.aoColumns[i].bVisible) {
					if(sort.length && i == sort[0][0]) {
					    var fixedSortColumn = $('tr:last-child th', left.header).eq(visibleColumnIndex);
					    
					    if(fixedSortColumn.length) {
						fixedSortColumn.addClass("sorting_"+ sort[0][1]);
					    }
					}
					var fixedSearchColumn = $("th", $searchHeader).eq(visibleColumnIndex).clone(true, false);
					
					$('input', fixedSearchColumn).attr('data-old-value', this.s.dt.aoPreSearchCols[i]["sSearch"]);
					
					if(that.indexes.includes(i)) {
					    if(fixedSearchColumn.children().length) {
						fixedSearchColumn.children().val( that.s.dt.column(i).search() )
					    }
					    
					    that.data[that.indexes.indexOf(i)]["fixedNode"] = fixedSearchColumn.get(0);
					}
					
					fixedSearchColumnsRow.append( fixedSearchColumn.get(0) );
					visibleColumnIndex++;
				    }
				}
				
				$("thead tr:last-child", left.header).before(fixedSearchColumnsRow);
				
				$("tr", this.dom.header).each(function(index, row){
				    $("thead tr", left.header).eq(index).height($(row).height())
				})
				
				if(fixedColumnDrawCallback) {
				    fixedColumnDrawCallback.call( this, this.dom.clone.left, this.dom.clone.right )
				}
			    }
			    
			    that.s.ctx._oFixedColumns.s.fnDrawCallback = fixedColumnDrawCallbackForPlugin;
			}
		    })
		}
	    },
	    
	    "renderField": function(col, type){
		var that = this,
			dt		= this.s.dt,
			ctx		= this.s.ctx,
			index 		 = that.indexes.indexOf(col),
			columnSearchData = that.data[index],
			columnType 	 = type ? type : columnSearchData.type;
		
		var field;
		
		if(columnType === "string" || columnType === "number" || columnType === "dateTime") {
		    field = $('<input type="text"/>');
		    
		    if(columnType === "number") {
			field.attr("type", "number")
		    }
		}
		else if(columnType === "select") {
		    field = $('<select />');
		    
		    if(columnSearchData.options && columnSearchData.options.length) {
			var keys   = [],
			    values = [];
			
			if($.isArray(columnSearchData.options)) {
			    keys = columnSearchData.options[0];
			    
			    if(columnSearchData.options.length == 2 && $.isArray(columnSearchData.options[1])) {
				values = columnSearchData.options[1];
			    } else {
				keys = columnSearchData.options;
				values = $.clone(keys);
			    }
			}
			else {
			    keys = Object.keys(columnSearchData.options);
			    values = Object.values(columnSearchData.options);
			}
			
			field.append( $.map(keys, function(key, index){ return '<option value="'+ key +'">'+ values[index] + '</option>' }) )
		    }
		}
		
		if(field) {
//		    field.attr("style", "width: 100%");
		    var fieldValue = dt.column(columnSearchData.dtColumnIndex).search();
		    
		    field.addClass('form-control h-auto p-1');
		    field.attr('data-old-value', fieldValue);
		    field.val(fieldValue);

		    if(columnType !== "select") {
			field.addClass('form-control h-auto p-1 pl-2 pr-2');
			field.attr("placeholder", ctx.aoColumns[columnSearchData.dtColumnIndex]["sTitle"])
		    }
		}
		
		columnSearchData.nTh.html(field);
		that.data[index].type = columnType;
		
		if($.isFunction(columnSearchData.onFieldCreated)) {
		    columnSearchData.onFieldCreated(field, dt.column(columnSearchData.dtColumnIndex).search());
		}
	    },
	    
	    "onInputChangeEvent": function(e) {
		var that = this,
		    $el 	= $(e.target),
		    value 	= $el.val(),
		    index 	= $el.parents('th').index(),
		    dataIndex 	= that.iDisplayIndexes.indexOf(index),
		    searchColumnData = that.data[dataIndex],
		    oldValue 	= $el.data('oldValue'),
		    isValueChangesd = true;
		
		if($.isFunction(searchColumnData.valueOnChange)) {
		    value = searchColumnData.valueOnChange(value, e, searchColumnData);
		}
		
		if( $.isFunction(searchColumnData.onChange) ) {
		    isValueChangesd = searchColumnData.onChange(value, e, searchColumnData);
		} else {
		    isValueChangesd = (oldValue !== value);
		}
		
		if(isValueChangesd) {
		    $el.data('oldValue', value);
		    $('input', searchColumnData.nTh).val(value);
		    
		    if( $.isFunction(searchColumnData.searchHandler) ) {
			searchColumnData.searchHandler(value, oldValue, dataIndex, that.data, that.s.dt);
		    } else {
			that.s.dt.column( searchColumnData.dtColumnIndex ).search( value, (searchColumnData.type === "string") ).draw();
		    }
		}
	    },
	    
	    "pluck": function(key) {
		return $.map(this.data, function(d, index){ return d[key] })
	    }
    }
    
    DataTable.Api.register('columnSearch()', function(){
	return this;
    });
    
    DataTable.Api.register('columnSearch().column()', function(columnKey) {
	if(!columnKey || !columnKey.length) {
	    return this;
	}
	
	var ctx = this.settings()[0],
		searchColumns = ctx.columnSearch,
		searchColumnsDataKeys = $.map(searchColumns.data, function(d, index){ return d["mData"] });
	
	return searchColumnsDataKeys.indexOf(columnKey);
//	return searchColumns.data[requestColumnIndex];
    });
    
    DataTable.Api.register('columnSearch().updateSearchColumn()', function(columnKey, options) {
	if(!columnKey || !columnKey.length) {
	    return this;
	}
	
	var ctx = this.settings()[0],
		dt = $.fn.dataTable.Api(ctx),
		searchColumns = ctx.columnSearch,
		searchColumnsDataKeys = $.map(searchColumns.data, function(d, index){ return d["mData"] }),
		requestColumnIndex    = searchColumnsDataKeys.indexOf(columnKey),
		searchColumnData      = searchColumns.data[requestColumnIndex];
	
	if(options && options.length && searchColumnData.type === "select") {
	    var nTh = searchColumnData["nTh"],
	        keys   = [],
	    	values = [];
	
	    if($.isArray(options)) {
		keys = options[0];
    	    
		if(options.length == 2 && $.isArray(options[1])) {
		    values = options[1];
		} else {
		    keys = options;
		    values = $.clone(keys);
		}
	    }
	    else {
		keys = Object.keys(options);
		values = Object.values(options);
	    }
    	
	    if(nTh) {
	    	var field = $("select", nTh);
	    	if(field) {
                field.empty();
                field.append( $.map(keys, function(key, index){ return '<option value="'+ key +'">'+ values[index] + '</option>' }) )
                field.val(dt.column(searchColumnData.dtColumnIndex).search())
	    	}
	    }
	}
    });
    
    $(document).on("preInit.dt.columnSearch", function(e, settings, json){
	if(e.namespace !== 'dt') {
	    return;
	}
	
	new ColumnSearch( settings );
    });
    
    $.fn.dataTable.ColumnSearch = ColumnSearch;
    $.fn.DataTable.ColumnSearch = ColumnSearch;
}))