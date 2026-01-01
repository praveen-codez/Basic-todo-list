

/* ========== DOM ELEMENT REFERENCES ========== */
const DOM = {
  taskInput: document.getElementById("taskInput"),
  dock: document.getElementById("dock"),
  addTaskBtn: document.getElementById("addTaskBtn"),
  prioritySelector: document.getElementById("prioritySelector"),
  priorityDropdown: document.getElementById("priorityDropdown"),
  calendarBtn: document.getElementById("calendarBtn"),
  calendarInput: document.getElementById("calendarInput"),
  listBtn: document.getElementById("ListBtn"),
  listDropdown: document.getElementById("listDropdown"),
  listNameDisplay: document.getElementById("listNameDisplay"),
  listOptions: document.getElementById("listOptions"),
  newListInput: document.getElementById("newListInput"),
  tagBtn: document.getElementById("tagBtn"),
  tagElement: document.getElementById("tagElement"),
  tagInput: document.getElementById("tagInput"),
  tagAddBtn: document.getElementById("tagAddBtn"),
  tagDisplay: document.getElementById("tagDisplay"),
  listSelect: document.getElementById("listSelect"),
  navItems: document.querySelectorAll(".navbar > ul > li"),
  taskToolbar: document.querySelector(".task-toolbar"),
};

/* ========== STATE MANAGEMENT ========== */
const state = {
  currentPriority: "medium",
  selectedDate: null,
  selectedList: null,
  selectedTags: [],
  activeDockItem: null,
  flatpickrInstance: null,
};

/* ========== CONSTANTS ========== */
const DEFAULTS = {
  lists: ["None", "Personal", "Hobbies", "Work"],
  defaultList: "None",
  maxTags: 2,
};

const CLASSES = {
  visible: "visible",
  dockActive: "dock-active",
  active: "active",
  listItem: "list-item",
  newListBtn: "newList-btn",
  tagItem: "tag-item",
  tagRemoveBtn: "tag-remove-btn",
  priorityOption: "priority-option",
};

const SELECTORS = {
  flatpickrCalendar: ".flatpickr-calendar",
  svgUse: "svg use",
  priorityFlag: "#flag-",
};

/* ========== BEHAVIOR IMPLEMENTATION ========== */

function showDock() {
  if (!DOM.dock.classList.contains(CLASSES.visible)) {
    DOM.dock.classList.add(CLASSES.visible);
    DOM.addTaskBtn.classList.add(CLASSES.visible);
    DOM.taskInput.style.borderBottomLeftRadius = "0px";
    DOM.taskInput.style.borderBottomRightRadius = "0px";
  }
}

function closeAllDockItems() {
  DOM.priorityDropdown.classList.remove(CLASSES.visible);
  DOM.prioritySelector.classList.remove(CLASSES.dockActive);
  DOM.tagElement.classList.remove(CLASSES.visible);
  DOM.tagBtn.classList.remove(CLASSES.dockActive);
  DOM.calendarBtn.classList.remove(CLASSES.dockActive);
  DOM.listBtn.classList.remove(CLASSES.dockActive);
  DOM.listDropdown.classList.remove(CLASSES.visible);
  DOM.listOptions.classList.remove(CLASSES.visible);
  DOM.newListInput.style.display = "none";
  state.activeDockItem = null;
}

function hideDock() {
  DOM.dock.classList.remove(CLASSES.visible);
  closeAllDockItems();
  DOM.taskInput.style.borderBottomLeftRadius = "12px";
  DOM.taskInput.style.borderBottomRightRadius = "12px";
}

function setActiveDockItem(name, element) {
  closeAllDockItems();
  state.activeDockItem = name;
  element.classList.add(CLASSES.dockActive);
}

/* --- Lists Initialization & Rendering --- */
function initializeDefaultLists() {
  if (localStorage.getItem("listInitialized") !== "true") {
    localStorage.setItem("lists", JSON.stringify(DEFAULTS.lists));
    localStorage.setItem("listInitialized", "true");
    state.selectedList = DEFAULTS.defaultList;
    DOM.listNameDisplay.innerHTML = `<span>${state.selectedList}</span> <span>&#10549;</span>`;
  } else if (!state.selectedList) {
    const lists = JSON.parse(localStorage.getItem("lists") || "[]");
    if (lists.length > 0) {
      state.selectedList = lists[0];
      DOM.listNameDisplay.innerHTML = `<span>${state.selectedList}</span> <span>&#10549;</span>`;
    }
  }
}

function renderLists() {
  DOM.listOptions.innerHTML = "";
  const lists = JSON.parse(localStorage.getItem("lists") || "[]");
  lists.forEach((item) => {
    const div = document.createElement("div");
    div.className = CLASSES.listItem;
    div.textContent = item;
    DOM.listOptions.appendChild(div);
    div.addEventListener("click", (e) => {
      e.stopPropagation();
      state.selectedList = item;
      DOM.listNameDisplay.innerHTML = `<span>${item}</span> <span>&#10549;</span>`;
      DOM.listDropdown.classList.remove(CLASSES.visible);
      DOM.listOptions.classList.remove(CLASSES.visible);
      DOM.listBtn.classList.remove(CLASSES.dockActive);
      state.activeDockItem = null;
    });
  });

  const newListBtn = document.createElement("button");
  newListBtn.id = "newListBtn";
  newListBtn.className = CLASSES.newListBtn;
  newListBtn.textContent = "New List";
  DOM.listOptions.appendChild(newListBtn);
  newListBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    DOM.listDropdown.classList.remove(CLASSES.visible);
    DOM.listOptions.classList.remove(CLASSES.visible);
    DOM.newListInput.value = "";
    DOM.newListInput.style.display = "block";
    DOM.newListInput.focus();
    DOM.listBtn.classList.remove(CLASSES.dockActive);
    state.activeDockItem = null;
  });
}

initializeDefaultLists();
renderLists();

/* --- Tasks localStorage helpers --- */
function getTasks() {
  const t = localStorage.getItem("tasks");
  return t ? JSON.parse(t) : [];
}

function getCompletedTasks() {
  const c = localStorage.getItem("completedTasks");
  return c ? JSON.parse(c) : [];
}

function completeTask(taskId) {
  let tasks = getTasks();
  const taskIndex = tasks.findIndex(t => t.id === taskId);
  if (taskIndex !== -1) {
    const completedTask = tasks.splice(taskIndex, 1)[0];
    localStorage.setItem("tasks", JSON.stringify(tasks));
    const completedTasks = getCompletedTasks();
    completedTasks.push(completedTask);
    localStorage.setItem("completedTasks", JSON.stringify(completedTasks));
  }
}

function uncompleteTask(taskId) {
  let completedTasks = getCompletedTasks();
  const taskIndex = completedTasks.findIndex(t => t.id === taskId);
  if (taskIndex !== -1) {
    const task = completedTasks.splice(taskIndex, 1)[0];
    localStorage.setItem("completedTasks", JSON.stringify(completedTasks));
    const tasks = getTasks();
    tasks.push(task);
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }
}

function removeTask(taskId) {
  let tasks = getTasks();
  tasks = tasks.filter(t => t.id !== taskId);
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function addTask() {
  const name = DOM.taskInput.value.trim();
  if (!name) return false;
  const taskObj = { 
    id: Date.now(),
    taskName: name,
    priority: state.currentPriority,
    dueDate: state.selectedDate,
    tags: state.selectedTags.slice(),
    list: state.selectedList,
    completed: false,
  };
  const updated = [...getTasks(), taskObj];
  localStorage.setItem("tasks", JSON.stringify(updated));
  return true;
}

/* --- Tags --- */
function displayTags() {
  DOM.tagDisplay.innerHTML = "";
  state.selectedTags.forEach((tag) => {
    const item = document.createElement("div");
    const text = document.createElement("span");
    const remove = document.createElement("span");

    item.classList.add(CLASSES.tagItem);

    text.textContent = tag;

    remove.textContent = "✕";
    remove.classList.add(CLASSES.tagRemoveBtn);

    remove.addEventListener("click", (e) => {
      e.stopPropagation();
      removeTag(tag);
    });

    item.appendChild(text);
    item.appendChild(remove);

    DOM.tagDisplay.appendChild(item);
  });
  
  if (state.selectedTags.length > 0) {
    DOM.tagDisplay.classList.add(CLASSES.visible);
  } else {
    DOM.tagDisplay.classList.remove(CLASSES.visible);
  }
}

function removeTag(tag) {
  state.selectedTags = state.selectedTags.filter((t) => t !== tag);
  displayTags();
}

/* ========== EVENT LISTENERS ========== */
DOM.taskInput.addEventListener("focus", showDock);
DOM.taskInput.addEventListener("click", showDock);

document.addEventListener("click", (e) => {
  if (
    !DOM.taskInput.contains(e.target) &&
    !DOM.dock.contains(e.target) &&
    !DOM.addTaskBtn.contains(e.target) &&
    !e.target.closest(SELECTORS.flatpickrCalendar)
  ) {
    hideDock();
  }
});

/* ========== Dock Item Event Listeners ======== */

// --- Priority Selector ---
DOM.prioritySelector.addEventListener("click", (e) => {
  e.stopPropagation();
  if (state.activeDockItem === "priority") {
    closeAllDockItems();
  } else {
    setActiveDockItem("priority", DOM.prioritySelector);
    DOM.priorityDropdown.classList.add(CLASSES.visible);
    DOM.newListInput.style.display = "none";
  }
});

// Priority Options
document.querySelectorAll(".priority-option").forEach((option) => {
  option.addEventListener("click", (e) => {
    e.stopPropagation();
    const classes = Array.from(option.classList);
    const pr = classes.find((c) => ["low", "medium", "high"].includes(c));
    if (pr) {
      state.currentPriority = pr;
      const use = DOM.prioritySelector.querySelector("svg use");
      if (use) use.setAttribute("href", `${SELECTORS.priorityFlag}${state.currentPriority}`);
    }
    closeAllDockItems();
  });
});

// --- Tags ---
DOM.tagBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  if (state.activeDockItem === "tag") {
    closeAllDockItems();
  } else {
    setActiveDockItem("tag", DOM.tagBtn);
    DOM.tagElement.classList.add(CLASSES.visible);
    DOM.tagInput.focus();
  }
});

// Tag Add Button
DOM.tagAddBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  const v = DOM.tagInput.value.trim();
  if(state.selectedTags.length >= DEFAULTS.maxTags) {
    alert(`You can add up to ${DEFAULTS.maxTags} tags only.`);
    return;
  }
  if(v.length > 10) {
    alert("Tag length cannot exceed 10 characters.");
    return;
  }
  if (v && !state.selectedTags.includes(v)) {
    state.selectedTags.push(v);
    console.log(state.selectedTags);
    displayTags();
    DOM.tagInput.value = "";
    DOM.tagBtn.classList.add(CLASSES.active);
  }
  closeAllDockItems();
});


// Tag Input Enter Key
DOM.tagInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    DOM.tagAddBtn.click();
  }
});

/* --- Calendar / flatpickr --- */
DOM.calendarBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  DOM.calendarInput.style.display = "none";
  if (state.activeDockItem === "calendar") {
    closeAllDockItems();
    if (state.flatpickrInstance) state.flatpickrInstance.close();
    return;
  }
  if (!state.flatpickrInstance && typeof flatpickr !== "undefined") {
    state.flatpickrInstance = flatpickr("#calendarInput", {
      enableTime: true,
      dateFormat: "Y-m-d H:i",
      theme: "dark",
      position: "below",
      positionElement: DOM.calendarBtn,
      onClose: (selectedDates) => {
        if (selectedDates && selectedDates.length > 0) {
          state.selectedDate = selectedDates[0];
        }
        closeAllDockItems();
      },
    });
  }
  DOM.newListInput.style.display = "none";
  DOM.calendarBtn.classList.add(CLASSES.dockActive);
  setActiveDockItem("calendar", DOM.calendarBtn);
  if (state.flatpickrInstance) state.flatpickrInstance.open();
});

/* --- Lists UI --- */
DOM.listBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  DOM.newListInput.style.display = "none";
  if (state.activeDockItem === "list") {
    closeAllDockItems();
  } else {
    setActiveDockItem("list", DOM.listBtn);
    DOM.listDropdown.classList.add(CLASSES.visible);
    DOM.listOptions.classList.add(CLASSES.visible);
  }
});

DOM.listNameDisplay.addEventListener("click", (e) => {
  e.stopPropagation();
  DOM.listOptions.classList.toggle(CLASSES.visible);
  if (DOM.listOptions.classList.contains(CLASSES.visible)) DOM.newListInput.style.display = "none";
});

DOM.newListInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    const newName = DOM.newListInput.value.trim();
    if (newName) {
      state.selectedList = newName;
      let lists = JSON.parse(localStorage.getItem("lists") || "[]");
      if (!lists.includes(newName)) {
        lists.push(newName);
        localStorage.setItem("lists", JSON.stringify(lists));
      }
      DOM.listNameDisplay.innerHTML = `<span>${newName}</span> <span>&#10549;</span>`;
      DOM.newListInput.value = "";
      DOM.newListInput.style.display = "none";
      renderLists();
      DOM.listBtn.classList.add(CLASSES.dockActive);
    }
  }
});

/* --- Add Task Button --- */
DOM.addTaskBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  if (!DOM.taskInput.value.trim()) {
    alert("Task name cannot be empty.");
    DOM.taskInput.focus();
    return;
  }
  addTask();
  renderTaskItems();
  DOM.taskInput.value = "";
  state.selectedDate = null;
  state.currentPriority = "medium";
  state.selectedTags = [];
  displayTags();
  state.selectedList = DEFAULTS.defaultList;
  hideDock();
  const selectorSvg = DOM.prioritySelector.querySelector("svg use");
  if (selectorSvg) selectorSvg.setAttribute("href", "#flag-low");
  DOM.listNameDisplay.innerHTML = `<span>${DEFAULTS.defaultList}</span> <span>&#10549;</span>`;
});

DOM.taskInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter" && !state.activeDockItem) {
    DOM.addTaskBtn.click();
  }
});

DOM.dock.addEventListener("click", (e) => e.stopPropagation());


/* ========== Task Rendering and management ========== */

const navElements = document.querySelectorAll(".navbar > ul > li");
navElements.forEach((el) => {
  el.addEventListener("click", (e) => {
    navElements.forEach((ne) => ne.classList.remove(CLASSES.active));
    el.classList.add(CLASSES.active);
  });
});


function createTaskCard(task) {
  const card = document.createElement("div");
  card.className = "task-card";

  // Checkbox
  const checkBox = document.createElement("input");
  checkBox.type = "checkbox";
  checkBox.className = "task-checkbox";

  checkBox.addEventListener('', () => {
    
  const nameContainer = document.createElement("span");
  nameContainer.className = "task-name-container";

  const name = document.createElement("span");
  name.className = "task-name";
  name.textContent = task.taskName;

  const tagsContainer = document.createElement("span");
  tagsContainer.className = "task-tags-container";
  if (task.tags && task.tags.length > 0) {
    task.tags.forEach((tag) => {
      const tagSpan = document.createElement("span");
      tagSpan.className = "task-tag";
      tagSpan.textContent = `#${tag}`;
      tagsContainer.appendChild(tagSpan);
    });
  }

  nameContainer.appendChild(name);
  nameContainer.appendChild(tagsContainer);

  // Priority and List (metadata)
  const detailsContainer = document.createElement("div");
  detailsContainer.className = "task-metadata-container";

  const prioritySpan = document.createElement("span");
  prioritySpan.className = `task-priority priority-${task.priority ? task.priority.toLowerCase() : 'medium'}`;
  prioritySpan.textContent = task.priority || "Medium";

  const listSpan = document.createElement("span");
  listSpan.className = "task-list";
  listSpan.textContent = task.list || "None";

  detailsContainer.appendChild(prioritySpan);
  detailsContainer.appendChild(listSpan);

  // Due date section
  const dueDateContainer = document.createElement("div");
  dueDateContainer.className = "task-due-date-container";

  const dueDateLabel = document.createElement("span");
  dueDateLabel.className = "task-due-date";
  if (task.dueDate) {
    const dateObj = new Date(task.dueDate);
    const formattedDate = dateObj.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    dueDateLabel.textContent = formattedDate;
  } else {
    dueDateLabel.textContent = "-";
  }

  dueDateContainer.appendChild(dueDateLabel);

  // Assemble the card in a single row
  card.appendChild(checkBox);
  
    const topSection = document.createElement("div");
    topSection.className = "task-top-section";
    topSection.appendChild(nameContainer);
    topSection.appendChild(detailsContainer);
  
  card.appendChild(topSection);
  card.appendChild(dueDateContainer);

  // Append to the display window
  const taskDisplayWindow = document.getElementById("taskDisplayWindow");
  if (taskDisplayWindow) {
    taskDisplayWindow.appendChild(card);
  }

  return card;
}


function renderTaskItems(filterType = "all", filterValue = null) {
  const taskDisplayWindow = document.getElementById("taskDisplayWindow");
  taskDisplayWindow.innerHTML = "";
  let tasks = getTasks();

  if (filterType === 'today') {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    tasks = tasks.filter((task) => task.dueDate && task.dueDate.substring(0, 10) === todayStr);
  } 
  
  else if (filterType === 'week') {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const weekDates = [];
    for (let i = 0; i < 7 - dayOfWeek; i++) {
      let newDate = new Date();
      newDate.setDate(today.getDate() + i);
      const dateStr = `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, '0')}-${String(newDate.getDate()).padStart(2, '0')}`;
      weekDates.push(dateStr);
    }
    tasks = tasks.filter((task) => task.dueDate && weekDates.includes(task.dueDate.substring(0, 10)));
  }
    
  
  else if (filterType === 'priority' && filterValue) {
    tasks = tasks.filter((task) => task.priority.toLowerCase() === filterValue.toLowerCase());
  } 
  
  else if (filterType === 'list' && filterValue) {
    tasks = tasks.filter((task) => task.list === filterValue);
  } 
  
  else if (filterType === 'tag' && filterValue) {
    tasks = tasks.filter((task) => task.tags.includes(filterValue));
  }

  tasks.forEach((task) => {
    createTaskCard(task);
  });
}

// Initial render
renderTaskItems();