const CGPA_HISTORY_KEY = 'srmgrade-cgpa-history';

const cgpaForm = document.getElementById('cgpa-form');
const semesterContainer = document.getElementById('semester-container');
const addSemesterButton = document.getElementById('add-semester');
const currentResultEl = document.getElementById('cgpa-result');
const currentMetricsEl = document.getElementById('cgpa-metrics');
const currentBreakdownEl = document.getElementById('cgpa-breakdown');
const currentMessageEl = document.getElementById('cgpa-message');
const currentStatusEl = document.getElementById('cgpa-status');
const copyCgpaButton = document.getElementById('copy-cgpa');
const shareCgpaButton = document.getElementById('share-cgpa');
const cgpaHistoryEl = document.getElementById('cgpa-history');
const clearHistoryButton = document.getElementById('clear-history');

const projectionForm = document.getElementById('projection-form');
const projectionContainer = document.getElementById('projection-container');
const addForecastButton = document.getElementById('add-forecast-semester');
const projectionCurrentCgpaEl = document.getElementById('projection-current-cgpa');
const projectionCurrentCreditsEl = document.getElementById('projection-current-credits');
const projectionResultEl = document.getElementById('projection-result');
const projectionMetricsEl = document.getElementById('projection-metrics');
const projectionMessageEl = document.getElementById('projection-message');
const copyProjectionButton = document.getElementById('copy-projection');
const shareProjectionButton = document.getElementById('share-projection');

let semesterCount = semesterContainer ? semesterContainer.querySelectorAll('.semester-row').length : 0;
let forecastCount = projectionContainer ? projectionContainer.querySelectorAll('.semester-row').length : 0;
let lastCgpaSummaryText = 'No CGPA calculation yet.';
let lastProjectionSummaryText = 'No projection yet.';

function setMessage(element, text, tone = '') {
  if (!element) return;
  element.textContent = text;
  element.className = `message${tone ? ` ${tone}` : ''}`;
}

function formatTimestamp(value) {
  return new Date(value).toLocaleString([], {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function getStoredHistory() {
  try {
    return JSON.parse(localStorage.getItem(CGPA_HISTORY_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveHistory(entry) {
  const history = getStoredHistory();
  history.unshift(entry);
  try {
    localStorage.setItem(CGPA_HISTORY_KEY, JSON.stringify(history.slice(0, 8)));
  } catch {
    // Ignore storage failures.
  }
}

function renderHistory() {
  if (!cgpaHistoryEl) return;
  const history = getStoredHistory();
  if (!history.length) {
    cgpaHistoryEl.innerHTML = '<li class="history-item"><strong>No history yet</strong><span class="muted">Your recent CGPA calculations will appear here.</span></li>';
    return;
  }

  cgpaHistoryEl.innerHTML = history.map((item) => `
    <li class="history-item">
      <strong>CGPA ${item.cgpa}</strong>
      <span class="muted">${item.credits} credits • ${item.semesters} semesters</span><br />
      <span class="muted">${formatTimestamp(item.timestamp)}</span>
    </li>
  `).join('');
}

function refreshSemesterNumbers() {
  if (semesterContainer) {
    semesterContainer.querySelectorAll('.semester-row').forEach((row, index) => {
      const serial = row.querySelector('.serial');
      if (serial) serial.textContent = `${index + 1}.`;
    });
    semesterCount = semesterContainer.querySelectorAll('.semester-row').length;
  }

  if (projectionContainer) {
    projectionContainer.querySelectorAll('.semester-row').forEach((row, index) => {
      const serial = row.querySelector('.serial');
      if (serial) serial.textContent = `${index + 1}.`;
    });
    forecastCount = projectionContainer.querySelectorAll('.semester-row').length;
  }
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

function addForecastRow() {
  if (!projectionContainer) return;
  forecastCount += 1;
  const row = document.createElement('div');
  row.className = 'semester-row';
  row.innerHTML = `
    <span class="serial">${forecastCount}.</span>
    <input type="number" step="0.01" placeholder="Expected GPA" class="forecast-gpa field" min="0" max="10" inputmode="decimal">
    <input type="number" placeholder="Credits" class="forecast-credits field" min="0" step="0.5" inputmode="decimal">
  `;
  projectionContainer.appendChild(row);
}

function readSemesterRows() {
  const rows = [];
  const rowEls = Array.from(semesterContainer.querySelectorAll('.semester-row'));

  for (let index = 0; index < rowEls.length; index += 1) {
    const row = rowEls[index];
    const gpaInput = row.querySelector('.gpa');
    const creditsInput = row.querySelector('.credits');
    const gpaRaw = gpaInput.value.trim();
    const creditRaw = creditsInput.value.trim();

    if (!gpaRaw && !creditRaw) {
      row.classList.remove('row-invalid');
      continue;
    }

    if (!gpaRaw || !creditRaw) {
      row.classList.add('row-invalid');
      return { error: `Semester ${index + 1} is partially filled. Enter both GPA and credits, or leave it blank.` };
    }

    const gpa = Number.parseFloat(gpaRaw);
    const credits = Number.parseFloat(creditRaw);
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

function readForecastRows() {
  const rows = [];
  const rowEls = Array.from(projectionContainer.querySelectorAll('.semester-row'));

  for (let index = 0; index < rowEls.length; index += 1) {
    const row = rowEls[index];
    const gpaInput = row.querySelector('.forecast-gpa');
    const creditsInput = row.querySelector('.forecast-credits');
    const gpaRaw = gpaInput.value.trim();
    const creditRaw = creditsInput.value.trim();

    if (!gpaRaw && !creditRaw) {
      row.classList.remove('row-invalid');
      continue;
    }

    if (!gpaRaw || !creditRaw) {
      row.classList.add('row-invalid');
      return { error: `Future semester ${index + 1} is partially filled. Enter both GPA and credits, or leave it blank.` };
    }

    const gpa = Number.parseFloat(gpaRaw);
    const credits = Number.parseFloat(creditRaw);
    if (!Number.isFinite(gpa) || gpa < 0 || gpa > 10) {
      row.classList.add('row-invalid');
      return { error: `Future semester ${index + 1} needs a GPA between 0 and 10.` };
    }
    if (!Number.isFinite(credits) || credits <= 0) {
      row.classList.add('row-invalid');
      return { error: `Future semester ${index + 1} needs credits greater than 0.` };
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

function renderCgpaResult(rows, totalCredits, weightedSum, cgpa) {
  if (currentResultEl) {
    currentResultEl.innerHTML = `${cgpa.toFixed(2)}<small>from ${totalCredits.toFixed(2)} total credits</small>`;
  }

  if (currentMetricsEl) {
    currentMetricsEl.innerHTML = `
      <div class="metric-card"><span>Total credits</span><strong>${totalCredits.toFixed(2)}</strong></div>
      <div class="metric-card"><span>Total weighted points</span><strong>${weightedSum.toFixed(2)}</strong></div>
      <div class="metric-card"><span>Semesters</span><strong>${rows.length}</strong></div>
    `;
  }

  if (currentBreakdownEl) {
    currentBreakdownEl.innerHTML = rows.map((row) => `
      <tr>
        <td>Semester ${row.semester}</td>
        <td>${row.gpa.toFixed(2)}</td>
        <td>${row.credits.toFixed(2)}</td>
        <td>${row.weighted.toFixed(2)}</td>
      </tr>
    `).join('');
  }

  lastCgpaSummaryText = [
    'SRM CGPA Calculator',
    `CGPA: ${cgpa.toFixed(2)}`,
    `Credits: ${totalCredits.toFixed(2)}`,
    `Weighted points: ${weightedSum.toFixed(2)}`,
    'Breakdown:',
    ...rows.map((row) => `- Semester ${row.semester}: GPA ${row.gpa.toFixed(2)}, ${row.credits.toFixed(2)} credits, ${row.weighted.toFixed(2)} weighted points`),
  ].join('\n');
}

function renderProjectionResult(currentCgpa, currentCredits, futureRows) {
  const futureCredits = futureRows.reduce((sum, row) => sum + row.credits, 0);
  const futureWeighted = futureRows.reduce((sum, row) => sum + row.weighted, 0);
  const finalCredits = currentCredits + futureCredits;
  const projected = finalCredits ? ((currentCgpa * currentCredits) + futureWeighted) / finalCredits : 0;

  if (projectionResultEl) {
    projectionResultEl.innerHTML = `${projected.toFixed(2)}<small>projected final CGPA after ${finalCredits.toFixed(2)} credits</small>`;
  }

  if (projectionMetricsEl) {
    projectionMetricsEl.innerHTML = `
      <div class="metric-card"><span>Current CGPA</span><strong>${currentCgpa.toFixed(2)}</strong></div>
      <div class="metric-card"><span>Future credits</span><strong>${futureCredits.toFixed(2)}</strong></div>
      <div class="metric-card"><span>Total credits</span><strong>${finalCredits.toFixed(2)}</strong></div>
    `;
  }

  lastProjectionSummaryText = [
    'SRM Projected CGPA',
    `Current CGPA: ${currentCgpa.toFixed(2)}`,
    `Current credits: ${currentCredits.toFixed(2)}`,
    `Projected CGPA: ${projected.toFixed(2)}`,
    `Final credits: ${finalCredits.toFixed(2)}`,
    'Future semesters:',
    ...futureRows.map((row) => `- Semester ${row.semester}: GPA ${row.gpa.toFixed(2)}, ${row.credits.toFixed(2)} credits`),
  ].join('\n');
}

function calculateCgpa() {
  const parsed = readSemesterRows();

  if (parsed.error) {
    setMessage(currentMessageEl, parsed.error, 'error');
    if (currentStatusEl) currentStatusEl.textContent = 'Check entries';
    if (currentBreakdownEl) currentBreakdownEl.innerHTML = '<tr><td class="empty-state" colspan="4">Fix the highlighted row to continue.</td></tr>';
    return;
  }

  const rows = parsed.rows;
  if (!rows.length) {
    setMessage(currentMessageEl, 'Add at least one completed semester before calculating CGPA.', 'error');
    if (currentStatusEl) currentStatusEl.textContent = 'No data';
    if (currentBreakdownEl) currentBreakdownEl.innerHTML = '<tr><td class="empty-state" colspan="4">No completed semesters yet.</td></tr>';
    if (currentResultEl) currentResultEl.innerHTML = 'No calculation yet.<small>Fill in at least one semester.</small>';
    if (currentMetricsEl) currentMetricsEl.innerHTML = '';
    lastCgpaSummaryText = 'No CGPA calculation yet.';
    return;
  }

  const totalCredits = rows.reduce((sum, row) => sum + row.credits, 0);
  const weightedSum = rows.reduce((sum, row) => sum + row.weighted, 0);
  const cgpa = totalCredits ? weightedSum / totalCredits : 0;

  renderCgpaResult(rows, totalCredits, weightedSum, cgpa);
  setMessage(currentMessageEl, `Calculated CGPA ${cgpa.toFixed(2)} from ${rows.length} semesters.`, 'success');
  if (currentStatusEl) currentStatusEl.textContent = 'Calculated';

  if (projectionCurrentCgpaEl) projectionCurrentCgpaEl.value = cgpa.toFixed(2);
  if (projectionCurrentCreditsEl) projectionCurrentCreditsEl.value = totalCredits.toFixed(2);

  saveHistory({
    cgpa: cgpa.toFixed(2),
    credits: totalCredits.toFixed(2),
    semesters: rows.length,
    timestamp: Date.now(),
  });
  renderHistory();

  if (typeof gtag === 'function') {
    gtag('event', 'cgpa_calculated');
  }
}

function calculateProjection() {
  const currentCgpa = Number.parseFloat(projectionCurrentCgpaEl ? projectionCurrentCgpaEl.value : '');
  const currentCredits = Number.parseFloat(projectionCurrentCreditsEl ? projectionCurrentCreditsEl.value : '');
  const parsed = readForecastRows();

  if (!Number.isFinite(currentCgpa) || currentCgpa < 0 || currentCgpa > 10) {
    setMessage(projectionMessageEl, 'Enter a current CGPA between 0 and 10, or calculate the current CGPA first.', 'error');
    return;
  }

  if (!Number.isFinite(currentCredits) || currentCredits <= 0) {
    setMessage(projectionMessageEl, 'Enter completed credits greater than 0, or calculate the current CGPA first.', 'error');
    return;
  }

  if (parsed.error) {
    setMessage(projectionMessageEl, parsed.error, 'error');
    return;
  }

  const futureRows = parsed.rows;
  if (!futureRows.length) {
    setMessage(projectionMessageEl, 'Add at least one future semester to calculate a projection.', 'error');
    if (projectionResultEl) projectionResultEl.innerHTML = 'No projection yet.<small>Add future semesters to estimate the final CGPA.</small>';
    if (projectionMetricsEl) projectionMetricsEl.innerHTML = '';
    lastProjectionSummaryText = 'No projection yet.';
    return;
  }

  renderProjectionResult(currentCgpa, currentCredits, futureRows);
  setMessage(projectionMessageEl, 'Projected CGPA updated.', 'success');
}

async function copyText(text, messageTarget, successText) {
  try {
    await navigator.clipboard.writeText(text);
    setMessage(messageTarget, successText, 'success');
  } catch {
    setMessage(messageTarget, 'Copy failed in this browser.', 'error');
  }
}

async function shareText(text, messageTarget, title) {
  if (navigator.share) {
    try {
      await navigator.share({
        title,
        text,
        url: window.location.href,
      });
      setMessage(messageTarget, 'Result shared successfully.', 'success');
      return;
    } catch {
      // fall back below
    }
  }
  await copyText(text, messageTarget, 'Result copied to clipboard.');
}

if (addSemesterButton) {
  addSemesterButton.addEventListener('click', addSemesterRow);
}

if (addForecastButton) {
  addForecastButton.addEventListener('click', addForecastRow);
}

if (cgpaForm) {
  cgpaForm.addEventListener('submit', (event) => {
    event.preventDefault();
    calculateCgpa();
  });
}

if (projectionForm) {
  projectionForm.addEventListener('submit', (event) => {
    event.preventDefault();
    calculateProjection();
  });
}

if (copyCgpaButton) {
  copyCgpaButton.addEventListener('click', () => copyText(lastCgpaSummaryText, currentMessageEl, 'CGPA copied to clipboard.'));
}

if (shareCgpaButton) {
  shareCgpaButton.addEventListener('click', () => shareText(lastCgpaSummaryText, currentMessageEl, 'SRM CGPA result'));
}

if (copyProjectionButton) {
  copyProjectionButton.addEventListener('click', () => copyText(lastProjectionSummaryText, projectionMessageEl, 'Projection copied to clipboard.'));
}

if (shareProjectionButton) {
  shareProjectionButton.addEventListener('click', () => shareText(lastProjectionSummaryText, projectionMessageEl, 'SRM projected CGPA'));
}

if (clearHistoryButton) {
  clearHistoryButton.addEventListener('click', () => {
    try {
      localStorage.removeItem(CGPA_HISTORY_KEY);
    } catch {
      // Ignore storage failures.
    }
    renderHistory();
    setMessage(currentMessageEl, 'History cleared.', 'success');
  });
}

if (semesterContainer) {
  semesterContainer.addEventListener('input', () => {
    setMessage(currentMessageEl, '', '');
  });
}

if (projectionContainer) {
  projectionContainer.addEventListener('input', () => {
    setMessage(projectionMessageEl, '', '');
  });
}

renderHistory();
