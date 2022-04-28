// =============================================================================
// MARKUP
// =============================================================================
Subtle.svg_markup = function(width,height,content){
  let blur = '<filter id="blur_filter" x="0" y="0"><feGaussianBlur in="SourceGraphic" stdDeviation="3" /></filter>';

  let svg = '<svg height="' + height + '" width="' + width + '">\n';
  svg += '<defs>' + blur + '</defs>';
  svg += content;
  svg += '</svg>';

  return svg;
}

// =============================================================================
// STYLES
// =============================================================================
Subtle.svg_style = function(style){

  // get default style
  st = {
    fill_color: "none",
    stroke_color: "#000000",
    stroke_width: 3,
    stroke_dasharray: 0,
    stroke_linecap: "butt",
    opacity: 1,
    stroke_linejoin: "round",
  }

  // edit style
  for(const item in style){ st[item] = style[item] }

  // create string and return
  styl = '';
  styl += 'style="';
  styl += 'fill:' + st.fill_color + ';';
  styl += 'fill-opacity:' + st.opacity.toString() + ';';
  styl += 'stroke:' + st.stroke_color + ';';
  styl += 'stroke-width:' + st.stroke_width.toString() + ';';
  styl += 'stroke-dasharray:' + st.stroke_dasharray.toString() + ';';
  styl += 'stroke-opacity:' + st.opacity.toString() + ';';
  styl += 'stroke-linecap:' + st.stroke_linecap + ';';
  styl += 'stroke-linejoin:' + st.stroke_linejoin + ';';
  styl += '"';

  return styl;
}

Subtle.svg_lineargradient = function(id, color, direction = "h"){
  let grad = '';

  grad += '<linearGradient id="' + id + '" gradientUnits="userSpaceOnUse" ';
  if(direction == "h") grad += 'x1="0%" y1="0%" x2="100%" y2="0%">';
  if(direction == "v") grad += 'x1="0%" y1="100%" x2="0%" y2="0%">';

  grad += '<stop offset="0%" style="stop-color:' + color + ';stop-opacity:0" />';
  grad += '<stop offset="100%" style="stop-color:' + color + ';stop-opacity:1" />';

  grad += '</linearGradient>';
  return grad;
}

// =============================================================================
// FIGURES
// =============================================================================
Subtle.svg_line = function(x1,y1,x2,y2,style){

  let line = '<line ';

  line += 'x1="' + x1 + '" ';
  line += 'y1="' + y1 + '" ';
  line += 'x2="' + x2 + '" ';
  line += 'y2="' + y2 + '" ';

  line += Subtle.svg_style(style);

  if("filter" in style){
    line += 'filter="' + style.filter + '"';
  }

  line += '/>';
  return line;
}

Subtle.svg_circle = function(x,y,r,style){

  let circ = '<circle ';
  circ += 'cx="' + x + '" ';
  circ += 'cy="' + y + '" ';
  circ += 'r="' + r + '" ';

  circ += Subtle.svg_style(style);
  circ += '/>';
  return circ;

}

Subtle.svg_rectangle = function(x,y,dx,dy,style,rx = 0){

  let sqr = '<rect ';
  sqr += 'x="' + x + '" ';
  sqr += 'y="' + y + '" ';
  sqr += 'width="' + dx + '" ';
  sqr += 'height="' + dy + '" ';
  sqr += 'rx="' + rx + '" ';

  sqr += Subtle.svg_style(style);
  sqr += '/>';
  return sqr;
}

Subtle.svg_cross = function(x,y,size,style){
  // draw an 'X' (two lines)
  let cross = '<g transform="translate(-' + size*0.5 + ' -' + size*0.5 + ')">';
  cross += Subtle.svg_line(x,y,x+size,y+size,style);
  cross += Subtle.svg_line(x+size,y,x,y+size,style);
  cross += '</g>';
  return cross;
}

Subtle.svg_text = function(x,y,value,style){

  // get default style
  st = {
    color: Subtle.COLORS["text"],
    //font_size: 12,
    //font_family: "Helvetica",
    anchor: "start", // start, middle, end
    center_vertically: false, //true, false
  }

  // edit style
  for(const item in style){ st[item] = style[item] }

  let text = '';
  if("font_family" in style) { text = '<text '; }
  else{ text = '<text class="at_font" '; }

  text += 'x="' + x + '" ';
  text += 'y="' + y + '" ';
  text += 'dy="' + (st.center_vertically ? "0.3em" : 0) + '" ';

  text += 'fill="' + st.color + '" ';
  text += 'text-anchor="' + st.anchor + '" ';
  //text += 'font-size="' + st.font_size + '" ';
  if("font_family" in style) { text += 'font-family="' + st.font_family + '" '; }
  if("font_size" in style) { text += 'style="font-size:' + st.font_size + '" '; }
  if("color" in style) { text += 'color="' + st.color + '" '; }
  text += '>' + value + '</text>';

  return text;
}

Subtle.svg_ellipsearc = function(x,y,r_x,r_y,start_angle,sweep_angle,total_rotation,style_){

  const cos = Math.cos;
  const sin = Math.sin;
  const pi = Math.PI;

  const f_matrix_times = (( [[a,b], [c,d]], [x,y]) => [ a * x + b * y, c * x + d * y]);
  const f_rotate_matrix = ((x) => [[cos(x),-sin(x)], [sin(x), cos(x)]]);
  const f_vec_add = (([a1, a2], [b1, b2]) => [a1 + b1, a2 + b2]);

  const f_svg_ellipse_arc = (([cx,cy],[rx,ry], [t1, delt], phi, style ) => {
    /* [
    returns a SVG path element that represent a ellipse.
    cx,cy → center of ellipse
    rx,ry → major minor radius
    t1 → start angle, in radian.
    delt → angle to sweep, in radian. positive.
    phi → rotation on the whole, in radian
    url: SVG Circle Arc http://xahlee.info/js/svg_circle_arc.html
    Version 2019-06-19
    ] */
    delt = delt % (2*pi);
    const rotMatrix = f_rotate_matrix (phi);
    const [sX, sY] = ( f_vec_add ( f_matrix_times ( rotMatrix, [rx * cos(t1), ry * sin(t1)] ), [cx,cy] ) );
    const [eX, eY] = ( f_vec_add ( f_matrix_times ( rotMatrix, [rx * cos(t1+delt), ry * sin(t1+delt)] ), [cx,cy] ) );
    const fA = ( (  delt > pi ) ? 1 : 0 );
    const fS = ( (  delt > 0 ) ? 1 : 0 );
    return '<path ' + style + ' d="' + 'M ' + sX + ' ' + sY + ' A ' + [ rx , ry , phi / (2*pi) *360, fA, fS, eX, eY ].join(' ') + '" />';
  });

  return f_svg_ellipse_arc( [x,y],[r_x,r_y], [start_angle, sweep_angle], total_rotation, Subtle.svg_style(style_) )

}

// =============================================================================
// DIAL HAND
// =============================================================================
Subtle.svg_dial_hand = function(x,y,r, angle, color = "#000000"){

  let hand = '';
  hand += '<path style="fill:' + color + '" d="M -2.618073,0 0.02776695,-23.8125 2.673597,0 c 0,3.96875 -5.29167,3.96875 -5.29167,0 z" ';
  hand += 'transform="';

  hand += 'translate(' + x + ' '  + y + ') ';
  hand += 'rotate(' + angle + ' 0 0) ';
  hand += 'scale(' + r/26.789  + ' '  + r/26.789 + ')';
  hand += '"/>';

  return hand;
}

// =============================================================================
// PLOT MARKERS
// =============================================================================
Subtle.svg_marker = function(x, y, marker, color, size){

  let normal_style = { stroke_color:color, stroke_width:3 };
  let fill_style   = { fill_color:color, stroke_color: color, stroke_width:3 };

  if(marker == "circle"){
    return svg_circle(x,y,size*0.5,normal_style);
  }
  if(marker == "circle_fill"){
    return svg_circle(x,y,size*0.5, fill_style);
  }
  if(marker == 'square'){
    return '<g transform="translate(-' + size*0.5 + ' -' + size*0.5 + ')">' + Subtle.svg_rectangle(x,y,size,size,normal_style) + '</g>';
  }
  if(marker == 'square_fill'){
    return '<g transform="translate(-' + size*0.5 + ' -' + size*0.5 + ')">' + Subtle.svg_rectangle(x,y,size,size,fill_style) + '</g>';
  }
  if(marker == 'cross'){
    return svg_cross(x,y,size,normal_style);
  }

}


// =============================================================================
// SVG ICONS
// =============================================================================
Subtle.svg_icon = function(icon, color = "#000000"){

  if(icon == "info_filled") return `
  <?xml version="1.0" encoding="UTF-8" standalone="no"?>
  <svg width="16" height="16" viewBox="0 0 4.2333332 4.2333335">
    <path
       d="M 2.1166717,1.75e-7 C 0.94766167,1.75e-7 1.675e-6,0.94766317 1.675e-6,2.1166662 c 0,1.169003 0.947659995,2.116667 2.116670025,2.116667 1.169,-10e-7 2.11666,-0.947665 2.11666,-2.116667 0,-1.16900303 -0.94766,-2.116665025 -2.11666,-2.116666025 z m -0.26459,0.793749995 h 0.52917 V 1.3229162 h -0.52917 z m 0,1.05833303 h 0.52917 v 1.5875 h -0.52917 z"
       style="mix-blend-mode:normal;fill:` + color + `;stroke:none;stroke-width:0.321651;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;paint-order:markers stroke fill"
    />
  </svg>`;

  if(icon == "warning_filled") return `
  <?xml version="1.0" encoding="UTF-8" standalone="no"?>
  <svg width="16" height="16" viewBox="0 0 4.2333332 4.2333335">
      <path
         style="mix-blend-mode:normal;fill:` + color + `;stroke:none;stroke-width:0.321651;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;paint-order:markers stroke fill"
         d="m 2.1166617,4.2333337 c 1.16901,0 2.11667,-0.947663 2.11667,-2.116666 0,-1.16900403 -0.94766,-2.116668025 -2.11667,-2.116668025 C 0.94766167,-3.25e-7 1.675e-6,0.94766467 1.675e-6,2.1166677 c 0,1.169003 0.947659995,2.116665 2.116660025,2.116666 z m 0.26459,-0.79375 h -0.52917 v -0.529166 h 0.52917 z m 0,-1.058333 h -0.52917 V 0.79374968 h 0.52917 z" />
  </svg>`;

  if(icon == "error_filled") return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
  <svg width="16" height="16" viewBox="0 0 4.2333332 4.2333335">
    <path
       d="M 2.1166666,0 C 1.2843348,-0.01155961 0.4816217,0.523417 0.16633713,1.2927643 -0.16283441,2.0485603 0.00748465,2.9874305 0.5844754,3.5770407 1.1396266,4.1745124 2.0542385,4.3925098 2.820063,4.1136519 3.6138585,3.8439944 4.1991293,3.0642163 4.230579,2.22559 4.2832729,1.4103472 3.8107355,0.59547794 3.0802812,0.23156249 2.7835328,0.07906631 2.4502307,-5.0760971e-4 2.1166666,0 Z m -0.79375,0.88780111 C 1.5875,1.1522122 1.8520833,1.4166233 2.1166666,1.6810343 2.38125,1.4166233 2.6458333,1.1522122 2.9104166,0.88780111 3.0554551,1.0328396 3.2004936,1.1778781 3.3455321,1.3229166 3.081121,1.5875 2.8167099,1.8520833 2.552299,2.1166666 2.8167099,2.38125 3.081121,2.6458333 3.3455321,2.9104166 3.2004936,3.0554551 3.0554551,3.2004936 2.9104166,3.3455321 2.6458333,3.081121 2.38125,2.8167099 2.1166666,2.552299 1.8520833,2.8167099 1.5875,3.081121 1.3229166,3.3455321 1.1778781,3.2004936 1.0328396,3.0554551 0.88780111,2.9104166 1.1522122,2.6458333 1.4166233,2.38125 1.6810343,2.1166666 1.4166233,1.8520833 1.1522122,1.5875 0.88780111,1.3229166 1.0328396,1.1778781 1.1778781,1.0328396 1.3229166,0.88780111 Z"
       style="mix-blend-mode:normal;fill:` + color + `;stroke:none;stroke-width:0.321651;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;paint-order:markers stroke fill" />
  </svg>`;

  if(icon == "info") return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
  <svg width="16" height="16" viewBox="0 0 4.2333332 4.2333335">
    <path
    style="mix-blend-mode:normal;fill:` + color + `;stroke:none;stroke-width:0.321651;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;paint-order:markers stroke fill"
    d="m 1.8520817,0.79375017 h 0.52917 V 1.3229162 h -0.52917 z m 0,1.05833303 h 0.52917 v 1.5875 h -0.52917 z" />
  </svg>`;

  if(icon == "warning") return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
  <svg width="16" height="16" viewBox="0 0 4.2333332 4.2333335">
    <path
    d="m 2.3812517,3.4395837 h -0.52917 v -0.529166 h 0.52917 z m 0,-1.058333 h -0.52917 V 0.79374968 h 0.52917 z"
    style="mix-blend-mode:normal;fill:` + color + `;stroke:none;stroke-width:0.321651;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;paint-order:markers stroke fill" />
  </svg>`;

  if(icon == "error") return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
  <svg width="16" height="16" viewBox="0 0 4.2333332 4.2333335">
    <path
    style="mix-blend-mode:normal;fill:` + color + `;stroke:none;stroke-width:0.321651;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;paint-order:markers stroke fill"
    d="m 1.3229166,0.88780111 0.79375,0.79323319 0.79375,-0.79323319 0.4351155,0.43511549 -0.7932331,0.79375 0.7932331,0.79375 L 2.9104166,3.3455321 2.1166666,2.552299 1.3229166,3.3455321 0.88780111,2.9104166 1.6810343,2.1166666 0.88780111,1.3229166 Z" />
  </svg>`;


}



// =============================================================================
// SVG KNOB AND LED
// =============================================================================
Subtle.svg_knob = function(text_left, text_right, angle = 0, color = "#00baff"){

  return `
  <svg style="width:100%; height: 100%" width="178.2265" height="133.72655" viewBox="0 0 47.155758 35.381817" version="1.1">
  <g transform="translate(6.6238806,1.5151517)">
    <circle
      style="opacity:0.993;fill:#000000;fill-rule:evenodd;stroke-width:0.529167;stroke-linecap:round;stroke-linejoin:round;paint-order:markers stroke fill;stop-color:#000000"
      cx="16.933332"
      cy="16.933332"
      r="16.933332" />
    <circle
      r="16.933332"
      cy="16.933332"
      cx="16.933332"
      style="opacity:0.993;fill:#d7dde3;fill-rule:evenodd;stroke-width:0.529167;stroke-linecap:round;stroke-linejoin:round;paint-order:markers stroke fill;stop-color:#000000;fill-opacity:1" />
    <circle
      style="opacity:0.993;fill:#3a3c39;fill-rule:evenodd;stroke-width:0.52916667;stroke-linecap:round;stroke-linejoin:round;paint-order:markers fill stroke;stop-color:#000000;fill-opacity:1;stroke:none;stroke-miterlimit:4;stroke-dasharray:none"
      id="circle835-5"
      cx="16.933332"
      cy="16.933332"
      r="15.530168" />
    <g
      id="g911"
      transform="rotate(` + angle + `,16.588873,17.816322)">
      <path
        id="path895"
        style="color:#000000;font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-size:medium;line-height:normal;font-family:sans-serif;font-variant-ligatures:normal;font-variant-position:normal;font-variant-caps:normal;font-variant-numeric:normal;font-variant-alternates:normal;font-variant-east-asian:normal;font-feature-settings:normal;font-variation-settings:normal;text-indent:0;text-align:start;text-decoration:none;text-decoration-line:none;text-decoration-style:solid;text-decoration-color:#000000;letter-spacing:normal;word-spacing:normal;text-transform:none;writing-mode:lr-tb;direction:ltr;text-orientation:mixed;dominant-baseline:auto;baseline-shift:baseline;text-anchor:start;white-space:normal;shape-padding:0;shape-margin:0;inline-size:0;clip-rule:nonzero;display:inline;overflow:visible;visibility:visible;isolation:auto;mix-blend-mode:normal;color-interpolation:sRGB;color-interpolation-filters:linearRGB;solid-color:#000000;solid-opacity:1;vector-effect:none;fill:#7e827e;fill-opacity:1;fill-rule:nonzero;stroke:none;stroke-width:0.529167;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-dashoffset:0;stroke-opacity:1;color-rendering:auto;image-rendering:auto;shape-rendering:auto;text-rendering:auto;enable-background:accumulate;stop-color:#000000"
        d="m 16.4021,2.8747598 c -0.552886,0.019399 -1.099809,0.1164204 -1.532723,0.289388 -0.216458,0.086484 -0.406458,0.1919867 -0.552938,0.3260783 -0.146479,0.1340917 -0.25299,0.3064756 -0.265617,0.5059125 -0.01956,0.2919626 -0.404963,6.6731604 -0.722953,13.0643184 -0.158995,3.195579 -0.300215,6.387726 -0.371037,8.812382 -0.03541,1.212329 -0.05363,2.23389 -0.04651,2.96881 0.0036,0.367462 0.01361,0.661652 0.03101,0.879018 0.0087,0.10868 0.01857,0.197553 0.03307,0.271301 0.0145,0.07374 -3.97e-4,0.128545 0.103869,0.222726 l 0.01757,0.01601 0.01964,0.0093 c 2.527677,0.96493 5.22497,1.306494 7.636226,0 l 0.01964,-0.0093 0.01757,-0.01601 c 0.104272,-0.09418 0.0873,-0.148982 0.101802,-0.222726 0.0145,-0.07375 0.02645,-0.162621 0.03514,-0.271301 0.01739,-0.217366 0.02589,-0.511556 0.02946,-0.879018 0.0071,-0.73492 -0.0095,-1.756481 -0.04496,-2.96881 C 20.839532,23.448183 20.696246,20.256036 20.53725,17.060457 20.219259,10.6693 19.835924,4.2880782 19.816364,3.9961386 19.803738,3.7967017 19.69516,3.6243178 19.54868,3.4902261 19.402201,3.3561345 19.214267,3.2506319 18.997809,3.1641478 c -0.432916,-0.1729676 -0.981905,-0.269989 -1.53479,-0.289388 -0.122044,-0.00425 -0.239774,0.00102 -0.3576,0 -0.117826,-0.00102 -0.229077,-0.00209 -0.343649,0 -0.114572,0.00209 -0.237661,-0.00422 -0.359668,0 z"/>
      <rect
        ry="0.52916664"
        rx="0.52916664"
        y="4.2333331"
        x="16.404167"
        height="3.175"
        width="1.0583333"
        id="rect900"
        style="opacity:0.993;fill:` + color + `;fill-opacity:1;fill-rule:evenodd;stroke:none;stroke-width:0.607419;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;paint-order:markers stroke fill;stop-color:#000000" />
    </g>
    <text
       x="6.6218114"
       y="1.5151517"
       fill="` + Subtle.COLORS["text"] + `"
       style="font-size:4.23333px;stroke-width:0.264583; text-anchor:end">
       ` + text_left + `
    </text>
    <text
      y="1.5151517"
      x="27.102222"
      fill="` + Subtle.COLORS["text"] + `"
      style="font-size:4.23333px;stroke-width:0.264583">
      ` + text_right + `
    </text>
  </g>
  </svg>`;

}

Subtle.svg_led = function(color, size){
  return `
  <?xml version="1.0" encoding="UTF-8" standalone="no"?>
  <svg width="` + size + `" height="` + size + `" viewbox="0 0 64 64">
    <defs
      id="defs4">
      <linearGradient
        inkscape:collect="always"
        id="linearGradient3767">
        <stop
          style="stop-color:#ffffff;stop-opacity:1;"
          offset="0"
          id="stop3769" />
        <stop
          style="stop-color:#ffffff;stop-opacity:0;"
          offset="1"
          id="stop3771" />
      </linearGradient>
      <radialGradient
        inkscape:collect="always"
        xlink:href="#linearGradient3767"
        id="radialGradient3775"
        cx="16.454626"
        cy="11.617443"
        fx="16.454626"
        fy="11.617443"
        r="17.429127"
        gradientTransform="matrix(-1.1109257,0.05194102,-0.03008734,-0.64351499,16.070171,26.445752)"
        gradientUnits="userSpaceOnUse" />
    </defs>
    <g
      transform="translate(3.2116215,3.2116215)"
      inkscape:label="Capa 1"
      inkscape:groupmode="layer"
      id="layer1">
      <circle
        r="28.223236"
        style="fill:` + color + `;fill-opacity:1;fill-rule:nonzero;stroke:#000000;stroke-width:7.55353;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:0.533333;paint-order:stroke fill markers"
        id="path2985"
        cx="28.78838"
        cy="28.78838" />
      <ellipse
        style="opacity:0.56;fill:url(#radialGradient3775);fill-opacity:1;fill-rule:nonzero;stroke:none;stroke-width:1.08461"
        id="path3765"
        transform="rotate(-50.364246)"
        cx="-3.5457149"
        cy="22.126102"
        rx="16.49552"
        ry="9.1520014"
        inkscape:transform-center-x="13.80319"
        inkscape:transform-center-y="-10.987245" />
    </g>
  </svg>`;

}

// =============================================================================
// SORTING BUTTONS
// =============================================================================
Subtle.svg_sort_buttons = function(mode = "down"){ // mode = up, down

  let svgpath = ""
  if(mode == "down"){ svgpath = 'd="M 2.1166669,3.9497342 4.2333334,0.2835992 1.4999998e-8,0.2835994 Z"' }
  if(mode == "up"){ svgpath = 'd="M 2.1166669,0.2835992 4.2333334,3.9497342 1.4999998e-8,3.949734 Z"' }
  if(mode == "chevron_down") { svgpath = 'd="m 2.1176412,3.0162171 1.634766,-1.451172 a 0.1984375,0.1984375 0 0 0 0.01758,-0.28125 0.1984375,0.1984375 0 0 0 -0.28125,-0.01563 l -1.371094,1.216797 -1.37304702,-1.216797 a 0.1984375,0.1984375 0 0 0 -0.28125,0.01563 0.1984375,0.1984375 0 0 0 0.01758,0.28125 z"' }
  if(mode == "chevron_up") { svgpath = 'd="m 2.1156922,1.2171163 -1.63476603,1.451172 a 0.1984375,0.1984375 0 0 0 -0.01758,0.28125 0.1984375,0.1984375 0 0 0 0.28125,0.01563 l 1.37109403,-1.216797 1.373047,1.216797 a 0.1984375,0.1984375 0 0 0 0.28125,-0.01563 0.1984375,0.1984375 0 0 0 -0.01758,-0.28125 z"' }
  if(mode == "chevron_right") { svgpath = 'd="M 3.0162171,2.1156922 1.5650451,0.48092617 a 0.1984375,0.1984375 0 0 0 -0.28125,-0.01758 0.1984375,0.1984375 0 0 0 -0.01563,0.28125 l 1.216797,1.37109403 -1.216797,1.373047 a 0.1984375,0.1984375 0 0 0 0.01563,0.28125 0.1984375,0.1984375 0 0 0 0.28125,-0.01758 z"' }

  return `
  <svg style="display: inline; width:8px; height: 8px" width="16" height="16" viewBox="0 0 4.2333333 4.2333335" version="1.1">
  <g
    inkscape:label="Layer 1"
    inkscape:groupmode="layer"
    id="layer1">
   <path
      id="path837-8-3"
      style="opacity:0.99;fill:#000000;fill-rule:evenodd;stroke:none;stroke-width:0.680089;stroke-linecap:round;stroke-linejoin:round;paint-order:markers fill stroke;stop-color:#000000"
      inkscape:transform-center-y="-0.49183891" ${svgpath}/>
  </g>
  </svg>`

}
