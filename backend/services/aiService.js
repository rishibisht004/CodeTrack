// ==========================================
// CodeTrack - Gemini AI Service
// ==========================================

const GEMINI_API_URL =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent";


// ==========================================
// Generate Assessment
// ==========================================

export async function generateAssessment(course, questionCount = 10) {

    if (!["C", "Python"].includes(course)) {
        throw new Error("Invalid course. Choose C or Python.");
    }

    if (
        !Number.isInteger(questionCount) ||
        questionCount < 5 ||
        questionCount > 20
    ) {
        throw new Error("Question count must be between 5 and 20.");
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        throw new Error("GEMINI_API_KEY is missing from .env file.");
    }


    console.log(
        `Generating ${questionCount} AI questions for ${course} using Gemini...`
    );


    // ==========================================
    // Prompt
    // ==========================================

    const prompt = `
You are CodeTrack, an AI programming assessment generator.

Create a programming assessment for a 2nd-year BTech CSE student.

Programming language: ${course}
Number of questions: ${questionCount}

Requirements:

- Generate exactly ${questionCount} questions.
- 60% theory questions.
- 40% programming questions.
- Cover different programming topics.
- Include easy, medium and hard questions.
- Do not repeat questions.
- Theory questions must have exactly 4 options.
- Programming questions must contain starter code.
- Questions must test real programming understanding.

Every question must contain:

id
type
topic
difficulty
question

For theory questions also include:

options
correctAnswer

For programming questions also include:

starterCode
expectedConcepts

The "type" must be either:
"theory"
or
"programming"

The "difficulty" must be:
"easy"
"medium"
or
"hard"

For theory questions, correctAnswer must be:
0, 1, 2, or 3

Return ONLY valid JSON.

Do not use markdown.
Do not use code fences.
Do not add explanations.

JSON format:

{
  "questions": [
    {
      "id": 1,
      "type": "theory",
      "topic": "Variables",
      "difficulty": "easy",
      "question": "What is a variable?",
      "options": [
        "Option A",
        "Option B",
        "Option C",
        "Option D"
      ],
      "correctAnswer": 0
    },
    {
      "id": 2,
      "type": "programming",
      "topic": "Loops",
      "difficulty": "medium",
      "question": "Write a program to solve this problem.",
      "starterCode": "// Write your code here",
      "expectedConcepts": [
        "loops",
        "conditions"
      ]
    }
  ]
}
`;


    // ==========================================
    // Gemini API Request
    // ==========================================

    const response = await fetch(
        `${GEMINI_API_URL}?key=${apiKey}`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            {
                                text: prompt
                            }
                        ]
                    }
                ],

                generationConfig: {
                    
                    responseMimeType: "application/json"
                }
            })
        }
    );


    // ==========================================
    // Handle API Error
    // ==========================================

    if (!response.ok) {

        const errorText = await response.text();

        console.error("Gemini API Error:");
        console.error(errorText);

        throw new Error(
            `Gemini API request failed (${response.status}).`
        );
    }


    const data = await response.json();


    // ==========================================
    // Extract AI Response
    // ==========================================

    const aiText =
        data?.candidates?.[0]?.content?.parts?.[0]?.text;


    if (!aiText) {

        console.error(
            "Unexpected Gemini response:",
            JSON.stringify(data, null, 2)
        );

        throw new Error(
            "Gemini returned an empty response."
        );
    }


    console.log("Gemini response received.");


    // ==========================================
    // Parse JSON
    // ==========================================

    let parsed;

    try {

        parsed = JSON.parse(aiText);

    } catch (error) {

        console.error("Gemini returned invalid JSON:");
        console.error(aiText);

        throw new Error(
            "Gemini returned invalid assessment JSON."
        );
    }


    // ==========================================
    // Validate
    // ==========================================

    validateQuestions(
        parsed.questions,
        questionCount
    );


    console.log(
        `Successfully generated ${parsed.questions.length} questions.`
    );


    return parsed.questions;
}


// ==========================================
// Validate Questions
// ==========================================

function validateQuestions(questions, expectedCount) {

    if (!Array.isArray(questions)) {

        throw new Error(
            "Gemini response does not contain a questions array."
        );
    }


    if (questions.length !== expectedCount) {

        throw new Error(
            `Gemini generated ${questions.length} questions instead of ${expectedCount}.`
        );
    }


    questions.forEach((question, index) => {

        if (!question || typeof question !== "object") {

            throw new Error(
                `Question ${index + 1} is invalid.`
            );
        }


        if (!question.id) {

            throw new Error(
                `Question ${index + 1} is missing id.`
            );
        }


        if (
            !["theory", "programming"].includes(
                question.type
            )
        ) {

            throw new Error(
                `Question ${index + 1} has invalid type.`
            );
        }


        if (!question.topic) {

            throw new Error(
                `Question ${index + 1} is missing topic.`
            );
        }


        if (
            !["easy", "medium", "hard"].includes(
                question.difficulty
            )
        ) {

            throw new Error(
                `Question ${index + 1} has invalid difficulty.`
            );
        }


        if (!question.question) {

            throw new Error(
                `Question ${index + 1} is missing question text.`
            );
        }


        // Theory validation
        if (question.type === "theory") {

            if (
                !Array.isArray(question.options) ||
                question.options.length !== 4
            ) {

                throw new Error(
                    `Theory question ${index + 1} must have exactly 4 options.`
                );
            }


            if (
                !Number.isInteger(
                    question.correctAnswer
                ) ||
                question.correctAnswer < 0 ||
                question.correctAnswer > 3
            ) {

                throw new Error(
                    `Theory question ${index + 1} has invalid correct answer.`
                );
            }
        }


        // Programming validation
        if (question.type === "programming") {

            if (!question.starterCode) {

                question.starterCode =
                    "// Write your solution here";
            }


            if (
                !Array.isArray(
                    question.expectedConcepts
                )
            ) {

                question.expectedConcepts = [];
            }
        }

    });
}
// ==========================================
// Evaluate Assessment
// ==========================================

export async function evaluateAssessment(course, answers) {

    if (!["C", "Python"].includes(course)) {
        throw new Error("Invalid course. Choose C or Python.");
    }

    if (!Array.isArray(answers) || answers.length === 0) {
        throw new Error("Answers must be a non-empty array.");
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        throw new Error("GEMINI_API_KEY is missing from .env file.");
    }

    console.log(
        `Evaluating ${answers.length} answers for ${course}...`
    );


    // ==========================================
    // Separate Theory & Programming
    // ==========================================

    const theoryAnswers = answers.filter(
        answer => answer.type === "theory"
    );

    const programmingAnswers = answers.filter(
        answer => answer.type === "programming"
    );


    // ==========================================
    // Evaluate Theory Locally
    // ==========================================

    const questionResults = [];

    theoryAnswers.forEach(answer => {

        const userAnswer =
            Number(answer.answer);

        const correctAnswer =
            Number(answer.correctAnswer);

        const isCorrect =
            Number.isInteger(userAnswer) &&
            userAnswer === correctAnswer;

        questionResults.push({
            questionId: answer.questionId,
            topic: answer.topic,
            difficulty: answer.difficulty,
            type: "theory",
            correct: isCorrect,
            feedback: isCorrect
                ? "Correct answer."
                : "Incorrect answer."
        });

    });


    // ==========================================
    // Evaluate Programming Using Gemini
    // ==========================================

    if (programmingAnswers.length > 0) {

        const programmingPrompt = `
You are CodeTrack, an AI programming evaluator.

Evaluate the following programming answers.

Programming language: ${course}

For every question determine whether the student's answer is
correct based on the problem requirements and expected concepts.

Be reasonably strict:
- Check whether the logic solves the problem.
- Check important edge cases.
- Check whether expected concepts are actually used when appropriate.
- Do not require an identical solution.
- Minor syntax mistakes can be considered incorrect if they prevent the solution from working.

Return ONLY valid JSON.

Required format:

{
  "results": [
    {
      "questionId": 1,
      "correct": true,
      "feedback": "Short explanation."
    }
  ]
}

Questions and student answers:

${JSON.stringify(
    programmingAnswers.map(answer => ({
        questionId: answer.questionId,
        topic: answer.topic,
        difficulty: answer.difficulty,
        question: answer.question,
        expectedConcepts: answer.expectedConcepts || [],
        starterCode: answer.starterCode || "",
        studentAnswer: answer.answer || ""
    })),
    null,
    2
)}
`;


        const response = await fetch(
            `${GEMINI_API_URL}?key=${apiKey}`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: programmingPrompt
                                }
                            ]
                        }
                    ],

                    generationConfig: {
                        responseMimeType: "application/json"
                    }
                })
            }
        );


        if (!response.ok) {

            const errorText =
                await response.text();

            console.error(
                "Gemini Evaluation Error:"
            );

            console.error(errorText);

            throw new Error(
                `Gemini evaluation failed (${response.status}).`
            );
        }


        const data =
            await response.json();


        const aiText =
            data?.candidates?.[0]?.content?.parts?.[0]?.text;


        if (!aiText) {

            throw new Error(
                "Gemini returned an empty evaluation."
            );
        }


        let parsedEvaluation;

        try {

            parsedEvaluation =
                JSON.parse(aiText);

        } catch (error) {

            console.error(
                "Invalid Gemini evaluation JSON:"
            );

            console.error(aiText);

            throw new Error(
                "Gemini returned invalid evaluation JSON."
            );
        }


        if (
            !parsedEvaluation.results ||
            !Array.isArray(parsedEvaluation.results)
        ) {

            throw new Error(
                "Gemini evaluation does not contain results."
            );
        }


        parsedEvaluation.results.forEach(
            result => {

                const originalQuestion =
                    programmingAnswers.find(
                        answer =>
                            String(answer.questionId) ===
                            String(result.questionId)
                    );

                questionResults.push({
                    questionId: result.questionId,

                    topic:
                        originalQuestion?.topic ||
                        "General",

                    difficulty:
                        originalQuestion?.difficulty ||
                        "medium",

                    type: "programming",

                    correct:
                        result.correct === true,

                    feedback:
                        result.feedback ||
                        "No feedback available."
                });

            }
        );

    }


    // ==========================================
    // Calculate Score
    // ==========================================

    const total =
        answers.length;

    const correct =
        questionResults.filter(
            result => result.correct
        ).length;

    const percentage =
        total > 0
            ? Math.round((correct / total) * 100)
            : 0;


    // ==========================================
    // Topic-wise Analysis
    // ==========================================

    const topicStats = {};

    questionResults.forEach(result => {

        const topic =
            result.topic || "General";

        if (!topicStats[topic]) {

            topicStats[topic] = {
                attempted: 0,
                correct: 0
            };

        }

        topicStats[topic].attempted++;

        if (result.correct) {
            topicStats[topic].correct++;
        }

    });


    const topicAnalysis =
        Object.entries(topicStats).map(
            ([topic, stats]) => {

                const accuracy =
                    Math.round(
                        (stats.correct /
                            stats.attempted) *
                        100
                    );

                let status;

                if (accuracy < 50) {
                    status = "Weak";
                }
                else if (accuracy < 75) {
                    status = "Needs Practice";
                }
                else {
                    status = "Strong";
                }

                return {
                    topic: topic,
                    attempted: stats.attempted,
                    correct: stats.correct,
                    accuracy: accuracy,
                    status: status
                };

            }
        );


    // ==========================================
    // Strengths & Weaknesses
    // ==========================================

    const strengths =
        topicAnalysis
            .filter(
                topic => topic.accuracy >= 75
            )
            .sort(
                (a, b) =>
                    b.accuracy - a.accuracy
            )
            .slice(0, 3)
            .map(
                topic =>
                    `${topic.topic} (${topic.accuracy}%)`
            );


    const weaknesses =
        topicAnalysis
            .filter(
                topic => topic.accuracy < 50
            )
            .sort(
                (a, b) =>
                    a.accuracy - b.accuracy
            )
            .slice(0, 3)
            .map(
                topic =>
                    `${topic.topic} (${topic.accuracy}%)`
            );


    // ==========================================
    // Recommendations
    // ==========================================

    const recommendations = [];

    topicAnalysis
        .filter(
            topic => topic.accuracy < 75
        )
        .sort(
            (a, b) =>
                a.accuracy - b.accuracy
        )
        .slice(0, 4)
        .forEach(topic => {

            recommendations.push(
                `Practice ${topic.topic} with more ${course} problems and focus on understanding the core concepts.`
            );

        });


    if (recommendations.length === 0) {

        recommendations.push(
            `Great performance! Continue practicing ${course} problems and gradually increase difficulty.`
        );

    }


    // ==========================================
    // Final Result
    // ==========================================

    return {

        score: correct,

        total: total,

        percentage: percentage,

        strengths: strengths,

        weaknesses: weaknesses,

        recommendations: recommendations,

        topicAnalysis: topicAnalysis,

        questionResults: questionResults

    };

}