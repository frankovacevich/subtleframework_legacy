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
