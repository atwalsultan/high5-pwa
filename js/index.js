//**************************************************************
//**************************************************************
//      High5 PWA
//**************************************************************
//**************************************************************


//**************************************************************
//      Root Scope Variable Declarations
//**************************************************************

// Login form 
const signupForm = document.getElementById('signup-form');
const loginForm = document.getElementById('login-form');

// Alerts
const alertDiv = document.getElementById('alerts');

//**************************************************************
//      Function Declarations
//**************************************************************

// Show alerts
const showAlert = (content, type) => {
    // Create element to show message
    let alertContent = document.createElement('p');

    // Put contents of the message into element
    alertContent.textContent = content;

    // Prepend element to alert div
    alertDiv.prepend(alertContent);

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

// Login form submit
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