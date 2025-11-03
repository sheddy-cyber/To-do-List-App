const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const taskList = document.getElementById('taskList');

document.addEventListener("DOMContentLoaded", loadTasks);
addBtn.addEventListener("click", addTask);

//Pressing Enter key also adds task
taskInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
        addTask();
    }
});

// Safely get all tasks from localStorage
function getTasks() {
    try {
        return JSON.parse(localStorage.getItem("tasks")) || [];
    } catch (err) {
        console.error("Error parsing tasks:", err);
        localStorage.removeItem("tasks");
        return [];
    }
}

// Save all tasks to localStorage
function saveTasks(tasks) {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Add a new task
function addTask() {
    const text = taskInput.value.trim();
    if (!text) return alert("Please enter a task!");

    let tasks = getTasks();

    // prevent duplicates (case-insensitive)
    if (tasks.some(t => t.text.toLowerCase() === text.toLowerCase())) {
        alert("That task already exists!");
        return;
    }

    const newTask = {
        id: Date.now().toString(),
        text,
        completed: false
    };

    tasks.push(newTask);
    saveTasks(tasks);
    renderTask(newTask);

    taskInput.value = "";
}

// Render one task on the screen
function renderTask(task) {
    const li = document.createElement("li");
    li.dataset.id = task.id;
    if (task.completed) li.classList.add("completed");

    const span = document.createElement("span");
    span.textContent = task.text;

    const actions = document.createElement("div");
    actions.classList.add("actions");

    const completeBtn = document.createElement("button");
    completeBtn.textContent = task.completed ? "Undo" : "Done";
    completeBtn.classList.add("complete");

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "X";
    deleteBtn.classList.add("delete");

    actions.appendChild(completeBtn);
    actions.appendChild(deleteBtn);

    li.appendChild(span);
    li.appendChild(actions);

    taskList.appendChild(li);
}

// Load and render all tasks on page load
function loadTasks() {
    // Load tasks and migrate any that lack an id
    let tasks = getTasks();
    let migrated = false;

    tasks = tasks.map(t => {
        // If no id exists, create one (preserve existing properties)
        if (!t.id) {
            t.id = Date.now().toString() + Math.floor(Math.random() * 10000).toString();
            migrated = true;
        }
        // Ensure completed is boolean (defensive)
        t.completed = !!t.completed;
        return t;
    });

    if (migrated) saveTasks(tasks); // persist migration

    taskList.innerHTML = "";
    tasks.forEach(renderTask);
}

// Event delegation: handle clicks for delete and complete
taskList.addEventListener("click", function (e) {
    // Find nearest li (in case the click target is a child)
    const li = e.target.closest("li");
    if (!li) return;

    const id = li.dataset.id;
    let tasks = getTasks();

    if (e.target.classList.contains("delete")) {
        // Delete by id
        tasks = tasks.filter(t => t.id !== id);
        saveTasks(tasks);
        loadTasks();
        return;
    }

    if (e.target.classList.contains("complete")) {
        tasks = tasks.map(t => {
            if (t.id === id) t.completed = !t.completed;
            return t;
        });
        saveTasks(tasks);
        loadTasks();
        return;
    }

});
