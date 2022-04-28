Subtle.TreeView = class TreeView {

    /*creates a tree view (like a folder explorer)

    A
    |-- A.B
        |-- A.B.X
        |-- A.B.Y
    |-- A.C
        |-- A.C.X
        |-- A.C.Z
    |-- A.W


    the nodes parameter is a list of objects with this structure:
    nodes = [
        {path:'item/full/path', prefix:'', tooltip : ''},
        ...
    ]

    the path is the item path, like 'A/B/X'
    the prefix (optional) is a string that is attached to the item (like an icon)
    the tooltip (optional) is a string that is added as a tooltip (using popper)

    for the previous example, nodes = [
        { path: 'A.B.X' },
        { path: 'A.B.Y' },
        { path: 'A.C.X' },
        { path: 'A.C.Z' },
        { path: 'A.W' },
    ]

    */

    constructor(object, nodes, parameters){

    // =========================================================================
    // PARAMETERES
    // =========================================================================
    this.params = {
        padding : 5,
        indentation : 25,
        path_separator : "/",
        show_checkboxes : false,
        show_arrows : false,
        highlight_on_select : true,
        auto_sort: false,
        on_select : function(){},
        on_checkbox_changed : function(){},
    };

    for(const p in parameters){ this.params[p] = parameters[p]; };

    // =========================================================================
    // OTHER
    // =========================================================================
    this.object = (typeof object === "string" ? document.getElementById(object) : object);
    this.nodes = nodes;

    this.all_nodes = [];
    this.nodes_checkbox_state = {};
    this.nodes_collapsed_state = {};
    this.selected_node = '';

    this.nodes_padding = {} // store padding to change on search
    this.final_nodes = [] // store end nodes for searching
    this.aliases = {} // store aliases for searching


    // ===============================================================================
    // DRAW CONTROL
    // ===============================================================================

    this.get_node_children = function(node_path){
        // return the node's children
        let children = [];
        for(const n in this.all_nodes){
            if(this.all_nodes[n].startsWith(node_path + this.params.path_separator)){
                children.push(this.all_nodes[n]);
            }
        }
        return children;
    }

    // callback function when a node is selected
    this.node_select = function(node_path){

        // highlight
        if(this.params.highlight_on_select){
            for(const n in this.all_nodes){
                document.getElementById(this.object.id + "_node_" + this.all_nodes[n]).classList.remove("selected");
            }
            document.getElementById(this.object.id + "_node_" + node_path).classList.add("selected");
        }

        // set selected node
        this.selected_node = node_path;

        // collapse/expand
        if(!this.nodes_collapsed_state[node_path]) {
            this.node_collapse(node_path);
        }
        else{
            this.node_expand(node_path);
        }

        // custom select function
        this.params.on_select();
    }

    // callback function when a checkbox is changed
    this.node_checkbox_on_change = function(node_path){
        let state = document.getElementById("chkbox_" + this.object.id + "_node_" + node_path).checked;
        this.nodes_checkbox_state[node_path] = state;

        // check / uncheck children (not used anymore)
        let children = this.get_node_children(node_path);
        for(const c in children){
            let child = children[c];
            document.getElementById("chkbox_" + this.object.id + "_node_" + child).checked = state;
            this.nodes_checkbox_state[child] = state;
        }

        this.params.on_checkbox_changed();
    }

    // set checkbox state programatically
    this.node_set_checkbox_state = function(node_path, state){
        if( document.getElementById("chkbox_" + this.object.id + "_node_" + node_path)){
            document.getElementById("chkbox_" + this.object.id + "_node_" + node_path).checked = state;
            this.nodes_checkbox_state[node_path] = state;
        }
    }

    this.node_collapse = function(node_path){
        // set node state to collapsed
        this.nodes_collapsed_state[node_path] = true;

        // change arrow
        if(this.params.show_arrows && document.getElementById("arrow_" + this.object.id + "_node_" + node_path)){
            document.getElementById("arrow_" + this.object.id + "_node_" + node_path).innerHTML = Subtle.svg_sort_buttons("chevron_right");
        }

        // hide all children
        let children = this.get_node_children(node_path);
        for(const c in children){
            let child = children[c];
            document.getElementById(this.object.id + "_node_" + child).style.display = "none";
        }
    }

    this.node_expand = function(node_path){
        // set node state to expanded
        this.nodes_collapsed_state[node_path] = false;

        // change arrow
        if(this.params.show_arrows && document.getElementById("arrow_" + this.object.id + "_node_" + node_path)){
            document.getElementById("arrow_" + this.object.id + "_node_" + node_path).innerHTML = Subtle.svg_sort_buttons("chevron_down");
        }

        // for all children
        let children = this.get_node_children(node_path);
        for(const c in children){
            let child = children[c];

            // show immediate children
            if(child.replace(node_path + this.params.path_separator,"").split(this.params.path_separator).length == 1){

                document.getElementById(this.object.id + "_node_" + child).style.display = "block";

                // recursively show expanded children (if not collapsed)
                if(!this.nodes_collapsed_state[child]){
                    this.node_expand(child);
                }
            }
        }
    }

    this.expand_all = function(){
        for(const n in this.all_nodes){
            this.node_expand(this.all_nodes[n]);
        }
    }

    this.collapse_all = function(){
        for(const n in this.all_nodes){
            this.node_collapse(this.all_nodes[n]);
        }
    }

    this.get_nodes_checkbox_state = function(){
        return this.nodes_checkbox_state;
    }

    // this function displays only the nodes that match the given text
    // and hides the others. It shows only end nodes, and removes all
    // padding (creating sort of a list)
    this.search = function(text){
        this.expand_all();
        if(text == ""){
            for(const n in this.all_nodes){
                document.getElementById(this.object.id + "_node_" + this.all_nodes[n]).style.display = "block";
                document.getElementById(this.object.id + "_node_" + this.all_nodes[n]).style.paddingLeft = this.nodes_padding[this.all_nodes[n]] + "px";
            }
        } else{
            for(const n in this.all_nodes){
                text = text.toLowerCase();

                // if not a final node, don't show
                if(!this.final_nodes.includes(this.all_nodes[n])){
                    document.getElementById(this.object.id + "_node_" + this.all_nodes[n]).style.display = "none";
                }
                // not a match, don't show
                else if(!this.all_nodes[n].toLowerCase().includes(text) /*&& !this.aliases[this.all_nodes[n]].toLowerCase().includes(text)*/){
                    document.getElementById(this.object.id + "_node_" + this.all_nodes[n]).style.display = "none";
                }
                // show
                else{
                    document.getElementById(this.object.id + "_node_" + this.all_nodes[n]).style.display = "block";
                    document.getElementById(this.object.id + "_node_" + this.all_nodes[n]).style.paddingLeft = "10px";
                }
            }
        }

    }

    // function load_tree takes a list of nodes and creates a dict with the structure
    // of the tree recursively
    this.load_tree = function(nodes, tree = {}){
        let sub_nodes = {};
        if(this.params.auto_sort) { nodes.sort(); }

        for(const n in nodes){
            let node = nodes[n];
            if(!(node.includes(this.params.path_separator))){
                tree[node] = null;
                continue;
            }

            let ps = this.params.path_separator;

            // separate the first element of the node
            // (here the function replace changes only the first ocurrence of the separator,
            // so, for example, 'my.node.path' becomes 'my..node.path'. Then we split the string
            // which results in ['my','node.path'])
            let node_ = node.replace(ps,ps+ps).split(ps+ps);
            tree[node_[0]] = {}

            if(!(node_[0] in sub_nodes)){ sub_nodes[node_[0]] = [] }
            sub_nodes[node_[0]].push(node_[1])
        }

        for(const sub_node in sub_nodes){
            this.load_tree(sub_nodes[sub_node], tree[sub_node])
        }
    }

    // prints tree recursively from a dict structure
    // (returns the html code of the tree)
    this.print_tree = function(tree, root, extra, all_nodes, depth = 0){
        var tree_html = "";

        if(tree == null) return "";

        for(const item in tree){
            var text = item;
            var full_path = root + this.params.path_separator + item;
            full_path = full_path.replace(this.params.path_separator,"");
            var div_id = this.object.id + "_node_" + full_path

            // change text for alias
            // if(full_path in extra.aliases){ text = extra.aliases[full_path] }

            // add prefix
            if(full_path in extra.prefixes){ text = extra.prefixes[full_path] + item }
            if(this.params.show_arrows && tree[item] != null){ text = "<span class='tree_arrow' id='arrow_" + div_id + "'>" + Subtle.svg_sort_buttons("chevron_down") + "</span>" + text }

            // add checkboxes
            if(this.params.show_checkboxes && tree[item] == null){
                /*text =
                `<label class="container_checkbox" style="margin-bottom: 0">
                    <input id="chkbox_${div_id}" class="tag_checkbox" type="checkbox">
                    <span class="checkmark_checkbox" autocomplete="off"></span>

                    <div style="overflow-x: hidden; text-overflow: ellipsis; white-space: nowrap; width: auto" >
                        ${text}
                    </div>
                </label>`*/
                text =
                `
                <div class="form-check">
                  <input id="chkbox_${div_id}" class="form-check-input" type="checkbox" value="" id="flexCheckDefault">
                  <label class="form-check-label" for="flexCheckDefault">
                    ${text}
                  </label>
                </div>
                `;

            }

            // create div
            let padding = 10+depth*this.params.indentation;
            var div = '<div id="' + div_id + '" class="tree-node" ';
            div += 'style="padding-left:' + padding + 'px;' + '" ';
            div += (full_path in extra.tooltips ? 'data-toggle="tooltip" data-placement="top" title="' + extra.tooltips[full_path] + '"' : '');
            div += '>' + text + '</div>';

            // add div to parent
            //this.object.innerHTML += div;
            tree_html += div;

            all_nodes.push(full_path);
            this.nodes_padding[full_path] = padding;
            if(tree[item] == null) this.final_nodes.push(full_path);

            tree_html += this.print_tree(tree[item], root + this.params.path_separator + item, extra, all_nodes, depth+1)
        }
        return tree_html;
    }

    this.draw = function(){
        // create a list of nodes
        var my_nodes = [];
        for(const node in this.nodes){
            my_nodes.push(this.nodes[node].path);
        }

        // create a dict from the list of nodes
        var my_tree = {};
        this.load_tree(my_nodes, my_tree);

        // create a dict of prefixes and tooltips
        var extra = {prefixes:{}, tooltips:{}, aliases:{}};
        for(const item in this.nodes){
            if("prefix" in this.nodes[item]){ extra.prefixes[this.nodes[item].path] = this.nodes[item].prefix; }
            if("tooltip" in this.nodes[item]){ extra.tooltips[this.nodes[item].path] = this.nodes[item].tooltip; }
            /*if("alias" in this.nodes[item]){
                extra.aliases[this.nodes[item].path] = this.nodes[item].alias;
                this.aliases[this.nodes[item].path] = this.nodes[item].alias;
            } else {
                this.aliases[this.nodes[item].path] = "";
            }*/
        }

        // print tree
        // this.object.innerHTML = "";
        this.object.innerHTML = this.print_tree(my_tree, '', extra, this.all_nodes, 0);

        // add on click and checkbox changed events
        var parent = this;
        for(const n in this.all_nodes){
            let node_path = this.all_nodes[n];

            // on select
            if(document.getElementById(this.object.id + "_node_" + node_path)){
                document.getElementById(this.object.id + "_node_" + node_path).onclick = function(){
                    parent.node_select(node_path);
                }
            }

            // on checkbox changed
            if(this.params.show_checkboxes && document.getElementById("chkbox_" + this.object.id + "_node_" + node_path)){
                document.getElementById("chkbox_" + this.object.id + "_node_" + node_path).onchange = function(){
                    parent.node_checkbox_on_change(node_path);
                }
                this.nodes_checkbox_state[node_path] = false;
            }

            // set collapsed state
            this.nodes_collapsed_state[node_path] = false;
        }

    }

    // auto initialize
    this.draw();

    }
}
