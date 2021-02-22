//**************************************************************
//**************************************************************
//      High5 PWA
//**************************************************************
//**************************************************************


//**************************************************************
//      Root Scope Variable Declarations
//**************************************************************

// Login and signup form 
const signupForm = document.getElementById('signupForm');
const loginForm = document.getElementById('loginForm');

// Alerts
const alertDiv = document.getElementById('alerts');
const alertContent = document.getElementById('message');

//**************************************************************
//      Function Declarations
//**************************************************************

// // Show alerts
const showAlert = (content, type) => {
    // Put contents of the message into div
    alertContent.textContent = content;

    // Background colors
    if (type === 'success') {
        alertDiv.style.backgroundColor = `rgba(0, 200, 0, 0.4)`;
    }
    else if (type === 'error') {
        alertDiv.style.backgroundColor = `rgba(200, 0, 0, 0.4)`
    }

    // Slide alert div down
    alertDiv.style.top = "1rem";

    // Push alert div back up after 3 seconds
    setTimeout(() => {
        alertDiv.style.top = "-5rem";
    }, 3000);

    // Clear contents of alert div once it goes back up
    setTimeout(() => {
        alertContent.textContent = "";
    }, 3500);
}

//**************************************************************
//      Event Listeners
//**************************************************************
signupForm.addEventListener('submit', (e) => {
    // Prevent form from actually submitting
    e.preventDefault();

    // Get email and password from DOM
    let email = signupForm.signupEmail.value;
    let password = signupForm.signupPassword.value;
    let confirmPassword = signupForm.confirmPassword.value;

    // Clear form
    signupForm.reset();
    signupForm.signupEmail.focus();

    // Check if passwords match
    if(password === confirmPassword) {
        // Sign up the user or show error message
        auth.createUserWithEmailAndPassword(email, password).catch((error) => {
            // Show message
            showAlert(error.message, `error`);
        });
    }
    else {
        // Show message
        showAlert(`The passwords do not match. Please try again.`, `error`);
    }

});

loginForm.addEventListener('submit', (e) => {
    // Prevent form from actually submitting
    e.preventDefault();
    
    // Get email and password from DOM
    let email = loginForm.loginEmail.value;
    let password = loginForm.loginPassword.value;

    // Clear form
    loginForm.reset();
    loginForm.loginEmail.focus();

    // Sign up the user or show error message
    auth.signInWithEmailAndPassword(email, password).catch((error) => {
        // Show message
        showAlert(error.message, `error`);
    });
});