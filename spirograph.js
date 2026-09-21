"use strict";

function gcd(a, b) {
  while (b !== 0) [a, b] = [b, a % b];
  return a;
}

// Hypotrochoid: a point attached to a circle rolling inside a fixed circle.
function spirographPoint(R, r, d, angle) {
  const radius = R - r;
  const rotation = radius / r * angle;
  return [
    radius * Math.cos(angle) + d * Math.cos(rotation),
    radius * Math.sin(angle) - d * Math.sin(rotation),
  ];
}

function initSpirograph() {
  const status = document.getElementById("load-status");
  if (typeof p5 === "undefined") {
    status.textContent = "p5.jsを読み込めませんでした。インターネット接続を確認して、ページを再読み込みしてください。";
    return;
  }

  const form = document.getElementById("parameters");
  const error = document.getElementById("input-error");
  const info = document.getElementById("curve-info");
  const inputs = ["R", "r", "d"].map((name) => document.getElementById(name));
  const ranges = inputs.map((input) => document.getElementById(`${input.id}-range`));
  let values = inputs.map((input) => input.valueAsNumber);

  new p5((p) => {
    let canvas;
    p.setup = () => {
      p.pixelDensity(1);
      canvas = p.createCanvas(900, 900);
      canvas.attribute("role", "img");
      p.noLoop();
      status.hidden = true;
    };

    p.draw = () => {
      const [R, r, d] = values;
      const divisor = gcd(R, r);
      const turns = r / divisor;
      const end = Math.PI * 2 * turns;
      // Sample both rotations finely, including for small r and coprime radii.
      const steps = 120 * Math.max(turns, (R - r) / divisor);
      const scale = p.width * 0.43 / (R - r + d);
      p.background("#fffdf9");
      p.translate(p.width / 2, p.height / 2);
      p.noFill();
      p.stroke("#b84d24");
      p.strokeWeight(1.5);
      p.beginShape();
      for (let i = 0; i <= steps; i++) {
        const [x, y] = spirographPoint(R, r, d, end * i / steps);
        p.vertex(x * scale, y * scale);
      }
      p.endShape(p.CLOSE);
      canvas.attribute("aria-label", `固定円の半径${R}、回転円の半径${r}、ペンの距離${d}のスピログラフ`);
      info.textContent = `R ${R} / r ${r} / d ${d}`;
    };

    function update() {
      // Reducing R also reduces r's upper limit so the rolling circle stays inside.
      if (inputs[0].validity.valid) {
        const maximum = inputs[0].valueAsNumber - 1;
        inputs[1].max = ranges[1].max = maximum;
        if (inputs[1].valueAsNumber > maximum) inputs[1].value = maximum;
      }
      const invalid = inputs.find((input) => !input.validity.valid);
      for (const input of inputs) input.setAttribute("aria-invalid", String(!input.validity.valid));
      error.textContent = invalid ? `${invalid.name}には${invalid.min}〜${invalid.max}の整数を入力してください。` : "";
      if (invalid) return;
      values = inputs.map((input) => input.valueAsNumber);
      ranges.forEach((range, i) => { range.value = values[i]; });
      p.redraw();
    }

    form.addEventListener("input", (event) => {
      const name = event.target.dataset.parameter;
      if (name) document.getElementById(name).value = event.target.value;
      update();
    });
    form.addEventListener("submit", (event) => event.preventDefault());
    form.addEventListener("reset", () => {
      // Native reset restores the input values after this event finishes.
      requestAnimationFrame(update);
    });
  }, document.getElementById("canvas-container"));
}

window.addEventListener("DOMContentLoaded", initSpirograph);
