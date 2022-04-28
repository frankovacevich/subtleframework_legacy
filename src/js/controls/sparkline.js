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
