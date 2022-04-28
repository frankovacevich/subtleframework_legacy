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
