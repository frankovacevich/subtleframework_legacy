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
