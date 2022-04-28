// =============================================================================
// SET COLOR MODE
// =============================================================================
Subtle.COLOR_MODE = "light";

Subtle.SET_COLOR_MODE = function(mode = "dark"){
  Subtle.COLOR_MODE = mode;
  if(mode == "dark") Subtle.COLORS = Subtle.DARK_MODE;
  else if(mode == "light") Subtle.COLORS = Subtle.LIGHT_MODE;

  document.getElementsByTagName("body")[0].style.backgroundColor = Subtle.COLORS["background"];
  document.getElementsByTagName("body")[0].style.color = Subtle.COLORS["text"];
}

Subtle.SET_COLOR = function(color, key = "primary"){
  Subtle.LIGHT_MODE[key] = color;
  Subtle.DARK_MODE[key] = color;

  if(key == "primary"){
    for(const p in Subtle.COLOR_PALETTES){
      
    }
  }

  if(key=="primary") Subtle.INSERT_COLOR_IN_COLOR_PALETTES(color);
}

Subtle.INSERT_COLOR_IN_COLOR_PALETTES = function(color){
  for(const p in Subtle.COLOR_PALETTES){
    Subtle.COLOR_PALETTES[p].splice(0,0,color);
  }
}

Subtle.GET_COLOR = function(color){
  if(color in Subtle.COLORS) { return Subtle.COLORS[color] }
  return color;
}

// =============================================================================
// MAIN COLORS
// =============================================================================
Subtle.LIGHT_MODE = {};
Subtle.DARK_MODE = {};

Subtle.COLORS = Subtle.LIGHT_MODE;

// =============================================================================
// LIGHT MODE
// =============================================================================

Subtle.LIGHT_MODE["primary"] = "#5bbadc";
Subtle.LIGHT_MODE["background"] = "#FFFFFF";
Subtle.LIGHT_MODE["text"] = "#000000";
Subtle.LIGHT_MODE["contrast"] = "#FFFFFF";

Subtle.LIGHT_MODE["control"] = "#555555";
Subtle.LIGHT_MODE["inactive"] = "#808080";
Subtle.LIGHT_MODE["ok"] = "#73d216";
Subtle.LIGHT_MODE["error"] = "#dc0000";
Subtle.LIGHT_MODE["info"] = "#0088e8";
Subtle.LIGHT_MODE["warning"] = "#fbb901";
Subtle.LIGHT_MODE["inactive"] = "#aea79f";

// =============================================================================
// DARK MODE
// =============================================================================
Subtle.DARK_MODE["primary"] = "#0086b3";
Subtle.DARK_MODE["background"] = "#121212";
Subtle.DARK_MODE["text"] = "#FFFFFF";
Subtle.DARK_MODE["contrast"] = "#FFFFFF";

Subtle.DARK_MODE["control"] = "#A5A5A5";
Subtle.DARK_MODE["inactive"] = "#808080";
Subtle.DARK_MODE["ok"] = "#73d216";
Subtle.DARK_MODE["error"] = "#ff2424";
Subtle.DARK_MODE["info"] = "#0088e8";
Subtle.DARK_MODE["warning"] = "#fbb901";
Subtle.DARK_MODE["inactive"] = "#aea79f";

// =============================================================================
// COLOR PALETTES
// =============================================================================
Subtle.COLOR_PALETTES = {};

Subtle.COLOR_PALETTES["main"] = [
  "#5bbadc",
  "#3d5afe",
  "#00e676",
  "#76ff03",
  "#c6ff00",
  "#ffc400",
  "#ff3d00",
  "#f50057",
  "#d500f9",
  "#1de9b6",
];

Subtle.COLOR_PALETTES["alternative"] = [
  "#d90d39",
  "#f8432d",
  "#ff8e25",
  "#ef55f1",
  "#c543fa",
  "#6324f5",
  "#2e21ea",
  "#3d719a",
  "#31ac28",
  "#96d310",
];

Subtle.COLOR_PALETTES["creamy"] = [
  "#ea989d",
  "#b9d7f7",
  "#c6bcdd",
  "#9bfdce",
  "#bee8bb",
  "#f9f2c0",
  "#5f8c96",
  "#9b91ac",
  "#ae896f",
  "#cc6d55",
];

Subtle.COLOR_PALETTES["contrast"] = [
  "#8ae234",
  "#fcaf3e",
  "#729fcf",
  "#ad7fa8",
  "#ef2929",
  "#4e9a06",
  "#ce5c00",
  "#204a87",
  "#5c3566",
  "#a40000",
];

Subtle.COLOR_PALETTES["soft"] = [
  "#ef9a9a",
  "#ce93d8",
  "#b39ddb",
  "#90caf9",
  "#80cbc4",
  "#a5d6a7",
  "#ffe082",
  "#ffcc80",
  "#ffab91",
  "#b0bec5",
];

Subtle.COLOR_PALETTES["accent"] = [
  "#d50000",
  "#c51162",
  "#6200ea",
  "#2962ff",
  "#00bfa5",
  "#00c853",
  "#ffab00",
  "#ff6b00",
  "#dd2c00",
  "#263238",
];
