// Esperar a que el DOM esté completamente cargado antes de ejecutar el script
document.addEventListener("DOMContentLoaded", function () {
    
    // Referencias a los elementos del DOM
    const taskInput = document.getElementById("new_task"); // Input donde el usuario escribe la tarea
    const addButton = document.querySelector(".add_task_button"); // Botón para agregar nuevas tareas
    const taskList = document.querySelector(".task_list ul"); // Lista donde se mostrarán las tareas
    const clearButton = document.querySelector(".clear_button"); // Botón para eliminar tareas completadas
    const allButton = document.getElementById("allButton"); // Botón para mostrar todas las tareas
    const activeButton = document.getElementById("activeButton"); // Botón para mostrar solo tareas activas
    const completedButton = document.getElementById("completedButton"); // Botón para mostrar solo tareas completadas

    // Función para crear una nueva tarea
    function createTask(text) {
        const li = document.createElement("li"); // Crear un elemento <li> para la tarea
        li.classList.add("task"); // Agregar la clase "task" al elemento <li>

        // Crear el checkbox (ícono de completado)
        const checkmark = document.createElement("span");
        checkmark.classList.add("checkmark"); // Agregar la clase "checkmark"
        checkmark.textContent = "o"; // Representa una tarea no completada con un símbolo
        checkmark.addEventListener("click", toggleTaskCompletion); // Agregar evento para marcar tarea completada

        // Crear el texto de la tarea
        const taskText = document.createElement("span");
        taskText.classList.add("task_text"); // Agregar clase al texto de la tarea
        taskText.textContent = text; // Asignar el texto de la tarea

        // Crear el botón de eliminar tarea
        const deleteButton = document.createElement("span");
        deleteButton.classList.add("delete"); // Agregar la clase "delete"
        deleteButton.textContent = "X"; // Representa el botón de eliminación con una "X"
        deleteButton.addEventListener("click", deleteTask); // Agregar evento para eliminar tarea

        // Añadir los elementos al <li> de la tarea
        li.appendChild(checkmark);
        li.appendChild(taskText);
        li.appendChild(deleteButton);
        taskList.appendChild(li); // Agregar la tarea a la lista de tareas

        // Limpiar el input después de agregar la tarea
        taskInput.value = "";
    }

    // Función para alternar el estado de completado de una tarea
    function toggleTaskCompletion(event) {
        const task = event.target.closest("li"); // Obtener la tarea <li> a la que pertenece el checkbox
        task.classList.toggle("completed"); // Alternar la clase "completed"

        const checkmark = task.querySelector(".checkmark"); // Obtener el ícono de la tarea

        // Cambiar el símbolo del checkbox según el estado de la tarea
        if (task.classList.contains("completed")) {
            checkmark.textContent = "✔"; // Si está completada, cambiar a un check
        } else {
            checkmark.textContent = "o"; // Si no está completada, volver al círculo vacío
        }
    }

    // Función para eliminar una tarea
    function deleteTask(event) {
        const task = event.target.closest("li"); // Obtener la tarea <li> correspondiente
        task.remove(); // Eliminar la tarea de la lista
    }

    // Función para eliminar todas las tareas completadas
    function clearCompleted() {
        const completedTasks = document.querySelectorAll(".task.completed"); // Seleccionar todas las tareas completadas
        completedTasks.forEach(task => task.remove()); // Eliminar cada una de ellas
    }

    // Función para filtrar tareas (todas, activas o completadas)
    function filterTasks(filter) {
        const tasks = document.querySelectorAll(".task"); // Obtener todas las tareas

        tasks.forEach(task => {
            const isCompleted = task.classList.contains("completed"); // Verificar si la tarea está completada

            // Mostrar u ocultar las tareas según el filtro seleccionado
            if (filter === "all") {
                task.style.display = "flex"; // Mostrar todas las tareas
            } else if (filter === "active" && !isCompleted) {
                task.style.display = "flex"; // Mostrar solo tareas activas
            } else if (filter === "completed" && isCompleted) {
                task.style.display = "flex"; // Mostrar solo tareas completadas
            } else {
                task.style.display = "none"; // Ocultar las tareas que no corresponden al filtro
            }
        });
    }

    // Evento de agregar tarea cuando se hace click en el botón "Agregar"
    addButton.addEventListener("click", function () {
        const taskText = taskInput.value.trim(); // Obtener el texto del input y eliminar espacios extra
        if (taskText) { // Solo agregar si hay texto
            createTask(taskText);
        }
    });

    // Evento para agregar una tarea al presionar "Enter"
    taskInput.addEventListener("keypress", function (event) {
        if (event.key === "Enter") { // Si la tecla presionada es "Enter"
            const taskText = taskInput.value.trim(); // Obtener el texto del input
            if (taskText) { // Solo agregar si hay texto
                createTask(taskText);
            }
        }
    });

    // Evento para limpiar tareas completadas cuando se presiona el botón "Clear"
    clearButton.addEventListener("click", clearCompleted);

    // Eventos para filtrar tareas según el estado
    allButton.addEventListener("click", function () {
        filterTasks("all"); // Mostrar todas las tareas
    });

    activeButton.addEventListener("click", function () {
        filterTasks("active"); // Mostrar solo tareas activas
    });

    completedButton.addEventListener("click", function () {
        filterTasks("completed"); // Mostrar solo tareas completadas
    });

    // Añadir eventos a las tareas predefinidas (si las hay en el HTML al cargar la página)
    const predefinedTasks = document.querySelectorAll(".task"); // Seleccionar tareas existentes
    predefinedTasks.forEach(task => {
        const checkmark = task.querySelector(".checkmark");
        checkmark.addEventListener("click", toggleTaskCompletion); // Agregar evento para marcar tarea completada

        const deleteButton = task.querySelector(".delete");
        deleteButton.addEventListener("click", deleteTask); // Agregar evento para eliminar tarea
    });
});
