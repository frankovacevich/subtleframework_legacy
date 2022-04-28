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
