// ==========================================
// CODETRACK AUTHENTICATION
// ==========================================


// Get stored users
function getUsers() {

    const users = localStorage.getItem("codeTrackUsers");

    if (!users) {
        return [];
    }

    try {
        return JSON.parse(users);
    } catch (error) {

        console.error("Unable to read users:", error);

        return [];
    }
}


// Save users
function saveUsers(users) {

    localStorage.setItem(
        "codeTrackUsers",
        JSON.stringify(users)
    );
}


// Get currently logged-in user
function getCurrentUser() {

    const userEmail = localStorage.getItem("codeTrackUser");

    if (!userEmail) {
        return null;
    }

    const users = getUsers();

    return users.find(
        user => user.email === userEmail
    ) || null;
}


// ==========================================
// REGISTER
// ==========================================

const registerForm = document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener("submit", function(event) {

        event.preventDefault();


        const name =
            document.getElementById("registerName")
                .value
                .trim();

        const email =
            document.getElementById("registerEmail")
                .value
                .trim()
                .toLowerCase();

        const password =
            document.getElementById("registerPassword")
                .value;

        const confirmPassword =
            document.getElementById("confirmPassword")
                .value;

        const message =
            document.getElementById("registerMessage");


        // Clear previous message

        message.textContent = "";

        message.className = "auth-message";


        // Validate name

        if (name.length < 2) {

            showAuthMessage(
                message,
                "Please enter a valid name.",
                "error"
            );

            return;
        }


        // Validate email

        if (!email.includes("@")) {

            showAuthMessage(
                message,
                "Please enter a valid email address.",
                "error"
            );

            return;
        }


        // Validate password

        if (password.length < 6) {

            showAuthMessage(
                message,
                "Password must contain at least 6 characters.",
                "error"
            );

            return;
        }


        // Check password match

        if (password !== confirmPassword) {

            showAuthMessage(
                message,
                "Passwords do not match.",
                "error"
            );

            return;
        }


        const users = getUsers();


        // Check existing account

        const existingUser = users.find(
            user => user.email === email
        );


        if (existingUser) {

            showAuthMessage(
                message,
                "An account with this email already exists.",
                "error"
            );

            return;
        }


        // Create user

        const newUser = {

            id: Date.now(),

            name: name,

            email: email,

            password: password,

            createdAt: new Date().toISOString(),

            progress: {

                C: {
                    attempted: false,
                    score: 0
                },

                Python: {
                    attempted: false,
                    score: 0
                }

            }

        };


        users.push(newUser);

        saveUsers(users);


        // Login automatically

        localStorage.setItem(
            "codeTrackUser",
            email
        );


        showAuthMessage(
            message,
            "Account created successfully! Redirecting...",
            "success"
        );


        setTimeout(() => {

            window.location.href = "dashboard.html";

        }, 800);

    });

}



// ==========================================
// LOGIN
// ==========================================

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", function(event) {

        event.preventDefault();


        const email =
            document.getElementById("loginEmail")
                .value
                .trim()
                .toLowerCase();

        const password =
            document.getElementById("loginPassword")
                .value;

        const message =
            document.getElementById("loginMessage");


        message.textContent = "";

        message.className = "auth-message";


        const users = getUsers();


        const user = users.find(
            currentUser =>
                currentUser.email === email &&
                currentUser.password === password
        );


        if (!user) {

            showAuthMessage(
                message,
                "Invalid email or password.",
                "error"
            );

            return;
        }


        // Save login session

        localStorage.setItem(
            "codeTrackUser",
            user.email
        );


        showAuthMessage(
            message,
            "Login successful! Redirecting...",
            "success"
        );


        setTimeout(() => {

            window.location.href = "dashboard.html";

        }, 600);

    });

}



// ==========================================
// LOGOUT
// ==========================================

function logout() {

    localStorage.removeItem("codeTrackUser");

    window.location.href = "index.html";
}



// ==========================================
// AUTH MESSAGE
// ==========================================

function showAuthMessage(
    element,
    text,
    type
) {

    element.textContent = text;

    element.classList.add(type);

}