// Функции для отрисовки графиков на canvas
export function drawLineChart(canvas, xs, ys, {color='#7dc4ff', fill=false, yLabel='', showPoints=false}={}) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width = canvas.clientWidth; // responsive
  const H = canvas.height = canvas.clientHeight;
  ctx.clearRect(0,0,W,H);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const pad = 40;
  const xTo = x => pad + (W-2*pad) * ( (x-minX)/(maxX-minX || 1) );
  const yTo = y => H-pad - (H-2*pad) * ( (y-minY)/(maxY-minY || 1) );

  // оси
  ctx.strokeStyle = '#2a3243';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pad, pad); ctx.lineTo(pad, H-pad); ctx.lineTo(W-pad, H-pad); ctx.stroke();
  
  // Сетка
  ctx.strokeStyle = '#1a1f2e';
  ctx.lineWidth = 0.5;
  for (let i = 1; i < 5; i++) {
    const y = pad + (H-2*pad) * i / 5;
    ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(W-pad, y); ctx.stroke();
  }
  
  // линия
  ctx.strokeStyle = color; ctx.lineWidth=2; ctx.beginPath();
  ys.forEach((y,i) => {
    const X = xTo(xs[i]); const Y = yTo(ys[i]);
    if (i===0) ctx.moveTo(X,Y); else ctx.lineTo(X,Y);
  });
  ctx.stroke();

  // Точки
  if (showPoints) {
    ctx.fillStyle = color;
    ys.forEach((y,i) => {
      const X = xTo(xs[i]); const Y = yTo(ys[i]);
      ctx.beginPath();
      ctx.arc(X, Y, 3, 0, 2*Math.PI);
      ctx.fill();
    });
  }

  if (fill) {
    ctx.lineTo(xTo(xs[xs.length-1]), H-pad);
    ctx.lineTo(xTo(xs[0]), H-pad);
    ctx.closePath();
    ctx.fillStyle = color + '33';
    ctx.fill();
  }

  // Подписи осей
  ctx.fillStyle = '#9aa3b2';
  ctx.font = '11px sans-serif';
  if (yLabel) {
    ctx.fillText(yLabel, pad+6, pad+15);
  }
  
  // Значения на осях
  ctx.fillText(minX.toFixed(0), pad, H-pad+15);
  ctx.fillText(maxX.toFixed(0), W-pad, H-pad+15);
  ctx.fillText(maxY.toFixed(1), pad-35, pad+5);
  ctx.fillText(minY.toFixed(1), pad-35, H-pad+5);
}

export function drawHistogram(canvas, buckets, {color='#a6e3a1'}={}) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width = canvas.clientWidth;
  const H = canvas.height = canvas.clientHeight;
  ctx.clearRect(0,0,W,H);
  const pad = 30;
  const maxCount = Math.max(...buckets.map(b=>b.count),1);
  const barW = (W-2*pad)/buckets.length;
  ctx.strokeStyle = '#2a3243';
  ctx.beginPath(); ctx.moveTo(pad, pad); ctx.lineTo(pad, H-pad); ctx.lineTo(W-pad, H-pad); ctx.stroke();
  ctx.fillStyle = color;
  buckets.forEach((b, i) => {
    const h = (H-2*pad) * (b.count/maxCount);
    ctx.fillRect(pad + i*barW + 2, (H-pad) - h, barW - 4, h);
  });
}

export function drawMultiLineChart(canvas, series, {yLabel='', xLabel='', showOptimal=false, optimalPoint=null}={}) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width = canvas.clientWidth || 720;
  const H = canvas.height = canvas.clientHeight || 220;
  ctx.clearRect(0,0,W,H);
  const pad = 40;
  const allXs = series.flatMap(s => s.xs);
  const allYs = series.flatMap(s => s.ys);
  let minX = 0, maxX = 10, minY = 0, maxY = 10;
  if (allXs.length >= 2 && allYs.length >= 2) {
    minX = Math.min(...allXs); maxX = Math.max(...allXs);
    minY = Math.min(...allYs); maxY = Math.max(...allYs);
  }
  const xTo = x => pad + (W-2*pad) * ( (x-minX)/(maxX-minX || 1) );
  const yTo = y => H-pad - (H-2*pad) * ( (y-minY)/(maxY-minY || 1) );

  // оси
  ctx.strokeStyle = '#2a3243';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pad, pad); ctx.lineTo(pad, H-pad); ctx.lineTo(W-pad, H-pad); ctx.stroke();

  // Сетка
  ctx.strokeStyle = '#1a1f2e';
  ctx.lineWidth = 0.5;
  for (let i = 1; i < 5; i++) {
    const y = pad + (H-2*pad) * i / 5;
    const x = pad + (W-2*pad) * i / 5;
    ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(W-pad, y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x, pad); ctx.lineTo(x, H-pad); ctx.stroke();
  }

  // линии
  series.forEach(s => {
    ctx.strokeStyle = s.color || '#7dc4ff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    s.ys.forEach((y,i) => {
      const X = xTo(s.xs[i]); const Y = yTo(y);
      if (i===0) ctx.moveTo(X,Y); else ctx.lineTo(X,Y);
    });
    ctx.stroke();
  });

  // Оптимальная точка
  if (showOptimal && optimalPoint) {
    ctx.strokeStyle = '#f38ba8';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    const optX = xTo(optimalPoint.x);
    ctx.beginPath();
    ctx.moveTo(optX, pad);
    ctx.lineTo(optX, H-pad);
    ctx.stroke();
    ctx.setLineDash([]);
    
    ctx.fillStyle = '#f38ba8';
    ctx.beginPath();
    ctx.arc(optX, yTo(optimalPoint.y), 5, 0, 2*Math.PI);
    ctx.fill();
    
    ctx.fillStyle = '#f38ba8';
    ctx.font = '11px sans-serif';
    ctx.fillText(`Optimal: ${optimalPoint.x}`, optX + 8, yTo(optimalPoint.y) - 8);
  }

  // легенда
  const legendX = W - pad - 140;
  let legendY = pad + 10;
  ctx.font = '11px sans-serif';
  series.forEach(s => {
    ctx.fillStyle = s.color || '#7dc4ff';
    ctx.fillRect(legendX, legendY-8, 12, 4);
    ctx.fillStyle = '#c7cdd6';
    ctx.fillText(s.label || '', legendX + 18, legendY);
    legendY += 14;
  });

  // Подписи осей
  ctx.fillStyle = '#9aa3b2';
  ctx.font = '11px sans-serif';
  if (yLabel) {
    ctx.fillText(yLabel, pad+6, pad+15);
  }
  if (xLabel) {
    ctx.fillText(xLabel, W/2 - 20, H-10);
  }
}