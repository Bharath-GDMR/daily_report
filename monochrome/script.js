const r = document.querySelector(":root");

var hueslider = document.getElementById("hueRange");
var hueoutput = document.getElementById("hueValue");
hueoutput.textContent = hueslider.value;

function hueRange() {
  r.style.setProperty("--hue", hueslider.value);
  hueoutput.textContent = event.target.value;
}
