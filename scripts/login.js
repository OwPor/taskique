// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAecf3S60q04l_t9xV0zc-GQWclfUzB7cQ",
    authDomain: "task-management-fba11.firebaseapp.com",
    databaseURL: "https://task-management-fba11-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "task-management-fba11",
    storageBucket: "task-management-fba11.appspot.com",
    messagingSenderId: "1027065655812",
    appId: "1:1027065655812:web:dc0b13776117dd0f0f3b51"
};

const app = firebase.initializeApp(firebaseConfig);
const auth =  firebase.auth();
const db = firebase.database();

//signIn
function signIn() {
	var email = document.getElementById("email").value;
	var password  = document.getElementById("password").value;

    if (validateEmail(email) == false) {
        alert("Invalid email. Please input a valid email.")
        return;
    }

    if (validatePassword(password) == false) {
        alert("Invalid password. Password must be 6 or more characters.")
        return;
    }

    auth.signInWithEmailAndPassword(email,password)
        .then(function() {
            var user = auth.currentUser;
        })
        .catch(function(error) {
            alert("Wrong email or password.");
        })
}

function validateEmail(email) {
    exp = /^[^@]+@\w+(\.\w+)+\w$/;
    if (exp.test(email) == true) {
        return true;
    } else {
        return false;
    }
}

function validatePassword(password) {
    if (password < 6) {
        return false;
    } else {
        return true;
    }
}

//signOut
function signOut() {
	auth.signOut();
	alert("Logged out successfully from system");
}

//Active user to homepage
firebase.auth().onAuthStateChanged((user) => {
    if(user){
        window.location.href = "pages/index.html";
    }
});