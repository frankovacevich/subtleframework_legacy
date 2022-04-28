Subtle.TabsLayout = class TabsLayout {

  constructor(object, tabs, parameters){

    // =========================================================================
		// PARAMETERES
		// =========================================================================
    this.params = {
      show_labels : true,
      show_labels_inline: false,
      position : "center", // center, left, fill
      color: Subtle.COLORS["primary"],
      show_icons : true,
      icon_size : 16,
      dock_bottom: false,
      direction: 'horizontal', // horizontal, vertical
    };

    for(const p in parameters){ this.params[p] = parameters[p]; };

    // =========================================================================
		// OTHER
		// =========================================================================
    this.object = (typeof object === "string" ? document.getElementById(object) : object);
    this.tabs = tabs;

		// ===============================================================================
		// DRAW CONTROL
		// ===============================================================================

		this.draw = function(){

      let jc = {"left":"flex-start", "fill":"space-evenly", "center":"center"}[this.params.position];

      let prt_ = '<div style="display:flex; flex-direction:column; justify-content: ' + jc + '; height: 100%; width: 100%;">';
      let str_ = '<div style="width:100%;">';

      str_ += '<div class="tabs_layout_container" style="display: ' + (this.params.direction == "vertical" ? "block" : "flex") + '; direction:' +' align-content: stretch; justify-content: ' + jc + ';">';

      let w = this.params.icon_size;
      for(const t in tabs){
        // create flex container
        str_ += '<div id="tab_' + tabs[t].div + '" class="no-selectable tab-item" style="width:' + (this.params.show_labels_inline || this.params.direction == "vertical" ? 'auto' : w*2+10 + 'px' ) + '; flex-direction:' + (this.params.show_labels_inline ? 'row' : 'column') + '; ">';

        // add icons
        if(this.params.show_icons){
          str_ += '<div style="font-size:' + w + 'px; height:' + w*1 + 'px; line-height:' + (w) + 'px">' + tabs[t].icon + '</div>';
        }

        // add labels
        if(this.params.show_labels){
          if(this.params.show_labels_inline){
            str_ += '<div style="font-size:12px; padding-left:' + (this.params.show_icons ? '10' : '0') + 'px;">';
          } else {
            str_ += '<div style="font-size:12px; margin-top: 5px;">';
          }
          str_ += tabs[t].label + '</div>';
        }

        str_ += '</div>';

        // hide all tab divs
        let dv = document.getElementById(tabs[t].div);
        dv.style.height = "100%";
        dv.style.width = "100%";
        dv.style.display = "none";
      }

      str_ += '</div>';
      str_ += '</div>';


      //
      let inner_html = this.object.innerHTML;
      let result = prt_ + str_ + inner_html + "</div>";
      if(this.params.dock_bottom){
        result = prt_ + inner_html + str_ + "<div>";
      }
			this.object.innerHTML = result;

      // clicks
      var parent = this;
      for(const t in tabs){
        this.object.getElementsByClassName("tabs_layout_container")[0].childNodes[t].onclick = function(){ parent.select_tab(t) };
      }

      this.select_tab(0);
		}

    this.select_tab = function(tabid){
      var parent = this;
      //
      for(const s in parent.tabs){
        document.getElementById(parent.tabs[s].div).style.display = "none";
        parent.object.getElementsByClassName("tabs_layout_container")[0].childNodes[s].style.color = Subtle.COLORS["text"];
      }
      document.getElementById(parent.tabs[tabid].div).style.display = "block";
      parent.object.getElementsByClassName("tabs_layout_container")[0].childNodes[tabid].style.color = Subtle.COLORS["primary"];

      if(parent.tabs[tabid].onselect){
        parent.tabs[tabid].onselect();
      }

    }

    this.draw()



	}
}
