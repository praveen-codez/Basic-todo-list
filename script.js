const taskInput = document.getElementById("taskInput");
const dock = document.getElementById("dock");
const addTaskBtn = document.getElementById("addTaskBtn");
const prioritySelector = document.getElementById("prioritySelector");
const priorityDropdown = document.getElementById("priorityDropdown");
const calendarBtn = document.getElementById("calendarBtn");
const addToListBtn = document.getElementById("addToListBtn");
const tagBtn = document.getElementById("tagBtn");
const tagElement = document.getElementById("tagElement");
const tagInput = document.getElementById("tagInput");
const tagAddBtn = document.getElementById("tagAddBtn");

let currentPriority = "medium";
let selectedDate = null;
let selectedList = null;
let selectedTags = [];
let flatpickrInstance = null;
let activeDockItem = null;

function showDock() {
  if (!dock.classList.contains("visible")) {
    dock.classList.add("visible");
    addTaskBtn.classList.add("visible");
    taskInput.style.borderBottomLeftRadius = "0px";
    taskInput.style.borderBottomRightRadius = "0px";
  }
}

function hideDock() {
  dock.classList.remove("visible");
  closeAllDockItems();
  taskInput.style.borderBottomLeftRadius = "12px";
  taskInput.style.borderBottomRightRadius = "12px";
}

function closeAllDockItems() {
  priorityDropdown.classList.remove("visible");
  prioritySelector.classList.remove("dock-active");
  tagElement.classList.remove("visible");
  tagBtn.classList.remove("dock-active");
  calendarBtn.classList.remove("dock-active");
  activeDockItem = null;
}

function setActiveDockItem(itemName, element) {
  closeAllDockItems();
  activeDockItem = itemName;
  element.classList.add("dock-active");
}

taskInput.addEventListener("focus", showDock);
taskInput.addEventListener("click", showDock);

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

prioritySelector.addEventListener("click", (e) => {
  e.stopPropagation();
  
  if (activeDockItem === "priority") {
    closeAllDockItems();
  } else {
    setActiveDockItem("priority", prioritySelector);
    priorityDropdown.classList.add("visible");
  }
});

document.querySelectorAll(".priority-option").forEach((option) => {
  option.addEventListener("click", (e) => {
    e.stopPropagation();
    currentPriority = option.classList[1];
    prioritySelector.querySelector("svg use").setAttribute("href", `#flag-${currentPriority}`);
    closeAllDockItems();
  });
});

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

tagAddBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  if (tagInput.value.trim()) {
    selectedTags.push(tagInput.value);
    taskInput.value = `#${tagInput.value} ` + taskInput.value;
    tagInput.value = "";
  }
  closeAllDockItems();
});

calendarBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  if (activeDockItem === "calendar") {
    closeAllDockItems();
    if (flatpickrInstance) {
      flatpickrInstance.close();
    } 
    return;
  }
  document.getElementById("calendarInput").style.display = "none";
  if (!flatpickrInstance) {
    flatpickrInstance = flatpickr("#calendarInput", {
      enableTime: true,
      dateFormat: "Y-m-d H:i",
      theme: "dark",
      position: "below",
      positionElement: calendarBtn,
      onClose: function (selectedDates) {
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

addTaskBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  taskInput.value = "";
  selectedDate = null;
  currentPriority = "medium";
  selectedTags = [];
  hideDock();
  const selectorSvg = prioritySelector.querySelector("svg use");
  selectorSvg.setAttribute("href", "#flag-low");
});

taskInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter" && !activeDockItem) {
    addTaskBtn.click();
  }
});
addToListBtn.addEventListener("click", (e) => {
  e.stopPropagation();
});

dock.addEventListener("click", (e) => {
  e.stopPropagation();
});
