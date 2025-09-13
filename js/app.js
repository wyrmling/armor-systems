// Главный файл приложения
import { mechanics } from './mechanics.js';
import { createInput, getValues } from './utils.js';
import { calculateEfficiencyMetrics, findOptimalArmor, analyzeVariability } from './analytics.js';
import { drawLineChart, drawHistogram, drawMultiLineChart } from './charts.js';

// Создание расширенной аналитической панели
function createAdvancedAnalysis(mechanic, panel) {
  const analysisSection = document.createElement('div');
  analysisSection.className = 'section';
  analysisSection.innerHTML = '<h3>📊 Расширенный анализ</h3>';
  
  const analysisControls = document.createElement('div');
  analysisControls.className = 'controls';
  
  const analysisInputs = [
    { key: 'minArmor', label: 'Мин. броня для анализа', type: 'number', value: 0 },
    { key: 'maxArmor', label: 'Макс. броня для анализа', type: 'number', value: 50 },
    { key: 'testDamage', label: 'Тестовый урон', type: 'number', value: 30 },
    { key: 'armorCost', label: 'Стоимость за ед. брони', type: 'number', value: 1 }
  ];
  
  analysisInputs.forEach(input => analysisControls.appendChild(createInput(input)));
  
  const analysisButton = document.createElement('button');
  analysisButton.className = 'btn';
  analysisButton.textContent = '🔍 Анализировать эффективность';
  
  const variabilityButton = document.createElement('button');
  variabilityButton.className = 'btn';
  variabilityButton.textContent = '📊 Анализ вариативности';
  
  const analysisOutput = document.createElement('div');
  analysisOutput.className = 'output';
  
  const variabilityOutput = document.createElement('div');
  variabilityOutput.className = 'output';
  
  // Canvas для графиков
  const chartsContainer = document.createElement('div');
  chartsContainer.className = 'grid2';
  
  const effectivenessCanvas = document.createElement('canvas');
  effectivenessCanvas.className = 'chart-canvas';
  effectivenessCanvas.style.height = '200px';
  
  const efficiencyCanvas = document.createElement('canvas');
  efficiencyCanvas.className = 'chart-canvas';
  efficiencyCanvas.style.height = '200px';
  
  chartsContainer.appendChild(effectivenessCanvas);
  chartsContainer.appendChild(efficiencyCanvas);
  
  // Event listeners и логика анализа...
  // (остальная логика перенесена из оригинального файла)
  
  const buttonsContainer = document.createElement('div');
  buttonsContainer.className = 'buttons';
  buttonsContainer.appendChild(analysisButton);
  buttonsContainer.appendChild(variabilityButton);
  
  analysisSection.appendChild(analysisControls);
  analysisSection.appendChild(buttonsContainer);
  analysisSection.appendChild(analysisOutput);
  analysisSection.appendChild(variabilityOutput);
  analysisSection.appendChild(chartsContainer);
  
  return analysisSection;
}

function renderComparePanel(panel) {
  // Логика панели сравнения
  // (перенесена из оригинального файла)
}

function render() {
  const tabs = document.getElementById('tabs');
  const content = document.getElementById('content');
  mechanics.forEach((m, i) => {
    const btn = document.createElement('button');
    btn.className = 'tab-btn' + (i===0 ? ' active' : '');
    btn.textContent = m.name;
    btn.addEventListener('click', () => activate(i));
    tabs.appendChild(btn);

    const panel = document.createElement('div');
    panel.className = 'panel' + (i===0 ? ' active' : '');

    const desc = document.createElement('div');
    desc.className = 'section';
    desc.innerHTML = `<h3>${m.name}</h3><div class="small">${m.desc}</div>`;
    panel.appendChild(desc);

    if (m.key === 'compare') {
      renderComparePanel(panel);
    } else {
      const form = document.createElement('div');
      form.className = 'section';
      const controls = document.createElement('div');
      controls.className = 'controls';
      m.inputs.forEach(c => controls.appendChild(createInput(c)));
      form.appendChild(controls);

      const buttons = document.createElement('div');
      buttons.className = 'buttons';
      const calc = document.createElement('button');
      calc.className = 'btn';
      calc.textContent = 'Рассчитать / Симулировать';
      const out = document.createElement('div');
      out.className = 'output';
      
      // Добавим canvas для гистограммы, если это soak
      let histCanvas = null;
      if (m.key === 'soak') {
        histCanvas = document.createElement('canvas');
        histCanvas.className = 'chart-canvas';
        form.appendChild(histCanvas);
      }
      
      calc.addEventListener('click', () => {
        const vals = getValues(form);
        try {
          const res = m.compute(vals);
          if (typeof res === 'string') {
            out.textContent = res;
          } else {
            out.textContent = res.text || '';
            if (histCanvas && res.hist && res.hist.length > 0) {
              const buckets = res.hist.map((h, i) => ({ label: h.label || String(i), count: h.count }));
              drawHistogram(histCanvas, buckets);
            }
          }
        } catch (e) {
          out.textContent = 'Ошибка: ' + e.message;
        }
      });
      buttons.appendChild(calc);
      form.appendChild(buttons);
      form.appendChild(out);

      panel.appendChild(form);
      
      // Добавляем расширенную аналитику для поддерживаемых механик
      const supportedForAnalysis = ['flatdr', 'percentdr', 'diminish', 'dt_dr', 'ac', 'shield'];
      if (supportedForAnalysis.includes(m.key)) {
        const analysisPanel = createAdvancedAnalysis(m, panel);
        panel.appendChild(analysisPanel);
      }
    }

    content.appendChild(panel);
  });

  function activate(idx) {
    [...tabs.children].forEach((b, i) => b.classList.toggle('active', i===idx));
    [...content.children].forEach((p, i) => p.classList.toggle('active', i===idx));
  }
}

window.addEventListener('DOMContentLoaded', render);