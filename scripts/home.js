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

function signOut() {
    try {
        let signOut = confirm("Are you sure you want to log out?");
        console.log(signOut);
        if (signOut) {          
            auth.signOut();
            alert("Logged out successfully from the system.");
        }
    } catch(err) {
        alert("An unexpected error happened. Please try again.");
    }
}

var uid;
var currentUser;
firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        uid = user.uid;
        var showUID = document.getElementById("showUID");
        showUID.textContent = uid;
        const username = firebase.database().ref("users/" + uid);
        username.on('value', function(snapshot) {
            currentUser = snapshot.val().username;
            console.log(currentUser);
            var showUsername = document.getElementById("showUsername");
            showUsername.textContent = currentUser;
        });
        

        displayTasks();
        //getCompletedTasksForWeek();

        
    } else (
        window.location.href = "login.html"
    )
});

function copyUID(e) {
    navigator.clipboard.writeText(e.textContent);
    alert("UID Copied Successfully!")
}

function validateForm(field) {
    if (field < 1) {
        alert("Form must not be empty.")
        return false;
    } else
        return true;
}

function addTask(title, description, date, status, collab) {
    var collaboratorsArray = collab.split(/[\s,]+/);

    db.ref("tasks/all").push({
        id: db.ref("tasks/" + uid).push().key,
        ownerName: currentUser,
        ownerId: uid,
        description: description,
        title: title,
        date: date,
        status: status,
        collaborators: collaboratorsArray
    });
    alert("Task added");
    document.getElementById("title").value = "";
    document.getElementById("description").value = "";
    document.getElementById("collaborator").value = "";
    closeModal(addModal);
    location.reload();
}

function editTask(taskID, title, description, date, status, collab) {
    var collaboratorsArray = collab.split(/[\s,]+/);
    db.ref("tasks/all/" + taskID).update({
        description: description,
        title: title,
        date: date,
        status: status,
        collaborators: collaboratorsArray
    });
    alert("Task edited");
    document.getElementById("editTitle").value = "";
    document.getElementById("editDescription").value = "";
    document.getElementById("editCollaborator").value = "";
    closeModal(addModal);
    location.reload();
}

function deleteTask(taskID) {
    db.ref("tasks/all/" + taskID).remove();
    alert("Task deleted");
    closeModal(editModal);
    location.reload();
}

/*
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

        // document.getElementById("completedTasksCount").textContent = completedThisWeek;
    });
}
*/

var taskTitle;
var taskDescription;
var taskDate;
var taskStatus;
var taskCollaborators;

var taskID = [];
var count = 0;
var currTaskID = 0;
var isUserAdmin = false;
function displayTasks() {
    var todo = document.getElementById("toDo");
    var inprogress = document.getElementById("inProgress");
    var completed = document.getElementById("completed");
    var cancelled = document.getElementById("cancelled");
    var pastdue = document.getElementById("pastDue");
    
    todo.innerHTML = '';
    inprogress.innerHTML = '';
    completed.innerHTML = '';
    cancelled.innerHTML = '';
    pastdue.innerHTML = '';

    var tapTimer;
    const dbRef = firebase.database().ref("tasks/all");
    dbRef.on('value', (snapshot) => {
        snapshot.forEach((childSnapshot) => {
          const childKey = childSnapshot.key;
          taskID[count] = childKey;
          count++;
        });
    }, { onlyOnce: true });

    const users = firebase.database().ref("users/" + uid);
    users.on('value', function(snapshot) {
        isUserAdmin = snapshot.val().isAdmin;
    });
    
    db.ref("tasks/all").on("child_added", function(snapshot) {
        var task = snapshot.val();
        setTimeout(() => {
            if (Array.isArray(task.collaborators) && task.collaborators.includes(uid) || task.ownerId == uid || isUserAdmin) {
                var taskItem = document.createElement("li");
                taskItem.className = "task-item";
                taskItem.innerHTML = `
                    <div class="task-title">${task.title}</div>
                    <div class="task-date">${task.date} ${task.status}</div>
                `;
                taskItem.setAttribute("draggable", "true");
                taskItem.setAttribute("class", "lists");
                taskItem.setAttribute("data-task-id", snapshot.key);

                taskItem.addEventListener("click", function() {
                    var taskLists = [
                        document.getElementById("toDo"),
                        document.getElementById("inProgress"),
                        document.getElementById("completed"),
                        document.getElementById("cancelled"),
                        document.getElementById("pastDue")
                    ];
            
                    taskLists.forEach(function(taskList) {
                        var selectedItems = taskList.getElementsByClassName("selected");
                        while (selectedItems[0]) {
                            selectedItems[0].classList.remove("selected");
                        }
                    });
                
                    this.classList.add("selected");
                
                    taskTitle = task.title;
                    taskDescription = task.description;
                    taskDate = task.date;
                    taskStatus = task.status;
                    taskCollaborators = task.collaborators;
                    currTaskID = this.getAttribute("data-task-id");
                });

                taskItem.addEventListener("dblclick", function() {
                    onTaskDoubleClick(task.title, task.description, task.date, task.status, task.collaborators);
                });

                function handleDoubleTap(event) {
                    if (tapTimer) {
                        clearTimeout(tapTimer);
                        tapTimer = null;
                        onTaskDoubleClick(task.title, task.description, task.date, task.status, task.collaborators);
                    } else {
                        tapTimer = setTimeout(function() {
                            tapTimer = null;
                        },  300);
                        target = event.target;
                    }
                }
                taskItem.addEventListener("touchend", handleDoubleTap);
                
                switch (task.status) {
                    case "To-Do":
                        todo.appendChild(taskItem);
                        break;
                    case "In Progress":
                        inprogress.appendChild(taskItem);
                        break;
                    case "Completed":
                        completed.appendChild(taskItem);
                        break;
                    case "Cancelled":
                        cancelled.appendChild(taskItem);
                        break;
                    case "Past Due":
                        pastdue.appendChild(taskItem);
                        break;
                    default:
                        console.log();
                }

                var taskDate = new Date(task.date);
                var currentDate = new Date();
                if (taskDate < currentDate && task.status !== "Past Due" && task.status !== "Completed" &&
                    (task.collaborators.includes(uid) || task.ownerId == uid || isUserAdmin)) {
                    db.ref("tasks/all/" + snapshot.key).update({
                        status: "Past Due"
                    });
                }
            }
        }, 1000);
    });
}

function getTaskOwnerId(taskID) {
    return new Promise((resolve, reject) => {
        const taskRef = db.ref("tasks/all/" + taskID);
        taskRef.once('value', function(snapshot) {
            const taskData = snapshot.val();
            if (taskData && taskData.ownerId) {
                resolve(taskData.ownerId);
            } else {
                reject(new Error("Task not found or ownerId is missing."));
            }
        }, function(error) {
            reject(error);
        });
    });
}

function getTaskOwnerName(taskID) {
    return new Promise((resolve, reject) => {
        const taskRef = db.ref("tasks/all/" + taskID);
        taskRef.once('value', function(snapshot) {
            const taskData = snapshot.val();
            if (taskData && taskData.ownerName) {
                resolve(taskData.ownerName);
            } else {
                reject(new Error("Task not found or ownerName is missing."));
            }
        }, function(error) {
            reject(error);
        });
    });
}

document.getElementById("addTaskForm").addEventListener("submit", function(e) {
    e.preventDefault();
    var title = document.getElementById("title").value;
    var description = document.getElementById("description").value;
    var date = document.getElementById("datePicker").value;
    var status = document.getElementById("status").value;
    var collab = document.getElementById("collaborator").value;

    if (validateForm(title)) {
        if (validateForm(description)) {
            if (validateForm(date)) {
                if (validateForm(status)) {
                    try {
                        addTask(title, description, date, status, collab);
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
    var collab = document.getElementById("editCollaborator").value;
    
    if (validateForm(title)) {
        if (validateForm(description)) {
            if (validateForm(date)) {
                if (validateForm(status)) {
                    try {
                        editTask(currTaskID, title, description, date, status, collab);
                    } catch(err) {
                        alert("An unexpected error happened. Please try again.");
                    }
                    return;
                }
            }
        }
    }
});

document.getElementById("deleteTaskBtn").onclick = function() {
    getTaskOwnerId(currTaskID).then(ownerId => {
        if (uid === ownerId || isUserAdmin) {
            if (currTaskID != 0) {
                try {
                    let isExecuted = confirm("Do you want to delete this task?");
                    if (isExecuted)          
                        deleteTask(currTaskID);
                } catch(err) {
                    alert("An unexpected error happened. Please try again.");
                }
            } else {
                alert("Please select a task first.");
            }
        } else {
            alert("Only the task's owner has the ability to delete this.");
            return false;
        }
    }).catch(error => {
        console.error("Error fetching task ownerId:", error);
    });
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
    if ( field.value.length > maxlimit ) {
        field.value = field.value.substring( 0, maxlimit );
        return false;
    } else {
        field2.value = maxlimit - field.value.length;
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
    var eTitle = document.getElementById("editTitle");
    var eDescription = document.getElementById("editDescription");

    document.getElementById("editTitle").value = taskTitle;
    document.getElementById("editDescription").value = taskDescription;
    document.getElementById("editDatePicker").value = taskDate;
    document.getElementById("editStatus").value = taskStatus;
    document.getElementById("editCollaborator").value = taskCollaborators;

    if (taskTitle == undefined) {
        alert("Please select a task first.");
        return;
    }

    getTaskOwnerId(currTaskID).then(ownerId => {
        if (ownerId === uid || isUserAdmin) {
            document.getElementById("editCollaborator").disabled = false;
        } else {
            document.getElementById("editCollaborator").disabled = true;
        }
    }).catch(error => {
        console.error("Error fetching task ownerId:", error);
    });

    editTitleCounter(eTitle, 'editTitleCount', 25);
    editDescCounter(eDescription, 'editDescriptionCount', 250);
    
    openModal(editModal);
}

function onTaskDoubleClick(title, description, date, status, collab) {
    var viewModal = document.getElementById("viewModal");
    document.getElementById("viewTitle").value = title;
    document.getElementById("viewDescription").value = description;
    document.getElementById("viewDatePicker").value = date;
    document.getElementById("viewStatus").value = status;
    document.getElementById("viewCollaborator").value = collab;

    getTaskOwnerName(currTaskID).then(ownerName => {
        document.getElementById("viewOwner").textContent = ownerName;
    }).catch(error => {
        console.error("Error fetching task ownerId:", error);
    });

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

// Drag and drop
var listsClass = document.getElementsByClassName("lists");
var todoContainer = document.getElementById("ltodo");
var inProgressContainer = document.getElementById("linprogress");
var completedContainer = document.getElementById("lcompleted");
var cancelledContainer = document.getElementById("lcancelled");
var pastDueContainer = document.getElementById("lpastdue");
selected = null;

todoContainer.addEventListener("dragover", function(e) {
    e.preventDefault();
});
todoContainer.addEventListener("drop", function(e) {
    var selected = document.getElementsByClassName("selected");
    if (selected[0]) {
        const taskId = selected[0].getAttribute("data-task-id");
        if (taskId) {
            updateTaskStatus(taskId, "To-Do");
            displayTasks();
        } else {
            console.error("Task ID not found on the selected element.");
        }
    } else {
        console.error("No task selected.");
    }
    selected = null;
});

inProgressContainer.addEventListener("dragover", function(e) {
    e.preventDefault();
});
inProgressContainer.addEventListener("drop", function(e) {
    var selected = document.getElementsByClassName("selected");
    if (selected[0]) {
        const taskId = selected[0].getAttribute("data-task-id");
        if (taskId) {
            updateTaskStatus(taskId, "In Progress");
            displayTasks();
        } else {
            console.error("Task ID not found on the selected element.");
        }
    } else {
        console.error("No task selected.");
    }
    selected = null;
});

completedContainer.addEventListener("dragover", function(e) {
    e.preventDefault();
});
completedContainer.addEventListener("drop", function(e) {
    var selected = document.getElementsByClassName("selected");
    if (selected[0]) {
        const taskId = selected[0].getAttribute("data-task-id");
        if (taskId) {
            updateTaskStatus(taskId, "Completed");
            displayTasks();
        } else {
            console.error("Task ID not found on the selected element.");
        }
    } else {
        console.error("No task selected.");
    }
    selected = null;
});

cancelledContainer.addEventListener("dragover", function(e) {
    e.preventDefault();
});
cancelledContainer.addEventListener("drop", function(e) {
    var selected = document.getElementsByClassName("selected");
    if (selected[0]) {
        const taskId = selected[0].getAttribute("data-task-id");
        if (taskId) {
            updateTaskStatus(taskId, "Cancelled");
            displayTasks();
        } else {
            console.error("Task ID not found on the selected element.");
        }
    } else {
        console.error("No task selected.");
    }
    selected = null;
});

pastDueContainer.addEventListener("dragover", function(e) {
    e.preventDefault();
});
pastDueContainer.addEventListener("drop", function(e) {
    var selected = document.getElementsByClassName("selected");
    if (selected[0]) {
        const taskId = selected[0].getAttribute("data-task-id");
        if (taskId) {
            updateTaskStatus(taskId, "Past Due");
            displayTasks();
        } else {
            console.error("Task ID not found on the selected element.");
        }
    } else {
        console.error("No task selected.");
    }
    selected = null;
});

for (var list of listsClass) {
    list.addEventListener("dragstart", function(e) {
        selected = e.target;
    });
}

function updateTaskStatus(taskId, newStatus) {
    if (!newStatus) {
        console.error("Invalid status");
        return;
    }

    console.log("Updating task:", taskId, "to status:", newStatus);

    db.ref("tasks/all/" + taskId).update({
        status: newStatus
    }).then(() => {
        console.log("Task status updated successfully");
    }).catch((error) => {
        console.error("Error updating task status:", error);
    });
}