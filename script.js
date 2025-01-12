const grade_points = {
    "O": 10,
    "A+": 9,
    "A": 8,
    "B+": 7,
    "B": 6,
    "C": 5.5,
    "W": 0,
    "F": 0,
    "Ab": 0,
    "I": 0,
    "*": 0
};

const quotes = {
    10: "Aim for the stars and you'll reach the sky.",
    9.9: "Great things never come from comfort zones.",
    9.8: "Success is not final, failure is not fatal: It is the courage to continue that counts.",
    9.7: "The harder you work for something, the greater you'll feel when you achieve it.",
    9.6: "Don't stop when you're tired. Stop when you're done.",
    9.5: "Believe in yourself and all that you are. Know that there is something inside you that is greater than any obstacle.",
    9.4: "Your limitation—it's only your imagination.",
    9.3: "Push yourself, because no one else is going to do it for you.",
    9.2: "Sometimes later becomes never. Do it now.",
    9.1: "Great things never come from comfort zones.",
    9: "Success is not the key to happiness. Happiness is the key to success.",
    8.9: "Dream it. Wish it. Do it.",
    8.8: "Success doesn’t just find you. You have to go out and get it.",
    8.7: "The harder you work for something, the greater you’ll feel when you achieve it.",
    8.6: "Dream bigger. Do bigger.",
    8.5: "Don’t stop when you’re tired. Stop when you’re done.",
    8.4: "Wake up with determination. Go to bed with satisfaction.",
    8.3: "Do something today that your future self will thank you for.",
    8.2: "Little things make big days.",
    8.1: "It’s going to be hard, but hard does not mean impossible.",
    8: "The only way to do great work is to love what you do.",
    7.9: "Don’t wait for opportunity. Create it.",
    7.8: "Sometimes we’re tested not to show our weaknesses, but to discover our strengths.",
    7.7: "The key to success is to focus on goals, not obstacles.",
    7.6: "Dream it. Believe it. Build it.",
    7.5: "Success is what happens after you have survived all your mistakes.",
    7.4: "The only limit to our realization of tomorrow is our doubts of today.",
    7.3: "The way to get started is to quit talking and begin doing.",
    7.2: "The only place where success comes before work is in the dictionary.",
    7.1: "The future depends on what you do today.",
    7: "Believe you can and you're halfway there.",
    6.9: "The only way to achieve the impossible is to believe it is possible.",
    6.8: "Success is not how high you have climbed, but how you make a positive difference to the world.",
    6.7: "The only limit to our realization of tomorrow is our doubts of today.",
    6.6: "The only place where success comes before work is in the dictionary.",
    6.5: "The future depends on what you do today.",
    6.4: "The way to get started is to quit talking and begin doing.",
    6.3: "The only limit to our realization of tomorrow is our doubts of today.",
    6.2: "The only place where success comes before work is in the dictionary.",
    6.1: "The future depends on what you do today.",
    6: "Don't watch the clock; do what it does. Keep going.",
    5.9: "The only way to achieve the impossible is to believe it is possible.",
    5.8: "Success is not how high you have climbed, but how you make a positive difference to the world.",
    5.7: "The only limit to our realization of tomorrow is our doubts of today.",
    5.6: "The only place where success comes before work is in the dictionary.",
    5.5: "The future belongs to those who believe in the beauty of their dreams.",
    0: "Failure is not the opposite of success; it's part of success."
};

let count = 1;

document.getElementById("go").addEventListener("click", calculate);
document.getElementById("reset").addEventListener("click", function() {
    document.getElementById("go").classList.remove("hidden");
    document.getElementById("reset").classList.add("hidden");
    document.getElementById("result").classList.add("hidden");
    document.getElementById("more").classList.remove("hidden");
    document.querySelector("form").reset();
    document.querySelector("table").innerHTML = `
        <tr>
            <th>#</th>
            <th>Credits</th>
            <th>Grade</th>
        </tr>
        <tr>
            <td>1.</td>
            <td><input type="number" class="cred form-control" min="0"></td>
            <td>
                <select class="opt form-control">
                    <option>O</option>
                    <option>A+</option>
                    <option>A</option>
                    <option>B+</option>
                    <option>B</option>
                    <option>C</option>
                    <option>W</option>
                    <option>F</option>
                    <option>Ab</option>
                    <option>I</option>
                    <option>*</option>
                </select>
            </td>
        </tr>
    `;
    count = 1;
});

function calculate(event) {
    const grade_list = document.querySelectorAll(".opt");
    const credit_list = document.querySelectorAll(".cred");
    let points = 0;
    let sum_credits = 0;
    for (let i = 0; i < credit_list.length; i++) {
        let credit = credit_list[i].value === "" ? 0 : Number(credit_list[i].value);
        sum_credits += credit;
        let gradept = grade_points[grade_list[i].value];
        points += credit * gradept;
    }
    let gpa = (points / sum_credits);
    let percent = (gpa * 10).toFixed(0);
    document.getElementById("result").classList.remove("hidden");
    document.getElementById("gpa").textContent = gpa.toFixed(2);
    document.querySelector(".progress-bar").style.width = percent + "%";
    document.getElementById("reset").classList.remove("hidden");
    
    // Display motivational quote
    let quote = quotes[Math.floor(gpa)] || "Keep pushing forward!";
    document.getElementById("quote").textContent = quote;

    window.scrollTo(0, 0);
    event.stopPropagation();
}

document.getElementById("more").addEventListener("click", function(event) {
    count += 1;
    document.querySelector("form table").insertAdjacentHTML("beforeend", `
        <tr>
            <td>${count}.</td>
            <td><input type="number" class="cred form-control" min="0"></td>
            <td>
                <select class="opt form-control">
                    <option>O</option>
                    <option>A+</option>
                    <option>A</option>
                    <option>B+</option>
                    <option>B</option>
                    <option>C</option>
                    <option>W</option>
                    <option>F</option>
                    <option>Ab</option>
                    <option>I</option>
                    <option>*</option>
                </select>
            </td>
        </tr>
    `);
});
