Subtle.MapView = class MapView{

  constructor(object, parameters = {}){
    // =========================================================================
		// PARAMETERES
		// =========================================================================

    this.params = {
      provider: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', // get from http://leaflet-extras.github.io/leaflet-providers/preview/
      leaflet_options: { attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'},

      lat: 0,
      lon: 0,
      zoom: 2, // zoom number from 2 to 20

      correct_icon_x : 6,
      correct_icon_y : 7,

      show_layer_control : false,

    };

    for(const p in parameters){ this.params[p] = parameters[p]; };

    // =========================================================================
		// OTHER
		// =========================================================================
    this.object = (typeof object === "string" ? document.getElementById(object) : object);
    this.map = L.map(this.object.id).setView([this.params.lat, this.params.lon], this.params.zoom);
    this.control_layers = L.control.layers();

    this.markers = {};
    this.layer_groups = {};


    this.get_icon_html = function(marker, icon, icon_left, icon_top){
      let html = '';
      html += '<div style="transform: translate(' + this.params.correct_icon_x + 'px,' + this.params.correct_icon_y + 'px)">';
      html += '<div style="font-size:24px;';
      html += 'margin-left:-' + icon_left + 'px;';
      html += 'margin-top:-' + icon_top + 'px;';
      //html += 'transform: rotate(' + this.markers[marker]["angle"] + 'deg);';
      html += 'transform-origin: ' + icon_left + 'px ' + icon_top + 'px;'
      html += '" id="' + this.object.id + "_" + marker + '" ';
      html += '>';
      html += icon;
      html += '</div>';
      html += '</div>';
      return html;
    }

    this.update_layer_groups = function(){

      this.control_layers.remove();
      this.control_layers = L.control.layers();
      // this.layer_groups = {};


      for(const m in this.markers){
        let marker = this.markers[m];

        if(!(marker.group in this.layer_groups)){
          this.layer_groups[marker.group] = [];
        }

        this.layer_groups[marker.group].push(marker.m);
      }

      for(const group in this.layer_groups){
        var Lay = L.layerGroup(this.layer_groups[group]);
        Lay.addTo(this.map);
        this.control_layers.addOverlay(Lay, group);
      }

      if(this.params.show_layer_control){
        this.control_layers.addTo(this.map);
      }
    }

		// =========================================================================
		// DRAW CONTROL
		// =========================================================================
    this.draw = function(){
      this.map.addLayer(new L.TileLayer(this.params.provider, this.params.leaflet_options));

      if(this.params.show_layer_control){
        this.control_layers.addTo(this.map);

        var ths = this;
        this.map.on('overlayadd', function(){
          for(const m in ths.markers){
            ths.update_marker(m,{tooltip:ths.markers[m].tooltip});
          }
        });
      }
    }

    // =========================================================================
		// AUTO INIT
    // =========================================================================
    this.draw();

    // =========================================================================
		// UPDATE: MARKERS
    // =========================================================================
    this.update_marker = function(marker, properties = {}){

      // if marker is new, create
      if(!(marker in this.markers)){
        this.markers[marker] = {"m" : new L.Marker([0,0])}

        this.markers[marker]["m"].addTo(this.map);
        this.markers[marker]["group"] = "default";
        this.markers[marker]["rotation"] = 0;
        this.markers[marker]["position"] = [0,0];
        this.markers[marker]["icon"] = "";
        this.markers[marker]["icon_left"] = 12;
        this.markers[marker]["icon_top"] = 12;
        this.markers[marker]["visible"] = true;
        this.markers[marker]["tooltip"] = "";
        this.markers[marker]["onclick"] = function(){};
      }

      // update marker properties
      for(const p in properties){ this.markers[marker][p] = properties[p]; }


      // update position
      if("position" in properties){
        var newLatLng = new L.LatLng(properties["position"][0], properties["position"][1]);
        this.markers[marker]["m"].setLatLng(newLatLng);
      }

      // update icon and tooltip
      if("icon" in properties || "icon_left" in properties || "icon_top" in properties || "icon_size" in properties || "visible" in properties || "tooltip" in properties ){

        // icon
        if("icon" in properties || "icon_left" in properties || "icon_top" in properties){
          this.markers[marker]["m"].setIcon(new L.DivIcon({
            className: 'my-div-icon',
            html: this.markers[marker]["visibility"] ? "" : this.get_icon_html(marker, this.markers[marker]["icon"], this.markers[marker]["icon_left"], this.markers[marker]["icon_top"]),
          }));
        }


        // tooltip
        if(this.markers[marker]["tooltip"] != ""){
          if(typeof tippy !== "undefined") tippy('#' + this.object.id + "_" + marker, {content: this.markers[marker]["tooltip"], allowHTML: true})
          else console.log("Tooltip error: tippy.js not included");
        }
      }

      // update angle
      if("rotation" in properties){
        document.getElementById(this.object.id + "_" + marker).style.transform = ("rotate(" + properties["rotation"] + "deg)")
      }

      // update onclick
      if("onclick" in properties){
        this.markers[marker]["m"].on('click', properties["onclick"])
      }

      // update groups
      if("group" in properties){
        this.update_layer_groups();
      }

    }

    // =========================================================================
		// UPDATE: TRACE
    // =========================================================================
    this.update_trace = function(trace, properties){
      // if trace is new, create
      if(!(trace in this.markers)){
        this.markers[trace] = {"m" : new L.polyline([[0,0],[10,10]])}

        this.markers[trace]["m"].addTo(this.map);
        this.markers[trace]["group"] = "default";
        this.markers[trace]["points"] = [];
        this.markers[trace]["color"] = "#3388ff";
        this.markers[trace]["width"] = 2;
        this.markers[trace]["visible"] = true;
        this.markers[trace]["onclick"] = function(){};
        this.markers[trace]["onhover"] = function(){};
      }

      // update trace properties
      for(const p in properties){ this.markers[trace][p] = properties[p]; }

      // update points
      if("points" in properties){
        this.markers[trace]["m"].setLatLngs(properties["points"]);
      }

      // update color and other styles
      if("color" in properties){ this.markers[trace]["m"].setStyle({color: properties["color"]}) }
      if("width" in properties){ this.markers[trace]["m"].setStyle({weight: properties["weight"]}) }

      // update onclick
      if("onclick" in properties){
        this.markers[trace]["m"].on('click', properties["onclick"]);
      }

      // update onhover
      if("onhover" in properties){
        this.markers[trace]["m"].on('mouseover', properties["onhover"]);
      }

      // update groups
      if("group" in properties){
        this.update_layer_groups();
      }

    }

    // =========================================================================
		// UPDATE: CIRCLE
    // =========================================================================
    this.update_circle = function(circle, properties){
      // if circle is new, create
      if(!(circle in this.markers)){
        this.markers[circle] = {"m" : new L.circle([0,0])}

        this.markers[circle]["m"].addTo(this.map);
        this.markers[circle]["group"] = "default";
        this.markers[circle]["radius"] = 0;
        this.markers[circle]["position"] = [0,0];
        this.markers[circle]["color"] = "#3388ff";
        this.markers[circle]["opacity"] = 0.5;
        this.markers[circle]["border_color"] = "#3388ff";
        this.markers[circle]["border_width"] = 1;
        this.markers[circle]["visible"] = true;
        this.markers[circle]["onclick"] = function(){};
        this.markers[circle]["onhover"] = function(){};
      }

      // update circle properties
      for(const p in properties){ this.markers[circle][p] = properties[p]; }

      // update position
      if("position" in properties){
        var newLatLng = new L.LatLng(properties["position"][0], properties["position"][1]);
        this.markers[circle]["m"].setLatLng(newLatLng);
      }

      // update radius
      if("radius" in properties){
        this.markers[circle]["m"].setRadius(properties["radius"]);
      }

      // update color and other styles
      if("color" in properties){ this.markers[circle]["m"].setStyle({fillColor: properties["color"]}) }
      if("opacity" in properties){ this.markers[circle]["m"].setStyle({fillOpacity: properties["opacity"]}) }
      if("border_color" in properties){ this.markers[circle]["m"].setStyle({color: properties["border_color"]}) }
      if("border_width" in properties){ this.markers[circle]["m"].setStyle({weight: properties["border_width"]}) }

      // update onclick
      if("onclick" in properties){
        this.markers[circle]["m"].on('click', properties["onclick"]);
      }

      // update onhover
      if("onhover" in properties){
        this.markers[circle]["m"].on('mouseover', properties["onhover"]);
      }

      // update groups
      if("group" in properties){
        this.update_layer_groups();
      }

    }

    // =========================================================================
		// UPDATE: POLYGON
    // =========================================================================
    this.update_polygon = function(polygon, properties){
      // if polygon is new, create
      if(!(polygon in this.markers)){
        this.markers[polygon] = {"m" : new L.polygon([[0,0],[10,10]])}

        this.markers[polygon]["m"].addTo(this.map);
        this.markers[polygon]["group"] = "default";
        this.markers[polygon]["points"] = [];
        this.markers[polygon]["color"] = "#3388ff";
        this.markers[polygon]["opacity"] = 0.5;
        this.markers[polygon]["border_color"] = "#3388ff";
        this.markers[polygon]["border_width"] = 1;
        this.markers[polygon]["visible"] = true;
        this.markers[polygon]["onclick"] = function(){};
        this.markers[polygon]["onhover"] = function(){};
      }

      // update polygon properties
      for(const p in properties){ this.markers[polygon][p] = properties[p]; }

      // update points
      if("points" in properties){
        this.markers[polygon]["m"].setLatLngs(properties["points"]);
      }

      // update color and other styles
      if("color" in properties){ this.markers[polygon]["m"].setStyle({fillColor: properties["color"]}) }
      if("opacity" in properties){ this.markers[polygon]["m"].setStyle({fillOpacity: properties["opacity"]}) }
      if("border_color" in properties){ this.markers[polygon]["m"].setStyle({color: properties["border_color"]}) }
      if("border_width" in properties){ this.markers[polygon]["m"].setStyle({weight: properties["border_width"]}) }

      // update onclick
      if("onclick" in properties){
        this.markers[polygon]["m"].on('click', properties["onclick"]);
      }

      // update onhover
      if("onhover" in properties){
        this.markers[polygon]["m"].on('mouseover', properties["onhover"]);
      }

      // update groups
      if("group" in properties){
        this.update_layer_groups();
      }
    }


  }

}
