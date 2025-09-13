// Утилиты для работы с формами и UI
export function createInput(control) {
  const wrap = document.createElement('div');
  wrap.className = 'control';
  const label = document.createElement('label');
  label.textContent = control.label;
  label.htmlFor = control.key;
  let input;
  if (control.type === 'select') {
    input = document.createElement('select');
    control.options.forEach(o => {
      const opt = document.createElement('option');
      opt.value = o.value;
      opt.textContent = o.label;
      if (o.value === control.value) opt.selected = true;
      input.appendChild(opt);
    });
  } else if (control.type === 'checkbox') {
    input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = !!control.value;
  } else {
    input = document.createElement('input');
    input.type = 'number';
    input.value = control.value;
  }
  input.id = control.key;
  input.name = control.key;
  input.dataset.key = control.key;
  wrap.appendChild(label);
  wrap.appendChild(input);
  return wrap;
}

export function getValues(panel) {
  const inputs = panel.querySelectorAll('.control input, .control select');
  const vals = {};
  inputs.forEach(inp => {
    const key = inp.dataset.key;
    if (inp.type === 'checkbox') vals[key] = inp.checked;
    else if (inp.tagName === 'SELECT') vals[key] = inp.value;
    else vals[key] = parseFloat(inp.value);
  });
  return vals;
}