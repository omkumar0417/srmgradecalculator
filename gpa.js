const gradeLabels = {
  '10': 'O',
  '9': 'A+',
  '8': 'A',
  '7': 'B+',
  '6': 'B',
  '5.5': 'C',
  '0': '* / Withheld / F / Ab / W / I',
};

const gpaForm = document.getElementById('gpa-form');
const subjectContainer = document.getElementById('subject-container');
const addSubjectButton = document.getElementById('add-subject');
const resultEl = document.getElementById('result');
const metricsEl = document.getElementById('gpa-metrics');
const messageEl = document.getElementById('gpa-message');

let subjectCount = subjectContainer ? subjectContainer.querySelectorAll('.input-row').length : 0;

function setResultState(isEmpty) {
  if (!resultEl) return;
  resultEl.classList.toggle('is-empty', isEmpty);
}

function setMessage(text, tone = '') {
  if (!messageEl) return;
  messageEl.textContent = text;
  messageEl.className = `message${tone ? ` ${tone}` : ''}`;
}

function refreshRowNumbers() {
  if (!subjectContainer) return;
  subjectContainer.querySelectorAll('.input-row').forEach((row, index) => {
    const serial = row.querySelector('.serial');
    if (serial) serial.textContent = `${index + 1}.`;
  });
  subjectCount = subjectContainer.querySelectorAll('.input-row').length;
}

function addSubjectRow() {
  if (!subjectContainer) return;
  subjectCount += 1;
  const row = document.createElement('div');
  row.className = 'input-row';
  row.innerHTML = `
    <span class="serial">${subjectCount}.</span>
    <input type="number" placeholder="Credits" class="credits field" min="0" step="0.5" inputmode="decimal">
    <select class="grade field">
      <option value="" selected>Grade</option>
      <option value="10">O</option>
      <option value="9">A+</option>
      <option value="8">A</option>
      <option value="7">B+</option>
      <option value="6">B</option>
      <option value="5.5">C</option>
      <option value="0">*</option>
      <option value="0">F / Ab / W / I</option>
    </select>
  `;
  subjectContainer.appendChild(row);
}

function readRows() {
  const rows = [];
  const rowEls = Array.from(subjectContainer.querySelectorAll('.input-row'));

  for (let index = 0; index < rowEls.length; index += 1) {
    const row = rowEls[index];
    const creditsInput = row.querySelector('.credits');
    const gradeInput = row.querySelector('.grade');
    const creditRaw = creditsInput.value.trim();
    const gradeRaw = gradeInput.value.trim();

    if (!creditRaw && !gradeRaw) {
      row.classList.remove('row-invalid');
      continue;
    }

    if (!creditRaw || !gradeRaw) {
      row.classList.add('row-invalid');
      return { error: `Row ${index + 1} is partially filled. Enter both credits and grade, or leave the row blank.` };
    }

    const credits = Number.parseFloat(creditRaw);
    const gradePoints = Number.parseFloat(gradeRaw);
    if (!Number.isFinite(credits) || credits <= 0) {
      row.classList.add('row-invalid');
      return { error: `Row ${index + 1} needs a credit value greater than 0.` };
    }
    if (!Number.isFinite(gradePoints)) {
      row.classList.add('row-invalid');
      return { error: `Row ${index + 1} needs a valid grade.` };
    }

    row.classList.remove('row-invalid');
    rows.push({
      subject: rows.length + 1,
      credits,
      gradePoints,
      gradeLabel: gradeLabels[gradeRaw] || gradeRaw,
      points: credits * gradePoints,
    });
  }

  return { rows };
}

function renderResult(rows, totalCredits, totalPoints, gpa) {
  if (resultEl) {
    resultEl.innerHTML = `${gpa.toFixed(2)}<small>from ${totalCredits.toFixed(2)} total credits</small>`;
  }
  setResultState(false);

  if (metricsEl) {
    metricsEl.innerHTML = `
      <div class="metric-card"><span>Total credits</span><strong>${totalCredits.toFixed(2)}</strong></div>
      <div class="metric-card"><span>Total points</span><strong>${totalPoints.toFixed(2)}</strong></div>
      <div class="metric-card"><span>Subjects</span><strong>${rows.length}</strong></div>
    `;
  }
}

function calculateGpa() {
  if (!subjectContainer) return;
  const parsed = readRows();

  if (parsed.error) {
    setMessage(parsed.error, 'error');
    if (resultEl) resultEl.innerHTML = 'Calculation paused.<small>Fix the highlighted row to see the GPA.</small>';
    setResultState(true);
    if (metricsEl) metricsEl.innerHTML = '';
    return;
  }

  const rows = parsed.rows;
  if (!rows.length) {
    setMessage('Add at least one completed subject before calculating GPA.', 'error');
    if (resultEl) resultEl.innerHTML = 'No calculation yet.<small>Fill in at least one subject.</small>';
    setResultState(true);
    if (metricsEl) metricsEl.innerHTML = '';
    return;
  }

  const totalCredits = rows.reduce((sum, row) => sum + row.credits, 0);
  const totalPoints = rows.reduce((sum, row) => sum + row.points, 0);
  const gpa = totalCredits ? totalPoints / totalCredits : 0;

  renderResult(rows, totalCredits, totalPoints, gpa);
  setMessage(`Calculated GPA ${gpa.toFixed(2)} from ${rows.length} subjects.`, 'success');

  if (typeof gtag === 'function') {
    gtag('event', 'gpa_calculated');
  }
}

if (addSubjectButton) {
  addSubjectButton.addEventListener('click', addSubjectRow);
}

if (gpaForm) {
  gpaForm.addEventListener('submit', (event) => {
    event.preventDefault();
    calculateGpa();
  });
}

if (subjectContainer) {
  subjectContainer.addEventListener('input', () => {
    setMessage('', '');
  });
}

setResultState(true);
