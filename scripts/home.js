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

//signOut
function signOut() {
    auth.signOut();
    alert("Logged out successfully from system");
}

var uid;
firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        uid = user.uid;
        displayTasks();
        getCompletedTasksForWeek();
    } else (
        window.location.href = "../index.html"
    )
});

function validateForm(field) {
    if (field < 1) {
        alert("Form must not be empty.")
        return false;
    } else
        return true;
}

function addTask(title, description, date, status) {
    db.ref("tasks/" + uid).push({
        id: db.ref("tasks/" + uid).push().key,
        description: description,
        title: title,
        date: date,
        status: status
    });
    alert("Task added");
    document.getElementById("title").value = "";
    document.getElementById("description").value = "";
    closeModal(addModal);
    location.reload();
}

function editTask(taskID, title, description, date, status) {
    db.ref("tasks/" + uid + "/" + taskID).update({ 
        description: description, 
        title: title,
        date: date,
        status: status
    });
    alert("Task edited");
    document.getElementById("editTitle").value = "";
    document.getElementById("editDescription").value = "";
    closeModal(editModal);
    location.reload();
}

function removeTask(taskID) {
    db.ref("tasks/" + uid + "/" + taskID).remove();
    alert("Task deleted");
    closeModal(editModal);
    location.reload();
}

function getCompletedTasksForWeek() {
    var today = new Date();
    var startOfWeek = today.getDate() - today.getDay();
    var endOfWeek = startOfWeek +  6;
    var weekStart = new Date(today.setDate(startOfWeek));
    var weekEnd = new Date(today.setDate(endOfWeek));

    db.ref("tasks/" + uid).orderByChild('status').equalTo('Completed').once('value', function(snapshot) {
        var completedTasks = snapshot.val();
        var completedThisWeek =  0;

        for (var taskId in completedTasks) {
            var task = completedTasks[taskId];
            var taskDate = new Date(task.date);
            if (taskDate >= weekStart && taskDate <= weekEnd) {
                completedThisWeek++;
            }
        }

        document.getElementById("completedTasksCount").textContent = completedThisWeek;
    });
}

var taskTitle;
var taskDescription;
var taskDate;
var taskStatus;

var taskID = [];
var count = 0;
var currTaskID = 0;
function displayTasks() {
    var taskList = document.getElementById("taskList");
    var tapTimer;
    const dbRef = firebase.database().ref("tasks/" + uid);
    dbRef.on('value', (snapshot) => {
        snapshot.forEach((childSnapshot) => {
          const childKey = childSnapshot.key;
          taskID[count] = childKey;
          count++;
        });
    }, { onlyOnce: true });
    db.ref("tasks/" + uid).on("child_added", function(snapshot) {
        var task = snapshot.val();
        var taskItem = document.createElement("li");
        taskItem.className = "task-item";
        taskItem.innerHTML = `
            <div class="task-title">${task.title}</div>
            <div class="task-date">${task.date}    ${task.status}</div>
        `;
        taskItem.setAttribute("data-task-id", snapshot.key);

        taskItem.addEventListener("click", function() {
            var selectedItems = taskList.getElementsByClassName("selected");
            while (selectedItems[0]) {
                selectedItems[0].classList.remove("selected");
            }
            this.classList.add("selected");
            taskTitle = task.title;
            taskDescription = task.description;
            taskDate = task.date;
            taskStatus = task.status;
            currTaskID = this.getAttribute("data-task-id");
        });

        taskItem.addEventListener("dblclick", function() {
            onTaskDoubleClick(task.title, task.description, task.date, task.status);
        });
        function handleDoubleTap(event) {
            if (tapTimer) {
                clearTimeout(tapTimer);
                tapTimer = null;
                onTaskDoubleClick(task.title, task.description);
            } else {
                tapTimer = setTimeout(function() {
                    tapTimer = null;
                },  300);
                target = event.target;
            }
        }
        taskItem.addEventListener("touchend", handleDoubleTap);

        taskList.appendChild(taskItem);
    });
}

document.getElementById("addTaskForm").addEventListener("submit", function(e) {
    e.preventDefault();
    var title = document.getElementById("title").value;
    var description = document.getElementById("description").value;
    var date = document.getElementById("datePicker").value;
    var status = document.getElementById("status").value;

    if (validateForm(title)) {
        if (validateForm(description)) {
            if (validateForm(date)) {
                if (validateForm(status)) {
                    try {
                        addTask(title, description, date, status);
                    } catch(err) {
                        alert("An unexpected error happened. Please try again.");
                    }
                    return;
                }
            }
        }
    }
});

document.getElementById("editTaskForm").addEventListener("submit", function(e) {
    e.preventDefault();
    var title = document.getElementById("editTitle").value;
    var description = document.getElementById("editDescription").value;
    var date = document.getElementById("editDatePicker").value;
    var status = document.getElementById("editStatus").value;
    
    if (validateForm(title)) {
        if (validateForm(description)) {
            if (validateForm(date)) {
                if (validateForm(status)) {
                    try {
                        editTask(currTaskID, title, description, date, status);
                    } catch(err) {
                        alert("An unexpected error happened. Please try again.");
                    }
                    return;
                }
            }
        }
    }
});

document.getElementById("removeTaskBtn").onclick = function() {
    if (currTaskID != 0) {
        try {
            let isExecuted = confirm("Do you want to delete this task?");
            console.log(isExecuted)
            if (isExecuted)          
                removeTask(currTaskID);
        } catch(err) {
            alert("An unexpected error happened. Please try again.");
        }
    } else {
        alert("Please select a task first.")
    }
}

function titleCounter(field, field2, maxlimit) {
    var countfield = document.getElementById(field2);
    if ( field.value.length > maxlimit ) {
        field.value = field.value.substring( 0, maxlimit );
        return false;
    } else {
        countfield.value = maxlimit - field.value.length;
    }
}

function descCounter(field, field2, maxlimit) {
    var countfield = document.getElementById(field2);
    if ( field.value.length > maxlimit ) {
        field.value = field.value.substring( 0, maxlimit );
        return false;
    } else {
        countfield.value = maxlimit - field.value.length;
    }
}

function editTitleCounter(field, field2, maxlimit) {
    var countfield = document.getElementById(field2);
    if ( field.value.length > maxlimit ) {
        field.value = field.value.substring( 0, maxlimit );
        return false;
    } else {
        countfield.value = maxlimit - field.value.length;
    }
}

function editDescCounter(field, field2, maxlimit) {
    var countfield = document.getElementById(field2);
    if ( field.value.length > maxlimit ) {
        field.value = field.value.substring( 0, maxlimit );
        return false;
    } else {
        countfield.value = maxlimit - field.value.length;
    }
}

var addModal = document.getElementById("addModal");
var viewModal = document.getElementById("viewModal");
var editModal = document.getElementById("editModal");

var addSpan = document.getElementsByClassName("addClose")[0];
var viewSpan = document.getElementsByClassName("viewClose")[0];
var editSpan = document.getElementsByClassName("editClose")[0];

document.getElementById("addTaskBtn").onclick = function() {
    openModal(addModal);
}

document.getElementById("editTaskBtn").onclick = function() {
    var editModal = document.getElementById("editModal");
    document.getElementById("editTitle").value = taskTitle;
    document.getElementById("editDescription").value = taskDescription;
    document.getElementById("editDatePicker").value = taskDate;
    document.getElementById("editStatus").value = taskStatus;

    if (taskTitle == undefined) {
        alert("Please select a task first.");
        return;
    }
    
    openModal(editModal);
}

function onTaskDoubleClick(title, description, date, status) {
    var viewModal = document.getElementById("viewModal");
    document.getElementById("viewTitle").value = title;
    document.getElementById("viewDescription").value = description;
    document.getElementById("viewDatePicker").value = date;
    document.getElementById("viewStatus").value = status;

    openModal(viewModal);
}

addSpan.onclick = function() {
    closeModal(addModal);
}

viewSpan.onclick = function() {
    closeModal(viewModal);
}


editSpan.onclick = function() {
    closeModal(editModal);
}

window.onclick = function(event) {
    if (event.target == addModal) {
        closeModal(addModal);
    }
    if (event.target == viewModal) {
        closeModal(viewModal);
    }
    if (event.target == editModal) {
        closeModal(editModal);
    }
}

function openModal(modal) {
    modal.style.display = "block";
}

function closeModal(modal) {
    modal.style.display = "none";
}