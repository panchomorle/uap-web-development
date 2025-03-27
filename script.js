const tasks = [
    {
        id: 1,
        text: 'Personal Work No. 1',
        completed: false
    },
    {
        id: 2,
        text: 'Visitar la tumba de menem',
        completed: false
    },
    {
        id: 3,
        text: 'Liberar al patriarcado',
        completed: false
    },
    {
        id: 4,
        text: 'Menem lo hizo?',
        completed: false
    },
]

let currentFilter = 'all'; // Filtro actual: 'all', 'done', 'undone'

function populateList() {
    const todoList = document.getElementById('todo-list');
    todoList.innerHTML = '';

    // Filtrar las tareas
    const filteredTasks = tasks.filter(task => {
        if (currentFilter === 'done') return task.completed;
        if (currentFilter === 'undone') return !task.completed;
        return true; // = all
    });

    // Renderizar las tareas filtradas
    for (let i = 0; i < filteredTasks.length; i++) {
        const task = filteredTasks[i];
        todoList.innerHTML += `
            <div class="todo-item" id="task-${task.id}">
                <div class="todo-check ${task.completed ? 'checked' : ''}" onclick="checkTask(${task.id})"></div>
                <p class="todo-text ${task.completed ? 'completed-text' : ''}">${task.text}</p>
                <button class="delete-button" onclick="deleteTask(${task.id})">X</button>
            </div>`;
    }
}

function checkTask(id) {
    const task = tasks.find(task => task.id === id);
    if (task) {
        task.completed = !task.completed;
        populateList();
    }
}

function deleteTask(id) {
    const taskIndex = tasks.findIndex(task => task.id === id);
    if (taskIndex !== -1) {
        tasks.splice(taskIndex, 1);
        populateList();
    }
}

function clearCompleted(){
    for (let i = 0; i < tasks.length; i++) {
        if (tasks[i].completed) {
            tasks.splice(i, 1);
            i--;
        }
    }
    populateList();
}

function submitForm(event) {
    event.preventDefault();
    
    const input = document.getElementById('todo-input');
    const inputValue = input.value.trim();

    if (inputValue === '') {
        alert('Por favor, escribe algo antes de enviar.');
        return;
    }

    tasks.push({
        id: tasks.length + 1,
        text: inputValue,
        completed: false
    });

    input.value = '';

    populateList();

}

function setFilter(filter) {
    currentFilter = filter; // Actualizar el filtro actual
    populateList(); // Actualizar la lista con el nuevo filtro
}

// Cargar las tareas cuando el documento está listo
document.addEventListener('DOMContentLoaded', function() {
    populateList();
});