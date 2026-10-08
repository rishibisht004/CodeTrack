// ==========================================
// CODETRACK ASSESSMENT
// ==========================================


// Backend URL
// Later production deployment mein isko
// deployed backend URL se replace karenge.

const API_BASE_URL = "http://localhost:5000";


// ==========================================
// VARIABLES
// ==========================================

let assessment = null;

let questions = [];

let currentQuestionIndex = 0;

let userAnswers = {};

let selectedCourse = "";


// ==========================================
// GET COURSE
// ==========================================

function getSelectedCourse() {

    const urlParams =
        new URLSearchParams(window.location.search);

    const urlCourse =
        urlParams.get("course");

    const storedCourse =
        localStorage.getItem("selectedCourse");


    return urlCourse || storedCourse || "";
}



// ==========================================
// PAGE INITIALIZATION
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        selectedCourse =
            getSelectedCourse();


        if (!selectedCourse) {

            showError(
                "No programming course was selected. Please go back to the dashboard and choose a course."
            );

            return;
        }


        updateCourseUI();

        generateAssessment();

    }
);



// ==========================================
// UPDATE COURSE UI
// ==========================================

function updateCourseUI() {

    const course =
        selectedCourse;


    const courseName =
        document.getElementById("courseName");

    const assessmentCourseLabel =
        document.getElementById(
            "assessmentCourseLabel"
        );


    if (courseName) {

        courseName.textContent =
            course + " Assessment";

    }


    if (assessmentCourseLabel) {

        assessmentCourseLabel.textContent =
            course.toUpperCase() + " PROGRAMMING";

    }

}



// ==========================================
// GENERATE ASSESSMENT
// ==========================================

async function generateAssessment() {

    hideError();

    showLoading();


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/api/assessment/generate`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({

                        course: selectedCourse,

                        questionCount: 10

                    })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to generate assessment."
            );

        }


        // Store complete assessment

        assessment =
            data;


        questions =
            data.questions || [];


        // Validate

        if (!Array.isArray(questions) ||
            questions.length === 0) {

            throw new Error(
                "AI did not return any questions."
            );

        }


        // Reset answers

        userAnswers = {};

        currentQuestionIndex = 0;


        // Save assessment ID

        if (data.assessmentId) {

            localStorage.setItem(
                "currentAssessmentId",
                data.assessmentId
            );

        }


        hideLoading();

        showAssessment();

        renderQuestion();

    }
    catch (error) {

        console.error(
            "Assessment generation error:",
            error
        );


        showError(
            error.message ||
            "Unable to connect to the AI assessment service."
        );

    }

}



// ==========================================
// RENDER QUESTION
// ==========================================

function renderQuestion() {

    if (!questions.length) {
        return;
    }


    const question =
        questions[currentQuestionIndex];


    // -------------------------------
    // Question counter
    // -------------------------------

    const counter =
        document.getElementById(
            "questionCounter"
        );


    const currentNumber =
        document.getElementById(
            "currentQuestionNumber"
        );


    if (counter) {

        counter.textContent =
            `${currentQuestionIndex + 1} / ${questions.length}`;

    }


    if (currentNumber) {

        currentNumber.textContent =
            currentQuestionIndex + 1;

    }



    // -------------------------------
    // Question text
    // -------------------------------

    document.getElementById(
        "questionText"
    ).textContent =
        question.question || "";



    // -------------------------------
    // Question type
    // -------------------------------

    const typeElement =
        document.getElementById(
            "questionType"
        );


    const questionType =
        normalizeQuestionType(
            question.type
        );


    typeElement.textContent =
        questionType === "programming"
            ? "PROGRAMMING"
            : "THEORY";



    // -------------------------------
    // Topic
    // -------------------------------

    document.getElementById(
        "questionTopic"
    ).textContent =
        question.topic || "General";



    // -------------------------------
    // Difficulty
    // -------------------------------

    document.getElementById(
        "questionDifficulty"
    ).textContent =
        question.difficulty || "Medium";



    // -------------------------------
    // Containers
    // -------------------------------

    const optionsContainer =
        document.getElementById(
            "optionsContainer"
        );


    const codingContainer =
        document.getElementById(
            "codingContainer"
        );


    optionsContainer.innerHTML = "";


    // Hide both initially

    optionsContainer.classList.add(
        "hidden"
    );

    codingContainer.classList.add(
        "hidden"
    );



    // -------------------------------
    // THEORY QUESTION
    // -------------------------------

    if (questionType === "theory") {

        renderTheoryQuestion(
            question,
            optionsContainer
        );

    }



    // -------------------------------
    // PROGRAMMING QUESTION
    // -------------------------------

    else if (
        questionType === "programming"
    ) {

        renderProgrammingQuestion(
            question,
            codingContainer
        );

    }



    // -------------------------------
    // Update progress
    // -------------------------------

    updateProgress();


    // -------------------------------
    // Navigation
    // -------------------------------

    updateNavigation();


    // -------------------------------
    // Dots
    // -------------------------------

    renderQuestionDots();

}



// ==========================================
// NORMALIZE TYPE
// ==========================================

function normalizeQuestionType(type) {

    if (!type) {
        return "theory";
    }


    const normalized =
        type
            .toString()
            .toLowerCase()
            .trim();


    if (
        normalized === "programming" ||
        normalized === "coding" ||
        normalized === "code"
    ) {

        return "programming";

    }


    return "theory";

}



// ==========================================
// THEORY QUESTION
// ==========================================

function renderTheoryQuestion(
    question,
    container
) {

    container.classList.remove(
        "hidden"
    );


    const options =
        Array.isArray(question.options)
            ? question.options
            : [];


    options.forEach(
        (option, index) => {

            const optionButton =
                document.createElement("button");


            optionButton.type =
                "button";


            optionButton.className =
                "answer-option";


            optionButton.dataset.index =
                index;


            const letter =
                String.fromCharCode(
                    65 + index
                );


            optionButton.innerHTML = `
                <span class="option-letter">
                    ${letter}
                </span>

                <span class="option-text">
                    ${escapeHTML(option)}
                </span>
            `;


            optionButton.addEventListener(
                "click",
                function () {

                    selectOption(
                        index
                    );

                }
            );


            container.appendChild(
                optionButton
            );

        }
    );


    // Restore previous answer

    const savedAnswer =
        userAnswers[
            question.id
        ];


    if (
        savedAnswer !== undefined &&
        savedAnswer !== null
    ) {

        selectOption(
            savedAnswer
        );

    }

}



// ==========================================
// SELECT OPTION
// ==========================================

function selectOption(index) {

    const question =
        questions[currentQuestionIndex];


    userAnswers[
        question.id
    ] = index;


    const options =
        document.querySelectorAll(
            ".answer-option"
        );


    options.forEach(
        (option, optionIndex) => {

            option.classList.toggle(
                "selected",
                optionIndex === index
            );

        }
    );

}



// ==========================================
// PROGRAMMING QUESTION
// ==========================================

function renderProgrammingQuestion(
    question,
    container
) {

    container.classList.remove(
        "hidden"
    );


    const language =
        document.getElementById(
            "codingLanguage"
        );


    if (language) {

        language.textContent =
            question.language ||
            selectedCourse;

    }


    const codeAnswer =
        document.getElementById(
            "codeAnswer"
        );


    codeAnswer.value =
        userAnswers[
            question.id
        ] || "";


    // Optional starter code

    if (
        question.starterCode &&
        !userAnswers[question.id]
    ) {

        codeAnswer.value =
            question.starterCode;

    }


    codeAnswer.oninput =
        function () {

            userAnswers[
                question.id
            ] = codeAnswer.value;

        };

}



// ==========================================
// UPDATE PROGRESS
// ==========================================

function updateProgress() {

    const total =
        questions.length;


    const current =
        currentQuestionIndex + 1;


    const percentage =
        Math.round(
            (current / total) * 100
        );


    const progressBar =
        document.getElementById(
            "progressBar"
        );


    const progressText =
        document.getElementById(
            "progressText"
        );


    if (progressBar) {

        progressBar.style.width =
            percentage + "%";

    }


    if (progressText) {

        progressText.textContent =
            percentage + "%";

    }

}



// ==========================================
// NAVIGATION
// ==========================================

function updateNavigation() {

    const previousBtn =
        document.getElementById(
            "previousBtn"
        );


    const nextBtn =
        document.getElementById(
            "nextBtn"
        );


    const submitBtn =
        document.getElementById(
            "submitBtn"
        );


    // Previous

    if (currentQuestionIndex === 0) {

        previousBtn.disabled = true;

        previousBtn.classList.add(
            "disabled-navigation"
        );

    }
    else {

        previousBtn.disabled = false;

        previousBtn.classList.remove(
            "disabled-navigation"
        );

    }



    // Last question

    const isLastQuestion =
        currentQuestionIndex ===
        questions.length - 1;


    if (isLastQuestion) {

        nextBtn.classList.add(
            "hidden"
        );

        submitBtn.classList.remove(
            "hidden"
        );

    }
    else {

        nextBtn.classList.remove(
            "hidden"
        );

        submitBtn.classList.add(
            "hidden"
        );

    }

}



// ==========================================
// NEXT QUESTION
// ==========================================

function nextQuestion() {

    saveCurrentAnswer();


    if (
        currentQuestionIndex <
        questions.length - 1
    ) {

        currentQuestionIndex++;

        renderQuestion();

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }

}



// ==========================================
// PREVIOUS QUESTION
// ==========================================

function previousQuestion() {

    saveCurrentAnswer();


    if (
        currentQuestionIndex > 0
    ) {

        currentQuestionIndex--;

        renderQuestion();

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }

}



// ==========================================
// SAVE CURRENT ANSWER
// ==========================================

function saveCurrentAnswer() {

    const question =
        questions[
            currentQuestionIndex
        ];


    if (!question) {
        return;
    }


    const type =
        normalizeQuestionType(
            question.type
        );


    // Programming answer

    if (type === "programming") {

        const codeAnswer =
            document.getElementById(
                "codeAnswer"
            );


        if (codeAnswer) {

            userAnswers[
                question.id
            ] = codeAnswer.value;

        }

    }

}



// ==========================================
// QUESTION DOTS
// ==========================================

function renderQuestionDots() {

    const container =
        document.getElementById(
            "questionDots"
        );


    container.innerHTML = "";


    questions.forEach(
        (question, index) => {

            const dot =
                document.createElement("button");


            dot.type =
                "button";


            dot.className =
                "question-dot";


            if (
                index ===
                currentQuestionIndex
            ) {

                dot.classList.add(
                    "active"
                );

            }


            if (
                hasAnswered(question)
            ) {

                dot.classList.add(
                    "answered"
                );

            }


            dot.textContent =
                index + 1;


            dot.addEventListener(
                "click",
                function () {

                    saveCurrentAnswer();

                    currentQuestionIndex =
                        index;

                    renderQuestion();

                }
            );


            container.appendChild(
                dot
            );

        }
    );

}



// ==========================================
// CHECK ANSWER
// ==========================================

function hasAnswered(question) {

    const answer =
        userAnswers[
            question.id
        ];


    if (
        answer === undefined ||
        answer === null
    ) {

        return false;

    }


    if (
        typeof answer === "string" &&
        answer.trim() === ""
    ) {

        return false;

    }


    return true;

}



// ==========================================
// SUBMIT ASSESSMENT
// ==========================================

async function submitAssessment() {

    saveCurrentAnswer();


    // Count unanswered questions

    const unanswered =
        questions.filter(
            question =>
                !hasAnswered(question)
        );


    if (unanswered.length > 0) {

        const confirmSubmit =
            confirm(
                `${unanswered.length} question(s) are unanswered. Do you still want to submit?`
            );


        if (!confirmSubmit) {

            return;

        }

    }


    showSubmitLoading();


    try {

        const assessmentId =
            localStorage.getItem(
                "currentAssessmentId"
            );


      const response = await fetch(
    `${API_BASE_URL}/api/assessment/submit`,
    {
        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            assessmentId: assessmentId,

            course: selectedCourse,

            answers: questions.map((question) => ({
                questionId: question.id,
                type: question.type,
                topic: question.topic,
                difficulty: question.difficulty,
                question: question.question,
                options: question.options || [],
                correctAnswer: question.correctAnswer ?? null,
                expectedConcepts:
                    question.expectedConcepts || [],
                starterCode:
                    question.starterCode || "",
                answer:
                    userAnswers[question.id] ?? null
            }))
        })
    }
);


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to submit assessment."
            );

        }


        // ==========================================
// SAVE LATEST RESULT
// ==========================================

localStorage.setItem(
    "latestAssessmentResult",
    JSON.stringify(data)
);


// ==========================================
// SAVE ASSESSMENT HISTORY
// ==========================================

const history =
    JSON.parse(
        localStorage.getItem("codeTrackHistory") || "[]"
    );

const historyItem = {
    assessmentId:
        data.assessmentId || null,

    course:
        data.course || selectedCourse,

    score:
        Number(data.result?.score || 0),

    total:
        Number(data.result?.total || questions.length),

    percentage:
        Number(data.result?.percentage || 0),

    topicAnalysis:
        data.result?.topicAnalysis || [],

    strengths:
        data.result?.strengths || [],

    weaknesses:
        data.result?.weaknesses || [],

    recommendations:
        data.result?.recommendations || [],

    completedAt:
        new Date().toISOString()
};


// Add newest assessment first

history.unshift(historyItem);


// Keep latest 20 assessments only

const limitedHistory =
    history.slice(0, 20);


localStorage.setItem(
    "codeTrackHistory",
    JSON.stringify(limitedHistory)
);


// Go to result

window.location.href =
    "result.html";
        


        // Open result page

        window.location.href =
            "result.html";

    }
    catch (error) {

        console.error(
            "Submission error:",
            error
        );


        hideSubmitLoading();


        alert(
            error.message ||
            "Unable to submit assessment."
        );

    }

}



// ==========================================
// UI STATES
// ==========================================

function showLoading() {

    document
        .getElementById("loadingScreen")
        .classList.remove("hidden");


    document
        .getElementById("assessmentScreen")
        .classList.add("hidden");


    document
        .getElementById("errorScreen")
        .classList.add("hidden");

}



function hideLoading() {

    document
        .getElementById("loadingScreen")
        .classList.add("hidden");

}



function showAssessment() {

    document
        .getElementById("assessmentScreen")
        .classList.remove("hidden");

}



function showError(message) {

    document
        .getElementById("loadingScreen")
        .classList.add("hidden");


    document
        .getElementById("assessmentScreen")
        .classList.add("hidden");


    const errorScreen =
        document.getElementById(
            "errorScreen"
        );


    errorScreen.classList.remove(
        "hidden"
    );


    document.getElementById(
        "errorMessage"
    ).textContent =
        message;

}



function hideError() {

    document
        .getElementById("errorScreen")
        .classList.add("hidden");

}



function showSubmitLoading() {

    document
        .getElementById("assessmentScreen")
        .classList.add("hidden");


    document
        .getElementById("submitLoading")
        .classList.remove("hidden");

}



function hideSubmitLoading() {

    document
        .getElementById("submitLoading")
        .classList.add("hidden");


    document
        .getElementById("assessmentScreen")
        .classList.remove("hidden");

}



// ==========================================
// DASHBOARD
// ==========================================

function goToDashboard() {

    window.location.href =
        "dashboard.html";

}



// ==========================================
// HTML ESCAPE
// ==========================================

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value;

    return div.innerHTML;

}