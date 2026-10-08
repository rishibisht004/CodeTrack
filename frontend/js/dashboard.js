// ==========================================
// CODETRACK DASHBOARD
// ==========================================


// ==========================================
// GET CURRENT USER
// ==========================================

function getDashboardUser() {

    const email =
        localStorage.getItem("codeTrackUser");

    if (!email) {
        return null;
    }

    const users =
        JSON.parse(
            localStorage.getItem("codeTrackUsers") || "[]"
        );

    return users.find(
        user => user.email === email
    ) || null;
}



// ==========================================
// SAVE UPDATED USER
// ==========================================

function saveDashboardUser(updatedUser) {

    const email =
        localStorage.getItem("codeTrackUser");

    if (!email) {
        return;
    }

    const users =
        JSON.parse(
            localStorage.getItem("codeTrackUsers") || "[]"
        );

    const userIndex =
        users.findIndex(
            user => user.email === email
        );

    if (userIndex === -1) {
        return;
    }

    users[userIndex] = updatedUser;

    localStorage.setItem(
        "codeTrackUsers",
        JSON.stringify(users)
    );
}



// ==========================================
// UPDATE DASHBOARD FROM LATEST ASSESSMENT
// ==========================================

function updateDashboardProgress(user) {

    const storedResult =
        localStorage.getItem(
            "latestAssessmentResult"
        );

    if (!storedResult) {
        return user;
    }

    try {

        const data =
            JSON.parse(storedResult);

        const result =
            data.result || {};

        const course =
            data.course;

        if (!course) {
            return user;
        }


        const score =
            Number(result.score || 0);

        const total =
            Number(result.total || 0);

        const percentage =
            Number(result.percentage || 0);


        // Make sure progress object exists

        if (!user.progress) {

            user.progress = {
                C: {
                    attempted: false,
                    score: 0,
                    attempts: 0
                },

                Python: {
                    attempted: false,
                    score: 0,
                    attempts: 0
                }
            };

        }


        // Make sure selected course exists

        if (!user.progress[course]) {

            user.progress[course] = {
                attempted: false,
                score: 0,
                attempts: 0
            };

        }


        const courseProgress =
            user.progress[course];


        // Increase attempt count

        courseProgress.attempted = true;

        courseProgress.score = percentage;

        courseProgress.lastScore = percentage;

        courseProgress.lastCorrect = score;

        courseProgress.lastTotal = total;

        courseProgress.lastAttempt =
            new Date().toISOString();


        courseProgress.attempts =
            Number(courseProgress.attempts || 0) + 1;


        // Save topic analysis

        courseProgress.topicAnalysis =
            result.topicAnalysis || [];


        // Save strengths

        courseProgress.strengths =
            result.strengths || [];


        // Save weaknesses

        courseProgress.weaknesses =
            result.weaknesses || [];


        // Save recommendations

        courseProgress.recommendations =
            result.recommendations || [];


        // Save updated user

        saveDashboardUser(user);


        // Mark this result as processed

        localStorage.setItem(
            "lastProcessedAssessment",
            JSON.stringify({
                assessmentId:
                    data.assessmentId || null,

                course: course,

                processedAt:
                    new Date().toISOString()
            })
        );


        return user;

    } catch (error) {

        console.error(
            "Dashboard progress update error:",
            error
        );

        return user;

    }

}



// ==========================================
// LOAD USER DATA
// ==========================================

function loadDashboard() {

    let user =
        getDashboardUser();

    if (!user) {
        return;
    }


    // ======================================
    // UPDATE PROGRESS FIRST
    // ======================================

    user =
        updateDashboardProgress(user);


    // ======================================
    // USER INFORMATION
    // ======================================

    const userName =
        document.getElementById("userName");

    const welcomeName =
        document.getElementById("welcomeName");

    const userEmail =
        document.getElementById("userEmail");

    const userAvatar =
        document.getElementById("userAvatar");


    if (userName) {

        userName.textContent =
            user.name;

    }


    if (welcomeName) {

        welcomeName.textContent =
            user.name.split(" ")[0];

    }


    if (userEmail) {

        userEmail.textContent =
            user.email;

    }


    if (userAvatar) {

        userAvatar.textContent =
            user.name
                .charAt(0)
                .toUpperCase();

    }


    // ======================================
    // LOAD STATISTICS
    // ======================================

    loadStatistics(user);

    loadAssessmentHistory();

}



// ==========================================
// STATISTICS
// ==========================================

function loadStatistics(user) {

    let assessmentCount = 0;

    let totalScore = 0;

    let scoreCount = 0;


    if (user.progress) {

        Object.values(
            user.progress
        ).forEach(course => {

            if (course.attempted) {

                const attempts =
                    Number(
                        course.attempts || 1
                    );


                assessmentCount +=
                    attempts;


                totalScore +=
                    Number(
                        course.score || 0
                    );


                scoreCount++;

            }

        });

    }


    const average =
        scoreCount > 0
            ? Math.round(
                totalScore / scoreCount
            )
            : 0;


    // ======================================
    // DASHBOARD ELEMENTS
    // ======================================

    const assessmentElement =
        document.getElementById(
            "assessmentCount"
        );

    const averageElement =
        document.getElementById(
            "averageScore"
        );

    const progressElement =
        document.getElementById(
            "progressStatus"
        );


    if (assessmentElement) {

        assessmentElement.textContent =
            assessmentCount;

    }


    if (averageElement) {

        averageElement.textContent =
            average + "%";

    }


    if (progressElement) {

        if (assessmentCount === 0) {

            progressElement.textContent =
                "Start";

        }

        else if (average >= 80) {

            progressElement.textContent =
                "Excellent";

        }

        else if (average >= 60) {

            progressElement.textContent =
                "Good";

        }

        else {

            progressElement.textContent =
                "Improve";

        }

    }

}



// ==========================================
// START ASSESSMENT
// ==========================================

function startAssessment(course) {

    localStorage.setItem(
        "selectedCourse",
        course
    );


    window.location.href =
        "assessment.html?course=" +
        encodeURIComponent(course);

}



// ==========================================
// LOGOUT
// ==========================================

function logoutUser() {

    localStorage.removeItem(
        "codeTrackUser"
    );

    localStorage.removeItem(
        "selectedCourse"
    );

    window.location.href =
        "login.html";

}



// ==========================================
// INITIALIZE
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    loadDashboard
);

// ==========================================
// ASSESSMENT HISTORY
// ==========================================

function loadAssessmentHistory() {

    const container =
        document.getElementById(
            "assessmentHistory"
        );

    if (!container) {
        return;
    }


    const history =
        JSON.parse(
            localStorage.getItem(
                "codeTrackHistory"
            ) || "[]"
        );


    // No history

    if (!Array.isArray(history) ||
        history.length === 0) {

        container.innerHTML = `
            <div class="history-empty">
                <div class="history-empty-icon">📝</div>

                <h3>No assessments yet</h3>

                <p>
                    Complete your first assessment
                    to see your performance history here.
                </p>
            </div>
        `;

        return;
    }


    // Show latest 5

    const recentHistory =
        history.slice(0, 5);


    container.innerHTML = "";


    recentHistory.forEach(
        (attempt, index) => {

            const percentage =
                Number(
                    attempt.percentage || 0
                );


            let status =
                "Needs Practice";

            if (percentage >= 75) {

                status = "Strong";

            }
            else if (percentage >= 50) {

                status = "Needs Practice";

            }
            else {

                status = "Weak";

            }


            const date =
                formatAssessmentDate(
                    attempt.completedAt
                );


            const card =
                document.createElement("div");

            card.className =
                "history-card";


            card.innerHTML = `

                <div class="history-main">

                    <div class="history-course">

                        <div class="history-icon">
                            ${
                                attempt.course === "Python"
                                    ? "🐍"
                                    : "💻"
                            }
                        </div>

                        <div>

                            <h3>
                                ${escapeDashboardHTML(
                                    attempt.course
                                )}
                                Assessment
                            </h3>

                            <p>
                                ${date}
                            </p>

                        </div>

                    </div>


                    <div class="history-score">

                        <strong>
                            ${percentage}%
                        </strong>

                        <span>
                            ${attempt.score || 0}
                            /
                            ${attempt.total || 0}
                        </span>

                    </div>

                </div>


                <div class="history-bottom">

                    <span class="
                        history-status
                        ${
                            percentage >= 75
                                ? "history-strong"
                                : percentage >= 50
                                    ? "history-practice"
                                    : "history-weak"
                        }
                    ">
                        ${status}
                    </span>


                    <span class="history-index">
                        Attempt ${history.length - index}
                    </span>

                </div>

            `;


            container.appendChild(
                card
            );

        }
    );



    // Show "View All" if more than 5

    if (history.length > 5) {

        const viewMore =
            document.createElement("p");

        viewMore.className =
            "history-more";

        viewMore.textContent =
            `Showing latest 5 of ${history.length} assessments`;

        container.appendChild(
            viewMore
        );

    }

}



// ==========================================
// FORMAT DATE
// ==========================================

function formatAssessmentDate(
    dateString
) {

    if (!dateString) {
        return "Unknown date";
    }


    const date =
        new Date(dateString);


    if (Number.isNaN(
        date.getTime()
    )) {

        return "Unknown date";

    }


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );

}



// ==========================================
// HTML ESCAPE
// ==========================================

function escapeDashboardHTML(
    value
) {

    const div =
        document.createElement("div");

    div.textContent =
        value ?? "";

    return div.innerHTML;

}