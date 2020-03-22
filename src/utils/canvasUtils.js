import {
  DEFAULT_LINE_COLOR,
  DEFAULT_LINE_WIDTH,
} from '@/constants';

export const drawArrow = (ctx, options) => {
  const {
    x, y, dx, dy,
    color = DEFAULT_LINE_COLOR,
    thickness = DEFAULT_LINE_WIDTH,
  } = options;

  ctx.strokeStyle = color;
  ctx.lineWidth = thickness;

  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(dx, dy);
  ctx.stroke();

  const ang = Math.atan2(dy - y, dx - x);

  ctx.save();
  ctx.translate(dx, dy);
  ctx.rotate(ang - Math.PI * 1.1);

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(20, 20);
  ctx.stroke();

  ctx.restore();

  ctx.save();
  ctx.translate(dx, dy);
  ctx.rotate(ang + Math.PI * 0.6);

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(20, 20);
  ctx.stroke();

  ctx.restore();
};

export const createCanvas = (options) => {
  const { width, height } = options || {};
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  return canvas;
};
