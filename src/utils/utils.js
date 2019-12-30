import * as colorUtil from './colorUtils';
import { generateOrgChartData, generateOrgChartDataFolded } from './dataGenerator';

function compose(...funcs) {
  if (funcs.length === 0) {
    return arg => arg;
  }
  if (funcs.length === 1) {
    return funcs[0];
  }
  return funcs.reduce((a, b) => (...args) => a(b(...args)));
}

function uuid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return 'id-' + s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

function getRandomColor16() {
  return '#' + Math.floor(Math.random() * 0xffffff).toString(16);
}

// 在canvas画布中绘制text
function text(ctx, text, x, y, fontSize, fontColor) {
  ctx.font = '14px Arial';
  ctx.fillStyle = fontColor;
  ctx.fillText(text, x, y);
}

// 在指定的区域绘制text, 如果超过限制就换行
function wrapText(context, text, x, y, maxWidth, lineHeight, fontColor) {
  context.fillStyle = fontColor;
  let words = text.split(' ');
  let line = '';
  for (let n = 0; n < words.length; n++) {
    let testLine = line + words[n] + ' ';
    let metrics = context.measureText(testLine);
    let testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      context.fillText(line, x, y);
      line = words[n] + ' ';
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  context.fillText(line, x, y);
}

// 绘制圆角方形
function roundRect(context, x, y, width, height, radius = 5, fill, stroke = true) {
  if (typeof radius === 'number') {
    radius = { tl: radius, tr: radius, br: radius, bl: radius };
  } else {
    let defaultRadius = { tl: 0, tr: 0, br: 0, bl: 0 };
    for (let side in defaultRadius) {
      radius[side] = radius[side] || defaultRadius[side];
    }
  }
  context.beginPath();
  context.moveTo(x + radius.tl, y);
  context.lineTo(x + width - radius.tr, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
  context.lineTo(x + width, y + height - radius.br);
  context.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
  context.lineTo(x + radius.bl, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
  context.lineTo(x, y + radius.tl);
  context.quadraticCurveTo(x, y, x + radius.tl, y);
  context.closePath();
  if (fill) {
    context.fill();
  }
  if (stroke) {
    context.stroke();
  }
}

export { compose, uuid, getRandomColor16, text, wrapText, roundRect, generateOrgChartData, generateOrgChartDataFolded };
export default {
  ...colorUtil,
  compose,
  uuid,
  getRandomColor16,
  text,
  wrapText,
  roundRect,
  generateOrgChartData,
  generateOrgChartDataFolded,
};
