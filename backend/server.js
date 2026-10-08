import "dotenv/config";

import express from "express";
import cors from "cors";

import assessmentRoutes from "./routes/assessment.js";


const app = express();

const PORT = process.env.PORT || 5000;


// ==========================================
// MIDDLEWARE
// ==========================================

app.use(cors());

app.use(express.json());


// ==========================================
// TEST ROUTE
// ==========================================

app.get("/", (req, res) => {

    res.json({
        success: true,
        message: "CodeTrack AI Backend is running."
    });

});


// ==========================================
// ASSESSMENT ROUTES
// ==========================================

app.use(
    "/api/assessment",
    assessmentRoutes
);


// ==========================================
// ERROR HANDLER
// ==========================================

app.use((error, req, res, next) => {

    console.error("SERVER ERROR:");
    console.error(error);

    res.status(500).json({
        success: false,
        message: "Internal server error."
    });

});


// ==========================================
// SERVER
// ==========================================

const server = app.listen(
    PORT,
    () => {

        console.log("");
        console.log("======================================");
        console.log("   CODETRACK BACKEND");
        console.log("======================================");
        console.log(`Server: http://localhost:${PORT}`);
        console.log("Status: RUNNING");
        console.log("======================================");
        console.log("");

    }
);


// ==========================================
// ERROR HANDLING
// ==========================================

server.on("error", (error) => {

    console.error("SERVER FAILED TO START:");
    console.error(error);

});


process.on("uncaughtException", (error) => {

    console.error("UNCAUGHT EXCEPTION:");
    console.error(error);

});


process.on("unhandledRejection", (error) => {

    console.error("UNHANDLED REJECTION:");
    console.error(error);

});