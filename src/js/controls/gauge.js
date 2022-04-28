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
