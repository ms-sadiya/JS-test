const state = {
    tasks: JSON.parse(localStorage.getItem('tasks')) || [],
    filter: { category: 'All', priority: 'All', search: '' },
};

const saveTasks = () => localStorage.setItem('tasks', JSON.stringify(state.tasks));

const updateState = (id, updatedData) => {
    state.tasks = state.tasks.map(task => task.id === id ? { ...task, ...updatedData } : task);
    saveTasks();
    renderTasks();
};

const addTask = (title, category, dueDate, priority) => {
    state.tasks.push({ id: Date.now(), title, category, dueDate, priority, completed: false });
    saveTasks();
    renderTasks();
};

const deleteTask = id => updateState(id, { deleted: true });

const updateSearch = query => {
    state.filter.search = query.toLowerCase();
    renderTasks();
};

const renderTasks = () => {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';
    state.tasks.filter(task => {
        return (!task.deleted &&
            (state.filter.category === 'All' || task.category === state.filter.category) &&
            (state.filter.priority === 'All' || task.priority === state.filter.priority) &&
            task.title.toLowerCase().includes(state.filter.search));
    }).forEach(task => {
        taskList.innerHTML += `
            <div class="task">
                <h3>${task.title}</h3>
                <p>Category: ${task.category} | Due: ${task.dueDate} | Priority: ${task.priority}</p>
                <button onclick="updateState(${task.id}, { completed: !${task.completed} })">
                    ${task.completed ? 'Undo' : 'Complete'}
                </button>
                <button onclick="deleteTask(${task.id})">Delete</button>
            </div>`;
    });
};

document.getElementById('addTaskForm').addEventListener('submit', e => {
    e.preventDefault();
    const { title, category, dueDate, priority } = e.target;
    addTask(title.value, category.value, dueDate.value, priority.value);
    e.target.reset();
});

document.addEventListener('DOMContentLoaded', renderTasks);
