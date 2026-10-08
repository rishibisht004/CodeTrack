// ==========================================
// CODETRACK RESULT PAGE
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadResult();

    }
);


// ==========================================
// LOAD RESULT
// ==========================================

function loadResult() {

    const storedResult =
        localStorage.getItem(
            "latestAssessmentResult"
        );


    if (!storedResult) {

        console.warn(
            "No assessment result found."
        );

        return;

    }


    try {

        const data =
            JSON.parse(
                storedResult
            );


        console.log(
            "Result data:",
            data
        );


        const result =
            data.result || {};


        const course =
            data.course || "Programming";


        const score =
            Number(
                result.score || 0
            );


        const total =
            Number(
                result.total || 0
            );


        const percentage =
            Number(
                result.percentage || 0
            );


        // Course

        const courseText =
            document.getElementById(
                "courseText"
            );

        if (courseText) {

            courseText.textContent =
                `${course} Programming Assessment`;

        }


        // Percentage

        const percentageElement =
            document.getElementById(
                "percentage"
            );

        if (percentageElement) {

            percentageElement.textContent =
                `${Math.round(percentage)}%`;

        }


        // Score

        const scoreValue =
            document.getElementById(
                "scoreValue"
            );

        if (scoreValue) {

            scoreValue.textContent =
                `${score} / ${total}`;

        }


        // Score description

        const scoreText =
            document.getElementById(
                "scoreText"
            );

        if (scoreText) {

            scoreText.textContent =
                `You scored ${score} out of ${total} questions.`;

        }


        // Result title

        const resultTitle =
            document.getElementById(
                "resultTitle"
            );

        if (resultTitle) {

            if (percentage >= 80) {

                resultTitle.textContent =
                    "Excellent Performance! 🔥";

            }

            else if (percentage >= 60) {

                resultTitle.textContent =
                    "Good Performance! 👍";

            }

            else if (percentage >= 40) {

                resultTitle.textContent =
                    "Keep Improving! 💪";

            }

            else {

                resultTitle.textContent =
                    "Let's Strengthen Your Basics! 🚀";

            }

        }


        // Strengths

        renderList(
            "strengthsList",
            result.strengths,
            "No strengths detected yet."
        );


        // Weaknesses

        renderList(
            "weaknessesList",
            result.weaknesses,
            "No weak areas detected yet."
        );


        // Recommendations

        renderRecommendations(
            result.recommendations
        );

        // Topic-wise Analysis

renderTopicAnalysis(
    result.topicAnalysis
);

    }

    catch (error) {

        console.error(
            "Result loading error:",
            error
        );

    }

}


// ==========================================
// RENDER LIST
// ==========================================

function renderList(
    elementId,
    items,
    emptyMessage
) {

    const container =
        document.getElementById(
            elementId
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    if (
        !Array.isArray(items) ||
        items.length === 0
    ) {

        const li =
            document.createElement(
                "li"
            );

        li.className =
            "empty-message";

        li.textContent =
            emptyMessage;

        container.appendChild(
            li
        );

        return;

    }


    items.forEach(
        item => {

            const li =
                document.createElement(
                    "li"
                );

            li.textContent =
                item;

            container.appendChild(
                li
            );

        }
    );

}


// ==========================================
// RECOMMENDATIONS
// ==========================================

function renderRecommendations(
    recommendations
) {

    const container =
        document.getElementById(
            "recommendationsList"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    if (
        !Array.isArray(recommendations) ||
        recommendations.length === 0
    ) {

        const item =
            document.createElement(
                "div"
            );

        item.className =
            "recommendation-item";

        item.textContent =
            "Complete more assessments to get personalized recommendations.";

        container.appendChild(
            item
        );

        return;

    }


    recommendations.forEach(
        recommendation => {

            const item =
                document.createElement(
                    "div"
                );

            item.className =
                "recommendation-item";

            item.textContent =
                recommendation;

            container.appendChild(
                item
            );

        }
    );

}


// ==========================================
// RETAKE
// ==========================================

function retakeAssessment() {

    const course =
        localStorage.getItem(
            "selectedCourse"
        ) || "C";


    window.location.href =
        `assessment.html?course=${encodeURIComponent(course)}`;

}


// ==========================================
// DASHBOARD
// ==========================================

function goToDashboard() {

    window.location.href =
        "dashboard.html";

}

// ==========================================
// TOPIC-WISE ANALYSIS
// ==========================================

function renderTopicAnalysis(topicAnalysis) {

    const container =
        document.getElementById(
            "topicAnalysisList"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    if (
        !Array.isArray(topicAnalysis) ||
        topicAnalysis.length === 0
    ) {

        const message =
            document.createElement("div");

        message.className =
            "empty-message";

        message.textContent =
            "Topic analysis is not available yet.";

        container.appendChild(
            message
        );

        return;
    }


    topicAnalysis.forEach(topic => {

        const item =
            document.createElement("div");

        item.className =
            "topic-item";


        // --------------------------------------
        // Determine status
        // --------------------------------------

        let statusClass = "";
        let statusText = "";

        if (topic.accuracy >= 75) {

            statusClass =
                "status-strong";

            statusText =
                "Strong";

        }

        else if (topic.accuracy >= 50) {

            statusClass =
                "status-practice";

            statusText =
                "Needs Practice";

        }

        else {

            statusClass =
                "status-weak";

            statusText =
                "Weak";

        }


        // --------------------------------------
        // Topic Header
        // --------------------------------------

        const header =
            document.createElement("div");

        header.className =
            "topic-header";


        const topicName =
            document.createElement("span");

        topicName.className =
            "topic-name";

        topicName.textContent =
            topic.topic;


        const status =
            document.createElement("span");

        status.className =
            `topic-status ${statusClass}`;

        status.textContent =
            `${statusText} • ${topic.accuracy}%`;


        header.appendChild(
            topicName
        );

        header.appendChild(
            status
        );


        // --------------------------------------
        // Progress Bar
        // --------------------------------------

        const bar =
            document.createElement("div");

        bar.className =
            "topic-bar";


        const progress =
            document.createElement("div");

        progress.className =
            "topic-progress";


        progress.style.width =
            `${Math.min(
                Math.max(topic.accuracy, 0),
                100
            )}%`;


        if (topic.accuracy >= 75) {

            progress.style.background =
                "#16a34a";

        }

        else if (topic.accuracy >= 50) {

            progress.style.background =
                "#d97706";

        }

        else {

            progress.style.background =
                "#dc2626";

        }


        bar.appendChild(
            progress
        );


        // --------------------------------------
        // Meta Information
        // --------------------------------------

        const meta =
            document.createElement("div");

        meta.className =
            "topic-meta";


        const attempts =
            document.createElement("span");

        attempts.textContent =
            `${topic.correct}/${topic.attempted} correct`;


        const accuracy =
            document.createElement("span");

        accuracy.textContent =
            `${topic.accuracy}% accuracy`;


        meta.appendChild(
            attempts
        );

        meta.appendChild(
            accuracy
        );


        // --------------------------------------
        // Assemble
        // --------------------------------------

        item.appendChild(
            header
        );

        item.appendChild(
            bar
        );

        item.appendChild(
            meta
        );


        container.appendChild(
            item
        );

    });

}