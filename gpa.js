let subjectCount = 1;

document.getElementById('add-subject').addEventListener('click', () => {
  subjectCount++;
  const row = document.createElement('div');
  row.className = 'input-row';
  row.innerHTML = `
    <span class="serial">${subjectCount}.</span>
    <input type="number" placeholder="Credits" class="credits" min="0" required />
    <select class="grade">
      <option value="10">O</option>
      <option value="9">A+</option>
      <option value="8">A</option>
      <option value="7">B+</option>
      <option value="6">B</option>
      <option value="5">C</option>
      <option value="0">F / Ab / W / I</option>
    </select>
  `;
  document.getElementById('subject-container').appendChild(row);
});

document.getElementById('gpa-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const credits = document.querySelectorAll('.credits');
  const grades = document.querySelectorAll('.grade');
  let totalCredits = 0;
  let totalPoints = 0;

  for (let i = 0; i < credits.length; i++) {
    const credit = parseFloat(credits[i].value);
    const grade = parseFloat(grades[i].value);
    if (!isNaN(credit) && !isNaN(grade)) {
      totalCredits += credit;
      totalPoints += credit * grade;
    }
  }

  const gpa = totalCredits ? (totalPoints / totalCredits).toFixed(2) : 0;
  document.getElementById('result').innerText = `🎓 Your GPA is: ${gpa}`;
});
gtag('event', 'gpa_calculated');