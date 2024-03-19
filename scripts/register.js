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

function register() {
    const email = document.getElementById("email").value;
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    
    if (validateEmail(email) == false) {
        alert("Invalid email. Please input a valid email.")
        return;
    }

    if (validatePassword(password) == false) {
        alert("Invalid password. Password must be 6 or more characters.")
        return;
    }

    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            dbRef = db.ref();
            var user = userCredential.user;
            dbRef.child('users/' + user.uid).set({
                username: username,
                isAdmin: false
            })
            .then(() => {
                console.log("Successfully registered!");
                auth.signOut();
                window.location.href = "index.html"
            })
            .catch((error) => {
                console.error("Error writing document: ", error);
            });
        })
        .catch((error) => {
                console.error("Error registering user: ", error);
        });
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

var isHidden = true;
var eye = document.getElementById("eye");
function eyeToggle() {
    password = document.getElementById("password");
    if (isHidden) {
        isHidden = false;
        password.setAttribute("type", "text");
        eye.src = "images/hide.png"
    } else {
        isHidden = true;
        password.setAttribute("type", "password");
        eye.src = "images/show.png"
    }
};