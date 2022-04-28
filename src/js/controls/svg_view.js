Subtle.SvgView = class SvgView{

  constructor(object, parameters){

    this.params = {
      img : '',
      onload : function(){},
      stretch : true,
      hover_effect : true,
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

      var parent = this;
      var xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
          let data = this.responseText;
          let ctr_ = '';
          ctr_ += '<div class="svg_view_container' + (parent.params.stretch ? ' stretch' : '') + '">';
          ctr_ += data;
          ctr_ += '</div>';
          parent.object.innerHTML = ctr_;

          parent.params.onload();
        }
      };
      xhttp.open("GET", this.params.img, true);
      xhttp.send();
    }

    // =========================================================================
    // UPDATE
    // =========================================================================
    this.set_child_color = function(item, color){
      if(color in Subtle.COLORS) color = Subtle.COLORS[color];
      document.getElementById(item).style.fill = color;
    }

    this.set_child_text = function(item, text){
      document.getElementById(item).innerHTML = text;
    }

    this.set_child_onclick = function(item, onclick){
      let it = document.getElementById(item);
      it.onclick = onclick;

      if(this.params.hover_effect){
        it.style.cursor = "pointer";
        it.onmouseover = function(){ it.style.opacity=0.75 };
        it.onmouseout = function(){ it.style.opacity=1 };
      }
    }

    this.set_child_bind = function(item, sub_item){
      let it1 = document.getElementById(item);
      let it2 = document.getElementById(sub_item);

      it2.style.opacity = 0;

      var hover_effect = this.params.hover_effect;
      if(hover_effect) it1.style.cursor = "pointer";

      it1.onmouseover = function(){ it2.style.opacity=1; if(hover_effect) it1.style.opacity = 0.75; };
      it1.onmouseout  = function(){ it2.style.opacity=0; if(hover_effect) it1.style.opacity = 1; };
    }

    this.set_child_tooltip = function(item, tooltip){
      let it = document.getElementById(item);

      // add hover effect
      if(this.params.hover_effect){
        it.style.cursor = "pointer";
        it.onmouseover = function(){ it.style.opacity=0.75 };
        it.onmouseout = function(){ it.style.opacity=1 };
      }

      // add tippy tooltip
      if(typeof tippy !== "undefined") tippy('#' + it.id, {content:tooltip, allowHTML: true})
      else console.log("Tooltip error: tippy.js not included");
    }

    this.set_child_for_html = function(item){
      let it = document.getElementById(item);
      let bbox = it.getBBox();

      let code = "";
      code += '<foreignObject x="' + bbox.x + '" y="' + bbox.y + '" width="' + bbox.width + '" height="' + bbox.height + '">';
      code += '<div style="height:100%; width:100%" id="' + item + '"></div>';
      code += '</foreignObject>';

      it.outerHTML = code;
    }

    // =========================================================================
    // AUTO INITIALIZE
    // =========================================================================
    this.draw();

  }


}
