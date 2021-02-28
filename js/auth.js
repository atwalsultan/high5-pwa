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
  db.settings({ timestampsInSnapshots: true 
});

// Check auth state of user
auth.onAuthStateChanged((user) => {
  if(user && (window.location.href.includes('index.html'))) {
    window.location.replace(`/pages/home.html`);
  }
  else if(!user && !(window.location.href.includes('index.html'))) {
    window.location.replace(`../index.html`);
  }
});