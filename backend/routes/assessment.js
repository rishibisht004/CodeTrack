import express from "express";

import {
    generateAssessment,
    evaluateAssessment
} from "../services/aiService.js";

const router = express.Router();


// ==========================================
// GENERATE ASSESSMENT
// ==========================================

router.post("/generate", async (req, res) => {

    try {

        const {
            course,
            questionCount = 10
        } = req.body;


        if (!course) {

            return res.status(400).json({
                success: false,
                message: "Course is required."
            });

        }


        if (!["C", "Python"].includes(course)) {

            return res.status(400).json({
                success: false,
                message: "Course must be C or Python."
            });

        }


        if (
            !Number.isInteger(questionCount) ||
            questionCount < 5 ||
            questionCount > 20
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Question count must be between 5 and 20."
            });

        }


        console.log(
            `Generating ${questionCount} AI questions for ${course}...`
        );


        const questions =
            await generateAssessment(
                course,
                questionCount
            );


        const assessmentId =
            "assessment_" +
            Date.now() +
            "_" +
            Math.random()
                .toString(36)
                .substring(2, 8);


        res.json({

            success: true,

            assessmentId,

            course,

            questions

        });

    }

    catch (error) {

        console.error(
            "ASSESSMENT GENERATION ERROR:"
        );

        console.error(error);


        res.status(500).json({

            success: false,

            message:
                error.message ||
                "Unable to generate assessment."

        });

    }

});



// ==========================================
// SUBMIT ASSESSMENT
// ==========================================

router.post("/submit", async (req, res) => {

    try {

        const {
            assessmentId,
            course,
            answers
        } = req.body;


        // --------------------------------------
        // Validate Assessment ID
        // --------------------------------------

        if (!assessmentId) {

            return res.status(400).json({

                success: false,

                message:
                    "Assessment ID is required."

            });

        }


        // --------------------------------------
        // Validate Course
        // --------------------------------------

        if (!course) {

            return res.status(400).json({

                success: false,

                message:
                    "Course is required."

            });

        }


        if (!["C", "Python"].includes(course)) {

            return res.status(400).json({

                success: false,

                message:
                    "Course must be C or Python."

            });

        }


        // --------------------------------------
        // Validate Answers
        // --------------------------------------

        if (!Array.isArray(answers)) {

            return res.status(400).json({

                success: false,

                message:
                    "Answers must be an array."

            });

        }


        if (answers.length === 0) {

            return res.status(400).json({

                success: false,

                message:
                    "No answers were submitted."

            });

        }


        console.log(
            `Evaluating assessment ${assessmentId}...`
        );


        // --------------------------------------
        // AI Evaluation
        // --------------------------------------

        const evaluation =
            await evaluateAssessment(
                course,
                answers
            );


        // --------------------------------------
        // Send Result
        // --------------------------------------

        res.json({

            success: true,

            message:
                "Assessment evaluated successfully.",

            assessmentId,

            course,

            result: evaluation

        });

    }

    catch (error) {

        console.error(
            "ASSESSMENT SUBMISSION ERROR:"
        );

        console.error(error);


        res.status(500).json({

            success: false,

            message:
                error.message ||
                "Unable to evaluate assessment."

        });

    }

});


// ==========================================
// EXPORT ROUTER
// ==========================================

export default router;