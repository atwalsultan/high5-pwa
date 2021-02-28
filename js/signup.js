//**************************************************************
//**************************************************************
//      High5 PWA
//**************************************************************
//**************************************************************

//**************************************************************
//      Root Scope Variable Declarations
//**************************************************************

// Signup form 
const signupForm = document.getElementById('signup-form');

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

// Signup form submit
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
        auth.createUserWithEmailAndPassword(email, password).then(() => {
            // Log user out
            auth.signOut().catch((error) => {
                // Show message
                showAlert(error.message, `error`);
            });

            // Show message
            showAlert(`Account created successfully! Redirecting to login page.`, `success`);

            // Navigate to home page after 3 seconds
            setTimeout(() => {
                window.location.href = `../index.html`;
            }, 3000);
            

        }).catch((error) => {
            // Show message
            showAlert(error.message, `error`);
        });
    }
    else {
        // Show message
        showAlert(`The passwords do not match. Please try again.`, `error`);
    }

});
