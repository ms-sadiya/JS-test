// Select necessary elements
let inputTask = document.getElementById("inputTask");
let addButton = document.querySelector(".btn");
let toDoColumn = document.getElementById("to-do");
let columns = document.querySelectorAll(".column");

// Load saved tasks when the page loads
document.addEventListener("DOMContentLoaded", loadTasks);

// Add a new task when the button is clicked
addButton.addEventListener("click", function () {
    let taskText = inputTask.value.trim();
    if (taskText === "") {
        alert("Please enter a task!");
        return;
    }

    let taskId = "task-" + Date.now(); // Unique ID
    let newTask = createTaskElement(taskText, taskId);
    toDoColumn.appendChild(newTask);

    inputTask.value = ""; // Clear input field
    saveTasks(); // Save the updated tasks
});

// Create a task element
function createTaskElement(text, id) {
    let task = document.createElement("div");
    task.classList.add("task");
    task.id = id;
    task.draggable = true;
    task.addEventListener("dragstart", dragStart);

    task.innerHTML = `
        <span class="task-text">${text}</span>
        <input type="text" class="edit-input" style="display: none;">
        <div class="actions">
            <button class="edit"><i class="fa-solid fa-pen-to-square"></i></button>
            <button class="delete"><i class="fa-solid fa-trash"></i></button>
        </div>
    `;

    let taskTextSpan = task.querySelector(".task-text");
    let editInput = task.querySelector(".edit-input");
    let editButton = task.querySelector(".edit");
    let deleteButton = task.querySelector(".delete");

    // Delete task
    deleteButton.addEventListener("click", function () {
        task.remove();
        saveTasks();
    });

    // Edit task
    editButton.addEventListener("click", function () {
        if (editInput.style.display === "none") {
            editInput.style.display = "inline-block";
            editInput.value = taskTextSpan.textContent;
            taskTextSpan.style.display = "none";
            editInput.focus();
        } else {
            taskTextSpan.textContent = editInput.value.trim() || taskTextSpan.textContent;
            editInput.style.display = "none";
            taskTextSpan.style.display = "inline-block";
            saveTasks();
        }
    });

    //Save edits when Enter is pressed
    editInput.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            taskTextSpan.textContent = editInput.value.trim() || taskTextSpan.textContent;
            editInput.style.display = "none";
            taskTextSpan.style.display = "inline-block";
            saveTasks();
        }
    });

    return task;
}

// Drag & Drop Functions
function allowDrop(e) {
    e.preventDefault();
}

function dragStart(e) {
    e.dataTransfer.setData("text/plain", e.target.id);
}

function drop(e) {
    e.preventDefault();
    let taskId = e.dataTransfer.getData("text/plain");
    let task = document.getElementById(taskId);

    if (task && e.target.classList.contains("column")) {
        e.target.appendChild(task);
        saveTasks();
    }
}

// Attach drag & drop event listeners to columns
columns.forEach(column => {
    column.addEventListener("dragover", allowDrop);
    column.addEventListener("drop", drop);
});

// Save tasks to localStorage
function saveTasks() {
    let boardState = {};

    columns.forEach(column => {
        let tasks = [];
        column.querySelectorAll(".task").forEach(task => {
            tasks.push({
                id: task.id,
                text: task.querySelector(".task-text").textContent
            });
        });

        boardState[column.id] = tasks;
    });

    localStorage.setItem("kanbanBoard", JSON.stringify(boardState));
}

// Load tasks from localStorage
function loadTasks() {
    let savedTasks = JSON.parse(localStorage.getItem("kanbanBoard")) || {};

    for (let columnId in savedTasks) {
        let column = document.getElementById(columnId);
        savedTasks[columnId].forEach(taskData => {
            let task = createTaskElement(taskData.text, taskData.id);
            column.appendChild(task);
        });
    }
}
