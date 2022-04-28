Subtle.ROUNDING = 2;

Subtle.ROUND = function(number, dec = -1){
  if(dec == -1) dec = Subtle.ROUNDING;
  if(typeof number != "number") return number;
  let d = {
    0: 1,
    1: 10,
    2: 100,
    3: 1000,
    4: 10000,
    5: 100000,
    6: 1000000,
  }
  return Math.round(number * d[dec]) / d[dec];
}
