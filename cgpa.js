let semesterCount = 1;

document.getElementById('add-semester').addEventListener('click', () => {
  semesterCount++;
  const row = document.createElement('div');
  row.className = 'semester-row';
  row.innerHTML = `
    <span class="serial">${semesterCount}.</span>
    <input type="number" step="0.01" placeholder="GPA" class="gpa" min="0" max="10" required />
    <input type="number" placeholder="Credits" class="credits" min="0" required />
  `;
  document.getElementById('semester-container').appendChild(row);
});

document.getElementById('cgpa-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const gpas = document.querySelectorAll('.gpa');
  const credits = document.querySelectorAll('.credits');
  let totalCredits = 0;
  let weightedSum = 0;

  for (let i = 0; i < gpas.length; i++) {
    const gpa = parseFloat(gpas[i].value);
    const credit = parseFloat(credits[i].value);
    if (!isNaN(gpa) && !isNaN(credit)) {
      totalCredits += credit;
      weightedSum += gpa * credit;
    }
  }

  const cgpa = totalCredits ? (weightedSum / totalCredits).toFixed(2) : 0;
  document.getElementById('cgpa-result').innerText = `📘 Your CGPA is: ${cgpa}`;
});
gtag('event', 'cgpa_calculated');