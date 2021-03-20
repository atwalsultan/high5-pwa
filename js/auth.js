//**************************************************************
//**************************************************************
//      High5 PWA
//**************************************************************
//**************************************************************

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
var firebaseConfig = {
  apiKey: "AIzaSyAT7B0jOp4FLAnq0doLimgfqRDSwH0lqsE",
  authDomain: "high5-pwa.firebaseapp.com",
  projectId: "high5-pwa",
  storageBucket: "high5-pwa.appspot.com",
  messagingSenderId: "439071465334",
  appId: "1:439071465334:web:dfdef51006c530402ee457",
  measurementId: "G-E65E2LDF9F",
  };

  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  firebase.analytics();

  const db = firebase.firestore();
  const auth = firebase.auth();
  const ref = firebase.storage().ref();

  db.settings({ timestampsInSnapshots: true });

//**************************************************************
//      Root Scope Variable Declarations
//**************************************************************
let signupRedirect = true;

setTimeout(() => {
    signupRedirect = false;
}, 3000);

// Check auth state of user
auth.onAuthStateChanged((user) => {
  // Logged in and on login page
  if(user && (window.location.href.includes('index.html'))) {
    // Redirect to home page
    window.location.replace(`/pages/home.html`);
  }
  // Logged in and on signup page and login not due to sign up
  else if(user && (window.location.href.includes('signup.html')) && signupRedirect) {
    // Redirect to home page
    window.location.replace(`../pages/home.html`);
  }
  // Not logged in and not on login or signup page
  else if(!user && !(window.location.href.includes('index.html')) && !(window.location.href.includes('signup.html'))) {
    // Redirect to login page
    window.location.replace(`../index.html`);
  }
});