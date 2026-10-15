/* Nonlinear pendulum for Lección 1. No external dependencies. */
(function () {
  'use strict';
  const H = 1 / 240, DURATION = 60;
  function field(s, p) { return [s[1], -(p.mu * s[1] + p.kappa * Math.sin(s[0])) / p.m, p.mu * s[1] * s[1]]; }
  function step(s, p, h = H) {
    const a = field(s, p), b = field(s.map((v, i) => v + h * a[i] / 2), p);
    const c = field(s.map((v, i) => v + h * b[i] / 2), p), d = field(s.map((v, i) => v + h * c[i]), p);
    return s.map((v, i) => v + h * (a[i] + 2 * b[i] + 2 * c[i] + d[i]) / 6);
  }
  function energy(s, p) { return p.m * s[1] ** 2 / 2 + p.kappa * (1 - Math.cos(s[0])); }
  function simulate(p, seconds = DURATION) {
    const points = [], start = [p.theta, p.v, 0], e0 = energy(start, p);
    let s = start;
    for (let i = 0; i <= Math.round(seconds / H); i++) {
      if (i % 8 === 0) points.push({ t: i * H, theta: s[0], v: s[1], loss: s[2], e: energy(s, p), k: p.m * s[1] ** 2 / 2 });
      if (i < Math.round(seconds / H)) s = step(s, p);
    }
    return { points, e0 };
  }
  const api = { field, step, energy, simulate, H, DURATION };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof document === 'undefined') return;
  const root = document.querySelector('[data-pendulum-lesson]');
  if (!root) return;
  const inputs = [...root.querySelectorAll('[data-param]')];
  const q = s => root.querySelector(s), fmt = n => Number(n).toLocaleString('es', { maximumFractionDigits: 3 });
  const play = q('[data-play]'), seek = q('[data-seek]'), status = q('[data-status]');
  let data, p, time = 0, running = false, previous = null, frame = null;
  function stop() {
    running = false; previous = null;
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null; play.textContent = 'Iniciar'; play.setAttribute('aria-pressed', 'false');
  }
  const line = (x1, y1, x2, y2, cls = '') => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="${cls}"/>`;
  function plot(el, series, bounds, labels, cursor) {
    const [xmin, xmax, ymin, ymax] = bounds, left = 58, top = 18, width = 550, height = 210;
    const sx = x => left + (x - xmin) / (xmax - xmin) * width;
    const sy = y => top + height - (y - ymin) / (ymax - ymin) * height;
    let html = '';
    for (let i = 0; i <= 4; i++) {
      const x = xmin + (xmax - xmin) * i / 4, y = ymin + (ymax - ymin) * i / 4;
      html += line(sx(x), top, sx(x), top + height, 'sim-grid');
      html += line(left, sy(y), left + width, sy(y), 'sim-grid');
      html += `<text x="${sx(x)}" y="248" text-anchor="middle">${fmt(x)}</text><text x="50" y="${sy(y) + 4}" text-anchor="end">${fmt(y)}</text>`;
    }
    if (xmin < 0 && xmax > 0) html += line(sx(0), top, sx(0), top + height, 'sim-axis');
    if (ymin <= 0 && ymax >= 0) html += line(left, sy(0), left + width, sy(0), 'sim-axis');
    for (const s of series) {
      const path = s.points.map((v, i) => `${i ? 'L' : 'M'}${sx(v[0]).toFixed(2)},${sy(v[1]).toFixed(2)}`).join(' ');
      html += `<path d="${path}" class="${s.cls}"/>`;
    }
    if (cursor) html += `<circle cx="${sx(cursor[0])}" cy="${sy(cursor[1])}" r="5" class="sim-current"/>`;
    html += `<text x="335" y="274" text-anchor="middle">${labels[0]}</text><text x="12" y="12">${labels[1]}</text>`;
    el.innerHTML = html;
  }
  function render() {
    const points = data.points, index = Math.min(points.length - 1, Math.round(time * 30)), s = points[index];
    const x = 180 + 122 * Math.sin(s.theta), y = 45 + 122 * Math.cos(s.theta);
    q('[data-bob]').setAttribute('cx', x); q('[data-bob]').setAttribute('cy', y);
    q('[data-rod]').setAttribute('x2', x); q('[data-rod]').setAttribute('y2', y);
    q('[data-values]').textContent = `t = ${fmt(s.t)} s · θ = ${fmt(s.theta)} rad · v = ${fmt(s.v)} rad/s`;
    q('[data-energy-values]').textContent = `E = ${fmt(s.e)} · K = ${fmt(s.k)} · U = ${fmt(s.e - s.k)} · D = ${fmt(s.loss)}`;
    q('[data-error]').textContent = `Error del balance E + D = E₀: ${Math.abs(s.e + s.loss - data.e0).toExponential(2)} (unidades del modelo).`;
    seek.value = s.t;
    q('[data-time]').textContent = `${fmt(s.t)} / 60 s`;
    const thetas = points.map(a => a.theta), velocities = points.map(a => a.v);
    const lo = Math.min(-0.5, ...thetas), hi = Math.max(0.5, ...thetas), vmax = Math.max(0.5, ...velocities.map(Math.abs));
    const margin = Math.max(0.1, (hi - lo) * 0.08);
    plot(q('[data-phase]'), [
      { points: points.map(a => [a.theta, a.v]), cls: 'sim-reference' },
      { points: points.slice(0, index + 1).map(a => [a.theta, a.v]), cls: 'sim-phase' }
    ], [lo - margin, hi + margin, -vmax * 1.15, vmax * 1.15], ['θ (rad, sin reducir módulo 2π)', 'v (rad/s)'], [s.theta, s.v]);
    plot(q('[data-energy]'), [
      { points: [[0, data.e0], [60, data.e0]], cls: 'sim-reference' },
      { points: points.slice(0, index + 1).map(a => [a.t, a.k]), cls: 'sim-kinetic' },
      { points: points.slice(0, index + 1).map(a => [a.t, a.e - a.k]), cls: 'sim-potential' },
      { points: points.slice(0, index + 1).map(a => [a.t, a.e]), cls: 'sim-total' }
    ], [0, 60, 0, Math.max(1, data.e0 * 1.12)], ['t (s)', 'Energía (unidades del modelo)']);
  }
  function reset() {
    stop(); time = 0; p = {};
    for (const input of inputs) {
      const key = input.dataset.param, value = Number(input.value);
      p[key] = key === 'theta' ? value * Math.PI / 180 : value;
      q(`[data-output="${key}"]`).textContent = fmt(value) + (key === 'theta' ? '°' : '');
    }
    data = simulate(p);
    status.textContent = p.mu === 0 ? 'Sin fricción: la energía total se conserva.' : 'Con fricción: dE/dt = −μv² ≤ 0; la energía se disipa.';
    render();
  }
  function tick(stamp) {
    if (!running) return;
    if (previous !== null) time = Math.min(60, time + Math.min(0.1, (stamp - previous) / 1000));
    previous = stamp; render();
    if (time >= 60) { stop(); status.textContent = 'Simulación finalizada. Puedes recorrer el tiempo o reiniciar.'; }
    else frame = requestAnimationFrame(tick);
  }
  for (const input of inputs) input.addEventListener('input', reset);
  play.addEventListener('click', () => {
    if (running) { stop(); return; }
    if (time >= 60) time = 0;
    running = true; previous = null; play.textContent = 'Pausar'; play.setAttribute('aria-pressed', 'true'); frame = requestAnimationFrame(tick);
  });
  q('[data-reset]').addEventListener('click', reset);
  seek.addEventListener('input', () => { stop(); time = Number(seek.value); render(); });
  for (const button of root.querySelectorAll('[data-preset]')) button.addEventListener('click', () => {
    const presets = { ideal: [1, 0, 1, 60, 0], damped: [1, 0.35, 1, 60, 0], rotation: [1, 0, 1, 0, 2.5] };
    inputs.forEach((input, i) => { input.value = presets[button.dataset.preset][i]; }); reset();
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
  reset(); root.classList.add('sim-ready');
})();
