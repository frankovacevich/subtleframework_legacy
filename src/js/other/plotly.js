Subtle.PlotlyObject = class PlotlyObject{

    constructor(object, parameters){

        this.obj = (typeof object === "string" ? document.getElementById(object) : object);

        this.traces = [];

        //this.annotations = [];

        this.layout = {
            margin: { l: 30, r: 20, b: 30, t: 30, pad: 5 },
            showlegend: false,
            legend: { orientation: "h", x:0, y:1.2 },
            xaxis: { title: "" },
            yaxis: { title: "" },
            dragmode: 'zoom',
            hovermode: 'closest',
        }

        for(const p in parameters){ this.layout[p] = parameters[p]; };

        this.options = {
            displaylogo: false,
            displayModeBar: false,
        }

        this.pie_chart_index = 0;

    }

    draw(){
        //this.layout.annotations = this.annotations;
        this.traces.sort(function(a, b){return a.zindex-b.zindex});
        Plotly.newPlot(this.obj, this.traces, this.layout, this.options);
    }

    /////////////////////////////////////////////////////////////////////

    add_text(x, y, text, parameters){

        if(!(x instanceof Array)){ x = [x] }
        if(!(y instanceof Array)){ y = [y] }
        if(!(text instanceof Array)){ text = [text] }

        let params_ = {
            x: x,
            y: y,
            mode: 'text',
            text: text,
            textposition: "middle center", //top,middle,bottom left,center,right
            showlegend: false,
            //textangle: 0,
            //showarrow: false,
            //align: "center", // left, center, right
            //valign: "middle", //top, middle, bottom
            zindex: 9999,
        }

        for(const p in parameters){ params_[p] = parameters[p]; };

        //this.annotations.push(params_);
        this.traces.push(params_);

        return;
    }

    add_scatter(data, parameters){
        /*
        data = [[x0, x1, x2, ... , xn], [y0, y1, y2, ... , yn]]
        */

        let params_ = {
            name: "",
            color: Subtle.COLORS["primary"][this.traces.length],
            show_markers: false,
            show_lines: true,
            plot_area: false, // fill area below the graph
            plot_manhattan: false, // make line manhattan
            plot_spline: false, // make line a spline
            line_stroke: 2,
            marker_symbol: "circle",
            marker_size: 6,
            zindex: 0,
        }

        for(const p in parameters){ params_[p] = parameters[p]; };

        let line_shape = "linear";
        if(params_.plot_manhattan) line_shape = "hv";
        if(params_.plot_spline) line_shape = "spline";

        let mode = "lines+markers";
        if(params_.show_lines && !params_.show_markers) mode = "lines";
        if(!params_.show_lines && params_.show_markers) mode = "markers";
        if(!params_.show_lines && !params_.show_markers) return;

        this.traces.push({
            type: 'scatter',
            x: data[0],
            y: data[1],
            mode: mode,
            fill: params_.plot_area ? "tozeroy" : "none",
            name: params_.name,

            marker: {
                color: params_.color,
                symbol: params_.marker_symbol,
                size: params_.marker_size,
            },
            line: {
                color: params_.color,
                shape: line_shape,
                width: params_.line_stroke,
            },
            zindex: params_.zindex,
        });

        return;
    }

    add_columnchart(data, parameters){
        /*
            data = [ [x0, x1, x2, x3, ... , xn], [y0, y1, y2, y3, ... , yn] ]
        */

        let params_ = {
            name: "",
            color: Subtle.COLOR_PALETTES["main"][this.traces.length],
            zindex: 0,
        }

        for(const p in parameters){ params_[p] = parameters[p]; };

        this.traces.push({
            type: 'bar',
            x: data[0],
            y: data[1],
            name: params_.name,
            marker: { color: params_.color },
            zindex: params_.zindex,
        });

        return;
    }

    add_piechart(data, parameters){
        /*
            data = [ [label0, label1, label2, label3, ... , labeln], [y0, y1, y2, y3, ... , yn] ]
        */

        let params_ = {
            name: "",
            colors: Subtle.COLOR_PALETTES["main"],
            donut: false,
            show_labels: true,
            zindex: 0,
        }

        for(const p in parameters){ params_[p] = parameters[p]; };

        this.traces.push({
            name: params_.name,
            type: 'pie',
            values: data[1],
            labels: data[0],
            hole: params_.donut ? 0.4 : 0,
            textinfo: params_.show_labels ? 'label+percent' : 'percent',

            marker: {
                colors: params_.colors,
            },
            domain: {
                row: 0,
                column: this.pie_chart_index,
            },

            zindex: params_.zindex,
        });

        this.pie_chart_index += 1;
        this.layout.grid = {rows: 1, columns: this.pie_chart_index}

        return;
    }

    /*add_gantt(data, parameters){

            //data = [ [t0, t1, y0], [t1, t2, y1], [t5, t6, y5], ... ]


        let params_ = {
            name: "",
            colors: Subtle.COLORS["primary"],
            color_by_values: false,
            show_value: true,
            width: 20,
            zindex: 0,
        }

        for(const p in parameters){ params_[p] = parameters[p]; };

        for(const s in data){

            let line_color = params_.colors;
            if(typeof params_.colors !== "string"){
                if(params.color_by_values){
                    let v = data[s][2]
                    line_color = params_.colors[v];
                } else {
                    line_color = params_.colors[s];
                }
            }

            this.traces.push({
                type: 'scatter',
                mode: 'lines',
                x: [ data[s][0] , data[s][1] ],
                y: [ params_.name , params_.name ],
                line: { color: line_color, width: params_.width },
                zindex: params_.zindex,
            });
        }

        return;
    }*/

    add_boxandwhiskers(data, parameters){
        /*
            data = [ y0, y1, y2, y3, y4, y5, y6, ... ]
        */

        let params_ = {
            name: "",
            color: Subtle.COLORS["primary"],
            show_outliers: true,
            show_mean: true,
            zindex: 0,
        }

        for(const p in parameters){ params_[p] = parameters[p]; };

        this.traces.push({
            type: 'box',
            y: data,
            x: params_.name,
            name: params_.name,
            boxpoints: params_.show_outliers ? 'Outliers' : false,
            boxmean: params_.show_mean,

            marker: {
                color: params_.color,
            },
            zindex: params_.zindex,
        });

        return;
    }

    add_heatmap(data, parameters){
        /*
            data = [
                [A1, B1, C1, D1, E1],
                [A2, B2, C2, D2, E2],
                [A3, B3, C3, D3, E3],
                [A4, B4, C4, D4, E4],
            ]
        */

        let params_ = {
            x: [],
            y: [],
            colors: Subtle.COLORS["primary"],
            show_scale : true,
            zindex: 0,
        }

        for(const p in parameters){ params_[p] = parameters[p]; };

        let colorscale = params_.colors;
        if(typeof params_.colors == "string"){
            colorscale = [[0, "#fff"], [1, params_.colors]];
        }

        this.traces.push({
            type: 'heatmap',
            z: data,
            x: params_.x,
            y: params_.y,

            colorscale: colorscale,
            showscale: params_.show_scale,
            zindex: params_.zindex,
        });

        return;
    }

    add_histogram(data, parameters){
        /*
            data = [ y0, y1, y2, y3, y4, y5, y6, ... ]
        */

        let params_ = {
            nbins : 0,
            zindex: 0,
            color: Subtle.COLORS["primary"],
        }

        for(const p in parameters){ params_[p] = parameters[p]; };

        this.traces.push({
            type: 'histogram',
            x: data,
            nbinsx: params_.nbins,
            marker: {
                color: params_.color
            },
            zindex: params_.zindex,
        });

        return;
    }
}
