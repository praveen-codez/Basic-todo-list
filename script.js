// DOM Element References
const taskInput = document.getElementById("taskInput");
const dock = document.getElementById("dock");
const addTaskBtn = document.getElementById("addTaskBtn");
const prioritySelector = document.getElementById("prioritySelector");
const priorityDropdown = document.getElementById("priorityDropdown");
const calendarBtn = document.getElementById("calendarBtn");
const calendarInput = document.getElementById("calendarInput");
const addToListBtn = document.getElementById("addToListBtn");
const tagBtn = document.getElementById("tagBtn");
const tagElement = document.getElementById("tagElement");
const tagInput = document.getElementById("tagInput");
const tagAddBtn = document.getElementById("tagAddBtn");
const tagDisplay = document.getElementById("tagDisplay");
// State Variables
let currentPriority = "medium";
let selectedDate = null;
let selectedList = null;
let selectedTags = [];
let flatpickrInstance = null;
let activeDockItem = null;

/* ---------- Dock Display Functions ---------- */

// Show the dock and related UI changes
function showDock() {
  if (!dock.classList.contains("visible")) {
    dock.classList.add("visible");
    addTaskBtn.classList.add("visible");
    taskInput.style.borderBottomLeftRadius = "0px";
    taskInput.style.borderBottomRightRadius = "0px";
  }
}

// Hide the dock and reset UI changes
function hideDock() {
  dock.classList.remove("visible");
  closeAllDockItems();
  taskInput.style.borderBottomLeftRadius = "12px";
  taskInput.style.borderBottomRightRadius = "12px";
}

// Close all dock interactive elements and reset states
function closeAllDockItems() {
  priorityDropdown.classList.remove("visible");
  prioritySelector.classList.remove("dock-active");
  tagElement.classList.remove("visible");
  tagBtn.classList.remove("dock-active");
  calendarBtn.classList.remove("dock-active");
  activeDockItem = null;
}

// Set an active dock item, highlighting it and closing others
function setActiveDockItem(itemName, element) {
  closeAllDockItems();
  activeDockItem = itemName;
  element.classList.add("dock-active");
}

/* ---------- Local Storage Task List Management ---------- */

// Initialize default task lists in local storage if not already present
function initializeDefaultLists() {
  if (localStorage.getItem("listInitialized") !== "true") {
    localStorage.setItem("lists", JSON.stringify(["work", "personal", "shopping"]));
    localStorage.setItem("listInitialized", "true");
  }
}

// Retrieve all tasks from local storage
function getTasks() {
  const tasks = localStorage.getItem("tasks");
  return tasks ? JSON.parse(tasks) : [];
}

// Add a new task to local storage
function addTask() {
  const taskObj = {
    name: taskInput.value.trim(),
    priority: currentPriority,
    dueDate: selectedDate,
    tags: selectedTag,
    list: selectedList,
  };
  const updatedTasks = [...getTasks(), taskObj];
  localStorage.setItem("tasks", JSON.stringify(updatedTasks));
}

/* ---------- Event Listeners and Handlers ---------- */

// Show dock on input focus or click
taskInput.addEventListener("focus", showDock);
taskInput.addEventListener("click", showDock);

// Hide dock when clicking outside related elements
document.addEventListener("click", (e) => {
  if (
    !taskInput.contains(e.target) &&
    !dock.contains(e.target) &&
    !addTaskBtn.contains(e.target) &&
    !e.target.closest(".flatpickr-calendar")
  ) {
    hideDock();
  }
});

// Handle priority selector click to toggle dropdown
prioritySelector.addEventListener("click", (e) => {
  e.stopPropagation();
  if (activeDockItem === "priority") {
    closeAllDockItems();
  } else {
    setActiveDockItem("priority", prioritySelector);
    priorityDropdown.classList.add("visible");
  }
});

// Priority option selection sets current priority and updates icon
document.querySelectorAll(".priority-option").forEach((option) => {
  option.addEventListener("click", (e) => {
    e.stopPropagation();
    currentPriority = option.classList[1];
    prioritySelector.querySelector("svg use").setAttribute("href", `#flag-${currentPriority}`);
    closeAllDockItems();
  });
});

// Toggle tag input visibility and focus
tagBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  if (activeDockItem === "tag") {
    closeAllDockItems();
  } else {
    setActiveDockItem("tag", tagBtn);
    tagElement.classList.add("visible");
    tagInput.focus();
  }
});

// Add tag button to add new tags to selectedTags list
tagAddBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  const tagValue = tagInput.value.trim();
  if (tagValue && !selectedTags.includes(tagValue) && selectedTags.length < 5) {
    selectedTags.push(tagValue);
    displayTags();
    tagInput.value = "";
    tagBtn.classList.add("active");
  }
  closeAllDockItems();
});
function displayTags() {
  tagDisplay.innerHTML = "";
  selectedTags.forEach((tag) => {
    const tagItem = document.createElement("div");
    const tagText = document.createElement("span");
    const tagRemoveBtn = document.createElement("span");
    
    tagItem.classList.add("tag-item");
    
    tagText.textContent = tag;

    tagRemoveBtn.textContent = "✕";
    tagRemoveBtn.classList.add("tag-remove-btn");;
    tagRemoveBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      removeTag(tag)
    });
    tagItem.appendChild(tagText);
    tagItem.appendChild(tagRemoveBtn);
    tagDisplay.appendChild(tagItem);
  })
};

function removeTag(tag) {
  selectedTags = selectedTags.filter((t) => t !== tag);
  displayTags();
};

// Calendar button toggles date picker initialization and visibility
calendarBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  calendarInput.style.display = "none";
  if (activeDockItem === "calendar") {
    closeAllDockItems();
    if (flatpickrInstance) flatpickrInstance.close();
    return;
  }
  if (!flatpickrInstance) {
    flatpickrInstance = flatpickr("#calendarInput", {
      enableTime: true,
      dateFormat: "Y-m-d H:i",
      theme: "dark",
      position: "below",
      positionElement: calendarBtn,
      onClose: (selectedDates) => {
        if (selectedDates.length > 0) {
          selectedDate = selectedDates[0];
        }
        closeAllDockItems();
      },
    });
  }
  calendarBtn.classList.add("dock-active");
  setActiveDockItem("calendar", calendarBtn);
  flatpickrInstance.open();
});

// Add task button click validates input, adds task, and resets UI/state
addTaskBtn.addEventListener("click", (e) => {
  e.stopPropagation();

  if (!taskInput.value.trim()) {
    alert("Task name cannot be empty.");
    taskInput.focus();
    return;
  }

  addTask();

  // Reset input and state
  taskInput.value = "";
  selectedDate = null;
  currentPriority = "medium";
  selectedTags = [];
  hideDock();

  // Reset priority icon to default low
  const selectorSvg = prioritySelector.querySelector("svg use");
  selectorSvg.setAttribute("href", "#flag-low");
});

// Add task on pressing Enter key if no dock item is active
taskInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter" && !activeDockItem) {
    addTaskBtn.click();
  }
});

// Prevent dock clicks from bubbling and closing dock unintentionally
dock.addEventListener("click", (e) => {
  e.stopPropagation();
});