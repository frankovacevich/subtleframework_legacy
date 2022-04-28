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
