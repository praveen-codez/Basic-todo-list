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
  defaultList: "work",
  maxTags: 5,
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

/* ========== UTILITY FUNCTIONS ========== */

/**
 * Toggle visibility of an element
 */
function toggleElementVisibility(element, shouldShow) {
  if (shouldShow === undefined) {
    element.classList.toggle(CLASSES.visible);
  } else {
    shouldShow
      ? element.classList.add(CLASSES.visible)
      : element.classList.remove(CLASSES.visible);
  }
}

/**
 * Toggle dock-active class on an element
 */
function toggleDockActive(element, shouldAdd = true) {
  shouldAdd
    ? element.classList.add(CLASSES.dockActive)
    : element.classList.remove(CLASSES.dockActive);
}

/**
 * Update task input border radius
 */
function updateTaskInputBorder(topLeft = "12px", topRight = "12px") {
  DOM.taskInput.style.borderBottomLeftRadius = topLeft;
  DOM.taskInput.style.borderBottomRightRadius = topRight;
}

/**
 * Retrieve tasks from local storage
 */
function getTasks() {
  const tasks = localStorage.getItem("tasks");
  return tasks ? JSON.parse(tasks) : [];
}

/**
 * Retrieve lists from local storage
 */
function getLists() {
  return JSON.parse(localStorage.getItem("lists")) || DEFAULTS.lists;
}

/**
 * Save lists to local storage
 */
function saveLists(lists) {
  localStorage.setItem("lists", JSON.stringify(lists));
}

/* ========== DOCK DISPLAY MANAGEMENT ========== */

/**
 * Show the dock and related UI changes
 */
function showDock() {
  if (!DOM.dock.classList.contains(CLASSES.visible)) {
    DOM.dock.classList.add(CLASSES.visible);
    DOM.addTaskBtn.classList.add(CLASSES.visible);
    updateTaskInputBorder("0px", "0px");
  }
}

/**
 * Hide the dock and reset UI changes
 */
function hideDock() {
  DOM.dock.classList.remove(CLASSES.visible);
  closeAllDockItems();
  updateTaskInputBorder();
}

/**
 * Close all dock interactive elements and reset states
 */
function closeAllDockItems() {
  toggleElementVisibility(DOM.priorityDropdown, false);
  toggleDockActive(DOM.prioritySelector, false);
  toggleElementVisibility(DOM.tagElement, false);
  toggleDockActive(DOM.tagBtn, false);
  toggleElementVisibility(DOM.tagDisplay, false);
  toggleDockActive(DOM.calendarBtn, false);
  toggleDockActive(DOM.listBtn, false);
  toggleElementVisibility(DOM.listDropdown, false);
  toggleElementVisibility(DOM.listOptions, false);
  DOM.newListInput.style.display = "none";
  state.activeDockItem = null;
}

/**
 * Set an active dock item, highlighting it and closing others
 */
function setActiveDockItem(itemName, element) {
  closeAllDockItems();
  state.activeDockItem = itemName;
  toggleDockActive(element, true);
}

/* ========== LIST MANAGEMENT ========== */

/**
 * Initialize default task lists in local storage if not already present
 */
function initializeDefaultLists() {
  if (localStorage.getItem("listInitialized") !== "true") {
    saveLists(DEFAULTS.lists);
    localStorage.setItem("listInitialized", "true");
    state.selectedList = DEFAULTS.defaultList;
    updateListDisplay(DEFAULTS.defaultList);
  } else if (!state.selectedList) {
    const lists = getLists();
    if (lists.length > 0) {
      state.selectedList = lists[0];
      updateListDisplay(lists[0]);
    }
  }
}

/**
 * Update the list name display
 */
function updateListDisplay(listName) {
  DOM.listNameDisplay.innerHTML = `<span>${listName}</span> <span>&#10549;</span>`;
}

/**
 * Render list options in the dropdown
 */
function renderLists() {
  DOM.listOptions.innerHTML = "";
  const lists = getLists();

  lists.forEach((item) => {
    const listItem = document.createElement("div");
    listItem.className = CLASSES.listItem;
    listItem.textContent = item;
    DOM.listOptions.appendChild(listItem);

    listItem.addEventListener("click", handleListItemClick(item));
  });

  createAndAppendNewListButton();
}

/**
 * Handle list item click event
 */
function handleListItemClick(listName) {
  return (e) => {
    e.stopPropagation();
    state.selectedList = listName;
    updateListDisplay(listName);
    closeListUI();
  };
}

/**
 * Create and append the "New List" button
 */
function createAndAppendNewListButton() {
  const newListBtn = document.createElement("button");
  newListBtn.innerHTML = "New List";
  newListBtn.className = CLASSES.newListBtn;
  newListBtn.id = "newListBtn";
  DOM.listOptions.appendChild(newListBtn);

  newListBtn.addEventListener("click", handleNewListButtonClick);
}

/**
 * Handle "New List" button click
 */
function handleNewListButtonClick(e) {
  e.stopPropagation();
  closeListUI();
  DOM.newListInput.value = "";
  DOM.newListInput.style.display = "block";
  DOM.newListInput.focus();
  state.activeDockItem = null;
}

/**
 * Close all list-related UI elements
 */
function closeListUI() {
  toggleElementVisibility(DOM.listDropdown, false);
  toggleElementVisibility(DOM.listOptions, false);
  toggleDockActive(DOM.listBtn, false);
  state.activeDockItem = null;
}

/**
 * Render list options in the select dropdown
 */
function listSelectOptionRender() {
  const availableLists = getLists();
  availableLists.forEach((item) => {
    const listOption = document.createElement("option");
    listOption.textContent = item;
    DOM.listSelect.appendChild(listOption);
  });
}

/* ========== TAG MANAGEMENT ========== */

/**
 * Display tags in the tag display area
 */
function displayTags() {
  DOM.tagDisplay.classList.add('visible');
  DOM.tagDisplay.innerHTML = "";
  state.selectedTags.forEach((tag) => {
    const tagItem = document.createElement("div");
    const tagText = document.createElement("span");
    const tagRemoveBtn = document.createElement("span");

    tagItem.classList.add(CLASSES.tagItem);
    tagText.textContent = tag;

    tagRemoveBtn.textContent = "✕";
    tagRemoveBtn.classList.add(CLASSES.tagRemoveBtn);
    tagRemoveBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      removeTag(tag);
    });

    tagItem.appendChild(tagText);
    tagItem.appendChild(tagRemoveBtn);
    DOM.tagDisplay.appendChild(tagItem);
  });
}

/**
 * Remove a tag from the selected tags
 */
function removeTag(tag) {
  state.selectedTags = state.selectedTags.filter((t) => t !== tag);
  displayTags();
}

/* ========== TASK MANAGEMENT ========== */

/**
 * Add a new task to local storage
 */
function addTask() {
  const taskObj = {
    name: DOM.taskInput.value.trim(),
    priority: state.currentPriority,
    dueDate: state.selectedDate,
    tags: state.selectedTags,
    list: state.selectedList,
  };
  const updatedTasks = [...getTasks(), taskObj];
  localStorage.setItem("tasks", JSON.stringify(updatedTasks));
}

/**
 * Reset task-related state variables
 */
function resetTaskState() {
  DOM.taskInput.value = "";
  state.selectedDate = null;
  state.currentPriority = "medium";
  state.selectedTags = [];
  state.selectedList = null;
  displayTags();
  updatePrioritySelectorIcon("low");
  updateListDisplay("None");
}

/**
 * Update the priority selector icon
 */
function updatePrioritySelectorIcon(priority) {
  const selectorSvg = DOM.prioritySelector.querySelector(SELECTORS.svgUse);
  selectorSvg.setAttribute("href", SELECTORS.priorityFlag + priority);
}

function renderTasks() {}

/* ========== EVENT LISTENERS ========== */

/**
 * Initialize all event listeners
 */
function initializeEventListeners() {
  // Task input events
  DOM.taskInput.addEventListener("focus", showDock);
  DOM.taskInput.addEventListener("click", showDock);
  DOM.taskInput.addEventListener("keypress", handleTaskInputKeypress);

  // Document click event
  document.addEventListener("click", handleDocumentClick);

  // Priority selector events
  DOM.prioritySelector.addEventListener("click", handlePrioritySelectorClick);
  document.querySelectorAll(`.${CLASSES.priorityOption}`).forEach((option) => {
    option.addEventListener("click", handlePriorityOptionClick);
  });

  // Tag events
  DOM.tagBtn.addEventListener("click", handleTagButtonClick);
  DOM.tagAddBtn.addEventListener("click", handleTagAddButtonClick);

  // Calendar events
  DOM.calendarBtn.addEventListener("click", handleCalendarButtonClick);

  // List events
  DOM.listBtn.addEventListener("click", handleListButtonClick);
  DOM.listNameDisplay.addEventListener("click", handleListNameDisplayClick);

  // Add task button
  DOM.addTaskBtn.addEventListener("click", handleAddTaskButtonClick);

  // New list input
  DOM.newListInput.addEventListener("keypress", handleNewListInputKeypress);

  // Dock click event
  DOM.dock.addEventListener("click", (e) => e.stopPropagation());
}

/**
 * Handle task input keypress event
 */
function handleTaskInputKeypress(e) {
  if (e.key === "Enter" && !state.activeDockItem) {
    DOM.addTaskBtn.click();
  }
}

/**
 * Handle document click event
 */
function handleDocumentClick(e) {
  if (
    !DOM.taskInput.contains(e.target) &&
    !DOM.dock.contains(e.target) &&
    !DOM.addTaskBtn.contains(e.target) &&
    !e.target.closest(SELECTORS.flatpickrCalendar)
  ) {
    hideDock();
  }
}

/**
 * Handle priority selector click event
 */
function handlePrioritySelectorClick(e) {
  e.stopPropagation();
  if (state.activeDockItem === "priority") {
    closeAllDockItems();
  } else {
    setActiveDockItem("priority", DOM.prioritySelector);
    toggleElementVisibility(DOM.priorityDropdown, true);
    DOM.newListInput.style.display = "none";
  }
}

/**
 * Handle priority option click event
 */
function handlePriorityOptionClick(e) {
  e.stopPropagation();
  state.currentPriority = e.target.classList[1];
  updatePrioritySelectorIcon(state.currentPriority);
  closeAllDockItems();
}

/**
 * Handle tag button click event
 */
function handleTagButtonClick(e) {
  e.stopPropagation();
  if (state.activeDockItem === "tag") {
    closeAllDockItems();
  } else {
    setActiveDockItem("tag", DOM.tagBtn);
    toggleElementVisibility(DOM.tagElement, true);
    DOM.tagInput.focus();
    DOM.newListInput.style.display = "none";
  }
}

/**
 * Handle tag add button click event
 */
function handleTagAddButtonClick(e) {
  e.stopPropagation();
  const tagValue = DOM.tagInput.value.trim();
  if (
    tagValue &&
    !state.selectedTags.includes(tagValue) &&
    state.selectedTags.length < DEFAULTS.maxTags
  ) {
    state.selectedTags.push(tagValue);
    displayTags();
    DOM.tagInput.value = "";
    DOM.tagBtn.classList.add(CLASSES.active);
  }
  closeAllDockItems();
}

/**
 * Handle calendar button click event
 */
function handleCalendarButtonClick(e) {
  e.stopPropagation();
  DOM.calendarInput.style.display = "none";

  if (state.activeDockItem === "calendar") {
    closeAllDockItems();
    if (state.flatpickrInstance) state.flatpickrInstance.close();
    return;
  }

  if (!state.flatpickrInstance) {
    state.flatpickrInstance = flatpickr("#calendarInput", {
      enableTime: true,
      dateFormat: "Y-m-d H:i",
      theme: "dark",
      position: "below",
      positionElement: DOM.calendarBtn,
      onClose: (selectedDates) => {
        if (selectedDates.length > 0) {
          state.selectedDate = selectedDates[0];
        }
        closeAllDockItems();
      },
    });
  }

  DOM.newListInput.style.display = "none";
  setActiveDockItem("calendar", DOM.calendarBtn);
  toggleDockActive(DOM.calendarBtn, true);
  state.flatpickrInstance.open();
}

/**
 * Handle list button click event
 */
function handleListButtonClick(e) {
  e.stopPropagation();
  DOM.newListInput.style.display = "none";

  if (state.activeDockItem === "list") {
    closeAllDockItems();
  } else {
    setActiveDockItem("list", DOM.listBtn);
    toggleElementVisibility(DOM.listDropdown, true);
    toggleElementVisibility(DOM.listOptions, true);
  }
}

/**
 * Handle list name display click event
 */
function handleListNameDisplayClick(e) {
  e.stopPropagation();
  DOM.listOptions.classList.toggle(CLASSES.visible);
  if (DOM.listOptions.classList.contains(CLASSES.visible)) {
    DOM.newListInput.style.display = "none";
  }
}

/**
 * Handle add task button click event
 */
function handleAddTaskButtonClick(e) {
  e.stopPropagation();
  if (!DOM.taskInput.value.trim()) {
    alert("Task name cannot be empty.");
    DOM.taskInput.focus();
    return;
  }

  addTask();
  resetTaskState();
  hideDock();
}

/**
 * Handle new list input keypress event
 */
function handleNewListInputKeypress(e) {
  if (e.key === "Enter") {
    const newListName = DOM.newListInput.value.trim();
    if (newListName) {
      state.selectedList = newListName;
      let lists = getLists();
      if (!lists.includes(newListName)) {
        lists.push(newListName);
        saveLists(lists);
      }

      updateListDisplay(newListName);
      DOM.newListInput.value = "";
      DOM.newListInput.style.display = "none";

      renderLists();
      toggleDockActive(DOM.listBtn, true);
    }
  }
}

/* ========== INITIALIZATION ========== */

initializeDefaultLists();
renderLists();
listSelectOptionRender();
initializeEventListeners();
