# Datatables-Column-Search
Api to apply column search in header for datatables

### Usage
columns.columnSearch: <b>true</b> | {}

### Options
To just apply the column search on a specific column you can set it to boolean:true at column level. Initializing it as true the columnSearch type will be considered as string.

Other than boolean option
<table>
  <thead><tr><th>Option</th><th>Description</th></tr></thead>
  <tbody>
     <tr>
       <th>type</th>
       <td>Type of the columnSearch to generate the input field based on that type.<br/>
         types are <b>string | number | select | dateTime</b>
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
  </tbody>
</table>
