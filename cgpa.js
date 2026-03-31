const cgpaForm = document.getElementById('cgpa-form');
const semesterContainer = document.getElementById('semester-container');
const addSemesterButton = document.getElementById('add-semester');
const resultEl = document.getElementById('cgpa-result');
const metricsEl = document.getElementById('cgpa-metrics');
const messageEl = document.getElementById('cgpa-message');

let semesterCount = semesterContainer ? semesterContainer.querySelectorAll('.semester-row').length : 0;

function setResultState(isEmpty) {
  if (!resultEl) return;
  resultEl.classList.toggle('is-empty', isEmpty);
}

function setMessage(text, tone = '') {
  if (!messageEl) return;
  messageEl.textContent = text;
  messageEl.className = `message${tone ? ` ${tone}` : ''}`;
}

function addSemesterRow() {
  if (!semesterContainer) return;
  semesterCount += 1;
  const row = document.createElement('div');
  row.className = 'semester-row';
  row.innerHTML = `
    <span class="serial">${semesterCount}.</span>
    <input type="number" step="0.01" placeholder="GPA" class="gpa field" min="0" max="10" inputmode="decimal">
    <input type="number" placeholder="Credits" class="credits field" min="0" step="0.5" inputmode="decimal">
  `;
  semesterContainer.appendChild(row);
}

function readRows() {
  const rows = [];
  const rowEls = Array.from(semesterContainer.querySelectorAll('.semester-row'));

  for (let index = 0; index < rowEls.length; index += 1) {
    const row = rowEls[index];
    const gpaInput = row.querySelector('.gpa');
    const creditsInput = row.querySelector('.credits');
    const gpaRaw = gpaInput.value.trim();
    const creditsRaw = creditsInput.value.trim();

    if (!gpaRaw && !creditsRaw) {
      row.classList.remove('row-invalid');
      continue;
    }

    if (!gpaRaw || !creditsRaw) {
      row.classList.add('row-invalid');
      return { error: `Semester ${index + 1} is partially filled. Enter both GPA and credits, or leave it blank.` };
    }

    const gpa = Number.parseFloat(gpaRaw);
    const credits = Number.parseFloat(creditsRaw);

    if (!Number.isFinite(gpa) || gpa < 0 || gpa > 10) {
      row.classList.add('row-invalid');
      return { error: `Semester ${index + 1} needs a GPA between 0 and 10.` };
    }

    if (!Number.isFinite(credits) || credits <= 0) {
      row.classList.add('row-invalid');
      return { error: `Semester ${index + 1} needs credits greater than 0.` };
    }

    row.classList.remove('row-invalid');
    rows.push({
      semester: rows.length + 1,
      gpa,
      credits,
      weighted: gpa * credits,
    });
  }

  return { rows };
}

function renderResult(rows, totalCredits, weightedSum, cgpa) {
  if (resultEl) {
    resultEl.innerHTML = `${cgpa.toFixed(2)}<small>from ${totalCredits.toFixed(2)} total credits</small>`;
  }
  setResultState(false);

  if (metricsEl) {
    metricsEl.innerHTML = `
      <div class="metric-card"><span>Total credits</span><strong>${totalCredits.toFixed(2)}</strong></div>
      <div class="metric-card"><span>Weighted points</span><strong>${weightedSum.toFixed(2)}</strong></div>
      <div class="metric-card"><span>Semesters</span><strong>${rows.length}</strong></div>
    `;
  }
}

function calculateCgpa() {
  if (!semesterContainer) return;
  const parsed = readRows();

  if (parsed.error) {
    setMessage(parsed.error, 'error');
    if (resultEl) resultEl.innerHTML = 'Calculation paused.<small>Fix the highlighted row to see the CGPA.</small>';
    setResultState(true);
    if (metricsEl) metricsEl.innerHTML = '';
    return;
  }

  const rows = parsed.rows;
  if (!rows.length) {
    setMessage('Add at least one completed semester before calculating CGPA.', 'error');
    if (resultEl) resultEl.innerHTML = 'No calculation yet.<small>Fill in at least one semester.</small>';
    setResultState(true);
    if (metricsEl) metricsEl.innerHTML = '';
    return;
  }

  const totalCredits = rows.reduce((sum, row) => sum + row.credits, 0);
  const weightedSum = rows.reduce((sum, row) => sum + row.weighted, 0);
  const cgpa = totalCredits ? weightedSum / totalCredits : 0;

  renderResult(rows, totalCredits, weightedSum, cgpa);
  setMessage(`Calculated CGPA ${cgpa.toFixed(2)} from ${rows.length} semesters.`, 'success');

  if (typeof gtag === 'function') {
    gtag('event', 'cgpa_calculated');
  }
}

if (addSemesterButton) {
  addSemesterButton.addEventListener('click', addSemesterRow);
}

if (cgpaForm) {
  cgpaForm.addEventListener('submit', (event) => {
    event.preventDefault();
    calculateCgpa();
  });
}

if (semesterContainer) {
  semesterContainer.addEventListener('input', () => {
    setMessage('', '');
  });
}

setResultState(true);
