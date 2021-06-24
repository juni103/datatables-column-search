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
    
    var ColumnSearch = function(settings, options){
	var dt = new DataTable.Api(settings);
	this.s = {
		dt: dt,
		ctx: dt.settings()[0]
	}
	
	if(this.s.ctx.columnSearch) {
	    return;
	}
	
	this.s.immediateSearch = true;
	
	$.extend(this.s, options);
	
	settings.columnSearch = this;
	
	this.init();
    }
    
    function getColumnSearchValue(columnSearchData, dt) {
	var searchedValue = dt.column(columnSearchData.dtColumnIndex).search();
	
	if(columnSearchData.searchValue) {
	    if($.isFunction(columnSearchData.searchValue)) {
		return columnSearchData.searchValue(searchedValue);
	    } else {
		return columnSearchData.searchValue;
	    }
	}
	
	return searchedValue;
    }
    
    function calculateColumnSearchProps(instance, $searchHeader) {
	var instanceS = instance.s,
		ctx = instanceS.ctx,
		hasColumnSearch = false;
	
	if(!$searchHeader) {
	    $searchHeader = $('.dt-column-search', publishTable.context[0].nTHead);
	    $searchHeader.empty();
	}
	
	instanceS.dt.columns(":visible").every(function(column, row, index) {
	    var $columnSearchHeader = $('<th class="border-left-0"/>');
	    $searchHeader.append($columnSearchHeader);
	   
	    if(ctx.aoColumns[column].columnSearch) {
		hasColumnSearch = true;
		
		var columnProps = {};
		
		if(typeof ctx.aoColumns[column].columnSearch !== "boolean") {
		    $.extend(columnProps, ctx.aoColumns[column].columnSearch);
		}
		
		columnProps.idx			= index;
		columnProps.dtColumnIndex	= column;
		columnProps.type 		= columnProps.type ? columnProps.type : "string";
		columnProps.nTh			= $columnSearchHeader;
		columnProps.mData		= ctx.aoColumns[column].mData;
		
		if(!instance.data) {
		    instance.data = [];
		    instance.indexes = [];
		}
		
		instance.indexes.push(column)
		instance.data.push(columnProps);
		instance.renderField(column);
	    }
	});
	
	return hasColumnSearch;
    }
    
    ColumnSearch.prototype = {
	    "init": function(){
		var that = this,
			dt = this.s.dt,
			ctx = this.s.ctx,
			$searchHeader = $('<tr class="dt-column-search"/>');
		
		var renderedColumnSearchRow = $('thead tr.dt-column-search', ctx.nTableWrapper);
		
		if(renderedColumnSearchRow.length) {
		    $searchHeader = renderedColumnSearchRow;
		    $searchHeader.empty();
		}
		
		var hasColumnSearch = calculateColumnSearchProps(that, $searchHeader);
		
		if(hasColumnSearch) {
//		    $(ctx.nTHead).prepend($searchHeader);
		    $(ctx.nTHead.lastElementChild).before($searchHeader);
		    
		    //set indexes for references
		    that.iDisplayIndexes = that.pluck("idx");
		    that.iDTColumnIndexes = that.pluck("dtColumnIndex");
		    that.chachedSearchableColumns = [];
		    that.chachedSearchableValues = {};
		    
		    $(ctx.nTableWrapper).on("change", 'thead tr.dt-column-search th input[type="text"], thead tr.dt-column-search th input[type="number"], thead tr.dt-column-search th select', function(e) {
			that.onInputChangeEvent(e);
		    })
		    
		    $(ctx.nTableWrapper).on("click", 'thead tr.dt-column-search th button', function(e) {
			if(that.s.filterButton && that.s.filterButton.index === $(this).index()) {
			    if(that.s.filterButton.action) {
				that.s.filterButton.action( e, that.chachedSearchableValues, dt, that.data );
			    } else {
				if(that.chachedSearchableValues) {
				    $.each(that.chachedSearchableValues, function(key, value) {
					key = parseInt(key);

					var columnData = that.data[that.indexes.indexOf(key)];
					
					value = columnData.valueToSearch ? ($.isFunction(columnData.valueToSearch) ? columnData.valueToSearch(columnData) : columnData.valueToSearch) : value;
					
//					dt.column(key).search(value, (columnData["type"] === "string"));
					dt.column(key).search(value, (columnData.regex ? columnData.regex : false));
				    });
				    
				    dt.columns().draw();
				}
			    }
			    
			    if($.isFunction(that.data[that.s.filterButton.index].onApplyFilter)) {
				that.data[that.s.filterButton.index].onApplyFilter(e, that.data[that.s.filterButton.index]);
			    }
			}
//			console.log("Apply Search...");
		    })
		}
		
		dt.on("draw.dt", function(){
		    if(that.s.ctx.bInitialised) {
			that.setSearchFieldsValue();
		    }
		})
		
		dt.on("column-visibility.dt", function(e, settings, colIdx, state){
//		    var currentColProps = settings.aoColumns[column];
		    
		    calculateColumnSearchProps(that);
		})
		
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
				    $("thead tr th", left.header).removeClass("sorting_asc sorting_desc");
				}
				
				for(var i = 0; i < this.s.iLeftColumns; i++) {
				    if(this.s.dt.aoColumns[i].bVisible) {
					var columnClasses = this.s.dt.aoColumns[i].nTh.classList;
					
					if(columnClasses.contains('sorting_asc') || columnClasses.contains('sorting_desc')) {
					    var fixedSortColumn = $('tr:last-child th', left.header).eq(visibleColumnIndex);
					    
					    if(fixedSortColumn.length) {
						if(columnClasses.contains('sorting_asc')) {
						    fixedSortColumn.addClass("sorting_asc");
						} else if(columnClasses.contains('sorting_desc')) {
						    fixedSortColumn.addClass("sorting_desc");
						}
					    }
					}
					var fixedSearchColumn = $("th", $searchHeader).eq(visibleColumnIndex).clone(true, false);
					
					if(that.indexes.includes(i)) {
					    var searchColumnProps = that.data[that.indexes.indexOf(i)];
					    
					    if(searchColumnProps.type !== "button") {
						if(that.chachedSearchableValues && that.chachedSearchableValues[i]) {
						    $('input', fixedSearchColumn).attr('data-old-value', that.chachedSearchableValues[i]);
						}
						else {
						    $('input', fixedSearchColumn).attr('data-old-value', this.s.dt.aoPreSearchCols[i]["sSearch"]);
						}
						
						if(fixedSearchColumn.children().length) {
						    if(that.chachedSearchableValues && that.chachedSearchableValues[i]) {
							fixedSearchColumn.children().val( that.chachedSearchableValues[i] )
						    }
						    else {
							fixedSearchColumn.children().val( getColumnSearchValue(searchColumnProps, that.s.dt) )
						    }
						    
						}
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
		else if(columnType === "button") {
		    var buttonMarkup = '<button />';
		    
		    if(columnSearchData.html) {
			buttonMarkup = columnSearchData.html;
		    }
		    
		    field = $(buttonMarkup);
		    
		    if(columnSearchData.isSearchButton) {
			that.s.filterButton = {};

			that.s.filterButton.html    = buttonMarkup;
			that.s.filterButton.element = field;
			that.s.filterButton.index   = columnSearchData.idx;
			that.s.filterButton.dtIndex = columnSearchData.dtColumnIndex;
			
			if($.isFunction(columnSearchData.action)) {
			    that.s.filterButton.action = columnSearchData.action;
			}
		    }
		    
		    that.s.immediateSearch = false;
		}
		
		if(field && columnType !== "button") {
//		    field.attr("style", "width: 100%");
		    that.setSearchFieldValue(columnSearchData, field);

		    if(columnType !== "select") {
			field.attr("placeholder", ctx.aoColumns[columnSearchData.dtColumnIndex]["sTitle"])
		    }
		    
		    if(columnSearchData.className) {
			field.addClass(columnSearchData.className);
		    }
		}
		
		if(columnSearchData.attributes) {
		    $.each(columnSearchData.attributes, function(k,v){
			field.attr(k, v);
		    })
		}
		
		if($.isFunction(columnSearchData.onChangeAnyField)) {
		    if(!that.s.onChangeAnyFieldEvents) {
			that.s.onChangeAnyFieldEvents = [];
		    }
		    
		    that.s.onChangeAnyFieldEvents.push({"dtIndex": columnSearchData.dtColumnIndex, "event": columnSearchData.onChangeAnyField});
		}
		
		columnSearchData.nTh.html(field);
		columnSearchData.searchField = field;
		that.data[index].type = columnType;
		
		if($.isFunction(columnSearchData.onFieldCreated)) {
		    if(columnType !== "button") {
			columnSearchData.onFieldCreated(field, getColumnSearchValue(columnSearchData, dt));
		    }
		    else {
			columnSearchData.onFieldCreated(field);
		    }
		}
	    },
	    
	    "setSearchFieldsValue": function() {
		var that = this,
			dt = this.s.dt,
			ctx = this.s.ctx,
			data = this.data;
		
		if(data) {
		    for(var i = 0; i < data.length; i++) {
			if(data["type"] != "button") {
			    var columnSearchData = data[i];
			    
			    that.setSearchFieldValue(columnSearchData, columnSearchData.searchField);
			}
		    }
		}
	    },
	    
	    "setSearchFieldValue": function(columnSearchData, field) {
		var dt = this.s.dt,
			fieldValue = getColumnSearchValue(columnSearchData, dt);
		
		
		
		if(!field && columnSearchData.searchField) {
		    field = columnSearchData.searchField;
		}
		
		if(field && typeof field.data("oldValue") !== "undefined") {
		    field.data("oldValue", fieldValue);
		}
		
		if(columnSearchData.searchFieldValue) {
		    fieldValue = ($.isFunction(columnSearchData.searchFieldValue) ? columnSearchData.searchFieldValue(field, fieldValue) : columnSearchData.searchFieldValue);
		}
		
		field.attr('data-old-value', fieldValue);
		field.val(fieldValue);
	    },
	    
	    "onInputChangeEvent": function(e) {
		var that = this,
		    $el 	= $(e.target),
		    value 	= $el.val(),
		    index 	= $el.parents('th').index(),
		    dataIndex 	= that.iDisplayIndexes.indexOf(index),
		    searchColumnData = that.data[dataIndex],
		    oldValue 	= $el.data('oldValue'),
		    isValueChanged = true;
		
		if($.isFunction(searchColumnData.valueOnChange)) {
		    value = searchColumnData.valueOnChange(value, e, searchColumnData);
		}
		
		if( $.isFunction(searchColumnData.onChange) ) {
		    isValueChanged = searchColumnData.onChange(value, e, searchColumnData);
		} else {
		    isValueChanged = (oldValue !== value);
		}
		
		if(isValueChanged) {
		    $el.data('oldValue', value);
		    $('input', searchColumnData.nTh).val(value);
		    
		    if( $.isFunction(searchColumnData.searchHandler) ) {
			searchColumnData.searchHandler(value, oldValue, dataIndex, searchColumnData, that.data, that.s.dt);
		    }
		    else if(that.s.immediateSearch) {
//			that.s.dt.column( searchColumnData.dtColumnIndex ).search( value, (searchColumnData.type === "string") ).draw();
			that.s.dt.column( searchColumnData.dtColumnIndex ).search(value, (searchColumnData.regex ? searchColumnData.regex : false)).draw();
		    }
		    else {
			if(that.s.onChangeAnyFieldEvents) {
			    for(var i = 0; i < that.s.onChangeAnyFieldEvents.length; i++) {
				that.s.onChangeAnyFieldEvents[i].event(e, that.data[that.indexes.indexOf(that.s.onChangeAnyFieldEvents[i].dtIndex)], searchColumnData, that.data);
			    }
			}
			
			if(!this.chachedSearchableColumns.includes(searchColumnData.dtColumnIndex)) {
			    this.chachedSearchableColumns.push(searchColumnData.dtColumnIndex);
			}
			
			this.chachedSearchableValues[searchColumnData.dtColumnIndex] = value;
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
    
    DataTable.Api.register('columnSearch().isWholeSelected()', function() {
	var columnSearch = this.settings()[0].columnSearch;
	
	return columnSearch.s.ctx.oAjaxData.isWholeSelected;
    });
    
    DataTable.Api.register('columnSearch.resetCache()', function() {
	var columnSearch = this.settings()[0].columnSearch;
	
	columnSearch.chachedSearchableColumns = [];
	columnSearch.chachedSearchableValues = {};
    });
    
    DataTable.Api.register('columnSearch.columnSearchData()', function(key) {
	var columnSearch = this.settings()[0].columnSearch;
	
	if(typeof key === "number") {
	    return columnSearch.data[key];
	}
	else if(typeof key === "string") {
	    return columnSearch.data[ columnSearch.pluck("mData").indexOf(key) ];
	}
	
	return columnSearch.data;
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
	    	    field.val(getColumnSearchValue(searchColumnData, dt))
	    	}
	    }
	}
    });
    
    $(document).on("preInit.dt.columnSearch", function(e, settings, json){
	if(e.namespace !== 'dt') {
	    return;
	}
	
	var init = settings.oInit.columnSearch;
	
	new ColumnSearch( settings, init );
    });
    
    $.fn.dataTable.ColumnSearch = ColumnSearch;
    $.fn.DataTable.ColumnSearch = ColumnSearch;
}));