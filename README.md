# Datatables-Column-Search
Api to apply column search in header for datatables

### Usage
columns.columnSearch: <b>true</b> | {}

### Options
To just apply the column search on a specific column you can set it to boolean:true at column level. Initializing it as true the columnSearch type will be considered as string.

Other than boolean option
<table>
  <thead><tr><th>Option</th><th>Value</th><th>Description</th></tr></thead>
  <tbody>
     <tr>
       <th>type</th>
       <td>string | number | select | dateTime | button</td>
       <td>Type of the columnSearch to generate the input field based on that type.</br> For the button type the button will be rendered instead of a field.</td>
    </tr>
     <tr>
       <th>isSearchButton</th>
       <td>true | false</td>
       <td>For the button type, if it is true on clicking this button the search will be applied.</td>
    </tr>
     <tr>
       <th>html</th>
  <td><button>Search</button></td>
       <td>To define custom markup for the type.</td>
    </tr>
     <tr>
       <th>immediateSearch</th>
       <td>true | false</td>
       <td>To restrict immidiate colum search application on change or focus out.<br/>
        Usage: columnSearch.immediateSearch: true | false
       </td>
    </tr>
     <tr>
       <th>searchFieldValue</th>
       <td>fn(element, searchedValue) | string</td>
       <td>This value will be visible in search field.<br/>
        Usage: columnSearch.searchFieldValue: 'visible string';
       </td>
    </tr>
     <tr>
       <th>valueToSearch</th>
       <td>fn(columnSearchData) | string</td>
       <td>This value will be used in search on apply. The return value will also be shown in search field after search applied.<br/>
         The best use of this option is to use it with <b>searchFieldValue</b> because after applying the search you can update search field value which you want to see.<br/>
        Usage: columnSearch.valueToSearch: 'searchthis';
       </td>
    </tr>
     <tr>
       <th>className</th>
       <td></td>
       <td><b>string</b> Css class name which will be set on the search field;
       </td>
    </tr>
  </tbody>
</table>

### Methods
<table>
  <thead><tr><th>Method</th><th>Description</th></tr></thead>
  <tbody>
     <tr>
       <th>onFieldCreated</th>
       <td><b>params: (element, value)</b><br/>
         This function could be used to modify the search field or apply any plugin on it.
       </td>
    </tr>
     <tr>
       <th>valueOnChange</th>
       <td><b>params: (element, value)</b><br/>
         When the field is changed, you can modify the field value by this callback.
       </td>
    </tr>
     <tr>
       <th>onChange</th>
       <td><b>params: (element, value); return: boolean</b><br/>
         return true to trigger search and false if you do not want to trigger the search
       </td>
    </tr>
     <tr>
       <th>searchHandler</th>
       <td><b>params: (value, oldValue, dataIndex, columnSearchData, columnsSearchData, dt)</b></br>
         This callback can be used to handle search manually
       </td>
    </tr>
     <tr>
       <th>updateSearchColumn</th>
       <td><b>input params: (columnDataSrc, data)</b></br>
         This is an api level function. This function could be used to update a select box options.</br>
         <b>ex:</b> dataTable.columnSearch().updateSearchColumn(<columnDataSrc>, ["All", "Option1", "Option2", "Option3"])
       </td>
    </tr>
     <tr>
       <th>onApplyFilter</th>
       <td><b>input params: (event, columnSearchData)</b></br>
         This function can be used after applying the search for the button type search button.
       </td>
    </tr>
     <tr>
       <th>onChangeAnyField</th>
       <td><b>input params: (event, eventColumnProps, searchColumnProps, searchColumnsData)</b></br>
         This callback will be called on input change event.
       </td>
    </tr>
  </tbody>
</table>

## Options Usage

$('#example').DataTable({
  columns: [{
  data: 'ID', columnsSearch: 
}]
})
