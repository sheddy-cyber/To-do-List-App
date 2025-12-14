const taskInput = document.getElementById('taskInput');         //get the input element and store it as taskInput
const addBtn = document.getElementById('addBtn');               //get the addBtn element and store as addBtn
const taskList = document.getElementById('taskList');           //get the list element and store as taskList

document.addEventListener("DOMContentLoaded", loadTasks);       //after page loads, run the loadTasks function
addBtn.addEventListener("click", addTask);                      //if the addBtn is clicked, run the addTask functiom

//Pressing Enter key also adds task
taskInput.addEventListener("keypress", function (e) {           //listen for keypress on the input element, and run the following function
    if (e.key === "Enter") {                                    //if the pressed key is the Enter key,...
        addTask();                                              //run the addTask function
    }
});

// Safely get all tasks from localStorage
function getTasks() {                                           //define function getTasks()
    try {                                                       //check for error in the following code
        return JSON.parse(localStorage.getItem("tasks")) || []; // get tasks from localStorage and return it as a JavaScript object or an empty if there is no task
    } catch (err) {                                             //if there is an error,...
        console.error("Error parsing tasks:", err);             //print error message
        localStorage.removeItem("tasks");                       //remove the corrupted tasks from localStorage
        return [];                                              // return an empty array
    }
}

// Save all tasks to localStorage
function saveTasks(tasks) {                                     //define function saveTasks which takes tasks as an argument
    localStorage.setItem("tasks", JSON.stringify(tasks));       //save said tasks as a string into localStorage under the key "tasks"
}

// Add a new task
function addTask() {                                            //define function addTask
    const text = taskInput.value.trim();                        //get the value of the input element, trim it and store as text
    if (!text) return alert("Please enter a task!");            //if input element is empty, return alert message

    let tasks = getTasks();                                     //store getTasks function as task

    // prevent duplicates (case-insensitive)
    if (tasks.some(t => t.text.toLowerCase() === text.toLowerCase())) { //if the entered text is the same as some text that already exists,
        alert("That task already exists!");                     //show alert warning
        return;                                                 //end the addTask function
    }

    const newTask = {                                           //define object newTask
        id: Date.now().toString(),                              //give it an id property of the current date,
        text,                                                   //a text property of the input text defined earlier
        completed: false                                        //and a completed property of false
    };

    tasks.push(newTask);                                        //add the newTask to the tasks array
    saveTasks(tasks);                                           //save task to local storage
    renderTask(newTask);                                        //render the task

    taskInput.value = "";                                       //empty the input box
}

// Render one task on the screen
function renderTask(task) {                                     //define the renderTask function
    const li = document.createElement("li");                    //create a new <li> element and store it as li
    li.dataset.id = task.id;                                    //assigns a data-id attribute to the <li> with a value of the task id
    if (task.completed) li.classList.add("completed");          //if the task is completed, give it a class of "completed" (which strikes it through)

    const span = document.createElement("span");                //create <span> element
    span.textContent = task.text;                               //let the task text live inside in the span element

    const actions = document.createElement("div");              //create a <div> element and store as actions
    actions.classList.add("actions");                           //give it a class of "actions"

    const completeBtn = document.createElement("button");       // create a button element and store as completeBtn
    completeBtn.textContent = task.completed ? "Undo" : "Done"; //give it a text content of "Undo" or "Done" depending on if the task is completed
    completeBtn.classList.add("complete");                      //give it a class of "complete"

    const deleteBtn = document.createElement("button");         //create a button element and store as deleteBtn
    deleteBtn.textContent = "X";                                //let its text content be "X"
    deleteBtn.classList.add("delete");                          //give it a class of "delete"

    actions.appendChild(completeBtn);                           //append the completeBtn as a child of the actions element
    actions.appendChild(deleteBtn);                             //append the deleteBtn as a child of the actions element

    li.appendChild(span);                                       //append the <span> element as a child of <li>
    li.appendChild(actions);                                    //append the actions element as a child of <li>

    taskList.appendChild(li);                                   //append the <li> element as a child of <ul> element
}

// Load and render all tasks on page load
function loadTasks() {                                          //define loadTasks function
    // Load tasks and migrate any that lack an id
    let tasks = getTasks();                                     //
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
        li.classList.add("removing"); // trigger fade-out
        setTimeout(() => {
            tasks = tasks.filter(t => t.id !== id);
            saveTasks(tasks);
            loadTasks();
        }, 400); // matches CSS transition time
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