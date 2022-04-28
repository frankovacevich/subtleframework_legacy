Subtle.Scale = class Scale{

    constructor(object, parameters){

    this.params = {
        min_val : 0,
        max_val : 1,

        vertical : false,
        color: "primary",
        background_color: "control",
        indicator_color: "control",
        indicator_size: 10,

        border_radius : 3,
        bar_width : 20,
        inner_padding : 5,
        offset : 10,

        limit_low : NaN,
        limit_high : NaN,
        show_limit_labels : false,
        shade_limits : true,
        ticks : [],

        enable_history : true,
        history_length : 3600, // length in seconds

        rounding : 2,
    };

    for(const p in parameters){ this.params[p] = parameters[p]; };

    // =========================================================================
    // OTHER
    // =========================================================================
    this.object = (typeof object === "string" ? document.getElementById(object) : object);

    this.line_limit_style = { stroke_color: "#000000", stroke_width: 1}
    this.label_style = { font_size:'16px', center_vertically: true };

    this.transform_v = function(v){ return (v - this.params.min_val) / (this.params.max_val - this.params.min_val) }

    this.value = 0.5;
    this.last_time = new Date();

    this.history = [];
    this.history_t = [];

    // =========================================================================
  	// DRAW CONTROL
  	// =========================================================================
    this.draw = function(){
        let params_color = this.params.color in Subtle.COLORS ? Subtle.COLORS[this.params.color] : this.params.color;
        let params_background_color = this.params.background_color in Subtle.COLORS ? Subtle.COLORS[this.params.background_color] : this.params.background_color;
        let params_indicator_color = this.params.indicator_color in Subtle.COLORS ? Subtle.COLORS[this.params.indicator_color] : this.params.indicator_color;


        let height = this.object.offsetHeight;
        let width = this.object.offsetWidth;

        let cx = width*0.5 + this.params.offset;
        let cy = height*0.5;

        if(!this.params.vertical){
            let aux = height;
            height = width;
            width = aux;

            cx = width*0.5 + this.params.offset;
            cy = height*0.5;
        }

        let svg_ = "";


        // draw background rectangle
        let bar_w = this.params.bar_width;
        let bgstyle = {fill_color: params_background_color, stroke_width: 0};
        if(this.params.vertical){
            svg_ += Subtle.svg_rectangle(cx-bar_w*0.5, 0, bar_w, height, bgstyle, this.params.border_radius);
        } else {
            svg_ += Subtle.svg_rectangle(0, cx-bar_w*0.5, height, bar_w, bgstyle, this.params.border_radius);
        }

        // draw limits
        /*let label_style = { anchor: "end", font_size:'16px', center_vertically: true };

        if(!Number.isNaN(this.params.limit_high) && !this.params.shade_limits){
            let limit_y = height*this.transform_v(this.params.limit_high);
            if(this.params.vertical){
                svg_ += Subtle.svg_line(cx-bar_w*0.5, limit_y, cx+bar_w*0.5, limit_y, this.line_limit_style);
                
            } else {
                svg_ += Subtle.svg_line(limit_y, cx-bar_w*0.5, limit_y, cx+bar_w*0.5, this.line_limit_style);
                //svg_ += Subtle.svg_rectangle(limit_y, cx-bar_w*0.5, height-limit_y, bar_w, { fill_color: "#888888", stroke_width: 0 }, this.params.border_radius);
                //svg_ += Subtle.svg_rectangle(limit_y, cx-bar_w*0.5, 10, bar_w, { fill_color: "#888888", stroke_width: 0 }, 0);
            }

            // label
            if(this.params.show_limit_labels){
                if(this.params.vertical){
                    svg_ += Subtle.svg_text(limit_y, cx-bar_w*0.5-3, Subtle.ROUND(this.params.limit_high, this.params.rounding), label_style)
                } else {
                    label_style.anchor = "middle";
                    svg_ += Subtle.svg_text(limit_y, cx-bar_w*0.5-10, Subtle.ROUND(this.params.limit_high, this.params.rounding), label_style)
                }
            }

        }
        if(!Number.isNaN(this.params.limit_low) && !this.params.shade_limits){
            let limit_y = height*this.transform_v(this.params.limit_low);
            if(this.params.vertical){
                svg_ += Subtle.svg_line(cx-bar_w*0.5, limit_y, cx+bar_w*0.5, limit_y, this.line_limit_style);
            } else {
                svg_ += Subtle.svg_line(limit_y, cx-bar_w*0.5, limit_y, cx+bar_w*0.5, this.line_limit_style);
            }

            // label
            if(this.params.show_limit_labels){
                if(this.params.vertical){
                    svg_ += Subtle.svg_text(cx-bar_w*0.5-3, limit_y, Subtle.ROUND(this.params.limit_low, this.params.rounding), label_style)
                } else {
                    label_style.anchor = "middle";
                    svg_ += Subtle.svg_text(limit_y, cx-bar_w*0.5-10, Subtle.ROUND(this.params.limit_low, this.params.rounding), label_style)
                }

            }

        }*/

        ///////
        if(this.params.shade_limits){
            let shade_color = Subtle.COLOR_MODE == "dark" ? "#EDEDED" : "#959595";

            let lh = !Number.isNaN(this.params.limit_high) ? height*this.transform_v(this.params.limit_high) : height;
            let lw = !Number.isNaN(this.params.limit_low) ? height*this.transform_v(this.params.limit_low) : 0;
    
            if(!Number.isNaN(this.params.limit_low) && !Number.isNaN(this.params.limit_high)){
                if(this.params.vertical){
                    svg_ += Subtle.svg_rectangle(cx-bar_w*0.5, lw, bar_w, lh-lw, { fill_color: shade_color, stroke_width: 0 }, 0);
                } else {
                    svg_ += Subtle.svg_rectangle(lw, cx-bar_w*0.5, lh-lw, bar_w, { fill_color: shade_color, stroke_width: 0 }, 0);    
                }
            }
            else if(!Number.isNaN(this.params.limit_high)){
                if(this.params.vertical){
                    svg_ += Subtle.svg_rectangle(cx-bar_w*0.5, lw, bar_w, lh-lw, { fill_color: shade_color, stroke_width: 0 }, this.params.border_radius);
                    svg_ += Subtle.svg_rectangle(cx-bar_w*0.5, (lh+lw)*0.5, bar_w, (lh-lw)*0.5, { fill_color: shade_color, stroke_width: 0 }, 0);    
                } else {
                    svg_ += Subtle.svg_rectangle(lw, cx-bar_w*0.5, lh-lw, bar_w, { fill_color: shade_color, stroke_width: 0 }, this.params.border_radius);
                    svg_ += Subtle.svg_rectangle((lh+lw)*0.5, cx-bar_w*0.5, (lh-lw)*0.5, bar_w, { fill_color: shade_color, stroke_width: 0 }, 0);    
                }
            }
            else if(!Number.isNaN(this.params.limit_low)){
                if(this.params.vertical){
                    svg_ += Subtle.svg_rectangle(cx-bar_w*0.5, lw, bar_w, lh-lw, { fill_color: shade_color, stroke_width: 0 }, this.params.border_radius);
                    svg_ += Subtle.svg_rectangle(cx-bar_w*0.5, lw, bar_w, (lh-lw)*0.5, { fill_color: shade_color, stroke_width: 0 }, 0);
                } else {
                    svg_ += Subtle.svg_rectangle(lw, cx-bar_w*0.5, lh-lw, bar_w, { fill_color: shade_color, stroke_width: 0 }, this.params.border_radius);
                    svg_ += Subtle.svg_rectangle(lw, cx-bar_w*0.5, (lh-lw)*0.5, bar_w, { fill_color: shade_color, stroke_width: 0 }, 0);
                }
            }
        } else {
            if(!Number.isNaN(this.params.limit_low)){
                let limit_y = height*this.transform_v(this.params.limit_low);
                if(this.params.vertical){
                    svg_ += Subtle.svg_line(cx-bar_w*0.5, limit_y, cx+bar_w*0.5, limit_y, this.line_limit_style);
                } else {
                    svg_ += Subtle.svg_line(limit_y, cx-bar_w*0.5, limit_y, cx+bar_w*0.5, this.line_limit_style);
                }
            }

            if(!Number.isNaN(this.params.limit_high) && !this.params.shade_limits){
                let limit_y = height*this.transform_v(this.params.limit_high);
                if(this.params.vertical){
                    svg_ += Subtle.svg_line(cx-bar_w*0.5, limit_y, cx+bar_w*0.5, limit_y, this.line_limit_style);
                } else {
                    svg_ += Subtle.svg_line(limit_y, cx-bar_w*0.5, limit_y, cx+bar_w*0.5, this.line_limit_style);
                }
            }    
        }


        // ticks
        for(const item in this.params.ticks){
            let tick = height * this.transform_v(this.params.ticks[item]);
            if(this.params.vertical){
                svg_ += Subtle.svg_line(cx, tick, cx+bar_w*0.5, tick, this.line_limit_style);
                svg_ += Subtle.svg_text(cx+bar_w*0.5+5, tick, Subtle.ROUND(this.params.ticks[item], this.params.rounding), this.label_style)
            } else {
                this.label_style.anchor = "middle";
                svg_ += Subtle.svg_line(tick, cx, tick, cx+bar_w*0.5, this.line_limit_style);
                svg_ += Subtle.svg_text(tick, cx+bar_w*0.5+10, Subtle.ROUND(this.params.ticks[item], this.params.rounding), this.label_style)
            }
        }


        // draw values retangle
        if(this.history.length > 0){
            let y0 = height * this.transform_v( Math.min(...this.history) );
            let y1 = height * this.transform_v( Math.max(...this.history) );
            let style = {fill_color: params_color, stroke_width: 0};
            if(this.params.vertical){
                svg_ += Subtle.svg_rectangle(cx-bar_w*0.5+this.params.inner_padding, y0, bar_w - this.params.inner_padding*2, y1-y0, style, this.params.border_radius*0.5)
            } else {
                svg_ += Subtle.svg_rectangle(y0, cx-bar_w*0.5+this.params.inner_padding, y1-y0, bar_w - this.params.inner_padding*2, style, this.params.border_radius*0.5)
            }
        }

        // draw indicator (small triangle)
        let y = height * this.transform_v( this.value );
        let path = '<path d=" M ';
        let indicator_dy = this.params.indicator_size * 0.577;
        if(this.params.vertical){
            path += (cx-bar_w*0.5) + ' ' + y;
            path += ' L ' + (cx-bar_w*0.5-this.params.indicator_size) + ' ' + (y-indicator_dy);
            path += ' L ' + (cx-bar_w*0.5-this.params.indicator_size) + ' ' + (y+indicator_dy);
            path += ' Z" ' + Subtle.svg_style({fill_color: params_indicator_color, stroke_width:0 })  + ' />';

        } else {
            path += y + ' ' + (cx-bar_w*0.5);
            path += ' L ' + (y-indicator_dy) + ' ' + (cx-bar_w*0.5-this.params.indicator_size);
            path += ' L ' + (y+indicator_dy) + ' ' + (cx-bar_w*0.5-this.params.indicator_size);
            path += ' Z" ' + Subtle.svg_style({fill_color: params_indicator_color, stroke_width:0 })  + ' />';

        }
        svg_ += path;

        // draw
        if(this.params.vertical){
            let content = Subtle.svg_markup(width, height, svg_);
            this.object.innerHTML = content;
        } else {
            let content = Subtle.svg_markup(height, width, svg_);
            this.object.innerHTML = content;
        }

    }

    // =========================================================================
  	// UPDATE
  	// =========================================================================
    this.update = function(value, time = ""){

        this.value = value;
        if(value < this.params.min_val) this.value = this.params.min_val;
        if(value > this.params.max_val) this.value = this.params.max_val;

        /*
        // calculate elapsed time from the last time this function was called in seconds
        var current_time = new Date();
        if(time != ""){ current_time = new Date(time); }
        var time_diff = (current_time - this.last_time) / 1000;
        this.last_time = current_time;

        //
        let min_i = 0;
        for (var i = 0; i < this.history_t.length; i++) {
            this.history_t[i] = this.history_t[i] + time_diff;
            if(this.history_t[i] > this.params.history_length) { min_i = i+1; }
        }
        this.history.push(value);
        this.history_t.push(0);

        this.history.splice(0, min_i);
        this.history_t.splice(0, min_i);
        */

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
