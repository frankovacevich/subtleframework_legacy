Subtle.Table = class Table{

  constructor(object, parameters){

    // =========================================================================
		// PARAMETERES
		// =========================================================================
    this.params = {
      headers : ["A","B","C","D"],
      header_aliases : {},

      table_class : "subtletable",

      show_row_headers : true,
      row_header_width : 60,
      null_cell_text : '',
      nullable_columns : [],

      allow_sort : false,
      insert_on_top : false,
      content_editable : false,

      max_displayed_data : 100,
      remove_old_data : true,
    };

    for(const p in parameters){ this.params[p] = parameters[p]; };

    // =========================================================================
		// OTHER
		// =========================================================================
    this.object = (typeof object === "string" ? document.getElementById(object) : object);

    this.data = {};
    this.data_index = []; // store ids to help remove old data

    this.sort_by = "";
    this.sort_reverse = false;

    this.auto_id = 0;

		// ===============================================================================
		// DRAW CONTROL
		// ===============================================================================
    this.draw = function(){
      var parent = this;

      // create string to draw control
      var ctr_ = '';
      ctr_ += '<table class="' + this.params.table_class + '">';

      // headers
      ctr_ += '<tr>';
      if(this.params.show_row_headers) { ctr_ += '<td style="width:' + this.params.row_header_width + 'px"><b>#</b></td>'; }
      for(const h in this.params.headers){
        var header = this.params.headers[h];
        ctr_ += '<td>';

        // display sorting buttons if sorted
        if(this.params.allow_sort){
            ctr_ += '<span style="cursor:pointer" id="table_' + this.object.id + '_sort_by_column_' + header + '">';
            ctr_ += '<b>' + (header in this.params.header_aliases ? this.params.header_aliases[header] : header) + '</b> ';
            if(this.sort_by == header) ctr_ += '<span class="hide-on-print">' + Subtle.svg_sort_buttons(this.sort_reverse ? "down" : "up") + '</span>';
            ctr_ += '<span>';
        } else {
            ctr_ += '<b>' + (header in this.params.header_aliases ? this.params.header_aliases[header] : header) + '</b>';
        }
        ctr_ += '</td>';
      }
      ctr_ += '</tr>';

      // data
      let i = 1;
      for(const r in this.data_index){
        let row = this.data_index[r];
        let ctr_aux_ = '<tr>';

        // we had to add the skip row flag to avoid cases in which the data has empty rows, so that it doesn't get displayed
        // to be used only in special cases
        let skip_row = false;
        if(this.params.nullable_columns.length != 0){ skip_row = true; }

        if(this.params.show_row_headers) { ctr_aux_ += '<td style="width:' + this.params.row_header_width + 'px"><b>' + i + '</b></td>'; }

        for(const h in this.params.headers){

          let col = this.params.headers[h];
          ctr_aux_ += '<td ' + (this.params.content_editable ? 'contenteditable' : '') + ' id="table_' + this.object.id + '_row_' + row + "_column_" + col + '">';

          // add cell
          if(col in this.data[row]){
            let cell = this.data[row][col];

            // check if should skip
            if(this.params.nullable_columns.length != 0){
              if(!this.params.nullable_columns.includes(col) && cell != null) skip_row = false;
            }

            if(cell == null){ cell = this.params.null_cell_text }
            ctr_aux_ += cell;
          } else {
            ctr_aux_ += this.params.null_cell_text;
          }

          ctr_aux_ += '</td>';

        }
        ctr_aux_ += '</tr>';

        // break if too many rows have been printed
        if(i >= this.params.max_displayed_data) break;

        // if not skip row, add
        if(!skip_row){
          ctr_ += ctr_aux_;
          i += 1;
        }
      }

      // create control
      ctr_ += '</table>';
			this.object.innerHTML = ctr_;

      // add sorting click listener
      if(this.params.allow_sort){
        for(const h in this.params.headers){
          let header = this.params.headers[h];
          document.getElementById('table_' + this.object.id + '_sort_by_column_' + header).onclick = function(){
            parent.sort(header);
            parent.draw();
          }
        }
      }
		}

  // ===============================================================================
	// UPDATE
	// ===============================================================================
  this.update = function(id, fields){
      if(id == undefined && fields == undefined){
        this.auto_id = this.data.length + 1;
        this.data_index = [];
        for(const item in this.data){
          this.data_index.push(item);
        }
        return;
      }

      // auto id
      if(id == ""){
        id = this.auto_id.toString();
        this.auto_id += 1;
      }

      // create row if id is new
      if(!(id in this.data)){
        this.data[id] = {};
        if(this.params.insert_on_top){ this.data_index.splice(0, 0, id); }
        else{ this.data_index.push(id); }

        // check if too many ids
        if(this.params.remove_old_data){
          while(this.data_index.length > this.params.max_displayed_data){
            let idx = this.data_index.shift();
            delete this.data[idx];
          }
        }

        // sort
        if(this.sort_by != ""){ this.sort(this.sort_by, this.sort_reverse); }

        //draw
        this.draw();
      }

      // update data from table
      for(const field in fields){
        this.data[id][field] = fields[field];
        let cell = document.getElementById('table_' + this.object.id + '_row_' + id + "_column_" + field);
        if(cell) cell.innerHTML = fields[field];
      }

    }

    // ===============================================================================
  	// SORT
  	// ===============================================================================
    this.sort = function(column = "", reverse = null){
      if(column == "") column = this.sort_by;
      if(reverse == null){
        if(this.sort_by == column){ reverse = !this.sort_reverse }
        else { reverse = false }
      }

      var data = this.data;
      var f = function(a,b){};
      if(typeof data[this.data_index[0]][column] == "string"){
        if(reverse) {
          f = function(a,b){
            if(data[a][column] == undefined && data[b][column] == undefined) return 0
            if(data[a][column] == undefined) return 1
            if(data[b][column] == undefined) return -1
            return data[b][column].localeCompare(data[a][column])
          } }
        else {
          f = function(a,b){
            if(data[a][column] == undefined && data[b][column] == undefined) return 0
            if(data[a][column] == undefined) return 1
            if(data[b][column] == undefined) return -1
            return data[a][column].localeCompare(data[b][column])
          } }
      } else {
        if(reverse) {
          f = function(a,b){
            if(data[a][column] == undefined && data[b][column] == undefined) return 0
            if(data[a][column] == undefined) return 1
            if(data[b][column] == undefined) return -1
            return data[b][column] - data[a][column]
          } }
        else { f = function(a,b){
          if(data[a][column] == undefined && data[b][column] == undefined) return 0
          if(data[a][column] == undefined) return 1
          if(data[b][column] == undefined) return -1
          return data[a][column] - data[b][column]
        } }
      }
      this.data_index.sort(f)

      this.sort_by = column;
      this.sort_reverse =  reverse;

    }

    // ===============================================================================
  	// DOWNLOAD
  	// ===============================================================================
    this.download_csv = function(file_name){
      let csv = "";
      // get headers
      for(const h in this.params.headers){
        csv += (h == 0 ? "" : ",") + this.params.headers[h];
      }
      csv += "\n";

      // get data
      for(const r in this.data){
        row = this.data[r];

        for(const h in this.params.headers){
          col = this.params.headers[h];

          if(col in row){
            cell = row[col];
          }else{
            cell = this.params.null_cell_text;
          }
          if(cell == null){ cell = this.params.null_cell_text}

          if(typeof cell == "string") cell = '"' + cell + '"';

          csv += (h == 0 ? "" : ",") + cell;
        }
        csv += "\n";
      }

      var downloadLink = document.createElement("a");
      var blob = new Blob(["\ufeff", csv]);
      var url = URL.createObjectURL(blob);
      downloadLink.href = url;
      downloadLink.download = file_name + ".csv";

      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }

    // ===============================================================================
  	// GET CHANGES
  	// ===============================================================================
    this.get_changes = function(file_name){
      let changes = {};

      for(const r in this.data_index){
        let row = this.data_index[r];
        for(const h in this.params.headers){
          let col = this.params.headers[h];

          let cell_id = 'table_' + this.object.id + '_row_' + row + '_column_' + col;
          let id_ = row;
          let cell_content = document.getElementById(cell_id).innerHTML;
          if(cell_content != this.params.null_cell_text && cell_content != this.data[row][col]){

            // set datatype (default = string)
            if(typeof this.data[row][col] == "number"){
              if(Number.isInteger(this.data[row][col])){ cell_content = parseInt(cell_content); }
              else { cell_content = parseFloat(cell_content); }
            }
            else if(cell_content == "true") cell_content = true;
            else if(cell_content == "false") cell_content = false;

            if(!(id_ in changes)) changes[id_] = {};
            changes[id_][col] = cell_content;
          }

        }
      }

      return changes;
    }

    // Auto init
    this.draw();
	}
}
