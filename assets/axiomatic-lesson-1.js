(function () {
  'use strict';
  const rad = x => x * Math.PI / 180;
  const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
  const mul = (a, s) => [a[0] * s, a[1] * s];
  const cross = (a, b) => a[0] * b[1] - a[1] * b[0];
  const norm = a => Math.hypot(...a);
  const distance = (a, b) => norm(sub(a, b));
  const unit = a => mul(a, 1 / norm(a));
  const direction = deg => [Math.cos(rad(deg)), Math.sin(rad(deg))];
  function intersection(a, u, b, v) { return add(a, mul(u, cross(sub(b, a), v) / cross(u, v))); }
  function angle(a, b, c) {
    const u = sub(a, b), v = sub(c, b);
    return Math.acos(Math.max(-1, Math.min(1, (u[0] * v[0] + u[1] * v[1]) / norm(u) / norm(v)))) * 180 / Math.PI;
  }
  function geometry(id) {
    if (id === 2) {
      const A = [0, 0], B = [1, 0], C = [0.5, 0.5 * Math.tan(rad(50))];
      const length = distance(B, C);
      const D = mul(direction(-30), Math.cos(rad(30)) + Math.sqrt(length ** 2 - 0.25));
      const P = intersection(A, direction(-30), C, direction(250));
      return { A, B, C, D, P };
    }
    const C = [0, 0], D = [1, 0];
    const A = intersection(C, direction(20), D, direction(140));
    const B = add(A, mul(direction(160), distance(A, D)));
    const P = intersection(A, direction(220), C, [1, 0]);
    return { A, B, C, D, P };
  }
  const explanations = {
    2: [
      'Datos: CA = CB = BD, ∠ACB = 80° y ∠BAD = 30°. Se busca x = ∠ABD.',
      'Traza CP con ∠ACP = 20°. Como ∠CAP = 80°, también ∠CPA = 80°; por tanto CA = CP.',
      'Une B con P. CP = CB y ∠BCP = 60°: BCP es equilátero y BP = CP = CB.',
      'BP = BD. Como A, P y D están alineados, ∠BPD = 180° − 80° − 60° = 40°; también ∠BDP = 40°.',
      'En ABD: x + 30° + 40° = 180°. Por tanto x = 110°.'
    ],
    3: [
      'Datos: AB = AD, ∠BAC = 40°, ∠ACD = 20° y ∠ADC = 40°. Se busca x = ∠BCA.',
      'Traza AP con ∠CAP = 20°. ∠CAD = 120° y ∠PAD = 100°; luego ∠APD = 40° y AP = AD.',
      'Une B con P. AB = AD = AP y ∠BAP = 60°: ABP es equilátero. Así, BP = AP.',
      'En ACP, los ángulos en A y C miden 20°: AP = CP. Junto con BP = AP, resulta BP = CP.',
      'C, P y D están alineados: ∠BPC = 180° − 60° − 40° = 80°. En BCP, los ángulos en B y C miden 50°; x = 50° − 20° = 30°.'
    ]
  };
  function svg(id, step = 4, rotation = 0, reflected = false) {
    const g = geometry(id), all = Object.values(g);
    const center = mul(all.reduce((a, b) => add(a, b), [0, 0]), 1 / all.length);
    function transform(p) {
      const v = sub(p, center), x = reflected ? -v[0] : v[0], y = v[1], a = rad(rotation);
      return [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
    }
    const t = Object.fromEntries(Object.entries(g).map(([k, p]) => [k, transform(p)]));
    const xs = Object.values(t).map(p => p[0]), ys = Object.values(t).map(p => p[1]);
    const loX = Math.min(...xs), hiX = Math.max(...xs), loY = Math.min(...ys), hiY = Math.max(...ys);
    const scale = Math.min(570 / (hiX - loX), 330 / (hiY - loY));
    const midX = (loX + hiX) / 2, midY = (loY + hiY) / 2;
    const pts = Object.fromEntries(Object.entries(t).map(([k, p]) => [k, [380 + (p[0] - midX) * scale, 235 - (p[1] - midY) * scale]]));
    const ink = '#183b32', aux = '#8c51b3', gold = '#ac6b10', teal = '#16796c';
    let body = '<rect width="760" height="490" fill="#f3f7f3"/>';
    function segment(a, b, color = ink, dash = false, width = 2.5) {
      const p = pts[a], q = pts[b];
      body += `<line x1="${p[0]}" y1="${p[1]}" x2="${q[0]}" y2="${q[1]}" stroke="${color}" stroke-width="${width}"${dash ? ' stroke-dasharray="7 5"' : ''}/>`;
    }
    function polygon(names, color) { body += `<polygon points="${names.map(k => pts[k].join(',')).join(' ')}" fill="${color}" fill-opacity="0.13"/>`; }
    function text(p, value, color = ink, size = 17) {
      const attrs = `x="${p[0]}" y="${p[1]}" font-family="Arial, sans-serif" font-size="${size}" font-weight="600" text-anchor="middle" dominant-baseline="middle"`;
      body += `<text ${attrs} fill="#f3f7f3" stroke="#f3f7f3" stroke-width="4">${value}</text><text ${attrs} fill="${color}">${value}</text>`;
    }
    function arc(a, b, c, label, radius = 30, color = ink) {
      const p = pts[a], o = pts[b], q = pts[c];
      const first = Math.atan2(p[1] - o[1], p[0] - o[0]);
      let delta = Math.atan2(q[1] - o[1], q[0] - o[0]) - first;
      while (delta > Math.PI) delta -= 2 * Math.PI;
      while (delta < -Math.PI) delta += 2 * Math.PI;
      const point = (a, r) => [o[0] + r * Math.cos(a), o[1] + r * Math.sin(a)];
      const start = point(first, radius), end = point(first + delta, radius);
      body += `<path d="M${start.join(',')} A${radius},${radius} 0 0 ${delta > 0 ? 1 : 0} ${end.join(',')}" fill="none" stroke="${color}" stroke-width="1.5"/>`;
      text(point(first + delta / 2, radius + 17), label, color, 16);
    }
    function ticks(a, b, color = ink, count = 2) {
      const p = pts[a], q = pts[b], u = unit(sub(q, p)), n = [-u[1], u[0]], mid = mul(add(p, q), 0.5);
      for (let i = 0; i < count; i++) {
        const v = add(mid, mul(u, (i - (count - 1) / 2) * 6)), s = add(v, mul(n, 5)), e = add(v, mul(n, -5));
        body += `<line x1="${s[0]}" y1="${s[1]}" x2="${e[0]}" y2="${e[1]}" stroke="${color}" stroke-width="2"/>`;
      }
    }
    if (id === 2) {
      if (step === 1) polygon(['A', 'C', 'P'], aux);
      if (step === 2) polygon(['B', 'C', 'P'], teal);
      if (step === 3) polygon(['B', 'D', 'P'], gold);
      for (const [a, b] of [['A', 'B'], ['B', 'C'], ['C', 'A'], ['A', 'D'], ['B', 'D']]) segment(a, b);
      ticks('C', 'A'); ticks('C', 'B'); ticks('B', 'D');
      if (step > 0) segment('C', 'P', aux, true, 3);
      if (step > 1) segment('B', 'P', teal, true, 3);
      if (step === 0 || step === 4) { arc('A', 'C', 'B', '80°', 25); arc('B', 'A', 'D', '30°', 33); arc('A', 'B', 'D', step === 4 ? 'x = 110°' : 'x', 46, gold); }
      if (step === 1) { arc('A', 'C', 'P', '20°', 43, aux); arc('C', 'A', 'P', '80°', 30, aux); arc('C', 'P', 'A', '80°', 55, aux); }
      if (step === 2) { arc('B', 'C', 'P', '60°', 33, teal); arc('C', 'P', 'B', '60°', 38, teal); arc('C', 'B', 'P', '60°', 40, teal); ticks('C', 'P', teal); ticks('P', 'B', teal); }
      if (step === 3 || step === 4) { arc('B', 'P', 'D', '40°', 36, gold); arc('P', 'D', 'B', '40°', 40, gold); }
      if (step === 3) { arc('C', 'P', 'A', '80°', 38, aux); arc('C', 'P', 'B', '60°', 33, teal); }
    } else {
      if (step === 1) polygon(['A', 'D', 'P'], aux);
      if (step === 2) polygon(['A', 'B', 'P'], teal);
      if (step === 3) polygon(['A', 'C', 'P'], gold);
      if (step === 4) polygon(['B', 'C', 'P'], teal);
      for (const [a, b] of [['A', 'B'], ['B', 'C'], ['A', 'C'], ['A', 'D'], ['C', 'D']]) segment(a, b);
      ticks('A', 'B'); ticks('A', 'D');
      if (step > 0) segment('A', 'P', aux, true, 3);
      if (step > 1) segment('B', 'P', teal, true, 3);
      if (step === 0) { arc('B', 'A', 'C', '40°', 31); arc('A', 'C', 'D', '20°', 55); arc('C', 'D', 'A', '40°', 42); arc('B', 'C', 'A', 'x', 33, gold); }
      if (step === 1) { arc('P', 'A', 'D', '100°', 39, aux); arc('A', 'D', 'P', '40°', 42, aux); arc('A', 'P', 'D', '40°', 40, aux); ticks('A', 'P', aux); }
      if (step === 2) { arc('B', 'A', 'P', '60°', 35, teal); arc('A', 'B', 'P', '60°', 37, teal); arc('A', 'P', 'B', '60°', 40, teal); ticks('A', 'P', teal); ticks('B', 'P', teal); }
      if (step === 3) { arc('C', 'A', 'P', '20°', 40, gold); arc('A', 'C', 'P', '20°', 54, gold); ticks('A', 'P', gold); ticks('C', 'P', gold); }
      if (step === 4) { arc('B', 'P', 'C', '80°', 43, teal); arc('P', 'B', 'C', '50°', 40, teal); arc('B', 'C', 'A', 'x = 30°', 39, gold); arc('A', 'C', 'D', '20°', 91); }
    }
    for (const [name, p] of Object.entries(pts)) {
      if (name === 'P' && step === 0) continue;
      body += `<circle cx="${p[0]}" cy="${p[1]}" r="3.5" fill="${ink}"/>`;
      const v = name === 'P' ? transform([g.P[0], g.P[1] - 0.035]) : sub(t[name], [0, 0]);
      let offset = name === 'P' ? sub(v, t.P) : v;
      offset = unit([offset[0], -offset[1]]);
      text(add(p, mul(offset, name === 'P' ? 20 : 23)), name, ink, 20);
    }
    body += `<text x="380" y="463" font-family="Arial, sans-serif" font-size="15" text-anchor="middle" fill="#476057">Problema ${id} · Paso ${step}/4 · Las medidas se conservan</text>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 490" role="img" aria-label="Construcción del problema ${id}, paso ${step} de 4">${body}</svg>`;
  }
  const api = { geometry, angle, distance, intersection, svg, explanations };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof document === 'undefined') return;
  for (const root of document.querySelectorAll('[data-axiomatic-lesson]')) {
    const id = Number(root.dataset.axiomaticLesson);
    const live = root.querySelector('.geometry-live'), controls = root.querySelector('.geometry-controls');
    controls.innerHTML = `<label>Paso de la demostración <output data-step-output>0 / 4</output><input data-step type="range" min="0" max="4" step="1" value="0" aria-label="Paso de la demostración del problema ${id}"></label><label>Girar la figura <output data-rotation-output>0°</output><input data-rotation type="range" min="-35" max="35" step="1" value="0" aria-label="Girar la figura del problema ${id}"></label><label><span>Vista reflejada</span><input data-reflect type="checkbox" aria-label="Reflejar la figura del problema ${id}"></label><button type="button" data-previous>Anterior</button><button type="button" data-next>Siguiente</button><button type="button" data-reset>Reiniciar</button>`;
    const step = root.querySelector('[data-step]'), rotation = root.querySelector('[data-rotation]'), reflect = root.querySelector('[data-reflect]');
    const previous = root.querySelector('[data-previous]'), next = root.querySelector('[data-next]');
    function render() {
      const n = Number(step.value);
      live.innerHTML = svg(id, n, Number(rotation.value), reflect.checked);
      root.querySelector('[data-step-output]').textContent = `${n} / 4`;
      root.querySelector('[data-rotation-output]').textContent = `${rotation.value}°`;
      root.querySelector('.geometry-readout').textContent = explanations[id][n];
      previous.disabled = n === 0; next.disabled = n === 4;
    }
    for (const input of [step, rotation, reflect]) input.addEventListener('input', render);
    previous.addEventListener('click', () => { step.value = Math.max(0, Number(step.value) - 1); render(); });
    next.addEventListener('click', () => { step.value = Math.min(4, Number(step.value) + 1); render(); });
    root.querySelector('[data-reset]').addEventListener('click', () => { step.value = 0; rotation.value = 0; reflect.checked = false; render(); });
    render(); root.classList.add('geometry-ready');
  }
})();
