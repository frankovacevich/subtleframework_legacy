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
