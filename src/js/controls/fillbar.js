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
