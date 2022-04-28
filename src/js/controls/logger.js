Subtle.Logger = class Logger{

  constructor(object, parameters){

    this.params = {
      show_stems : true,
      show_timestamp : false,
      max_length : 100,
    };

    for(const p in parameters){ this.params[p] = parameters[p]; };

    // =========================================================================
    // OTHER
    // =========================================================================
    this.object = (typeof object === "string" ? document.getElementById(object) : object);
    this.object.style.overflowY = "scroll";

    this.records = [];

    // =========================================================================
    // DRAW CONTROL
    // =========================================================================
    this.draw = function(){
      let ctr_ = '<table class="logger">';

      for(const r in this.records){

        // define color
        let color = this.records[r].color;
        if(color in Subtle.COLORS) color = Subtle.COLORS[color];
        let bg = 'background-color:' + color + ';';

        // define icon
        let ic = '<img src="' + this.records[r].icon + '" />';
        if(["info","warning","error"].includes(this.records[r].icon)) ic = Subtle.svg_icon(this.records[r].icon, "#FFFFFF");

        ctr_ += '<tr>';

        ctr_ += '<td style="width:30px">';
        ctr_ += '<div class="logger-item" style="' + bg + '"><div style="margin:2px">' + ic + '</div></div>';
        ctr_ += '</td>';
        ctr_ += '<td style="padding-left:10px">';
        ctr_ += '<b>' + this.records[r].title + '</b>';
        ctr_ += '</td>';

        ctr_ += '</tr>';
        ctr_ += '<tr>';

        ctr_ += '<td style="width:30px">';

        if(this.params.show_stems && r != this.records.length-1){
          ctr_ += '<div class="logger-stem" style="background-color:' + Subtle.COLORS["control"] + '"></div>';
        }

        ctr_ += '</td>';

        ctr_ += '<td style="padding-left:10px">';
        ctr_ += '<div style="padding-bottom:15px; padding-top:2px; font-size:14px">' + this.records[r].text;
        if(this.params.show_timestamp && this.records[r].timestamp != ""){
          ctr_ += '<div style="padding-top:4px; font-size:12px">' + this.records[r].timestamp + '</div>';
        }
        ctr_ += '</div>';
        ctr_ += '</td>';

        ctr_ += '</tr>';

      }

      ctr_ += '</table>';
      this.object.innerHTML = ctr_;
    }

    this.update = function(icon, title, text, timestamp = "", color = ""){
      if(icon in Subtle.COLORS && color == ""){ color = Subtle.COLORS[icon]; }

      this.records.splice(0, 0, {icon: icon, title: title, text: text, timestamp: timestamp, color:color });

      while(this.records.length > this.params.max_length){ this.records.pop() }

      this.draw()
    }

    this.clear = function(){
      this.records = [];
      this.draw();
    }

  }

}
