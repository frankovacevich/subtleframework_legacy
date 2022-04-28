class Subtle{}

//rounding.js
Subtle.ROUNDING = 2;

Subtle.ROUND = function(number, dec = -1){
  if(dec == -1) dec = Subtle.ROUNDING;
  if(typeof number != "number") return number;
  let d = {
    0: 1,
    1: 10,
    2: 100,
    3: 1000,
    4: 10000,
    5: 100000,
    6: 1000000,
  }
  return Math.round(number * d[dec]) / d[dec];
}


//plotly.js
Subtle.PlotlyObject = class PlotlyObject{

    constructor(object, parameters){

        this.obj = (typeof object === "string" ? document.getElementById(object) : object);

        this.traces = [];

        //this.annotations = [];

        this.layout = {
            margin: { l: 30, r: 20, b: 30, t: 30, pad: 5 },
            showlegend: false,
            legend: { orientation: "h", x:0, y:1.2 },
            xaxis: { title: "" },
            yaxis: { title: "" },
            dragmode: 'zoom',
            hovermode: 'closest',
        }

        for(const p in parameters){ this.layout[p] = parameters[p]; };

        this.options = {
            displaylogo: false,
            displayModeBar: false,
        }

        this.pie_chart_index = 0;

    }

    draw(){
        //this.layout.annotations = this.annotations;
        this.traces.sort(function(a, b){return a.zindex-b.zindex});
        Plotly.newPlot(this.obj, this.traces, this.layout, this.options);
    }

    /////////////////////////////////////////////////////////////////////

    add_text(x, y, text, parameters){

        if(!(x instanceof Array)){ x = [x] }
        if(!(y instanceof Array)){ y = [y] }
        if(!(text instanceof Array)){ text = [text] }

        let params_ = {
            x: x,
            y: y,
            mode: 'text',
            text: text,
            textposition: "middle center", //top,middle,bottom left,center,right
            showlegend: false,
            //textangle: 0,
            //showarrow: false,
            //align: "center", // left, center, right
            //valign: "middle", //top, middle, bottom
            zindex: 9999,
        }

        for(const p in parameters){ params_[p] = parameters[p]; };

        //this.annotations.push(params_);
        this.traces.push(params_);

        return;
    }

    add_scatter(data, parameters){
        /*
        data = [[x0, x1, x2, ... , xn], [y0, y1, y2, ... , yn]]
        */

        let params_ = {
            name: "",
            color: Subtle.COLORS["primary"][this.traces.length],
            show_markers: false,
            show_lines: true,
            plot_area: false, // fill area below the graph
            plot_manhattan: false, // make line manhattan
            plot_spline: false, // make line a spline
            line_stroke: 2,
            marker_symbol: "circle",
            marker_size: 6,
            zindex: 0,
        }

        for(const p in parameters){ params_[p] = parameters[p]; };

        let line_shape = "linear";
        if(params_.plot_manhattan) line_shape = "hv";
        if(params_.plot_spline) line_shape = "spline";

        let mode = "lines+markers";
        if(params_.show_lines && !params_.show_markers) mode = "lines";
        if(!params_.show_lines && params_.show_markers) mode = "markers";
        if(!params_.show_lines && !params_.show_markers) return;

        this.traces.push({
            type: 'scatter',
            x: data[0],
            y: data[1],
            mode: mode,
            fill: params_.plot_area ? "tozeroy" : "none",
            name: params_.name,

            marker: {
                color: params_.color,
                symbol: params_.marker_symbol,
                size: params_.marker_size,
            },
            line: {
                color: params_.color,
                shape: line_shape,
                width: params_.line_stroke,
            },
            zindex: params_.zindex,
        });

        return;
    }

    add_columnchart(data, parameters){
        /*
            data = [ [x0, x1, x2, x3, ... , xn], [y0, y1, y2, y3, ... , yn] ]
        */

        let params_ = {
            name: "",
            color: Subtle.COLOR_PALETTES["main"][this.traces.length],
            zindex: 0,
        }

        for(const p in parameters){ params_[p] = parameters[p]; };

        this.traces.push({
            type: 'bar',
            x: data[0],
            y: data[1],
            name: params_.name,
            marker: { color: params_.color },
            zindex: params_.zindex,
        });

        return;
    }

    add_piechart(data, parameters){
        /*
            data = [ [label0, label1, label2, label3, ... , labeln], [y0, y1, y2, y3, ... , yn] ]
        */

        let params_ = {
            name: "",
            colors: Subtle.COLOR_PALETTES["main"],
            donut: false,
            show_labels: true,
            zindex: 0,
        }

        for(const p in parameters){ params_[p] = parameters[p]; };

        this.traces.push({
            name: params_.name,
            type: 'pie',
            values: data[1],
            labels: data[0],
            hole: params_.donut ? 0.4 : 0,
            textinfo: params_.show_labels ? 'label+percent' : 'percent',

            marker: {
                colors: params_.colors,
            },
            domain: {
                row: 0,
                column: this.pie_chart_index,
            },

            zindex: params_.zindex,
        });

        this.pie_chart_index += 1;
        this.layout.grid = {rows: 1, columns: this.pie_chart_index}

        return;
    }

    /*add_gantt(data, parameters){

            //data = [ [t0, t1, y0], [t1, t2, y1], [t5, t6, y5], ... ]


        let params_ = {
            name: "",
            colors: Subtle.COLORS["primary"],
            color_by_values: false,
            show_value: true,
            width: 20,
            zindex: 0,
        }

        for(const p in parameters){ params_[p] = parameters[p]; };

        for(const s in data){

            let line_color = params_.colors;
            if(typeof params_.colors !== "string"){
                if(params.color_by_values){
                    let v = data[s][2]
                    line_color = params_.colors[v];
                } else {
                    line_color = params_.colors[s];
                }
            }

            this.traces.push({
                type: 'scatter',
                mode: 'lines',
                x: [ data[s][0] , data[s][1] ],
                y: [ params_.name , params_.name ],
                line: { color: line_color, width: params_.width },
                zindex: params_.zindex,
            });
        }

        return;
    }*/

    add_boxandwhiskers(data, parameters){
        /*
            data = [ y0, y1, y2, y3, y4, y5, y6, ... ]
        */

        let params_ = {
            name: "",
            color: Subtle.COLORS["primary"],
            show_outliers: true,
            show_mean: true,
            zindex: 0,
        }

        for(const p in parameters){ params_[p] = parameters[p]; };

        this.traces.push({
            type: 'box',
            y: data,
            x: params_.name,
            name: params_.name,
            boxpoints: params_.show_outliers ? 'Outliers' : false,
            boxmean: params_.show_mean,

            marker: {
                color: params_.color,
            },
            zindex: params_.zindex,
        });

        return;
    }

    add_heatmap(data, parameters){
        /*
            data = [
                [A1, B1, C1, D1, E1],
                [A2, B2, C2, D2, E2],
                [A3, B3, C3, D3, E3],
                [A4, B4, C4, D4, E4],
            ]
        */

        let params_ = {
            x: [],
            y: [],
            colors: Subtle.COLORS["primary"],
            show_scale : true,
            zindex: 0,
        }

        for(const p in parameters){ params_[p] = parameters[p]; };

        let colorscale = params_.colors;
        if(typeof params_.colors == "string"){
            colorscale = [[0, "#fff"], [1, params_.colors]];
        }

        this.traces.push({
            type: 'heatmap',
            z: data,
            x: params_.x,
            y: params_.y,

            colorscale: colorscale,
            showscale: params_.show_scale,
            zindex: params_.zindex,
        });

        return;
    }

    add_histogram(data, parameters){
        /*
            data = [ y0, y1, y2, y3, y4, y5, y6, ... ]
        */

        let params_ = {
            nbins : 0,
            zindex: 0,
            color: Subtle.COLORS["primary"],
        }

        for(const p in parameters){ params_[p] = parameters[p]; };

        this.traces.push({
            type: 'histogram',
            x: data,
            nbinsx: params_.nbins,
            marker: {
                color: params_.color
            },
            zindex: params_.zindex,
        });

        return;
    }
}


//soundalarm.js
Subtle.SoundAlarm = class SoundAlarm{
  constructor(file, parameters){
    this.params = {
      loop: true,
    }
    for(const p in parameters){ this.params[p] = parameters[p]; }

    this.file = file;
    this.audio = new Audio(file);

    this.is_playing = false;
  }

  play(){
    if(!this.is_playing){
      this.audio.play();
      this.is_playing = true;
    }
  }

  stop(){
    audio.stop();
    if(this.is_playing){
      this.audio.stop();
      this.is_playing = true;
    }
  }

}


//colors.js
// =============================================================================
// SET COLOR MODE
// =============================================================================
Subtle.COLOR_MODE = "light";

Subtle.SET_COLOR_MODE = function(mode = "dark"){
  Subtle.COLOR_MODE = mode;
  if(mode == "dark") Subtle.COLORS = Subtle.DARK_MODE;
  else if(mode == "light") Subtle.COLORS = Subtle.LIGHT_MODE;

  document.getElementsByTagName("body")[0].style.backgroundColor = Subtle.COLORS["background"];
  document.getElementsByTagName("body")[0].style.color = Subtle.COLORS["text"];
}

Subtle.SET_COLOR = function(color, key = "primary"){
  Subtle.LIGHT_MODE[key] = color;
  Subtle.DARK_MODE[key] = color;

  if(key == "primary"){
    for(const p in Subtle.COLOR_PALETTES){
      
    }
  }

  if(key=="primary") Subtle.INSERT_COLOR_IN_COLOR_PALETTES(color);
}

Subtle.INSERT_COLOR_IN_COLOR_PALETTES = function(color){
  for(const p in Subtle.COLOR_PALETTES){
    Subtle.COLOR_PALETTES[p].splice(0,0,color);
  }
}

Subtle.GET_COLOR = function(color){
  if(color in Subtle.COLORS) { return Subtle.COLORS[color] }
  return color;
}

// =============================================================================
// MAIN COLORS
// =============================================================================
Subtle.LIGHT_MODE = {};
Subtle.DARK_MODE = {};

Subtle.COLORS = Subtle.LIGHT_MODE;

// =============================================================================
// LIGHT MODE
// =============================================================================

Subtle.LIGHT_MODE["primary"] = "#5bbadc";
Subtle.LIGHT_MODE["background"] = "#FFFFFF";
Subtle.LIGHT_MODE["text"] = "#000000";
Subtle.LIGHT_MODE["contrast"] = "#FFFFFF";

Subtle.LIGHT_MODE["control"] = "#555555";
Subtle.LIGHT_MODE["inactive"] = "#808080";
Subtle.LIGHT_MODE["ok"] = "#73d216";
Subtle.LIGHT_MODE["error"] = "#dc0000";
Subtle.LIGHT_MODE["info"] = "#0088e8";
Subtle.LIGHT_MODE["warning"] = "#fbb901";
Subtle.LIGHT_MODE["inactive"] = "#aea79f";

// =============================================================================
// DARK MODE
// =============================================================================
Subtle.DARK_MODE["primary"] = "#0086b3";
Subtle.DARK_MODE["background"] = "#121212";
Subtle.DARK_MODE["text"] = "#FFFFFF";
Subtle.DARK_MODE["contrast"] = "#FFFFFF";

Subtle.DARK_MODE["control"] = "#A5A5A5";
Subtle.DARK_MODE["inactive"] = "#808080";
Subtle.DARK_MODE["ok"] = "#73d216";
Subtle.DARK_MODE["error"] = "#ff2424";
Subtle.DARK_MODE["info"] = "#0088e8";
Subtle.DARK_MODE["warning"] = "#fbb901";
Subtle.DARK_MODE["inactive"] = "#aea79f";

// =============================================================================
// COLOR PALETTES
// =============================================================================
Subtle.COLOR_PALETTES = {};

Subtle.COLOR_PALETTES["main"] = [
  "#5bbadc",
  "#3d5afe",
  "#00e676",
  "#76ff03",
  "#c6ff00",
  "#ffc400",
  "#ff3d00",
  "#f50057",
  "#d500f9",
  "#1de9b6",
];

Subtle.COLOR_PALETTES["alternative"] = [
  "#d90d39",
  "#f8432d",
  "#ff8e25",
  "#ef55f1",
  "#c543fa",
  "#6324f5",
  "#2e21ea",
  "#3d719a",
  "#31ac28",
  "#96d310",
];

Subtle.COLOR_PALETTES["creamy"] = [
  "#ea989d",
  "#b9d7f7",
  "#c6bcdd",
  "#9bfdce",
  "#bee8bb",
  "#f9f2c0",
  "#5f8c96",
  "#9b91ac",
  "#ae896f",
  "#cc6d55",
];

Subtle.COLOR_PALETTES["contrast"] = [
  "#8ae234",
  "#fcaf3e",
  "#729fcf",
  "#ad7fa8",
  "#ef2929",
  "#4e9a06",
  "#ce5c00",
  "#204a87",
  "#5c3566",
  "#a40000",
];

Subtle.COLOR_PALETTES["soft"] = [
  "#ef9a9a",
  "#ce93d8",
  "#b39ddb",
  "#90caf9",
  "#80cbc4",
  "#a5d6a7",
  "#ffe082",
  "#ffcc80",
  "#ffab91",
  "#b0bec5",
];

Subtle.COLOR_PALETTES["accent"] = [
  "#d50000",
  "#c51162",
  "#6200ea",
  "#2962ff",
  "#00bfa5",
  "#00c853",
  "#ffab00",
  "#ff6b00",
  "#dd2c00",
  "#263238",
];


//gantt.js
Subtle.GanttChart = class GanttChart{

  constructor(object, parameters = {}){
    // =========================================================================
		// PARAMETERES
		// =========================================================================

    this.params = {
      labels: ["serie1","serie2"], //names for each gantt series
      time_unit: "s", // units: s, m, or h (second, minute or hour)

      time_span: 100, // time span
      time_grid: 5, // time grid (x axis guide lines)

      show_labels: true, // show series labels on the left
      show_time_inside_bar: true, // show time inside
      left_margin: 100, // left margin to show the labels
      show_status_on_label: false, // show's the last value by coloring the label

      smooth: true, // smooth chart with auto update

      color: Subtle.COLORS["primary"], // color palette

      bar_size: 0.9, // bar size from 0 to 1, (1 = fill height, 0 = no height)
      bar_round: 0.25, // rounded corners (1 = totally round, 0 = square)

      t0: "",

    };
    for(const p in parameters){ this.params[p] = parameters[p]; };

    // =========================================================================
		// OTHER
		// =========================================================================
    this.object = (typeof object === "string" ? document.getElementById(object) : object);

    this.bar_size = 0;

    this.data = {};
    this.last_values = {};
    for(const l in this.params.labels){
      this.data[this.params.labels[l]] = [];
      this.last_values[this.params.labels[l]] = 0;
    }

    if(this.params.smooth){
      let parent = this;
      window.setInterval(function(){ parent.update(null) }, 50);
    }

    // =========================================================================
		// USEFUL FUNCTIONS
		// =========================================================================
    this.transform_y = function(n){ return (2*n-1)*(this.spacing + 0.5*this.bar_size) }
		this.transform_t = function(t){ return (this.object.offsetWidth - t * (this.object.offsetWidth - this.params.left_margin) / this.params.time_span) }

		// =========================================================================
		// DRAW CONTROL
		// =========================================================================
    this.draw = function(){
      let height = this.object.offsetHeight;
      let width = this.object.offsetWidth;

      let N = this.params.labels.length + (this.params.time_grid > 0 ? 1 : 0);
      this.bar_size = this.params.bar_size * height / N;
      this.spacing = (height - N * this.bar_size) / (2 * N);

      // start svg
      let svg_ = "";

      // Loop through each label (each series)
      // =====================================
      for(const l in this.params.labels){
        let label = this.params.labels[l];

        // create style for rectangle
        let style = { stroke_width: 0 };
        // get color from params, it can either be a single color (string)
        // or a color palette (list)
        if(typeof this.params.color == "string") { style.fill_color = this.params.color }
        else{ style.fill_color = this.params.color[l] }

        // draw labels
        if(this.params.show_labels){
          let text_color = Subtle.COLORS["text"];
          if(this.params.show_status_on_label && this.last_values[label]){ text_color = style.fill_color; }
          svg_ += Subtle.svg_text(this.params.left_margin-10,this.transform_y(Number(l)+1),label,{color:text_color ,anchor:"end", center_vertically:true, font_family:'sans-serif'});
        }

        // loop through each data point (each bar)
        var max_v = -1;
        for(const data_point in this.data[this.params.labels[l]]){

          // get times
          let t_begin = this.params.t0 == "" ?  new Date() :  new Date(this.params.t0);
          let t0 = (t_begin - this.data[label][data_point][0]) / 1000;
          let t1 = (t_begin - this.data[label][data_point][1]) / 1000;
          if(this.params.time_unit == "m"){
            t0 /= 60;
            t1 /= 60;
          }
          if(this.params.time_unit == "h"){
            t0 /= 3600;
            t1 /= 3600;
          }

          if(this.data[label][data_point][1] == -1) t1 = 0;
          let lapse = t0-t1;

          // if time is outside range, break
          if(t0 > this.params.time_span) { t0 = this.params.time_span; }
          if(t1 > this.params.time_span) { max_v = data_point; break; }

          // get rectangle coordinates
          let y = this.transform_y(Number(l)+1);
          let x0 = this.transform_t(t0);
          let x1 = this.transform_t(t1);

          // draw svg
          svg_ += Subtle.svg_rectangle(x0,y - 0.5 * this.bar_size,x1-x0,this.bar_size,style,this.params.bar_round * this.bar_size * 0.5);

          // draw text
          if(this.params.show_time_inside_bar && x1-x0 > 48){
            svg_ += Subtle.svg_text(0.5*(x1+x0),y,Subtle.ROUND(lapse,0) + this.params.time_unit,{ anchor: "middle", font_family:'sans-serif', center_vertically:true });
          }
        }

        // remove points that are outside the range to keep the data size small
        if(max_v > 0){ this.data[label].splice(max_v); }
      }

      // Draw guides
      // ===========
      for(var i = 0; i < this.params.time_grid; i++){
        let t = (i + 1) * this.params.time_span / this.params.time_grid;
        let x = this.transform_t(t);
        let y = this.transform_y(N)
        svg_ += Subtle.svg_text(x,y,t + this.params.time_unit,{ anchor: "middle", font_family:'sans-serif', center_vertically:true, opacity: 0.7 });
        svg_ += Subtle.svg_line(x,0,x,y- 0.5 * this.bar_size,{stroke_color: Subtle.COLORS["control"], opacity:0.5});
      }

      // Draw control
      // ============
      //let content = "<div style='overflow:hidden; height: 100%; width: 100%; box-sizing:content-box'>" + svg_markup(width, height, svg_) + "<div>";
      let content = Subtle.svg_markup(width, height, svg_);
      this.object.innerHTML = content;

    }

    // =========================================================================
		// UPDATE
		// =========================================================================
    this.update = function(values, time = ""){

      if(values === null){ values = this.last_values; }

      /*// update times
      // calculate elapsed time from the last time this function was called in seconds
      var current_time = new Date();
      if(time != ""){ current_time = new Date(time); }
      var time_diff = (current_time - this.last_time) / 1000;
      if(this.params.time_unit == "m") time_diff /= 60;
      this.last_time = current_time;
      */

      if(time == "") time = new Date();
      else time = new Date(time);

      // update times and values
      // values is a dict {label:value}
      for(const l in this.params.labels){
        let item = this.params.labels[l];

        // update times
        // ============
        for(const point in this.data[item]){
          //this.data[item][point][0] += time_diff;
          //if(this.data[item][point][1] == -1) continue;
          //this.data[item][point][1] += time_diff;
        }

        // update values
        // =============
        if(!(item in values)) {continue};

        let d = this.data[item];
        let last_value = this.last_values[item];
        let value = values[item];

        // case 1: 0 -> 0
        if(value == 0 && last_value == 0){ continue; }

        // case 2: 1 -> 1
        if(value == last_value){ continue; }

        // case 3: 1 -> 0
        if(value == 0 && value != last_value){
          d[0][1] = time;
        }

        // case 4: 0 -> 1
        if(last_value == 0 && value != last_value){
          d.splice(0,0,[time,-1,value]);
        }

        // case 5: 1 -> 2
        if(last_value != 0 && value != 0 && value != last_value){
          d[0][1] = 0;
          d.splice(0,0,[time,-1,value]);
        }

        this.last_values[item] = value;
      }

      // draw
      this.draw();
    }


  }


}


//gauge_advanced.js
Subtle.GaugeHistoric = class GaugeHistoric {

    constructor(object, parameters){

    // =========================================================================
    // PARAMETERES
    // =========================================================================
    this.params = {
        inner_padding : 3,
        history_length: 3600,
        t0: "",
    };

    for(const p in parameters){ this.params[p] = parameters[p]; };

    // =========================================================================
    // OTHER
    // =========================================================================
    this.object = (typeof object === "string" ? document.getElementById(object) : object);

    this.gauge = new Subtle.Gauge(this.object, this.params);

    this.current_value = (this.params.max_val + this.params.min_val) * 0.5;

    this.history = [];
    this.history_t = [];

    // ===============================================================================
    // DRAW CONTROL
    // ===============================================================================
    this.draw = function(){

        this.gauge.current_value = this.current_value;

        let forced_min = Math.min( ...this.history );
        let forced_max = Math.max( ...this.history );

        if(forced_min < this.params.min_val) forced_min = this.params.min_val;
        if(forced_max > this.params.max_val) forced_max = this.params.max_val;
        this.gauge.forced_min_value = forced_min;
        this.gauge.forced_max_value = forced_max;

        this.gauge.draw();

    }

    // ===============================================================================
    // UPDATE
    // ===============================================================================
    this.update = function(value, time = ""){

        this.current_value = value;

        // add time and value
        if(time == "") time = Math.floor(new Date() / 1000);
        else time = Math.floor(new Date(time) / 1000);

        this.history.push(value);
        this.history_t.push(time);

        // remove old times
        let t0 = this.params.t0 == "" ?  Math.floor(new Date() / 1000) :  Math.floor(new Date(this.params.t0 / 1000));
        for (var i = this.history_t.length -1; i > 0; i--) {
            if(t0 - this.history_t[i] > this.params.history_length) break;
        }

        this.history.splice(0, i);
        this.history_t.splice(0, i);

        //
        this.draw();
    }

    }
}


//tree_view.js
Subtle.TreeView = class TreeView {

    /*creates a tree view (like a folder explorer)

    A
    |-- A.B
        |-- A.B.X
        |-- A.B.Y
    |-- A.C
        |-- A.C.X
        |-- A.C.Z
    |-- A.W


    the nodes parameter is a list of objects with this structure:
    nodes = [
        {path:'item/full/path', prefix:'', tooltip : ''},
        ...
    ]

    the path is the item path, like 'A/B/X'
    the prefix (optional) is a string that is attached to the item (like an icon)
    the tooltip (optional) is a string that is added as a tooltip (using popper)

    for the previous example, nodes = [
        { path: 'A.B.X' },
        { path: 'A.B.Y' },
        { path: 'A.C.X' },
        { path: 'A.C.Z' },
        { path: 'A.W' },
    ]

    */

    constructor(object, nodes, parameters){

    // =========================================================================
    // PARAMETERES
    // =========================================================================
    this.params = {
        padding : 5,
        indentation : 25,
        path_separator : "/",
        show_checkboxes : false,
        show_arrows : false,
        highlight_on_select : true,
        auto_sort: false,
        on_select : function(){},
        on_checkbox_changed : function(){},
    };

    for(const p in parameters){ this.params[p] = parameters[p]; };

    // =========================================================================
    // OTHER
    // =========================================================================
    this.object = (typeof object === "string" ? document.getElementById(object) : object);
    this.nodes = nodes;

    this.all_nodes = [];
    this.nodes_checkbox_state = {};
    this.nodes_collapsed_state = {};
    this.selected_node = '';

    this.nodes_padding = {} // store padding to change on search
    this.final_nodes = [] // store end nodes for searching
    this.aliases = {} // store aliases for searching


    // ===============================================================================
    // DRAW CONTROL
    // ===============================================================================

    this.get_node_children = function(node_path){
        // return the node's children
        let children = [];
        for(const n in this.all_nodes){
            if(this.all_nodes[n].startsWith(node_path + this.params.path_separator)){
                children.push(this.all_nodes[n]);
            }
        }
        return children;
    }

    // callback function when a node is selected
    this.node_select = function(node_path){

        // highlight
        if(this.params.highlight_on_select){
            for(const n in this.all_nodes){
                document.getElementById(this.object.id + "_node_" + this.all_nodes[n]).classList.remove("selected");
            }
            document.getElementById(this.object.id + "_node_" + node_path).classList.add("selected");
        }

        // set selected node
        this.selected_node = node_path;

        // collapse/expand
        if(!this.nodes_collapsed_state[node_path]) {
            this.node_collapse(node_path);
        }
        else{
            this.node_expand(node_path);
        }

        // custom select function
        this.params.on_select();
    }

    // callback function when a checkbox is changed
    this.node_checkbox_on_change = function(node_path){
        let state = document.getElementById("chkbox_" + this.object.id + "_node_" + node_path).checked;
        this.nodes_checkbox_state[node_path] = state;

        // check / uncheck children (not used anymore)
        let children = this.get_node_children(node_path);
        for(const c in children){
            let child = children[c];
            document.getElementById("chkbox_" + this.object.id + "_node_" + child).checked = state;
            this.nodes_checkbox_state[child] = state;
        }

        this.params.on_checkbox_changed();
    }

    // set checkbox state programatically
    this.node_set_checkbox_state = function(node_path, state){
        if( document.getElementById("chkbox_" + this.object.id + "_node_" + node_path)){
            document.getElementById("chkbox_" + this.object.id + "_node_" + node_path).checked = state;
            this.nodes_checkbox_state[node_path] = state;
        }
    }

    this.node_collapse = function(node_path){
        // set node state to collapsed
        this.nodes_collapsed_state[node_path] = true;

        // change arrow
        if(this.params.show_arrows && document.getElementById("arrow_" + this.object.id + "_node_" + node_path)){
            document.getElementById("arrow_" + this.object.id + "_node_" + node_path).innerHTML = Subtle.svg_sort_buttons("chevron_right");
        }

        // hide all children
        let children = this.get_node_children(node_path);
        for(const c in children){
            let child = children[c];
            document.getElementById(this.object.id + "_node_" + child).style.display = "none";
        }
    }

    this.node_expand = function(node_path){
        // set node state to expanded
        this.nodes_collapsed_state[node_path] = false;

        // change arrow
        if(this.params.show_arrows && document.getElementById("arrow_" + this.object.id + "_node_" + node_path)){
            document.getElementById("arrow_" + this.object.id + "_node_" + node_path).innerHTML = Subtle.svg_sort_buttons("chevron_down");
        }

        // for all children
        let children = this.get_node_children(node_path);
        for(const c in children){
            let child = children[c];

            // show immediate children
            if(child.replace(node_path + this.params.path_separator,"").split(this.params.path_separator).length == 1){

                document.getElementById(this.object.id + "_node_" + child).style.display = "block";

                // recursively show expanded children (if not collapsed)
                if(!this.nodes_collapsed_state[child]){
                    this.node_expand(child);
                }
            }
        }
    }

    this.expand_all = function(){
        for(const n in this.all_nodes){
            this.node_expand(this.all_nodes[n]);
        }
    }

    this.collapse_all = function(){
        for(const n in this.all_nodes){
            this.node_collapse(this.all_nodes[n]);
        }
    }

    this.get_nodes_checkbox_state = function(){
        return this.nodes_checkbox_state;
    }

    // this function displays only the nodes that match the given text
    // and hides the others. It shows only end nodes, and removes all
    // padding (creating sort of a list)
    this.search = function(text){
        this.expand_all();
        if(text == ""){
            for(const n in this.all_nodes){
                document.getElementById(this.object.id + "_node_" + this.all_nodes[n]).style.display = "block";
                document.getElementById(this.object.id + "_node_" + this.all_nodes[n]).style.paddingLeft = this.nodes_padding[this.all_nodes[n]] + "px";
            }
        } else{
            for(const n in this.all_nodes){
                text = text.toLowerCase();

                // if not a final node, don't show
                if(!this.final_nodes.includes(this.all_nodes[n])){
                    document.getElementById(this.object.id + "_node_" + this.all_nodes[n]).style.display = "none";
                }
                // not a match, don't show
                else if(!this.all_nodes[n].toLowerCase().includes(text) /*&& !this.aliases[this.all_nodes[n]].toLowerCase().includes(text)*/){
                    document.getElementById(this.object.id + "_node_" + this.all_nodes[n]).style.display = "none";
                }
                // show
                else{
                    document.getElementById(this.object.id + "_node_" + this.all_nodes[n]).style.display = "block";
                    document.getElementById(this.object.id + "_node_" + this.all_nodes[n]).style.paddingLeft = "10px";
                }
            }
        }

    }

    // function load_tree takes a list of nodes and creates a dict with the structure
    // of the tree recursively
    this.load_tree = function(nodes, tree = {}){
        let sub_nodes = {};
        if(this.params.auto_sort) { nodes.sort(); }

        for(const n in nodes){
            let node = nodes[n];
            if(!(node.includes(this.params.path_separator))){
                tree[node] = null;
                continue;
            }

            let ps = this.params.path_separator;

            // separate the first element of the node
            // (here the function replace changes only the first ocurrence of the separator,
            // so, for example, 'my.node.path' becomes 'my..node.path'. Then we split the string
            // which results in ['my','node.path'])
            let node_ = node.replace(ps,ps+ps).split(ps+ps);
            tree[node_[0]] = {}

            if(!(node_[0] in sub_nodes)){ sub_nodes[node_[0]] = [] }
            sub_nodes[node_[0]].push(node_[1])
        }

        for(const sub_node in sub_nodes){
            this.load_tree(sub_nodes[sub_node], tree[sub_node])
        }
    }

    // prints tree recursively from a dict structure
    // (returns the html code of the tree)
    this.print_tree = function(tree, root, extra, all_nodes, depth = 0){
        var tree_html = "";

        if(tree == null) return "";

        for(const item in tree){
            var text = item;
            var full_path = root + this.params.path_separator + item;
            full_path = full_path.replace(this.params.path_separator,"");
            var div_id = this.object.id + "_node_" + full_path

            // change text for alias
            // if(full_path in extra.aliases){ text = extra.aliases[full_path] }

            // add prefix
            if(full_path in extra.prefixes){ text = extra.prefixes[full_path] + item }
            if(this.params.show_arrows && tree[item] != null){ text = "<span class='tree_arrow' id='arrow_" + div_id + "'>" + Subtle.svg_sort_buttons("chevron_down") + "</span>" + text }

            // add checkboxes
            if(this.params.show_checkboxes && tree[item] == null){
                /*text =
                `<label class="container_checkbox" style="margin-bottom: 0">
                    <input id="chkbox_${div_id}" class="tag_checkbox" type="checkbox">
                    <span class="checkmark_checkbox" autocomplete="off"></span>

                    <div style="overflow-x: hidden; text-overflow: ellipsis; white-space: nowrap; width: auto" >
                        ${text}
                    </div>
                </label>`*/
                text =
                `
                <div class="form-check">
                  <input id="chkbox_${div_id}" class="form-check-input" type="checkbox" value="" id="flexCheckDefault">
                  <label class="form-check-label" for="flexCheckDefault">
                    ${text}
                  </label>
                </div>
                `;

            }

            // create div
            let padding = 10+depth*this.params.indentation;
            var div = '<div id="' + div_id + '" class="tree-node" ';
            div += 'style="padding-left:' + padding + 'px;' + '" ';
            div += (full_path in extra.tooltips ? 'data-toggle="tooltip" data-placement="top" title="' + extra.tooltips[full_path] + '"' : '');
            div += '>' + text + '</div>';

            // add div to parent
            //this.object.innerHTML += div;
            tree_html += div;

            all_nodes.push(full_path);
            this.nodes_padding[full_path] = padding;
            if(tree[item] == null) this.final_nodes.push(full_path);

            tree_html += this.print_tree(tree[item], root + this.params.path_separator + item, extra, all_nodes, depth+1)
        }
        return tree_html;
    }

    this.draw = function(){
        // create a list of nodes
        var my_nodes = [];
        for(const node in this.nodes){
            my_nodes.push(this.nodes[node].path);
        }

        // create a dict from the list of nodes
        var my_tree = {};
        this.load_tree(my_nodes, my_tree);

        // create a dict of prefixes and tooltips
        var extra = {prefixes:{}, tooltips:{}, aliases:{}};
        for(const item in this.nodes){
            if("prefix" in this.nodes[item]){ extra.prefixes[this.nodes[item].path] = this.nodes[item].prefix; }
            if("tooltip" in this.nodes[item]){ extra.tooltips[this.nodes[item].path] = this.nodes[item].tooltip; }
            /*if("alias" in this.nodes[item]){
                extra.aliases[this.nodes[item].path] = this.nodes[item].alias;
                this.aliases[this.nodes[item].path] = this.nodes[item].alias;
            } else {
                this.aliases[this.nodes[item].path] = "";
            }*/
        }

        // print tree
        // this.object.innerHTML = "";
        this.object.innerHTML = this.print_tree(my_tree, '', extra, this.all_nodes, 0);

        // add on click and checkbox changed events
        var parent = this;
        for(const n in this.all_nodes){
            let node_path = this.all_nodes[n];

            // on select
            if(document.getElementById(this.object.id + "_node_" + node_path)){
                document.getElementById(this.object.id + "_node_" + node_path).onclick = function(){
                    parent.node_select(node_path);
                }
            }

            // on checkbox changed
            if(this.params.show_checkboxes && document.getElementById("chkbox_" + this.object.id + "_node_" + node_path)){
                document.getElementById("chkbox_" + this.object.id + "_node_" + node_path).onchange = function(){
                    parent.node_checkbox_on_change(node_path);
                }
                this.nodes_checkbox_state[node_path] = false;
            }

            // set collapsed state
            this.nodes_collapsed_state[node_path] = false;
        }

    }

    // auto initialize
    this.draw();

    }
}


//tabs.js
Subtle.TabsLayout = class TabsLayout {

  constructor(object, tabs, parameters){

    // =========================================================================
		// PARAMETERES
		// =========================================================================
    this.params = {
      show_labels : true,
      show_labels_inline: false,
      position : "center", // center, left, fill
      color: Subtle.COLORS["primary"],
      show_icons : true,
      icon_size : 16,
      dock_bottom: false,
      direction: 'horizontal', // horizontal, vertical
    };

    for(const p in parameters){ this.params[p] = parameters[p]; };

    // =========================================================================
		// OTHER
		// =========================================================================
    this.object = (typeof object === "string" ? document.getElementById(object) : object);
    this.tabs = tabs;

		// ===============================================================================
		// DRAW CONTROL
		// ===============================================================================

		this.draw = function(){

      let jc = {"left":"flex-start", "fill":"space-evenly", "center":"center"}[this.params.position];

      let prt_ = '<div style="display:flex; flex-direction:column; justify-content: ' + jc + '; height: 100%; width: 100%;">';
      let str_ = '<div style="width:100%;">';

      str_ += '<div class="tabs_layout_container" style="display: ' + (this.params.direction == "vertical" ? "block" : "flex") + '; direction:' +' align-content: stretch; justify-content: ' + jc + ';">';

      let w = this.params.icon_size;
      for(const t in tabs){
        // create flex container
        str_ += '<div id="tab_' + tabs[t].div + '" class="no-selectable tab-item" style="width:' + (this.params.show_labels_inline || this.params.direction == "vertical" ? 'auto' : w*2+10 + 'px' ) + '; flex-direction:' + (this.params.show_labels_inline ? 'row' : 'column') + '; ">';

        // add icons
        if(this.params.show_icons){
          str_ += '<div style="font-size:' + w + 'px; height:' + w*1 + 'px; line-height:' + (w) + 'px">' + tabs[t].icon + '</div>';
        }

        // add labels
        if(this.params.show_labels){
          if(this.params.show_labels_inline){
            str_ += '<div style="font-size:12px; padding-left:' + (this.params.show_icons ? '10' : '0') + 'px;">';
          } else {
            str_ += '<div style="font-size:12px; margin-top: 5px;">';
          }
          str_ += tabs[t].label + '</div>';
        }

        str_ += '</div>';

        // hide all tab divs
        let dv = document.getElementById(tabs[t].div);
        dv.style.height = "100%";
        dv.style.width = "100%";
        dv.style.display = "none";
      }

      str_ += '</div>';
      str_ += '</div>';


      //
      let inner_html = this.object.innerHTML;
      let result = prt_ + str_ + inner_html + "</div>";
      if(this.params.dock_bottom){
        result = prt_ + inner_html + str_ + "<div>";
      }
			this.object.innerHTML = result;

      // clicks
      var parent = this;
      for(const t in tabs){
        this.object.getElementsByClassName("tabs_layout_container")[0].childNodes[t].onclick = function(){ parent.select_tab(t) };
      }

      this.select_tab(0);
		}

    this.select_tab = function(tabid){
      var parent = this;
      //
      for(const s in parent.tabs){
        document.getElementById(parent.tabs[s].div).style.display = "none";
        parent.object.getElementsByClassName("tabs_layout_container")[0].childNodes[s].style.color = Subtle.COLORS["text"];
      }
      document.getElementById(parent.tabs[tabid].div).style.display = "block";
      parent.object.getElementsByClassName("tabs_layout_container")[0].childNodes[tabid].style.color = Subtle.COLORS["primary"];

      if(parent.tabs[tabid].onselect){
        parent.tabs[tabid].onselect();
      }

    }

    this.draw()



	}
}


//time_plot.js
Subtle.TimePlot = class TimePlot {

  /*
	The Graph Control displays a plot with time on the x axis and a given value
	on the y axis. The plot refreshes itself when the update_value is called.

  y = y_max ^
            |                               ----
            |       ----                  /      \
            |     /      \         ------         \
            |    /        \      /                 \
            |---            ----                     ------
            |
  y = y_min |_____________________________________________>
  		  t = time_span								                    t = 0

  */

  constructor(object, parameters = {}){

    // =========================================================================
		// PARAMETERES
		// =========================================================================
    this.params = {
      y_min : -0.25,
      y_max : 1.25,
      time_span : 10, // time span in seconds
      units : "",
      color : Subtle.COLORS["primary"],

      limit_high : NaN, // upper limit for y (draws a dashed line)
      limit_low : NaN, // lower limit for y (draws a dashed line)
      y_auto : false, // calculate automatically y_min and y_max
      shade_limits : false, // display limits as a shade

      stroke_width : 3,
      show_labels : false,

      left_offset : 0,
      value_on_left : false, // instead of text shows the value on left
      override_text_left : "", // display some text on the left (other than te value)

      endpoint : false, // draw a circle on the end
      right_offset : 3, // offset on the right for endpoint
      fade : false, // fade for big t
      glow : false, // make the line glow
      fill_area: false,

      smooth : false, // smooths out the plot by auto updating
      t0: "", // t0
    };

    for(const p in parameters){ this.params[p] = parameters[p]; };

    // =========================================================================
		// OTHER
		// =========================================================================
    this.object = (typeof object === "string" ? document.getElementById(object) : object);

    this.data = [];
    this.times = [];
    this.averaging_buffer = [];

    // save max and min value
    this.max_value = 0.5 * (this.params.y_max - this.params.y_min);
		this.min_value = 0.5 * (this.params.y_max - this.params.y_min);

    // Define styles to use in auxiliary lines and text
    this.line_style = { stroke_color: "#000000", stroke_width: 3, }
    this.line_limit_style = { stroke_color: "#888888", stroke_width: 1, stroke_dasharray: 4, }
    this.text_limit_style = { color: "#888888", anchor: "left", font_size:'16px' };
    this.labels_style = { anchor: "left", font_size:'16px' };


    // =========================================================================
		// USEFUL FUNCTIONS
		// =========================================================================

    // scaling helper functions
		// t (or x) is time, measured from right to left (right edge -> t = 0, left edge -> t = time_span)
		// y is value, measured from bottom to top (bottom edge -> y = y_min, top edge -> y = y_max)
		//this.transform_y = function(y){ return (height - this.offset_y) - y * (height - this.offset_y) / (this.y_max - this.y_min); }
		this.transform_y = function(y){ return (this.params.y_max - y) * (this.object.offsetHeight) / (this.params.y_max - this.params.y_min); }
		this.transform_t = function(t){ return (this.object.offsetWidth - this.params.stroke_width - this.params.right_offset) - t * (this.object.offsetWidth - this.params.left_offset) / this.params.time_span; }

    this.draw_line = function(t1,y1,t2,y2,style){
			y1 = this.transform_y(y1);
			y2 = this.transform_y(y2);
			t1 = this.transform_t(t1);
			t2 = this.transform_t(t2);
			return Subtle.svg_line(t1,y1,t2,y2,style);
		}

    this.draw_circle = function(t,y,r,style){
			t = this.transform_t(t);
			y = this.transform_y(y);
			return Subtle.svg_circle(t,y,r,style);
		}

    // 8) autoupdate
    if(this.params.smooth){
      let parent = this;
      window.setInterval(function(){
        parent.update(parent.current_value);
      }, 50);
    }

    // =========================================================================
		// DRAW CONTROL
		// =========================================================================

    // returns the svg code for the main plot
    this.draw_get_main_svg = function(width, height){
      var plt_ = "";

      // 0) draw plot
      // ============
      let color = (this.params.color in Subtle.COLORS ? Subtle.COLORS[this.params.color] : this.params.color);
      let plot_style = { stroke_color: color, stroke_width: this.params.stroke_width, stroke_linecap: "round" };
      let glow_style = { stroke_color: color, stroke_width: this.params.stroke_width+1, stroke_linecap: "round" };

      // update styles for fading
      if(this.params.fade){
        let fade_grad  = Subtle.svg_lineargradient(this.object.id + 'fade_gradient', this.params.color, 'h');
        plt_ += fade_grad;
        plot_style.stroke_color = "url(#" + this.object.id + "fade_gradient)";
        glow_style.stroke_color = "url(#" + this.object.id + "fade_gradient)";
      }

      // calculate path
      var i = this.times.length - 1;

      if(typeof this.data[i] !== "undefined"){

        let t0 = this.params.t0 == "" ?  new Date() :  new Date(this.params.t0);
        let time_i = (t0 - this.times[i])/1000;

        let path = '<path d=" M ' + this.transform_t(time_i) + ' ' + this.transform_y(this.data[i]) + ' ';
        i--;

        time_i = (t0 - this.times[i])/1000;

        while(i >= 0 && time_i < this.params.time_span && typeof this.data[i] !== "undefined"){
          time_i = (t0 - this.times[i])/1000;
          path += 'L ' + this.transform_t(time_i) + ' ' + this.transform_y(this.data[i]) + ' ';
          i--;
        }

        // add path to plt
        plt_ += path + '" ' + Subtle.svg_style(plot_style) + ' />';
        if(this.params.glow){ plt_ += path + '" ' + Subtle.svg_style(glow_style) + ' filter="url(#blur_filter)"/>'; }

        // trim data and time arrays to keep the size constant
        if(i > 0){
          this.times.splice(0,i);
          this.data.splice(0,i);
        }
      }

      // draw endpoint
      // ================
      if (this.params.endpoint && typeof this.data[this.data.length-1] !== "undefined"){
        let endpoint_style = { fill_color: this.params.color, stroke_width : 0 };
        plt_ += this.draw_circle(0,this.data[this.data.length-1],this.params.stroke_width+3,endpoint_style);
      }

      return plt_;

    }

    // returns the svg code for labels, guides, etc.
    this.draw_get_context_svg = function(width, height){
      var svg_ = "";

      // display value on left for sparkline
      if(this.params.value_on_left & this.params.override_text_left == ""){
        svg_ += Subtle.svg_text(1, height * 0.5, Subtle.ROUND(this.data[this.data.length-1]) + this.params.units, {center_vertically: true });
      }
      if(this.params.override_text_left != ""){
        svg_ += Subtle.svg_text(1, height * 0.5, this.params.override_text_left, {center_vertically: true });
      }

      // 1) draw guides and limits
      // =========================
      this.line_limit_style.stroke_color = Subtle.COLORS["control"];
      this.text_limit_style.color = Subtle.COLORS["control"];

      if(this.params.shade_limits){
        // shaded limits
        let x0 = this.params.left_offset;
        let y0 = this.transform_y(this.params.limit_high);
        let x1 = width;
        let y1 = this.transform_y(this.params.limit_low);
        svg_ += Subtle.svg_rectangle(x0,y0,x1-x0,y1-y0,{fill_color: Subtle.COLORS["control"], stroke_width:0});

      } else {
        // normal limits
        if(!Number.isNaN(this.params.limit_high)){
          // draw line and text of top limit
          svg_ += this.draw_line(this.params.time_span,this.params.limit_high,0,this.params.limit_high, this.line_limit_style);
          svg_ += Subtle.svg_text(5 + this.params.left_offset,this.transform_y(this.params.limit_high) + 16,this.params.limit_high + this.params.units, this.text_limit_style);
        }
        if(!Number.isNaN(this.params.limit_low)){
          // draw line and text of bottom limit
          svg_ += this.draw_line(this.params.time_span,this.params.limit_low,0,this.params.limit_low, this.line_limit_style);
          svg_ += Subtle.svg_text(5 + this.params.left_offset,this.transform_y(this.params.limit_low) - 5,this.params.limit_low + this.params.units, this.text_limit_style);
        }
      }


      // 3) draw x label
      // ===============
      if(this.params.show_labels){
        this.labels_style.anchor = "middle";
        svg_ += Subtle.svg_text((width - this.params.left_offset) *0.5 + this.params.left_offset,(height - 6),"- " + this.params.time_span + "s -",this.labels_style);
      }

      // 4) draw y labels
      // ================
      if(this.params.show_labels){
        this.labels_style.anchor = "left";
        svg_ += Subtle.svg_text(this.params.left_offset+5,height-6,Subtle.ROUND(this.params.y_min) + this.params.units,this.labels_style);
        svg_ += Subtle.svg_text(this.params.left_offset+5,18,Subtle.ROUND(this.params.y_max) + this.params.units,this.labels_style);
      }

      return svg_;

    }

    this.draw = function(){
      let height = this.object.offsetHeight;
      let width = this.object.offsetWidth;

      let plt_ = this.draw_get_main_svg(width, height);
      let svg_ = this.draw_get_context_svg(width, height);

      // draw everything to control
      let content = Subtle.svg_markup(width, height, plt_ + svg_);
      //if(content.includes("NaN")) return;
      this.object.innerHTML = content;

    }

    // =========================================================================
		// UPDATE
		// =========================================================================
    this.update = function(value, time = "", draw_after_update = true){

      // calculate elapsed time from the last time this function was called in seconds
      if(time == "") time = new Date();
      else time = new Date(time);
      this.times.push(time);

      // update data queue (push new value)
      this.data.push(value);
      this.current_value = value;

      // clear min and max
      // save if min or max
      if( this.params.y_auto ){
        if (this.max_value < value) {
          this.max_value = value;
          this.params.y_max = this.max_value + (this.max_value - this.min_value) * 0.25;
        };
        if (this.min_value > value) {
          this.min_value = value;
          this.params.y_min = this.min_value - (this.max_value - this.min_value) * 0.25;
        };
      }

      if(draw_after_update) { this.draw(); }

    }
  }
}


//svg_view.js
Subtle.SvgView = class SvgView{

  constructor(object, parameters){

    this.params = {
      img : '',
      onload : function(){},
      stretch : true,
      hover_effect : true,
    };

    for(const p in parameters){ this.params[p] = parameters[p]; };

    // =========================================================================
    // OTHER
    // =========================================================================
    this.object = (typeof object === "string" ? document.getElementById(object) : object);

    // =========================================================================
    // DRAW CONTROL
    // =========================================================================
    this.draw = function(){

      var parent = this;
      var xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
          let data = this.responseText;
          let ctr_ = '';
          ctr_ += '<div class="svg_view_container' + (parent.params.stretch ? ' stretch' : '') + '">';
          ctr_ += data;
          ctr_ += '</div>';
          parent.object.innerHTML = ctr_;

          parent.params.onload();
        }
      };
      xhttp.open("GET", this.params.img, true);
      xhttp.send();
    }

    // =========================================================================
    // UPDATE
    // =========================================================================
    this.set_child_color = function(item, color){
      if(color in Subtle.COLORS) color = Subtle.COLORS[color];
      document.getElementById(item).style.fill = color;
    }

    this.set_child_text = function(item, text){
      document.getElementById(item).innerHTML = text;
    }

    this.set_child_onclick = function(item, onclick){
      let it = document.getElementById(item);
      it.onclick = onclick;

      if(this.params.hover_effect){
        it.style.cursor = "pointer";
        it.onmouseover = function(){ it.style.opacity=0.75 };
        it.onmouseout = function(){ it.style.opacity=1 };
      }
    }

    this.set_child_bind = function(item, sub_item){
      let it1 = document.getElementById(item);
      let it2 = document.getElementById(sub_item);

      it2.style.opacity = 0;

      var hover_effect = this.params.hover_effect;
      if(hover_effect) it1.style.cursor = "pointer";

      it1.onmouseover = function(){ it2.style.opacity=1; if(hover_effect) it1.style.opacity = 0.75; };
      it1.onmouseout  = function(){ it2.style.opacity=0; if(hover_effect) it1.style.opacity = 1; };
    }

    this.set_child_tooltip = function(item, tooltip){
      let it = document.getElementById(item);

      // add hover effect
      if(this.params.hover_effect){
        it.style.cursor = "pointer";
        it.onmouseover = function(){ it.style.opacity=0.75 };
        it.onmouseout = function(){ it.style.opacity=1 };
      }

      // add tippy tooltip
      if(typeof tippy !== "undefined") tippy('#' + it.id, {content:tooltip, allowHTML: true})
      else console.log("Tooltip error: tippy.js not included");
    }

    this.set_child_for_html = function(item){
      let it = document.getElementById(item);
      let bbox = it.getBBox();

      let code = "";
      code += '<foreignObject x="' + bbox.x + '" y="' + bbox.y + '" width="' + bbox.width + '" height="' + bbox.height + '">';
      code += '<div style="height:100%; width:100%" id="' + item + '"></div>';
      code += '</foreignObject>';

      it.outerHTML = code;
    }

    // =========================================================================
    // AUTO INITIALIZE
    // =========================================================================
    this.draw();

  }


}


//sparkline.js
Subtle.Sparkline = class Sparkline{

  constructor(object, parameters = {}){

    this.params = {
      fade: true,
      value_on_left: false,
      endpoint: true,
      glow: false,
    };

    for(const p in parameters){ this.params[p] = parameters[p] }

    ////////////////////

    this.object = (typeof object === "string" ? document.getElementById(object) : object);

    var tc = new Subtle.TimePlot(object, this.params);

    this.draw = function(){ tc.draw() }
    this.update = function(value, time = ""){ tc.update(value, time) }

  }

}


//text_simple.js
Subtle.TextSimple = class TextSimple{

  constructor(object, parameters = {}){
    // =========================================================================
		// PARAMETERES
		// =========================================================================

    this.params = {
      value : 0,
      units : "",
      v_align : "center",
      h_align : "center",
      rounding: 2,
      font_size: 36,
    };
    for(const p in parameters){ this.params[p] = parameters[p]; };

    // =========================================================================
		// OTHER
		// =========================================================================
    this.object = (typeof object === "string" ? document.getElementById(object) : object);

		// =========================================================================
		// DRAW CONTROL
		// =========================================================================
    this.draw = function(){
      let ctr_ = "";

      let v_align = this.params.v_align;
      let h_align = this.params.h_align;
      if(v_align == "top") v_align = "flex-start";
      if(v_align == "bottom") v_align = "flex-end";
      if(h_align == "left") h_align = "flex-start";
      if(h_align == "right") h_align = "flex-end";

      let units_color = Subtle.COLORS["control"];
      ctr_ += '<div style="display:flex; align-items:' + v_align + '; justify-content:' + h_align + '; height:100%">';
      ctr_ += '<div class="at_font" style="font-size:' + this.params.font_size + 'px;"><span>' + Subtle.ROUND(this.params.value, this.params.rounding) + '</span>' + (this.params.units != "" ? ' <span style="color:' + units_color + '">' + this.params.units + '</span>' : '') +  '</div>';
      ctr_ += '</div>';

      this.object.innerHTML = ctr_;
    }

    // =========================================================================
		// UPDATE
		// =========================================================================
    this.update = function(text){
      this.object.childNodes[0].childNodes[0].childNodes[0].innerHTML = Subtle.ROUND(text, this.params.rounding);
    }

    // =========================================================================
		// AUTO INITIALIZE
		// =========================================================================
    this.draw();


  }


}


//svg_commands.js
// =============================================================================
// MARKUP
// =============================================================================
Subtle.svg_markup = function(width,height,content){
  let blur = '<filter id="blur_filter" x="0" y="0"><feGaussianBlur in="SourceGraphic" stdDeviation="3" /></filter>';

  let svg = '<svg height="' + height + '" width="' + width + '">\n';
  svg += '<defs>' + blur + '</defs>';
  svg += content;
  svg += '</svg>';

  return svg;
}

// =============================================================================
// STYLES
// =============================================================================
Subtle.svg_style = function(style){

  // get default style
  st = {
    fill_color: "none",
    stroke_color: "#000000",
    stroke_width: 3,
    stroke_dasharray: 0,
    stroke_linecap: "butt",
    opacity: 1,
    stroke_linejoin: "round",
  }

  // edit style
  for(const item in style){ st[item] = style[item] }

  // create string and return
  styl = '';
  styl += 'style="';
  styl += 'fill:' + st.fill_color + ';';
  styl += 'fill-opacity:' + st.opacity.toString() + ';';
  styl += 'stroke:' + st.stroke_color + ';';
  styl += 'stroke-width:' + st.stroke_width.toString() + ';';
  styl += 'stroke-dasharray:' + st.stroke_dasharray.toString() + ';';
  styl += 'stroke-opacity:' + st.opacity.toString() + ';';
  styl += 'stroke-linecap:' + st.stroke_linecap + ';';
  styl += 'stroke-linejoin:' + st.stroke_linejoin + ';';
  styl += '"';

  return styl;
}

Subtle.svg_lineargradient = function(id, color, direction = "h"){
  let grad = '';

  grad += '<linearGradient id="' + id + '" gradientUnits="userSpaceOnUse" ';
  if(direction == "h") grad += 'x1="0%" y1="0%" x2="100%" y2="0%">';
  if(direction == "v") grad += 'x1="0%" y1="100%" x2="0%" y2="0%">';

  grad += '<stop offset="0%" style="stop-color:' + color + ';stop-opacity:0" />';
  grad += '<stop offset="100%" style="stop-color:' + color + ';stop-opacity:1" />';

  grad += '</linearGradient>';
  return grad;
}

// =============================================================================
// FIGURES
// =============================================================================
Subtle.svg_line = function(x1,y1,x2,y2,style){

  let line = '<line ';

  line += 'x1="' + x1 + '" ';
  line += 'y1="' + y1 + '" ';
  line += 'x2="' + x2 + '" ';
  line += 'y2="' + y2 + '" ';

  line += Subtle.svg_style(style);

  if("filter" in style){
    line += 'filter="' + style.filter + '"';
  }

  line += '/>';
  return line;
}

Subtle.svg_circle = function(x,y,r,style){

  let circ = '<circle ';
  circ += 'cx="' + x + '" ';
  circ += 'cy="' + y + '" ';
  circ += 'r="' + r + '" ';

  circ += Subtle.svg_style(style);
  circ += '/>';
  return circ;

}

Subtle.svg_rectangle = function(x,y,dx,dy,style,rx = 0){

  let sqr = '<rect ';
  sqr += 'x="' + x + '" ';
  sqr += 'y="' + y + '" ';
  sqr += 'width="' + dx + '" ';
  sqr += 'height="' + dy + '" ';
  sqr += 'rx="' + rx + '" ';

  sqr += Subtle.svg_style(style);
  sqr += '/>';
  return sqr;
}

Subtle.svg_cross = function(x,y,size,style){
  // draw an 'X' (two lines)
  let cross = '<g transform="translate(-' + size*0.5 + ' -' + size*0.5 + ')">';
  cross += Subtle.svg_line(x,y,x+size,y+size,style);
  cross += Subtle.svg_line(x+size,y,x,y+size,style);
  cross += '</g>';
  return cross;
}

Subtle.svg_text = function(x,y,value,style){

  // get default style
  st = {
    color: Subtle.COLORS["text"],
    //font_size: 12,
    //font_family: "Helvetica",
    anchor: "start", // start, middle, end
    center_vertically: false, //true, false
  }

  // edit style
  for(const item in style){ st[item] = style[item] }

  let text = '';
  if("font_family" in style) { text = '<text '; }
  else{ text = '<text class="at_font" '; }

  text += 'x="' + x + '" ';
  text += 'y="' + y + '" ';
  text += 'dy="' + (st.center_vertically ? "0.3em" : 0) + '" ';

  text += 'fill="' + st.color + '" ';
  text += 'text-anchor="' + st.anchor + '" ';
  //text += 'font-size="' + st.font_size + '" ';
  if("font_family" in style) { text += 'font-family="' + st.font_family + '" '; }
  if("font_size" in style) { text += 'style="font-size:' + st.font_size + '" '; }
  if("color" in style) { text += 'color="' + st.color + '" '; }
  text += '>' + value + '</text>';

  return text;
}

Subtle.svg_ellipsearc = function(x,y,r_x,r_y,start_angle,sweep_angle,total_rotation,style_){

  const cos = Math.cos;
  const sin = Math.sin;
  const pi = Math.PI;

  const f_matrix_times = (( [[a,b], [c,d]], [x,y]) => [ a * x + b * y, c * x + d * y]);
  const f_rotate_matrix = ((x) => [[cos(x),-sin(x)], [sin(x), cos(x)]]);
  const f_vec_add = (([a1, a2], [b1, b2]) => [a1 + b1, a2 + b2]);

  const f_svg_ellipse_arc = (([cx,cy],[rx,ry], [t1, delt], phi, style ) => {
    /* [
    returns a SVG path element that represent a ellipse.
    cx,cy → center of ellipse
    rx,ry → major minor radius
    t1 → start angle, in radian.
    delt → angle to sweep, in radian. positive.
    phi → rotation on the whole, in radian
    url: SVG Circle Arc http://xahlee.info/js/svg_circle_arc.html
    Version 2019-06-19
    ] */
    delt = delt % (2*pi);
    const rotMatrix = f_rotate_matrix (phi);
    const [sX, sY] = ( f_vec_add ( f_matrix_times ( rotMatrix, [rx * cos(t1), ry * sin(t1)] ), [cx,cy] ) );
    const [eX, eY] = ( f_vec_add ( f_matrix_times ( rotMatrix, [rx * cos(t1+delt), ry * sin(t1+delt)] ), [cx,cy] ) );
    const fA = ( (  delt > pi ) ? 1 : 0 );
    const fS = ( (  delt > 0 ) ? 1 : 0 );
    return '<path ' + style + ' d="' + 'M ' + sX + ' ' + sY + ' A ' + [ rx , ry , phi / (2*pi) *360, fA, fS, eX, eY ].join(' ') + '" />';
  });

  return f_svg_ellipse_arc( [x,y],[r_x,r_y], [start_angle, sweep_angle], total_rotation, Subtle.svg_style(style_) )

}

// =============================================================================
// DIAL HAND
// =============================================================================
Subtle.svg_dial_hand = function(x,y,r, angle, color = "#000000"){

  let hand = '';
  hand += '<path style="fill:' + color + '" d="M -2.618073,0 0.02776695,-23.8125 2.673597,0 c 0,3.96875 -5.29167,3.96875 -5.29167,0 z" ';
  hand += 'transform="';

  hand += 'translate(' + x + ' '  + y + ') ';
  hand += 'rotate(' + angle + ' 0 0) ';
  hand += 'scale(' + r/26.789  + ' '  + r/26.789 + ')';
  hand += '"/>';

  return hand;
}

// =============================================================================
// PLOT MARKERS
// =============================================================================
Subtle.svg_marker = function(x, y, marker, color, size){

  let normal_style = { stroke_color:color, stroke_width:3 };
  let fill_style   = { fill_color:color, stroke_color: color, stroke_width:3 };

  if(marker == "circle"){
    return svg_circle(x,y,size*0.5,normal_style);
  }
  if(marker == "circle_fill"){
    return svg_circle(x,y,size*0.5, fill_style);
  }
  if(marker == 'square'){
    return '<g transform="translate(-' + size*0.5 + ' -' + size*0.5 + ')">' + Subtle.svg_rectangle(x,y,size,size,normal_style) + '</g>';
  }
  if(marker == 'square_fill'){
    return '<g transform="translate(-' + size*0.5 + ' -' + size*0.5 + ')">' + Subtle.svg_rectangle(x,y,size,size,fill_style) + '</g>';
  }
  if(marker == 'cross'){
    return svg_cross(x,y,size,normal_style);
  }

}


// =============================================================================
// SVG ICONS
// =============================================================================
Subtle.svg_icon = function(icon, color = "#000000"){

  if(icon == "info_filled") return `
  <?xml version="1.0" encoding="UTF-8" standalone="no"?>
  <svg width="16" height="16" viewBox="0 0 4.2333332 4.2333335">
    <path
       d="M 2.1166717,1.75e-7 C 0.94766167,1.75e-7 1.675e-6,0.94766317 1.675e-6,2.1166662 c 0,1.169003 0.947659995,2.116667 2.116670025,2.116667 1.169,-10e-7 2.11666,-0.947665 2.11666,-2.116667 0,-1.16900303 -0.94766,-2.116665025 -2.11666,-2.116666025 z m -0.26459,0.793749995 h 0.52917 V 1.3229162 h -0.52917 z m 0,1.05833303 h 0.52917 v 1.5875 h -0.52917 z"
       style="mix-blend-mode:normal;fill:` + color + `;stroke:none;stroke-width:0.321651;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;paint-order:markers stroke fill"
    />
  </svg>`;

  if(icon == "warning_filled") return `
  <?xml version="1.0" encoding="UTF-8" standalone="no"?>
  <svg width="16" height="16" viewBox="0 0 4.2333332 4.2333335">
      <path
         style="mix-blend-mode:normal;fill:` + color + `;stroke:none;stroke-width:0.321651;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;paint-order:markers stroke fill"
         d="m 2.1166617,4.2333337 c 1.16901,0 2.11667,-0.947663 2.11667,-2.116666 0,-1.16900403 -0.94766,-2.116668025 -2.11667,-2.116668025 C 0.94766167,-3.25e-7 1.675e-6,0.94766467 1.675e-6,2.1166677 c 0,1.169003 0.947659995,2.116665 2.116660025,2.116666 z m 0.26459,-0.79375 h -0.52917 v -0.529166 h 0.52917 z m 0,-1.058333 h -0.52917 V 0.79374968 h 0.52917 z" />
  </svg>`;

  if(icon == "error_filled") return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
  <svg width="16" height="16" viewBox="0 0 4.2333332 4.2333335">
    <path
       d="M 2.1166666,0 C 1.2843348,-0.01155961 0.4816217,0.523417 0.16633713,1.2927643 -0.16283441,2.0485603 0.00748465,2.9874305 0.5844754,3.5770407 1.1396266,4.1745124 2.0542385,4.3925098 2.820063,4.1136519 3.6138585,3.8439944 4.1991293,3.0642163 4.230579,2.22559 4.2832729,1.4103472 3.8107355,0.59547794 3.0802812,0.23156249 2.7835328,0.07906631 2.4502307,-5.0760971e-4 2.1166666,0 Z m -0.79375,0.88780111 C 1.5875,1.1522122 1.8520833,1.4166233 2.1166666,1.6810343 2.38125,1.4166233 2.6458333,1.1522122 2.9104166,0.88780111 3.0554551,1.0328396 3.2004936,1.1778781 3.3455321,1.3229166 3.081121,1.5875 2.8167099,1.8520833 2.552299,2.1166666 2.8167099,2.38125 3.081121,2.6458333 3.3455321,2.9104166 3.2004936,3.0554551 3.0554551,3.2004936 2.9104166,3.3455321 2.6458333,3.081121 2.38125,2.8167099 2.1166666,2.552299 1.8520833,2.8167099 1.5875,3.081121 1.3229166,3.3455321 1.1778781,3.2004936 1.0328396,3.0554551 0.88780111,2.9104166 1.1522122,2.6458333 1.4166233,2.38125 1.6810343,2.1166666 1.4166233,1.8520833 1.1522122,1.5875 0.88780111,1.3229166 1.0328396,1.1778781 1.1778781,1.0328396 1.3229166,0.88780111 Z"
       style="mix-blend-mode:normal;fill:` + color + `;stroke:none;stroke-width:0.321651;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;paint-order:markers stroke fill" />
  </svg>`;

  if(icon == "info") return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
  <svg width="16" height="16" viewBox="0 0 4.2333332 4.2333335">
    <path
    style="mix-blend-mode:normal;fill:` + color + `;stroke:none;stroke-width:0.321651;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;paint-order:markers stroke fill"
    d="m 1.8520817,0.79375017 h 0.52917 V 1.3229162 h -0.52917 z m 0,1.05833303 h 0.52917 v 1.5875 h -0.52917 z" />
  </svg>`;

  if(icon == "warning") return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
  <svg width="16" height="16" viewBox="0 0 4.2333332 4.2333335">
    <path
    d="m 2.3812517,3.4395837 h -0.52917 v -0.529166 h 0.52917 z m 0,-1.058333 h -0.52917 V 0.79374968 h 0.52917 z"
    style="mix-blend-mode:normal;fill:` + color + `;stroke:none;stroke-width:0.321651;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;paint-order:markers stroke fill" />
  </svg>`;

  if(icon == "error") return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
  <svg width="16" height="16" viewBox="0 0 4.2333332 4.2333335">
    <path
    style="mix-blend-mode:normal;fill:` + color + `;stroke:none;stroke-width:0.321651;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;paint-order:markers stroke fill"
    d="m 1.3229166,0.88780111 0.79375,0.79323319 0.79375,-0.79323319 0.4351155,0.43511549 -0.7932331,0.79375 0.7932331,0.79375 L 2.9104166,3.3455321 2.1166666,2.552299 1.3229166,3.3455321 0.88780111,2.9104166 1.6810343,2.1166666 0.88780111,1.3229166 Z" />
  </svg>`;


}



// =============================================================================
// SVG KNOB AND LED
// =============================================================================
Subtle.svg_knob = function(text_left, text_right, angle = 0, color = "#00baff"){

  return `
  <svg style="width:100%; height: 100%" width="178.2265" height="133.72655" viewBox="0 0 47.155758 35.381817" version="1.1">
  <g transform="translate(6.6238806,1.5151517)">
    <circle
      style="opacity:0.993;fill:#000000;fill-rule:evenodd;stroke-width:0.529167;stroke-linecap:round;stroke-linejoin:round;paint-order:markers stroke fill;stop-color:#000000"
      cx="16.933332"
      cy="16.933332"
      r="16.933332" />
    <circle
      r="16.933332"
      cy="16.933332"
      cx="16.933332"
      style="opacity:0.993;fill:#d7dde3;fill-rule:evenodd;stroke-width:0.529167;stroke-linecap:round;stroke-linejoin:round;paint-order:markers stroke fill;stop-color:#000000;fill-opacity:1" />
    <circle
      style="opacity:0.993;fill:#3a3c39;fill-rule:evenodd;stroke-width:0.52916667;stroke-linecap:round;stroke-linejoin:round;paint-order:markers fill stroke;stop-color:#000000;fill-opacity:1;stroke:none;stroke-miterlimit:4;stroke-dasharray:none"
      id="circle835-5"
      cx="16.933332"
      cy="16.933332"
      r="15.530168" />
    <g
      id="g911"
      transform="rotate(` + angle + `,16.588873,17.816322)">
      <path
        id="path895"
        style="color:#000000;font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-size:medium;line-height:normal;font-family:sans-serif;font-variant-ligatures:normal;font-variant-position:normal;font-variant-caps:normal;font-variant-numeric:normal;font-variant-alternates:normal;font-variant-east-asian:normal;font-feature-settings:normal;font-variation-settings:normal;text-indent:0;text-align:start;text-decoration:none;text-decoration-line:none;text-decoration-style:solid;text-decoration-color:#000000;letter-spacing:normal;word-spacing:normal;text-transform:none;writing-mode:lr-tb;direction:ltr;text-orientation:mixed;dominant-baseline:auto;baseline-shift:baseline;text-anchor:start;white-space:normal;shape-padding:0;shape-margin:0;inline-size:0;clip-rule:nonzero;display:inline;overflow:visible;visibility:visible;isolation:auto;mix-blend-mode:normal;color-interpolation:sRGB;color-interpolation-filters:linearRGB;solid-color:#000000;solid-opacity:1;vector-effect:none;fill:#7e827e;fill-opacity:1;fill-rule:nonzero;stroke:none;stroke-width:0.529167;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-dashoffset:0;stroke-opacity:1;color-rendering:auto;image-rendering:auto;shape-rendering:auto;text-rendering:auto;enable-background:accumulate;stop-color:#000000"
        d="m 16.4021,2.8747598 c -0.552886,0.019399 -1.099809,0.1164204 -1.532723,0.289388 -0.216458,0.086484 -0.406458,0.1919867 -0.552938,0.3260783 -0.146479,0.1340917 -0.25299,0.3064756 -0.265617,0.5059125 -0.01956,0.2919626 -0.404963,6.6731604 -0.722953,13.0643184 -0.158995,3.195579 -0.300215,6.387726 -0.371037,8.812382 -0.03541,1.212329 -0.05363,2.23389 -0.04651,2.96881 0.0036,0.367462 0.01361,0.661652 0.03101,0.879018 0.0087,0.10868 0.01857,0.197553 0.03307,0.271301 0.0145,0.07374 -3.97e-4,0.128545 0.103869,0.222726 l 0.01757,0.01601 0.01964,0.0093 c 2.527677,0.96493 5.22497,1.306494 7.636226,0 l 0.01964,-0.0093 0.01757,-0.01601 c 0.104272,-0.09418 0.0873,-0.148982 0.101802,-0.222726 0.0145,-0.07375 0.02645,-0.162621 0.03514,-0.271301 0.01739,-0.217366 0.02589,-0.511556 0.02946,-0.879018 0.0071,-0.73492 -0.0095,-1.756481 -0.04496,-2.96881 C 20.839532,23.448183 20.696246,20.256036 20.53725,17.060457 20.219259,10.6693 19.835924,4.2880782 19.816364,3.9961386 19.803738,3.7967017 19.69516,3.6243178 19.54868,3.4902261 19.402201,3.3561345 19.214267,3.2506319 18.997809,3.1641478 c -0.432916,-0.1729676 -0.981905,-0.269989 -1.53479,-0.289388 -0.122044,-0.00425 -0.239774,0.00102 -0.3576,0 -0.117826,-0.00102 -0.229077,-0.00209 -0.343649,0 -0.114572,0.00209 -0.237661,-0.00422 -0.359668,0 z"/>
      <rect
        ry="0.52916664"
        rx="0.52916664"
        y="4.2333331"
        x="16.404167"
        height="3.175"
        width="1.0583333"
        id="rect900"
        style="opacity:0.993;fill:` + color + `;fill-opacity:1;fill-rule:evenodd;stroke:none;stroke-width:0.607419;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;paint-order:markers stroke fill;stop-color:#000000" />
    </g>
    <text
       x="6.6218114"
       y="1.5151517"
       fill="` + Subtle.COLORS["text"] + `"
       style="font-size:4.23333px;stroke-width:0.264583; text-anchor:end">
       ` + text_left + `
    </text>
    <text
      y="1.5151517"
      x="27.102222"
      fill="` + Subtle.COLORS["text"] + `"
      style="font-size:4.23333px;stroke-width:0.264583">
      ` + text_right + `
    </text>
  </g>
  </svg>`;

}

Subtle.svg_led = function(color, size){
  return `
  <?xml version="1.0" encoding="UTF-8" standalone="no"?>
  <svg width="` + size + `" height="` + size + `" viewbox="0 0 64 64">
    <defs
      id="defs4">
      <linearGradient
        inkscape:collect="always"
        id="linearGradient3767">
        <stop
          style="stop-color:#ffffff;stop-opacity:1;"
          offset="0"
          id="stop3769" />
        <stop
          style="stop-color:#ffffff;stop-opacity:0;"
          offset="1"
          id="stop3771" />
      </linearGradient>
      <radialGradient
        inkscape:collect="always"
        xlink:href="#linearGradient3767"
        id="radialGradient3775"
        cx="16.454626"
        cy="11.617443"
        fx="16.454626"
        fy="11.617443"
        r="17.429127"
        gradientTransform="matrix(-1.1109257,0.05194102,-0.03008734,-0.64351499,16.070171,26.445752)"
        gradientUnits="userSpaceOnUse" />
    </defs>
    <g
      transform="translate(3.2116215,3.2116215)"
      inkscape:label="Capa 1"
      inkscape:groupmode="layer"
      id="layer1">
      <circle
        r="28.223236"
        style="fill:` + color + `;fill-opacity:1;fill-rule:nonzero;stroke:#000000;stroke-width:7.55353;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:0.533333;paint-order:stroke fill markers"
        id="path2985"
        cx="28.78838"
        cy="28.78838" />
      <ellipse
        style="opacity:0.56;fill:url(#radialGradient3775);fill-opacity:1;fill-rule:nonzero;stroke:none;stroke-width:1.08461"
        id="path3765"
        transform="rotate(-50.364246)"
        cx="-3.5457149"
        cy="22.126102"
        rx="16.49552"
        ry="9.1520014"
        inkscape:transform-center-x="13.80319"
        inkscape:transform-center-y="-10.987245" />
    </g>
  </svg>`;

}

// =============================================================================
// SORTING BUTTONS
// =============================================================================
Subtle.svg_sort_buttons = function(mode = "down"){ // mode = up, down

  let svgpath = ""
  if(mode == "down"){ svgpath = 'd="M 2.1166669,3.9497342 4.2333334,0.2835992 1.4999998e-8,0.2835994 Z"' }
  if(mode == "up"){ svgpath = 'd="M 2.1166669,0.2835992 4.2333334,3.9497342 1.4999998e-8,3.949734 Z"' }
  if(mode == "chevron_down") { svgpath = 'd="m 2.1176412,3.0162171 1.634766,-1.451172 a 0.1984375,0.1984375 0 0 0 0.01758,-0.28125 0.1984375,0.1984375 0 0 0 -0.28125,-0.01563 l -1.371094,1.216797 -1.37304702,-1.216797 a 0.1984375,0.1984375 0 0 0 -0.28125,0.01563 0.1984375,0.1984375 0 0 0 0.01758,0.28125 z"' }
  if(mode == "chevron_up") { svgpath = 'd="m 2.1156922,1.2171163 -1.63476603,1.451172 a 0.1984375,0.1984375 0 0 0 -0.01758,0.28125 0.1984375,0.1984375 0 0 0 0.28125,0.01563 l 1.37109403,-1.216797 1.373047,1.216797 a 0.1984375,0.1984375 0 0 0 0.28125,-0.01563 0.1984375,0.1984375 0 0 0 -0.01758,-0.28125 z"' }
  if(mode == "chevron_right") { svgpath = 'd="M 3.0162171,2.1156922 1.5650451,0.48092617 a 0.1984375,0.1984375 0 0 0 -0.28125,-0.01758 0.1984375,0.1984375 0 0 0 -0.01563,0.28125 l 1.216797,1.37109403 -1.216797,1.373047 a 0.1984375,0.1984375 0 0 0 0.01563,0.28125 0.1984375,0.1984375 0 0 0 0.28125,-0.01758 z"' }

  return `
  <svg style="display: inline; width:8px; height: 8px" width="16" height="16" viewBox="0 0 4.2333333 4.2333335" version="1.1">
  <g
    inkscape:label="Layer 1"
    inkscape:groupmode="layer"
    id="layer1">
   <path
      id="path837-8-3"
      style="opacity:0.99;fill:#000000;fill-rule:evenodd;stroke:none;stroke-width:0.680089;stroke-linecap:round;stroke-linejoin:round;paint-order:markers fill stroke;stop-color:#000000"
      inkscape:transform-center-y="-0.49183891" ${svgpath}/>
  </g>
  </svg>`

}


//fillbar.js
Subtle.FillBar = class FillBar{

    constructor(object, parameters){

      this.params = {
        min_val : 0,
        max_val : 1,

        vertical : false,
        color: "primary",
        background_color: "control",
        smooth : false,
        border_radius : 10,
        bar_width : 28,
        font_size : 14,

        show_label : true,
        units : "",

        rounding : 2,

      };

      for(const p in parameters){ this.params[p] = parameters[p]; };

      // =========================================================================
  		// OTHER
  		// =========================================================================
      this.object = (typeof object === "string" ? document.getElementById(object) : object);

      this.value = this.params.min_val;

      // =========================================================================
  		// DRAW CONTROL
  		// =========================================================================
      this.draw = function(){
        let params_color = this.params.color in Subtle.COLORS ? Subtle.COLORS[this.params.color] : this.params.color;
        let params_background_color = this.params.background_color in Subtle.COLORS ? Subtle.COLORS[this.params.background_color] : this.params.background_color;

        let ctr_ = '';

        //
        ctr_ = '<div class="fillbar_parent">';

        //
        let style = 'style="';
        style += 'border-radius:' + this.params.border_radius + 'px;';
        style += (this.params.vertical ? 'width:' : 'height:') + this.params.bar_width + 'px;';
        style += 'background-color:' + params_background_color + ';';
        style += 'font-size:' + this.params.font_size + 'px;';
        style += '"';
        ctr_ += '<div class="' + (this.params.vertical ? 'fillbar_v' : 'fillbar') + '" ' + style + '>';

        //
        style = 'style="';
        style += 'background-color:' + params_color + ';';
        if(this.params.vertical){
            style += 'border-bottom-right-radius:' + this.params.border_radius + 'px;';
            style += 'border-bottom-left-radius:' + this.params.border_radius + 'px;';
            style += 'height:' + (100 * this.value / (this.params.max_val - this.params.min_val)) + '%;';
            style += 'width:' + this.params.bar_width + 'px;';
        } else {
          style += 'border-top-left-radius:' + this.params.border_radius + 'px;';
          style += 'border-bottom-left-radius:' + this.params.border_radius + 'px;';
          style += 'width:' + (100 * this.value / (this.params.max_val - this.params.min_val)) + '%;';
          style += 'height:' + this.params.bar_width + 'px;';
          style += 'line-height:' + this.params.bar_width + 'px;';
        }
        if(this.params.smooth){ style += 'transition: width 0.5s, height 0.5s;' }
        style += '"';
        ctr_ += '<div class="' + (this.params.vertical ? 'fillbar_v' : 'fillbar') + '" ' + style + '>';

        //
        if(this.params.show_label) { ctr_ += Subtle.ROUND(this.value, this.params.rounding) + this.params.units.toString(); }

        //
        ctr_ += '</div></div></div>';

        this.object.innerHTML = ctr_;
    }

    this.update = function(value){

      if(Number.isNaN(this.value)) { this.value = value; this.draw() };
      this.value = value;
      
      let bar = this.object.childNodes[0].childNodes[0].childNodes[0];
      if(this.params.vertical){
        bar.style.height = (100 * this.value / (this.params.max_val - this.params.min_val)) + "%";
      }
      else{
        bar.style.width =  (100 * this.value / (this.params.max_val - this.params.min_val)) + "%";
      }

      if(this.params.show_label){
        bar.innerHTML = Subtle.ROUND(this.value, this.params.rounding) + this.params.units.toString();
      }


    }

    // autoinitilize
    this.draw();
  }
}


//scale.js
Subtle.Scale = class Scale{

    constructor(object, parameters){

    this.params = {
        min_val : 0,
        max_val : 1,

        vertical : false,
        color: "primary",
        background_color: "control",
        indicator_color: "control",
        indicator_size: 10,

        border_radius : 3,
        bar_width : 20,
        inner_padding : 5,
        offset : 10,

        limit_low : NaN,
        limit_high : NaN,
        show_limit_labels : false,
        shade_limits : true,
        ticks : [],

        enable_history : true,
        history_length : 3600, // length in seconds

        rounding : 2,
    };

    for(const p in parameters){ this.params[p] = parameters[p]; };

    // =========================================================================
    // OTHER
    // =========================================================================
    this.object = (typeof object === "string" ? document.getElementById(object) : object);

    this.line_limit_style = { stroke_color: "#000000", stroke_width: 1}
    this.label_style = { font_size:'16px', center_vertically: true };

    this.transform_v = function(v){ return (v - this.params.min_val) / (this.params.max_val - this.params.min_val) }

    this.value = 0.5;
    this.last_time = new Date();

    this.history = [];
    this.history_t = [];

    // =========================================================================
  	// DRAW CONTROL
  	// =========================================================================
    this.draw = function(){
        let params_color = this.params.color in Subtle.COLORS ? Subtle.COLORS[this.params.color] : this.params.color;
        let params_background_color = this.params.background_color in Subtle.COLORS ? Subtle.COLORS[this.params.background_color] : this.params.background_color;
        let params_indicator_color = this.params.indicator_color in Subtle.COLORS ? Subtle.COLORS[this.params.indicator_color] : this.params.indicator_color;


        let height = this.object.offsetHeight;
        let width = this.object.offsetWidth;

        let cx = width*0.5 + this.params.offset;
        let cy = height*0.5;

        if(!this.params.vertical){
            let aux = height;
            height = width;
            width = aux;

            cx = width*0.5 + this.params.offset;
            cy = height*0.5;
        }

        let svg_ = "";


        // draw background rectangle
        let bar_w = this.params.bar_width;
        let bgstyle = {fill_color: params_background_color, stroke_width: 0};
        if(this.params.vertical){
            svg_ += Subtle.svg_rectangle(cx-bar_w*0.5, 0, bar_w, height, bgstyle, this.params.border_radius);
        } else {
            svg_ += Subtle.svg_rectangle(0, cx-bar_w*0.5, height, bar_w, bgstyle, this.params.border_radius);
        }

        // draw limits
        /*let label_style = { anchor: "end", font_size:'16px', center_vertically: true };

        if(!Number.isNaN(this.params.limit_high) && !this.params.shade_limits){
            let limit_y = height*this.transform_v(this.params.limit_high);
            if(this.params.vertical){
                svg_ += Subtle.svg_line(cx-bar_w*0.5, limit_y, cx+bar_w*0.5, limit_y, this.line_limit_style);
                
            } else {
                svg_ += Subtle.svg_line(limit_y, cx-bar_w*0.5, limit_y, cx+bar_w*0.5, this.line_limit_style);
                //svg_ += Subtle.svg_rectangle(limit_y, cx-bar_w*0.5, height-limit_y, bar_w, { fill_color: "#888888", stroke_width: 0 }, this.params.border_radius);
                //svg_ += Subtle.svg_rectangle(limit_y, cx-bar_w*0.5, 10, bar_w, { fill_color: "#888888", stroke_width: 0 }, 0);
            }

            // label
            if(this.params.show_limit_labels){
                if(this.params.vertical){
                    svg_ += Subtle.svg_text(limit_y, cx-bar_w*0.5-3, Subtle.ROUND(this.params.limit_high, this.params.rounding), label_style)
                } else {
                    label_style.anchor = "middle";
                    svg_ += Subtle.svg_text(limit_y, cx-bar_w*0.5-10, Subtle.ROUND(this.params.limit_high, this.params.rounding), label_style)
                }
            }

        }
        if(!Number.isNaN(this.params.limit_low) && !this.params.shade_limits){
            let limit_y = height*this.transform_v(this.params.limit_low);
            if(this.params.vertical){
                svg_ += Subtle.svg_line(cx-bar_w*0.5, limit_y, cx+bar_w*0.5, limit_y, this.line_limit_style);
            } else {
                svg_ += Subtle.svg_line(limit_y, cx-bar_w*0.5, limit_y, cx+bar_w*0.5, this.line_limit_style);
            }

            // label
            if(this.params.show_limit_labels){
                if(this.params.vertical){
                    svg_ += Subtle.svg_text(cx-bar_w*0.5-3, limit_y, Subtle.ROUND(this.params.limit_low, this.params.rounding), label_style)
                } else {
                    label_style.anchor = "middle";
                    svg_ += Subtle.svg_text(limit_y, cx-bar_w*0.5-10, Subtle.ROUND(this.params.limit_low, this.params.rounding), label_style)
                }

            }

        }*/

        ///////
        if(this.params.shade_limits){
            let shade_color = Subtle.COLOR_MODE == "dark" ? "#EDEDED" : "#959595";

            let lh = !Number.isNaN(this.params.limit_high) ? height*this.transform_v(this.params.limit_high) : height;
            let lw = !Number.isNaN(this.params.limit_low) ? height*this.transform_v(this.params.limit_low) : 0;
    
            if(!Number.isNaN(this.params.limit_low) && !Number.isNaN(this.params.limit_high)){
                if(this.params.vertical){
                    svg_ += Subtle.svg_rectangle(cx-bar_w*0.5, lw, bar_w, lh-lw, { fill_color: shade_color, stroke_width: 0 }, 0);
                } else {
                    svg_ += Subtle.svg_rectangle(lw, cx-bar_w*0.5, lh-lw, bar_w, { fill_color: shade_color, stroke_width: 0 }, 0);    
                }
            }
            else if(!Number.isNaN(this.params.limit_high)){
                if(this.params.vertical){
                    svg_ += Subtle.svg_rectangle(cx-bar_w*0.5, lw, bar_w, lh-lw, { fill_color: shade_color, stroke_width: 0 }, this.params.border_radius);
                    svg_ += Subtle.svg_rectangle(cx-bar_w*0.5, (lh+lw)*0.5, bar_w, (lh-lw)*0.5, { fill_color: shade_color, stroke_width: 0 }, 0);    
                } else {
                    svg_ += Subtle.svg_rectangle(lw, cx-bar_w*0.5, lh-lw, bar_w, { fill_color: shade_color, stroke_width: 0 }, this.params.border_radius);
                    svg_ += Subtle.svg_rectangle((lh+lw)*0.5, cx-bar_w*0.5, (lh-lw)*0.5, bar_w, { fill_color: shade_color, stroke_width: 0 }, 0);    
                }
            }
            else if(!Number.isNaN(this.params.limit_low)){
                if(this.params.vertical){
                    svg_ += Subtle.svg_rectangle(cx-bar_w*0.5, lw, bar_w, lh-lw, { fill_color: shade_color, stroke_width: 0 }, this.params.border_radius);
                    svg_ += Subtle.svg_rectangle(cx-bar_w*0.5, lw, bar_w, (lh-lw)*0.5, { fill_color: shade_color, stroke_width: 0 }, 0);
                } else {
                    svg_ += Subtle.svg_rectangle(lw, cx-bar_w*0.5, lh-lw, bar_w, { fill_color: shade_color, stroke_width: 0 }, this.params.border_radius);
                    svg_ += Subtle.svg_rectangle(lw, cx-bar_w*0.5, (lh-lw)*0.5, bar_w, { fill_color: shade_color, stroke_width: 0 }, 0);
                }
            }
        } else {
            if(!Number.isNaN(this.params.limit_low)){
                let limit_y = height*this.transform_v(this.params.limit_low);
                if(this.params.vertical){
                    svg_ += Subtle.svg_line(cx-bar_w*0.5, limit_y, cx+bar_w*0.5, limit_y, this.line_limit_style);
                } else {
                    svg_ += Subtle.svg_line(limit_y, cx-bar_w*0.5, limit_y, cx+bar_w*0.5, this.line_limit_style);
                }
            }

            if(!Number.isNaN(this.params.limit_high) && !this.params.shade_limits){
                let limit_y = height*this.transform_v(this.params.limit_high);
                if(this.params.vertical){
                    svg_ += Subtle.svg_line(cx-bar_w*0.5, limit_y, cx+bar_w*0.5, limit_y, this.line_limit_style);
                } else {
                    svg_ += Subtle.svg_line(limit_y, cx-bar_w*0.5, limit_y, cx+bar_w*0.5, this.line_limit_style);
                }
            }    
        }


        // ticks
        for(const item in this.params.ticks){
            let tick = height * this.transform_v(this.params.ticks[item]);
            if(this.params.vertical){
                svg_ += Subtle.svg_line(cx, tick, cx+bar_w*0.5, tick, this.line_limit_style);
                svg_ += Subtle.svg_text(cx+bar_w*0.5+5, tick, Subtle.ROUND(this.params.ticks[item], this.params.rounding), this.label_style)
            } else {
                this.label_style.anchor = "middle";
                svg_ += Subtle.svg_line(tick, cx, tick, cx+bar_w*0.5, this.line_limit_style);
                svg_ += Subtle.svg_text(tick, cx+bar_w*0.5+10, Subtle.ROUND(this.params.ticks[item], this.params.rounding), this.label_style)
            }
        }


        // draw values retangle
        if(this.history.length > 0){
            let y0 = height * this.transform_v( Math.min(...this.history) );
            let y1 = height * this.transform_v( Math.max(...this.history) );
            let style = {fill_color: params_color, stroke_width: 0};
            if(this.params.vertical){
                svg_ += Subtle.svg_rectangle(cx-bar_w*0.5+this.params.inner_padding, y0, bar_w - this.params.inner_padding*2, y1-y0, style, this.params.border_radius*0.5)
            } else {
                svg_ += Subtle.svg_rectangle(y0, cx-bar_w*0.5+this.params.inner_padding, y1-y0, bar_w - this.params.inner_padding*2, style, this.params.border_radius*0.5)
            }
        }

        // draw indicator (small triangle)
        let y = height * this.transform_v( this.value );
        let path = '<path d=" M ';
        let indicator_dy = this.params.indicator_size * 0.577;
        if(this.params.vertical){
            path += (cx-bar_w*0.5) + ' ' + y;
            path += ' L ' + (cx-bar_w*0.5-this.params.indicator_size) + ' ' + (y-indicator_dy);
            path += ' L ' + (cx-bar_w*0.5-this.params.indicator_size) + ' ' + (y+indicator_dy);
            path += ' Z" ' + Subtle.svg_style({fill_color: params_indicator_color, stroke_width:0 })  + ' />';

        } else {
            path += y + ' ' + (cx-bar_w*0.5);
            path += ' L ' + (y-indicator_dy) + ' ' + (cx-bar_w*0.5-this.params.indicator_size);
            path += ' L ' + (y+indicator_dy) + ' ' + (cx-bar_w*0.5-this.params.indicator_size);
            path += ' Z" ' + Subtle.svg_style({fill_color: params_indicator_color, stroke_width:0 })  + ' />';

        }
        svg_ += path;

        // draw
        if(this.params.vertical){
            let content = Subtle.svg_markup(width, height, svg_);
            this.object.innerHTML = content;
        } else {
            let content = Subtle.svg_markup(height, width, svg_);
            this.object.innerHTML = content;
        }

    }

    // =========================================================================
  	// UPDATE
  	// =========================================================================
    this.update = function(value, time = ""){

        this.value = value;
        if(value < this.params.min_val) this.value = this.params.min_val;
        if(value > this.params.max_val) this.value = this.params.max_val;

        /*
        // calculate elapsed time from the last time this function was called in seconds
        var current_time = new Date();
        if(time != ""){ current_time = new Date(time); }
        var time_diff = (current_time - this.last_time) / 1000;
        this.last_time = current_time;

        //
        let min_i = 0;
        for (var i = 0; i < this.history_t.length; i++) {
            this.history_t[i] = this.history_t[i] + time_diff;
            if(this.history_t[i] > this.params.history_length) { min_i = i+1; }
        }
        this.history.push(value);
        this.history_t.push(0);

        this.history.splice(0, min_i);
        this.history_t.splice(0, min_i);
        */

        // add time and value
        if(time == "") time = Math.floor(new Date() / 1000);
        else time = Math.floor(new Date(time) / 1000);

        this.history.push(value);
        this.history_t.push(time);

        // remove old times
        let t0 = this.params.t0 == "" ?  Math.floor(new Date() / 1000) :  Math.floor(new Date(this.params.t0 / 1000));
        for (var i = this.history_t.length -1; i > 0; i--) {
            if(t0 - this.history_t[i] > this.params.history_length) break;
        }

        this.history.splice(0, i);
        this.history_t.splice(0, i);


        //
        this.draw();

    }

    }
}


//line_plot.js
Subtle.LinePlot = class LinePlot{

  constructor(object, parameters){

    this.params = {
      y_max : 1,
      y_min : -1,

      x_min : 0,
      x_max : 1,
      values_x : [0],

      direction: 'horizontal', // horizontal, vertical

      show_grid : true,
      show_points : true,
      show_ticks : false,
      ticks_major : [1,-1],
      ticks_minor : [0.2,-0.2],

      show_labels : false,
      label_offset : 30,
      labels : [""],

      show_values : false,
      value_offset : 30,

      color : Subtle.COLORS["primary"],
      stroke_width : 2,
      grid_stroke_width : 1,

    };

    for(const p in parameters){ this.params[p] = parameters[p]; };


    // =========================================================================
    // OTHER
    // =========================================================================
    this.object = (typeof object === "string" ? document.getElementById(object) : object);
    this.values_x = this.params.values_x;
    this.values_y = [0];

    // =========================================================================
    // USEFUL FUNCTIONS
    // =========================================================================
    // scaling helper functions
    // transform functions are flexible to allow swapping the x and y axis (vertical or horizontal)
    this.transform_y = function(v, v_max, v_min, v_offset_top, v_offset_bottom){ return v_offset_top + (v_max - v) * (this.object.offsetHeight - v_offset_top - v_offset_bottom) / (v_max - v_min); }
    this.transform_x = function(v, v_max, v_min, v_offset_left, v_offset_right){ return v_offset_left + (this.object.offsetWidth - v_offset_left - v_offset_right) * (v - v_min) / (v_max - v_min); }

    // =========================================================================
    // DRAW CONTROL
    // =========================================================================
    this.draw = function(){

      // get size
      let height = this.object.offsetHeight;
      let width = this.object.offsetWidth;

      let svg_ = "";

      // swap transformation functions if vertical
      var parent = this;
      let t_x = function(x){ return parent.transform_x(x,parent.params.x_max, parent.params.x_min, 10, 10) };
      let t_y = function(y){ return parent.transform_y(y,parent.params.y_max, parent.params.y_min, parent.params.show_values ? parent.params.value_offset : 1, parent.params.show_labels ? parent.params.label_offset : 1) };
      if(this.params.direction == "vertical"){
        t_x = function(x){ return parent.transform_y(x,parent.params.x_max, parent.params.x_min, 10, 10) };
        t_y = function(y){ return parent.transform_x(y,parent.params.y_max, parent.params.y_min, parent.params.show_labels ? parent.params.label_offset : 1, parent.params.show_values ? parent.params.value_offset : 1) };
      }

      // 1) Draw grid
      // ============
      let grid_style = {stroke_color: Subtle.COLORS["control"], stroke_width: this.params.grid_stroke_width};

      for(let i = 0; i < this.values_x.length; i++){
        // draw line from y_min to y_max
        if(this.params.show_grid){
          let x0 = t_x(this.values_x[i]);
          let y0 = t_y(this.params.y_min);
          let x1 = t_x(this.values_x[i]);
          let y1 = t_y(this.params.y_max);

          if(this.params.direction == "horizontal") { svg_ += Subtle.svg_line(x0, y0, x1, y1, grid_style) }
          else { svg_ += Subtle.svg_line(y0, x0, y1, x1, grid_style) }
        }

        if(this.params.show_ticks){
          for(const tick in this.params.ticks_major){
            let x0 = t_x(this.values_x[i])-10;
            let x1 = t_x(this.values_x[i])+10;
            let y = t_y(this.params.ticks_major[tick]);

            if(this.params.direction == "horizontal") { svg_ += Subtle.svg_line(x0, y, x1, y, grid_style); }
            else { svg_ += Subtle.svg_line(y, x0, y, x1, grid_style); }
          }
          for(const tick in this.params.ticks_minor){
            let x0 = t_x(this.values_x[i])-5;
            let x1 = t_x(this.values_x[i])+5;
            let y = t_y(this.params.ticks_minor[tick]);

            if(this.params.direction == "horizontal") { svg_ += Subtle.svg_line(x0, y, x1, y, grid_style); }
            else { svg_ += Subtle.svg_line(y, x0, y, x1, grid_style); }
          }
        }
      }


      // 2) Draw plot
      // ============
      // get styles for svg
      let plot_style = { stroke_color: (this.params.color in Subtle.COLORS ? Subtle.COLORS[this.params.color] : this.params.color), stroke_width: this.params.stroke_width, stroke_linecap: "round" };
      let circle_style = { fill_color: (this.params.color in Subtle.COLORS ? Subtle.COLORS[this.params.color] : this.params.color), stroke_width:0 };

      // start path, draw first point
      let x = t_x(this.values_x[0]);
      let y = t_y(this.values_y[0]);

      let path = "";
      if(this.params.direction == "horizontal") {
        path = '<path d=" M ' + x + ' ' + y + ' ';
        if(this.params.show_points) svg_ += Subtle.svg_circle(x,y,this.params.stroke_width*2,circle_style);
      } else {
        path = '<path d=" M ' + y + ' ' + x + ' ';
        if(this.params.show_points) svg_ += Subtle.svg_circle(y,x,this.params.stroke_width*2,circle_style);
      }

      // draw path point by point
      for(let i = 1; i < this.values_x.length; i++){
        let x = t_x(this.values_x[i]);
        let y = t_y(this.values_y[i]);

        if(this.params.direction == "horizontal") {
          path += 'L ' + x + ' ' + y + ' ';
          if(this.params.show_points) svg_ += Subtle.svg_circle(x,y,this.params.stroke_width*2,circle_style);
        } else {
          path += 'L ' + y + ' ' + x + ' ';
          if(this.params.show_points) svg_ += Subtle.svg_circle(y,x,this.params.stroke_width*2,circle_style);
        }

      }

      // add path to svg
      svg_ += path + '" ' + Subtle.svg_style(plot_style) + ' />';

      // 3) Draw labels
      // ==============
      if(this.params.show_labels){
        for(const i in this.params.labels){
          let x = t_x(this.values_x[i]);
          let y = t_y(this.params.y_min);

          if(this.params.direction == "horizontal") {
            svg_ += Subtle.svg_text(x,y+10,this.params.labels[i],{center_vertically : true, anchor: "middle", font_size:"16px" })
          } else {
            svg_ += Subtle.svg_text(y-10,x,this.params.labels[i],{center_vertically : true, anchor: "end", font_size:"16px" })
          }
        }
      }

      // 4) Draw values
      // ==============
      if(this.params.show_values){
        for(const i in this.values_x){
          let x = t_x(this.values_x[i]);
          let y = t_y(this.params.y_max);

          if(this.params.direction == "horizontal") {
            svg_ += Subtle.svg_text(x,y-10,this.values_y[i],{center_vertically : true, anchor: "middle", font_size:"16px" })
          } else {
            svg_ += Subtle.svg_text(y+10,x,this.values_y[i],{center_vertically : true, anchor: "start", font_size:"16px" })
          }
        }
      }


      // 5) Draw control
      // ===============
      let content = Subtle.svg_markup(width, height, svg_);


      this.object.innerHTML = content;

    }

    // =========================================================================
    // UPDATE CONTROL
    // =========================================================================
    this.update = function(values, index = -1){

      if(index == -1){
        this.values_y = values;
      }
      else{
        this.values_y[index = values];
      }

      this.draw();


    }
  }

}


//table.js
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


//web_plot.js
Subtle.WebPlot = class WebPlot{

  constructor(object, parameters){

    this.params = {
      labels : ["A","B","C","D","E","F"],
      max_value : 1,
      min_value : 0,

      limit_high : NaN,
      limit_low : NaN,

      show_grid : true,
      show_tooltips : true,

      endpoint_size : 5,
      padding : 50,

      color : "primary",
      opacity : 0.5,
    };

    for(const p in parameters){ this.params[p] = parameters[p]; };

    // =========================================================================
    // OTHER
    // =========================================================================
    this.object = (typeof object === "string" ? document.getElementById(object) : object);
    this.values = [0,0,0,0,0,0];


    // =========================================================================
		// USEFUL FUNCTIONS
		// =========================================================================
    // transform_val: receives a value r and a position p and returns the
    // coordinates (x,y) of the point in the svg canvas

    this.transform_val = function(r, p){
      let R = this.params.max_value - this.params.min_value;
      let H = this.object.offsetHeight;
      let W = this.object.offsetWidth;

      r = (r / R) * (((H > W ? W : H) - this.params.padding) * 0.5);

      let alpha = 2 * Math.PI * p / this.params.labels.length;
      let x = 0.5*W + r * Math.sin(alpha);
      let y = 0.5*H - r * Math.cos(alpha);

      return [x,y,r];
    }


    // =========================================================================
    // DRAW CONTROL
    // =========================================================================
    this.draw = function(){
      let params_color = this.params.color in Subtle.COLORS ? Subtle.COLORS[this.params.color] : this.params.color;

      let height = this.object.offsetHeight;
      let width = this.object.offsetWidth;

      let svg_ = "";

      // get center
      let x_c = width * 0.5;
      let y_c = height * 0.5;



      // 1) Draw limits
      // ==============

      if(!Number.isNaN(this.params.limit_high)){
        let r = this.transform_val(this.params.limit_high, 0)[2];
        svg_ += Subtle.svg_circle(x_c, y_c, r, {stroke_width: 1, stroke_color: Subtle.COLORS["control"]})
      }
      if(!Number.isNaN(this.params.limit_low)){
        let r = this.transform_val(this.params.limit_low, 0)[2];
        svg_ += Subtle.svg_circle(x_c, y_c, r, {stroke_width: 1, stroke_color: Subtle.COLORS["control"]})
      }


      // 2) Draw grid (spikes)
      // =====================
      if(this.params.show_grid){

        let line_style = {stroke_color: Subtle.COLORS["control"]};
        for(let i = 0; i < this.params.labels.length; i++){
          let s_ = this.transform_val(this.params.max_value*1,i);
          svg_ += Subtle.svg_line(x_c,y_c,s_[0],s_[1],line_style);

          if(this.params.endpoint_size > 0){
            let tooltip_id = 'custom_label_for_' + this.object.id + '_id_' + this.params.labels[i];
            svg_ += '<g id="' + tooltip_id + '">' + Subtle.svg_circle(s_[0],s_[1],this.params.endpoint_size,{fill_color: Subtle.COLORS["control"], stroke_width: 0}) + '</g>';
          }


        }
      }


      // 3) Draw values
      // ==============
      let plot_style = { stroke_color: params_color, stroke_linecap: "round", fill_color: params_color, opacity: this.params.opacity };

      // first value
      let s_ = this.transform_val(this.values[0],0);
      let path = '<path d=" M ' + s_[0] + ' ' + s_[1] + ' ';

      // other values
      for(let i = 1; i < this.params.labels.length; i++){
        let s_ = this.transform_val(this.values[i], i);

        path += 'L ' + s_[0] + ' ' + s_[1] + ' ';

      }

      svg_ += path + ' Z" ' + Subtle.svg_style(plot_style) + ' />';


      // 4) Draw control
      // ===============
      let content = Subtle.svg_markup(width, height, svg_);

      this.object.innerHTML = content;

      if(this.params.show_tooltips){
        for(let i = 0; i < this.params.labels.length; i++){
          let tooltip_id = 'custom_label_for_' + this.object.id + '_id_' + this.params.labels[i];
          if(typeof tippy !== "undefined") tippy('#' + tooltip_id, {content:this.params.labels[i]})
          else console.log("Tooltip error: tippy.js not included");
        }
      }

    }

    // =========================================================================
    // UPDATE CONTROL
    // =========================================================================
    this.update = function(values, index = -1){

      if(index < 0){
        this.values = values;
      }
      else if(index < this.params.labels.length){
        this.values[index] = values;
      }

      this.draw();

    }
  }

}


//time_plot_multi.js
Subtle.MultiTimePlot = class MultiTimePlot{

  constructor(object, parameters = {}){

    this.params = {
      colors : Subtle.COLOR_PALETTES["main"],
      labels : ["A","B","C"],
    };

    for(const p in parameters){ this.params[p] = parameters[p] }

    this.object = (typeof object === "string" ? document.getElementById(object) : object);

    this.time_plots = {};

    ////////////////////

    // Create a TimePlot for each label
    for(const l in this.params.labels){
      let label = this.params.labels[l]
      this.time_plots[label] = new Subtle.TimePlot(object, this.params);

      // set color
      this.time_plots[label].params.color = this.params.colors[l];
    }

    // Draw

    this.draw = function(){
      let height = this.object.offsetHeight;
      let width = this.object.offsetWidth;

      let svg_ = "";
      let plt_ = "";

      // get svg context from first plot
      svg_ = this.time_plots[this.params.labels[0]].draw_get_context_svg(width, height);

      // draw all plots
      for(const l in this.params.labels){
        plt_ += this.time_plots[this.params.labels[l]].draw_get_main_svg(width, height);
      }

      // draw everything to control
      let content = Subtle.svg_markup(width, height, svg_ + plt_);
      //if(content.includes("NaN")) return;
      this.object.innerHTML = content;
    }

    this.update = function(values, time = ""){
      // values is a dict {label: value, ...}, where label is
      // the label as specificed in this.params.labels

      for(const l in this.params.labels){
        let label = this.params.labels[l];

        let value = this.time_plots[label].last_value;
        if(label in values){
          value = values[label];
        }

        this.time_plots[label].update(value, time);
      }

      this.draw();
    }

  }

}


//map_view.js
Subtle.MapView = class MapView{

  constructor(object, parameters = {}){
    // =========================================================================
		// PARAMETERES
		// =========================================================================

    this.params = {
      provider: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', // get from http://leaflet-extras.github.io/leaflet-providers/preview/
      leaflet_options: { attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'},

      lat: 0,
      lon: 0,
      zoom: 2, // zoom number from 2 to 20

      correct_icon_x : 6,
      correct_icon_y : 7,

      show_layer_control : false,

    };

    for(const p in parameters){ this.params[p] = parameters[p]; };

    // =========================================================================
		// OTHER
		// =========================================================================
    this.object = (typeof object === "string" ? document.getElementById(object) : object);
    this.map = L.map(this.object.id).setView([this.params.lat, this.params.lon], this.params.zoom);
    this.control_layers = L.control.layers();

    this.markers = {};
    this.layer_groups = {};


    this.get_icon_html = function(marker, icon, icon_left, icon_top){
      let html = '';
      html += '<div style="transform: translate(' + this.params.correct_icon_x + 'px,' + this.params.correct_icon_y + 'px)">';
      html += '<div style="font-size:24px;';
      html += 'margin-left:-' + icon_left + 'px;';
      html += 'margin-top:-' + icon_top + 'px;';
      //html += 'transform: rotate(' + this.markers[marker]["angle"] + 'deg);';
      html += 'transform-origin: ' + icon_left + 'px ' + icon_top + 'px;'
      html += '" id="' + this.object.id + "_" + marker + '" ';
      html += '>';
      html += icon;
      html += '</div>';
      html += '</div>';
      return html;
    }

    this.update_layer_groups = function(){

      this.control_layers.remove();
      this.control_layers = L.control.layers();
      // this.layer_groups = {};


      for(const m in this.markers){
        let marker = this.markers[m];

        if(!(marker.group in this.layer_groups)){
          this.layer_groups[marker.group] = [];
        }

        this.layer_groups[marker.group].push(marker.m);
      }

      for(const group in this.layer_groups){
        var Lay = L.layerGroup(this.layer_groups[group]);
        Lay.addTo(this.map);
        this.control_layers.addOverlay(Lay, group);
      }

      if(this.params.show_layer_control){
        this.control_layers.addTo(this.map);
      }
    }

		// =========================================================================
		// DRAW CONTROL
		// =========================================================================
    this.draw = function(){
      this.map.addLayer(new L.TileLayer(this.params.provider, this.params.leaflet_options));

      if(this.params.show_layer_control){
        this.control_layers.addTo(this.map);

        var ths = this;
        this.map.on('overlayadd', function(){
          for(const m in ths.markers){
            ths.update_marker(m,{tooltip:ths.markers[m].tooltip});
          }
        });
      }
    }

    // =========================================================================
		// AUTO INIT
    // =========================================================================
    this.draw();

    // =========================================================================
		// UPDATE: MARKERS
    // =========================================================================
    this.update_marker = function(marker, properties = {}){

      // if marker is new, create
      if(!(marker in this.markers)){
        this.markers[marker] = {"m" : new L.Marker([0,0])}

        this.markers[marker]["m"].addTo(this.map);
        this.markers[marker]["group"] = "default";
        this.markers[marker]["rotation"] = 0;
        this.markers[marker]["position"] = [0,0];
        this.markers[marker]["icon"] = "";
        this.markers[marker]["icon_left"] = 12;
        this.markers[marker]["icon_top"] = 12;
        this.markers[marker]["visible"] = true;
        this.markers[marker]["tooltip"] = "";
        this.markers[marker]["onclick"] = function(){};
      }

      // update marker properties
      for(const p in properties){ this.markers[marker][p] = properties[p]; }


      // update position
      if("position" in properties){
        var newLatLng = new L.LatLng(properties["position"][0], properties["position"][1]);
        this.markers[marker]["m"].setLatLng(newLatLng);
      }

      // update icon and tooltip
      if("icon" in properties || "icon_left" in properties || "icon_top" in properties || "icon_size" in properties || "visible" in properties || "tooltip" in properties ){

        // icon
        if("icon" in properties || "icon_left" in properties || "icon_top" in properties){
          this.markers[marker]["m"].setIcon(new L.DivIcon({
            className: 'my-div-icon',
            html: this.markers[marker]["visibility"] ? "" : this.get_icon_html(marker, this.markers[marker]["icon"], this.markers[marker]["icon_left"], this.markers[marker]["icon_top"]),
          }));
        }


        // tooltip
        if(this.markers[marker]["tooltip"] != ""){
          if(typeof tippy !== "undefined") tippy('#' + this.object.id + "_" + marker, {content: this.markers[marker]["tooltip"], allowHTML: true})
          else console.log("Tooltip error: tippy.js not included");
        }
      }

      // update angle
      if("rotation" in properties){
        document.getElementById(this.object.id + "_" + marker).style.transform = ("rotate(" + properties["rotation"] + "deg)")
      }

      // update onclick
      if("onclick" in properties){
        this.markers[marker]["m"].on('click', properties["onclick"])
      }

      // update groups
      if("group" in properties){
        this.update_layer_groups();
      }

    }

    // =========================================================================
		// UPDATE: TRACE
    // =========================================================================
    this.update_trace = function(trace, properties){
      // if trace is new, create
      if(!(trace in this.markers)){
        this.markers[trace] = {"m" : new L.polyline([[0,0],[10,10]])}

        this.markers[trace]["m"].addTo(this.map);
        this.markers[trace]["group"] = "default";
        this.markers[trace]["points"] = [];
        this.markers[trace]["color"] = "#3388ff";
        this.markers[trace]["width"] = 2;
        this.markers[trace]["visible"] = true;
        this.markers[trace]["onclick"] = function(){};
        this.markers[trace]["onhover"] = function(){};
      }

      // update trace properties
      for(const p in properties){ this.markers[trace][p] = properties[p]; }

      // update points
      if("points" in properties){
        this.markers[trace]["m"].setLatLngs(properties["points"]);
      }

      // update color and other styles
      if("color" in properties){ this.markers[trace]["m"].setStyle({color: properties["color"]}) }
      if("width" in properties){ this.markers[trace]["m"].setStyle({weight: properties["weight"]}) }

      // update onclick
      if("onclick" in properties){
        this.markers[trace]["m"].on('click', properties["onclick"]);
      }

      // update onhover
      if("onhover" in properties){
        this.markers[trace]["m"].on('mouseover', properties["onhover"]);
      }

      // update groups
      if("group" in properties){
        this.update_layer_groups();
      }

    }

    // =========================================================================
		// UPDATE: CIRCLE
    // =========================================================================
    this.update_circle = function(circle, properties){
      // if circle is new, create
      if(!(circle in this.markers)){
        this.markers[circle] = {"m" : new L.circle([0,0])}

        this.markers[circle]["m"].addTo(this.map);
        this.markers[circle]["group"] = "default";
        this.markers[circle]["radius"] = 0;
        this.markers[circle]["position"] = [0,0];
        this.markers[circle]["color"] = "#3388ff";
        this.markers[circle]["opacity"] = 0.5;
        this.markers[circle]["border_color"] = "#3388ff";
        this.markers[circle]["border_width"] = 1;
        this.markers[circle]["visible"] = true;
        this.markers[circle]["onclick"] = function(){};
        this.markers[circle]["onhover"] = function(){};
      }

      // update circle properties
      for(const p in properties){ this.markers[circle][p] = properties[p]; }

      // update position
      if("position" in properties){
        var newLatLng = new L.LatLng(properties["position"][0], properties["position"][1]);
        this.markers[circle]["m"].setLatLng(newLatLng);
      }

      // update radius
      if("radius" in properties){
        this.markers[circle]["m"].setRadius(properties["radius"]);
      }

      // update color and other styles
      if("color" in properties){ this.markers[circle]["m"].setStyle({fillColor: properties["color"]}) }
      if("opacity" in properties){ this.markers[circle]["m"].setStyle({fillOpacity: properties["opacity"]}) }
      if("border_color" in properties){ this.markers[circle]["m"].setStyle({color: properties["border_color"]}) }
      if("border_width" in properties){ this.markers[circle]["m"].setStyle({weight: properties["border_width"]}) }

      // update onclick
      if("onclick" in properties){
        this.markers[circle]["m"].on('click', properties["onclick"]);
      }

      // update onhover
      if("onhover" in properties){
        this.markers[circle]["m"].on('mouseover', properties["onhover"]);
      }

      // update groups
      if("group" in properties){
        this.update_layer_groups();
      }

    }

    // =========================================================================
		// UPDATE: POLYGON
    // =========================================================================
    this.update_polygon = function(polygon, properties){
      // if polygon is new, create
      if(!(polygon in this.markers)){
        this.markers[polygon] = {"m" : new L.polygon([[0,0],[10,10]])}

        this.markers[polygon]["m"].addTo(this.map);
        this.markers[polygon]["group"] = "default";
        this.markers[polygon]["points"] = [];
        this.markers[polygon]["color"] = "#3388ff";
        this.markers[polygon]["opacity"] = 0.5;
        this.markers[polygon]["border_color"] = "#3388ff";
        this.markers[polygon]["border_width"] = 1;
        this.markers[polygon]["visible"] = true;
        this.markers[polygon]["onclick"] = function(){};
        this.markers[polygon]["onhover"] = function(){};
      }

      // update polygon properties
      for(const p in properties){ this.markers[polygon][p] = properties[p]; }

      // update points
      if("points" in properties){
        this.markers[polygon]["m"].setLatLngs(properties["points"]);
      }

      // update color and other styles
      if("color" in properties){ this.markers[polygon]["m"].setStyle({fillColor: properties["color"]}) }
      if("opacity" in properties){ this.markers[polygon]["m"].setStyle({fillOpacity: properties["opacity"]}) }
      if("border_color" in properties){ this.markers[polygon]["m"].setStyle({color: properties["border_color"]}) }
      if("border_width" in properties){ this.markers[polygon]["m"].setStyle({weight: properties["border_width"]}) }

      // update onclick
      if("onclick" in properties){
        this.markers[polygon]["m"].on('click', properties["onclick"]);
      }

      // update onhover
      if("onhover" in properties){
        this.markers[polygon]["m"].on('mouseover', properties["onhover"]);
      }

      // update groups
      if("group" in properties){
        this.update_layer_groups();
      }
    }


  }

}


//gauge.js
Subtle.Gauge = class Gauge {

  constructor(object, parameters){

    // =========================================================================
		// PARAMETERES
		// =========================================================================
    this.params = {
      max_val : 1,
      min_val : 0,
      units : "",
      stroke_width : 10,
      color : "primary",
      background_color : "control",
      hand_color : "control",
      inner_padding : 0,

      show_label : true,
      show_hand : true,
      linecap: "round",
      opening_angle: 0.5,

      override_label : "",

      dial_offset : 0,
      background_fill : "",
      font_size: 36,
      rounding : 2,

      //
      limit_low : NaN,
      limit_high : NaN,
    };

    for(const p in parameters){ this.params[p] = parameters[p]; };

    // =========================================================================
		// OTHER
		// =========================================================================
    this.object = (typeof object === "string" ? document.getElementById(object) : object);

    this.current_value = (this.params.max_val + this.params.min_val) * 0.5;

    // use this for advanced dial
    this.forced_min_value = NaN;
    this.forced_max_value = NaN;

		// ===============================================================================
		// DRAW CONTROL
		// ===============================================================================

		this.draw = function(){
      let params_color = this.params.color in Subtle.COLORS ? Subtle.COLORS[this.params.color] : this.params.color;
      let params_background_color = this.params.background_color in Subtle.COLORS ? Subtle.COLORS[this.params.background_color] : this.params.background_color;
      let params_hand_color = this.params.hand_color in Subtle.COLORS ? Subtle.COLORS[this.params.hand_color] : this.params.hand_color;

      var height = this.object.offsetHeight;
      var width = this.object.offsetWidth;

			let svg_ = '';
      const pi = Math.PI;

			// 1) draw control
			// ===============
			let cx = width * 0.5;
			let cy = height * 0.5;
			let ry = (width > height ? (height * 0.5) : (width * 0.5)) - this.params.stroke_width;
			let rx = ry;
      //let s = (this.params.opening_angle > 28.6478 ? 28.6478 : this.params.opening_angle) * pi / 180;
      let s = (this.params.opening_angle == 1 ? 0.99999 : this.params.opening_angle) * 0.5;
      let t1 = pi * (1 - s);
			let delt1 = 3*pi - 2*t1;
      let delt2 = (3*pi - 2*t1) * (this.current_value - this.params.min_val) / (this.params.max_val - this.params.min_val);
      let phi = 0;

      // angles for limits
      let delt_low = (!Number.isNaN(this.params.limit_low)) ? ((3*pi - 2*t1) * (this.params.limit_low - this.params.min_val) / (this.params.max_val - this.params.min_val) + t1) : t1;
      let delt_high= (!Number.isNaN(this.params.limit_high)) ? ((3*pi - 2*t1) * (this.params.limit_high - this.params.min_val) / (this.params.max_val - this.params.min_val) + t1) : delt1+t1;

      t1 = t1 + this.params.dial_offset;

      // styles for background and main arc
      let style_bg = { stroke_color: params_background_color, stroke_width : this.params.stroke_width, stroke_linecap: this.params.linecap }
      let style_mn = { stroke_color: params_color, stroke_width : this.params.stroke_width-this.params.inner_padding*2, stroke_linecap: this.params.linecap }
      // styles for limits
      let shade_color = Subtle.COLOR_MODE == "dark" ? "#EDEDED" : "#959595";
      let style_l0 = { stroke_color: shade_color, stroke_width : this.params.stroke_width, stroke_linecap: "butt" }
      let style_l1 = { stroke_color: shade_color, stroke_width : this.params.stroke_width, stroke_linecap: "round" }

      // circle background
      if(this.params.background_fill != ""){
        svg_ += Subtle.svg_ellipsearc(cx,cy,rx-this.params.stroke_width*0.7,ry-this.params.stroke_width*0.7,t1,delt1,phi,{fill_color:this.params.background_fill, stroke_width:0 });
      }

      // background arc
      svg_ += Subtle.svg_ellipsearc(cx,cy,rx,ry,t1,delt1,phi,style_bg);

      // limits
      if(this.params.dial_offset == 0){
        if(!Number.isNaN(this.params.limit_low) && !Number.isNaN(this.params.limit_high)){
          svg_ += Subtle.svg_ellipsearc(cx,cy,rx,ry,delt_low,delt_high-delt_low,phi,style_l0);
        }
        else if(!Number.isNaN(this.params.limit_high)){
          svg_ += Subtle.svg_ellipsearc(cx,cy,rx,ry,delt_low,delt_high-delt_low,phi,style_l0);
          svg_ += Subtle.svg_ellipsearc(cx,cy,rx,ry,delt_low,(delt_high-delt_low)*0.5,phi,style_l1);
        }
        else if(!Number.isNaN(this.params.limit_low)){
          svg_ += Subtle.svg_ellipsearc(cx,cy,rx,ry,delt_low,delt_high-delt_low,phi,style_l0);
          svg_ += Subtle.svg_ellipsearc(cx,cy,rx,ry,delt_low+(delt_high-delt_low)*0.5,(delt_high-delt_low)*0.5,phi,style_l1);
        }
      }

      // main arc
      if(!Number.isNaN(this.forced_min_value) && !Number.isNaN(this.forced_max_value)){
        let forced_min = (3*pi - 2*t1) * (this.forced_min_value - this.params.min_val) / (this.params.max_val - this.params.min_val);
        let forced_max = (3*pi - 2*t1) * (this.forced_max_value- this.params.min_val) / (this.params.max_val - this.params.min_val);
        svg_ += Subtle.svg_ellipsearc(cx,cy,rx,ry,t1+forced_min,forced_max-forced_min,phi,style_mn);
      } else {
        svg_ += Subtle.svg_ellipsearc(cx,cy,rx,ry,t1,delt2,phi,style_mn);
      }


			// 2) draw value inside
			// ====================
      if(this.params.show_label)
      {
        // get style
        let text_style = { center_vertically: true, anchor: 'middle' };
        if(this.params.font_size > 0) text_style.font_size = this.params.font_size + "px";
        let unit_style = {center_vertically: true, color: "gray",anchor: 'middle', font_size: "24px"};

        // set label text to value+units or overriden label text
        let label = Subtle.ROUND(this.current_value, this.params.rounding);
        if(this.params.override_label != "") { label = this.params.override_label }

        // if hand is visible, display text on bottom, else display on center
        if(this.params.show_hand){
          svg_ += Subtle.svg_text(cx, cy+rx*0.9, label, text_style);
        }else{

          if(this.params.units != ""){
            svg_ += Subtle.svg_text(cx, cy - 10, label, text_style);
            svg_ += Subtle.svg_text(cx, cy + 20, this.params.units, unit_style )
          } else {
            svg_ += Subtle.svg_text(cx, cy, label, text_style);
          }

        }

      }

      // 3) draw hand
			// ============
      if(this.params.show_hand){
        svg_ += Subtle.svg_dial_hand(cx, cy, rx, (delt2-0.5*delt1)*180/pi, params_hand_color);
      }


			// return
			this.object.innerHTML = Subtle.svg_markup(width, height, svg_);
		}

    this.update = function(value){
      this.current_value = value;
      if(value > this.params.max_val) this.current_value = this.params.max_val;
  		if(value < this.params.min_val) this.current_value = this.params.min_val;
  		this.draw();
    }

	}
}


//logger.js
Subtle.Logger = class Logger{

  constructor(object, parameters){

    this.params = {
      show_stems : true,
      show_timestamp : false,
      max_length : 100,
    };

    for(const p in parameters){ this.params[p] = parameters[p]; };

    // =========================================================================
    // OTHER
    // =========================================================================
    this.object = (typeof object === "string" ? document.getElementById(object) : object);
    this.object.style.overflowY = "scroll";

    this.records = [];

    // =========================================================================
    // DRAW CONTROL
    // =========================================================================
    this.draw = function(){
      let ctr_ = '<table class="logger">';

      for(const r in this.records){

        // define color
        let color = this.records[r].color;
        if(color in Subtle.COLORS) color = Subtle.COLORS[color];
        let bg = 'background-color:' + color + ';';

        // define icon
        let ic = '<img src="' + this.records[r].icon + '" />';
        if(["info","warning","error"].includes(this.records[r].icon)) ic = Subtle.svg_icon(this.records[r].icon, "#FFFFFF");

        ctr_ += '<tr>';

        ctr_ += '<td style="width:30px">';
        ctr_ += '<div class="logger-item" style="' + bg + '"><div style="margin:2px">' + ic + '</div></div>';
        ctr_ += '</td>';
        ctr_ += '<td style="padding-left:10px">';
        ctr_ += '<b>' + this.records[r].title + '</b>';
        ctr_ += '</td>';

        ctr_ += '</tr>';
        ctr_ += '<tr>';

        ctr_ += '<td style="width:30px">';

        if(this.params.show_stems && r != this.records.length-1){
          ctr_ += '<div class="logger-stem" style="background-color:' + Subtle.COLORS["control"] + '"></div>';
        }

        ctr_ += '</td>';

        ctr_ += '<td style="padding-left:10px">';
        ctr_ += '<div style="padding-bottom:15px; padding-top:2px; font-size:14px">' + this.records[r].text;
        if(this.params.show_timestamp && this.records[r].timestamp != ""){
          ctr_ += '<div style="padding-top:4px; font-size:12px">' + this.records[r].timestamp + '</div>';
        }
        ctr_ += '</div>';
        ctr_ += '</td>';

        ctr_ += '</tr>';

      }

      ctr_ += '</table>';
      this.object.innerHTML = ctr_;
    }

    this.update = function(icon, title, text, timestamp = "", color = ""){
      if(icon in Subtle.COLORS && color == ""){ color = Subtle.COLORS[icon]; }

      this.records.splice(0, 0, {icon: icon, title: title, text: text, timestamp: timestamp, color:color });

      while(this.records.length > this.params.max_length){ this.records.pop() }

      this.draw()
    }

    this.clear = function(){
      this.records = [];
      this.draw();
    }

  }

}


