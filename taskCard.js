const taskDisplayWindow  = document.getElementById('taskDisplayWindow');

export function createTaskCard(task){
    const taskCard = document.createElement('div');
    taskCard.classList.add('task-card');
    taskCard.innerHTML = `
        <h3>${task.taskName}</h3>
        <p>${task.priority}</p>
        <p>Due Date: ${task.dueDate}</p>
        <p>Tags: ${task.tags}</p>
    `;

    taskDisplayWindow.appendChild(taskCard);

    return taskCard;
}

export function renderTaskItems(sortType, updown, sortvalue){
    taskDisplayWindow.innerHTML = '';
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    if(sortType === 'date'){
        tasks.sort((a, b) => {
            const dateA = new Date(a.dueDate);
            const dateB = new Date(b.dueDate);
            return updown === 'up' ? dateA - dateB : dateB - dateA;
        }
        );
    } else if(sortType === 'priority'){
        const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
        tasks.sort((a, b) => {
            return updown === 'up' ? priorityOrder[a.priority] - priorityOrder[b.priority] : priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        );
    } else if(sortType === 'alphabetical'){
        tasks.sort((a, b) => {
            const titleA = a.title.toLowerCase();
            const titleB = b.title.toLowerCase();
            return updown === 'up' ? titleA.localeCompare(titleB) : titleB.localeCompare(titleA);
        }
        );
    } else if(sortType === 'list'){
        let newTasks = tasks.filter((tasks) => tasks.list === sortvalue);
        tasks = newTasks;
    } 

    tasks.forEach(task => {
        createTaskCard(task);
    });

}