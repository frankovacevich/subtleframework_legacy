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
