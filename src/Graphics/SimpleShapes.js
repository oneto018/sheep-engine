import * as PIXI from "pixi.js-legacy";

/**
 *
 * @param {{shape:"rectangle"|"circle", radius?:number, height?:number, width?:number}} param0
 *
 */
export function createSimpleShapeSprite({
  shape,
  radius,
  height,
  width,
  filled = true,
  color = "#66FF00",
  lineWidth = 1,
}) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (shape === "circle") {
    canvas.width = radius * 2;
    canvas.height = radius * 2;
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;

    if (filled) {
      ctx.fillStyle = color;
    }
    ctx.beginPath();

    ctx.arc(radius, radius, radius - lineWidth / 2, 0, 2 * Math.PI);
    if (filled) {
      ctx.fill();
    }
    ctx.stroke();
  } else if (shape === "rectangle") {
    canvas.width = width;
    canvas.height = height;
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;

    if (filled) {
      ctx.fillStyle = color;
    }
    if (filled) {
      ctx.fillRect(0, 0, width, height);
    } else {
      ctx.strokeRect(0, 0, width, height);
    }
  }
  window.__cn = canvas;
  const sprite = PIXI.Sprite.from(canvas);
  //document.removeChild(canvas);
  //canvas.remove();
  return sprite;
}
