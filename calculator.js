/**
 * This class to organize the input data for panel calculation
 * To Render the input data, you can use the following code:
 *
 * const panelProperties = new PanelProperties();
 */

const MIN_LAYERS = 3;
const MAX_LAYERS = 9;

function buildLayerRow(index) {
  const defaultOrientation = index % 2 === 1 ? 0 : 90;
  const row = document.createElement('div');
  row.className = 'row gx-2 align-items-center mb-2 layer-row';
  row.dataset.index = index;
  row.innerHTML = `
    <div class="col-2"><span class="badge bg-secondary">Layer ${index}</span></div>
    <div class="col-3">
      <input type="number" class="form-control layer-thickness" min="1" step="1" value="35" />
    </div>
    <div class="col-3">
      <select class="form-select layer-orientation">
        <option value="0" ${defaultOrientation === 0 ? 'selected' : ''}>0° (Longitudinal)</option>
        <option value="90" ${defaultOrientation === 90 ? 'selected' : ''}>90° (Transverse)</option>
      </select>
    </div>
    <div class="col-4">
      <select class="form-select layer-grade">
        ${MATERIAL_GRADES.map((g) => `<option value="${g.name}">${g.name}</option>`).join('')}
      </select>
    </div>
  `;
  return row;
}

function renderLayerInputs(totalLayers) {
  const container = document.getElementById('layersContainer');
  container.innerHTML = '';
  for (let i = 1; i <= totalLayers; i++) {
    container.appendChild(buildLayerRow(i));
  }
}

function readCLTLayupFromForm() {
  const beff = parseFloat(document.getElementById('beff').value);
  const length = parseFloat(document.getElementById('length').value);
  const analyticalMethod = document.querySelector('input[name="analyticalMethod"]:checked').value;

  const rows = document.querySelectorAll('#layersContainer .layer-row');
  const layers = Array.from(rows).map((row, i) => {
    const thickness = parseFloat(row.querySelector('.layer-thickness').value);
    const orientation = parseInt(row.querySelector('.layer-orientation').value, 10);
    const grade = row.querySelector('.layer-grade').value;
    return new CLTLayerType(i + 1, thickness, orientation, grade);
  });

  const cltLayup = new CLTLayupType();
  cltLayup.setLayers(layers).setBeff(beff).setLength(length).setAnalyticalMethod(analyticalMethod);
  return cltLayup;
}

function formatNumber(n, decimals = 3) {
  if (n === null || n === undefined || Number.isNaN(n)) return '-';
  return Number(n).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function renderOutput(result) {
  const output = document.getElementById('outputSection');
  const isShearAnalogy = result.method === ANALYTICAL_METHOD.SHEAR_ANALOGY;

  const rows = result.layers
    .map((lp) => `
      <tr>
        <td>Layer ${lp.index}</td>
        <td>${lp.thickness}</td>
        <td>${lp.orientation}°</td>
        <td>${lp.grade}</td>
        <td>${formatNumber(lp.E, 0)}</td>
        <td>${formatNumber(lp.G, 1)}</td>
        <td>${formatNumber(lp.yMid, 2)}</td>
        <td>${formatNumber(lp.a, 2)}</td>
        <td>${formatNumber(lp.gamma, 3)}</td>
        <td>${formatNumber(lp.EI, 0)}</td>
      </tr>`)
    .join('');

  output.innerHTML = `
    <h4 class="mt-4">Output - Panel Properties</h4>
    <p class="text-muted mb-2">
      Method: <strong>${isShearAnalogy ? 'Shear Analogy' : 'Gamma'}</strong> &middot;
      Total Layers: <strong>${result.totalLayers}</strong> &middot;
      Total Thickness: <strong>${formatNumber(result.totalThickness, 1)} mm</strong> &middot;
      Neutral Axis (from top): <strong>${formatNumber(result.neutralAxis, 2)} mm</strong>
    </p>
    <div class="table-responsive">
      <table class="table table-bordered table-sm align-middle">
        <thead class="table-light">
          <tr>
            <th>Layer</th><th>ti (mm)</th><th>θi</th><th>Grade</th>
            <th>Ei (MPa)</th><th>Gi (MPa)</th><th>yi (mm)</th>
            <th>ai (mm)</th><th>γi</th><th>EIi (N·mm²/m)</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    <div class="card mt-3">
      <div class="card-body">
        <h5 class="card-title">Effective Bending Stiffness</h5>
        <p class="card-text fs-5">(EI)<sub>eff</sub> = <strong>${formatNumber(result.EIeff, 0)} N·mm²/m</strong></p>
        ${isShearAnalogy ? `
          <h5 class="card-title">Effective Shear Stiffness</h5>
          <p class="card-text fs-5">(GA)<sub>eff</sub> = <strong>${formatNumber(result.GAeff, 0)} N/m</strong></p>` : ''}
      </div>
    </div>
  `;
}

function renderErrors(errors) {
  const output = document.getElementById('outputSection');
  output.innerHTML = `
    <div class="alert alert-danger mt-4">
      <strong>Cannot calculate:</strong>
      <ul class="mb-0">${errors.map((e) => `<li>${e}</li>`).join('')}</ul>
    </div>
  `;
}

function toggleMethodSections() {
  const method = document.querySelector('input[name="analyticalMethod"]:checked').value;
  const totalLayersInput = document.getElementById('totalLayers');

  if (method === ANALYTICAL_METHOD.GAMMA) {
    document.getElementById('shearAnalogyHint').classList.add('d-none');
    document.getElementById('gammaHint').classList.remove('d-none');
    if (![3, 5].includes(parseInt(totalLayersInput.value, 10))) {
      totalLayersInput.value = 3;
    }
    totalLayersInput.min = 3;
    totalLayersInput.max = 5;
  } else {
    document.getElementById('gammaHint').classList.add('d-none');
    document.getElementById('shearAnalogyHint').classList.remove('d-none');
    totalLayersInput.min = MIN_LAYERS;
    totalLayersInput.max = MAX_LAYERS;
  }
  renderLayerInputs(parseInt(totalLayersInput.value, 10));
}

function calculate() {
  try {
    const cltLayup = readCLTLayupFromForm();
    const { valid, errors } = cltLayup.validate();
    if (!valid) {
      renderErrors(errors);
      return;
    }
    const result = new PanelProperties().calculate(cltLayup);
    renderOutput(result);
  } catch (err) {
    renderErrors([err.message]);
  }
}

function initCalculator() {
  renderLayerInputs(parseInt(document.getElementById('totalLayers').value, 10));

  document.getElementById('totalLayers').addEventListener('change', (e) => {
    let val = parseInt(e.target.value, 10);
    const method = document.querySelector('input[name="analyticalMethod"]:checked').value;
    if (method === ANALYTICAL_METHOD.GAMMA && ![3, 5].includes(val)) {
      val = val <= 4 ? 3 : 5;
      e.target.value = val;
    }
    renderLayerInputs(val);
  });

  document.querySelectorAll('input[name="analyticalMethod"]').forEach((radio) => {
    radio.addEventListener('change', toggleMethodSections);
  });

  document.getElementById('calculateBtn').addEventListener('click', calculate);

  toggleMethodSections();
}

document.addEventListener('DOMContentLoaded', initCalculator);