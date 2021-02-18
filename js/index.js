//**************************************************************
//**************************************************************
//      High5 PWA
//**************************************************************
//**************************************************************


//**************************************************************
//      Root Scope Variable Declarations
//**************************************************************
let signupForm = document.getElementById('signupForm');
let loginForm = document.getElementById('loginForm');

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
            console.log(error.message);
        });
    }
    else {
        // Show message
        console.log(`The passwords do not match. Please try again.`);
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
        console.log(error.message);
    });
});