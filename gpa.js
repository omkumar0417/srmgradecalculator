const GPA_HISTORY_KEY = 'srmgrade-gpa-history';
const gradeLabels = {
  '10': 'O',
  '9': 'A+',
  '8': 'A',
  '7': 'B+',
  '6': 'B',
  '5': 'C',
  '0': 'F / Ab / W / I',
};

const gpaForm = document.getElementById('gpa-form');
const subjectContainer = document.getElementById('subject-container');
const addSubjectButton = document.getElementById('add-subject');
const resultEl = document.getElementById('result');
const metricsEl = document.getElementById('gpa-metrics');
const breakdownEl = document.getElementById('gpa-breakdown');
const messageEl = document.getElementById('gpa-message');
const statusEl = document.getElementById('gpa-status');
const copyButton = document.getElementById('copy-result');
const shareButton = document.getElementById('share-result');
const historyEl = document.getElementById('gpa-history');
const clearHistoryButton = document.getElementById('clear-history');

let subjectCount = subjectContainer ? subjectContainer.querySelectorAll('.input-row').length : 0;
let lastSummaryText = 'No GPA calculation yet.';

function setMessage(text, tone = '') {
  if (!messageEl) return;
  messageEl.textContent = text;
  messageEl.className = `message${tone ? ` ${tone}` : ''}`;
}

function formatTimestamp(value) {
  return new Date(value).toLocaleString([], {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function getStoredHistory() {
  try {
    return JSON.parse(localStorage.getItem(GPA_HISTORY_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveHistory(entry) {
  const history = getStoredHistory();
  history.unshift(entry);
  try {
    localStorage.setItem(GPA_HISTORY_KEY, JSON.stringify(history.slice(0, 8)));
  } catch {
    // Ignore storage failures.
  }
}

function renderHistory() {
  if (!historyEl) return;
  const history = getStoredHistory();
  if (!history.length) {
    historyEl.innerHTML = '<li class="history-item"><strong>No history yet</strong><span class="muted">Your recent GPA calculations will appear here.</span></li>';
    return;
  }

  historyEl.innerHTML = history.map((item) => `
    <li class="history-item">
      <strong>GPA ${item.gpa}</strong>
      <span class="muted">${item.credits} credits • ${item.subjects} subjects</span><br />
      <span class="muted">${formatTimestamp(item.timestamp)}</span>
    </li>
  `).join('');
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
      <option value="5">C</option>
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

  if (metricsEl) {
    metricsEl.innerHTML = `
      <div class="metric-card"><span>Total credits</span><strong>${totalCredits.toFixed(2)}</strong></div>
      <div class="metric-card"><span>Total points</span><strong>${totalPoints.toFixed(2)}</strong></div>
      <div class="metric-card"><span>Subjects</span><strong>${rows.length}</strong></div>
    `;
  }

  if (breakdownEl) {
    breakdownEl.innerHTML = rows.map((row) => `
      <tr>
        <td>Subject ${row.subject}</td>
        <td>${row.credits.toFixed(2)}</td>
        <td>${row.gradeLabel}</td>
        <td>${row.points.toFixed(2)}</td>
      </tr>
    `).join('');
  }

  lastSummaryText = [
    'SRM GPA Calculator',
    `GPA: ${gpa.toFixed(2)}`,
    `Credits: ${totalCredits.toFixed(2)}`,
    `Points: ${totalPoints.toFixed(2)}`,
    'Breakdown:',
    ...rows.map((row) => `- Subject ${row.subject}: ${row.credits.toFixed(2)} credits, ${row.gradeLabel}, ${row.points.toFixed(2)} points`),
  ].join('\n');
}

function calculateGpa() {
  if (!subjectContainer) return;
  const parsed = readRows();

  if (parsed.error) {
    setMessage(parsed.error, 'error');
    if (statusEl) statusEl.textContent = 'Check entries';
    if (breakdownEl) breakdownEl.innerHTML = '<tr><td class="empty-state" colspan="4">Fix the highlighted row to continue.</td></tr>';
    return;
  }

  const rows = parsed.rows;
  if (!rows.length) {
    setMessage('Add at least one completed subject before calculating GPA.', 'error');
    if (statusEl) statusEl.textContent = 'No data';
    if (breakdownEl) breakdownEl.innerHTML = '<tr><td class="empty-state" colspan="4">No completed subjects yet.</td></tr>';
    if (resultEl) resultEl.innerHTML = 'No calculation yet.<small>Fill in at least one subject.</small>';
    if (metricsEl) metricsEl.innerHTML = '';
    lastSummaryText = 'No GPA calculation yet.';
    return;
  }

  const totalCredits = rows.reduce((sum, row) => sum + row.credits, 0);
  const totalPoints = rows.reduce((sum, row) => sum + row.points, 0);
  const gpa = totalCredits ? totalPoints / totalCredits : 0;

  renderResult(rows, totalCredits, totalPoints, gpa);
  setMessage(`Calculated GPA ${gpa.toFixed(2)} from ${rows.length} subjects.`, 'success');
  if (statusEl) statusEl.textContent = 'Calculated';

  saveHistory({
    gpa: gpa.toFixed(2),
    credits: totalCredits.toFixed(2),
    subjects: rows.length,
    timestamp: Date.now(),
  });
  renderHistory();

  if (typeof gtag === 'function') {
    gtag('event', 'gpa_calculated');
  }
}

async function copySummary() {
  try {
    await navigator.clipboard.writeText(lastSummaryText);
    setMessage('Result copied to clipboard.', 'success');
  } catch {
    setMessage('Copy failed in this browser.', 'error');
  }
}

async function shareSummary() {
  if (navigator.share) {
    try {
      await navigator.share({
        title: 'SRM GPA result',
        text: lastSummaryText,
        url: window.location.href,
      });
      setMessage('Result shared successfully.', 'success');
      return;
    } catch {
      // fall back to clipboard below
    }
  }
  await copySummary();
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

if (copyButton) {
  copyButton.addEventListener('click', copySummary);
}

if (shareButton) {
  shareButton.addEventListener('click', shareSummary);
}

if (clearHistoryButton) {
  clearHistoryButton.addEventListener('click', () => {
    try {
      localStorage.removeItem(GPA_HISTORY_KEY);
    } catch {
      // Ignore storage failures.
    }
    renderHistory();
    setMessage('History cleared.', 'success');
  });
}

if (subjectContainer) {
  subjectContainer.addEventListener('input', () => {
    setMessage('', '');
  });
}

renderHistory();
