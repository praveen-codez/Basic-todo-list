// DOM Element References
const taskInput = document.getElementById("taskInput");
const dock = document.getElementById("dock");
const addTaskBtn = document.getElementById("addTaskBtn");
const prioritySelector = document.getElementById("prioritySelector");
const priorityDropdown = document.getElementById("priorityDropdown");
const calendarBtn = document.getElementById("calendarBtn");
const calendarInput = document.getElementById("calendarInput");
const listBtn = document.getElementById("ListBtn");
const listDropdown = document.getElementById("listDropdown");
const listNameDisplay = document.getElementById('listNameDisplay')
const listOptions = document.getElementById("listOptions");
const newListInput = document.getElementById('newListInput');
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
  listBtn.classList.remove('dock-active');
  listDropdown.classList.remove('visible');
  // Hide list options and new list input when closing dock items
  listOptions.classList.remove('visible');
  newListInput.style.display = 'none'; // ADDED: Hide new list input

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
    localStorage.setItem("lists", JSON.stringify(["None", "Personal", "Hobbies", "Work"]));
    localStorage.setItem("listInitialized", "true");
    selectedList = "work"; // Set a default list
    listNameDisplay.innerHTML = `<span>work</span> <span>&#10549;</span>`; // Update display
  } else if (!selectedList) {
    // If lists are initialized but no list is selected on refresh
    const lists = JSON.parse(localStorage.getItem("lists"));
    if (lists.length > 0) {
      selectedList = lists[0];
      listNameDisplay.innerHTML = `<span>${selectedList}</span> <span>&#10549;</span>`;
    }
  }
  return true;
}

initializeDefaultLists();

function renderLists() {
  listOptions.innerHTML = ''; // Clear previous options
  const lists = JSON.parse(localStorage.getItem("lists"));
  
  lists.forEach((item) => {
    const listItem = document.createElement("div");
    listItem.className = 'list-item'
    listItem.textContent = item;
    listOptions.appendChild(listItem);
    listItem.addEventListener("click", (e) => {
      e.stopPropagation(); // Stop click from propagating to listNameDisplay
      selectedList = item;
      listNameDisplay.innerHTML = `<span>${item}</span> <span>&#10549;</span>`;
      // Close all list-related UI elements
      listDropdown.classList.remove("visible");
      listOptions.classList.remove('visible');
      listBtn.classList.remove('dock-active');
      activeDockItem = null;
    });
  });

  // append the New List button after clearing and rendering list items
  const newListBtn = document.createElement("button");
  newListBtn.innerHTML = 'New List';
  newListBtn.className = 'newList-btn'
  newListBtn.id = 'newListBtn';
  listOptions.appendChild(newListBtn);

  newListBtn.addEventListener('click', (e) => {
    e.stopPropagation(); 
    listDropdown.classList.remove("visible");
    listOptions.classList.remove('visible');

    newListInput.value = ''; 
    newListInput.style.display = 'block';
    newListInput.focus();

    listBtn.classList.remove('dock-active');
    activeDockItem = null;
  });
}

renderLists();



function getTasks() {
  const tasks = localStorage.getItem("tasks");
  return tasks ? JSON.parse(tasks) : [];
}


function addTask() {
  const taskObj = {
    name: taskInput.value.trim(),
    priority: currentPriority,
    dueDate: selectedDate,
    tags: selectedTags, 
    list: selectedList,
  };
  const updatedTasks = [...getTasks(), taskObj];
  localStorage.setItem("tasks", JSON.stringify(updatedTasks));
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
    newListInput.style.display = 'none';
    
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
    newListInput.style.display = 'none';
  }
});


newListInput.addEventListener('keypress', (e) => {
  if(e.key === 'Enter'){
    const newListName = newListInput.value.trim();
    if (newListName) {
        selectedList = newListName;
        let lists = JSON.parse(localStorage.getItem('lists'));
        if (!lists.includes(newListName)) {
            lists.push(newListName);
            localStorage.setItem('lists', JSON.stringify(lists));
        }
        
        listNameDisplay.innerHTML = `<span>${newListName}</span> <span>&#10549;</span>`;
        newListInput.value = '';
        newListInput.style.display = 'none';
        
        
        renderLists(); 
        listBtn.classList.add('dock-active');
    }
  }
});



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
  newListInput.style.display = 'none'; // ADDED: Hide new list input
  calendarBtn.classList.add("dock-active");
  setActiveDockItem("calendar", calendarBtn);
  flatpickrInstance.open();
});

listBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  // Hide the list input whenever the list button is clicked (to reset)
  newListInput.style.display = 'none'; // ADDED: Hide new list input

  if (activeDockItem === 'list'){
    closeAllDockItems();
  }
  else{
    setActiveDockItem('list', listBtn);
    listDropdown.classList.add('visible');
    listOptions.classList.add('visible'); // Set listOptions visible by default with listDropdown
  }
})
listNameDisplay.addEventListener('click', (e) => {
  e.stopPropagation();
  listOptions.classList.toggle('visible');
  // Also make sure to hide the new list input if list options are shown
  if (listOptions.classList.contains('visible')) {
      newListInput.style.display = 'none';
  }
})

addTaskBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  if (!taskInput.value.trim()) {
    alert("Task name cannot be empty.");
    taskInput.focus();
    return;
  }
  addTask();

  taskInput.value = "";
  selectedDate = null;
  currentPriority = "medium";
  selectedTags = [];
  displayTags();
  selectedList = null;
  hideDock();

  const selectorSvg = prioritySelector.querySelector("svg use");
  selectorSvg.setAttribute("href", "#flag-low");
  listNameDisplay.innerHTML = `<span>None</span> <span>&#10549;</span>`; // Reset list display
});


taskInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter" && !activeDockItem) {
    addTaskBtn.click();
  }
});
dock.addEventListener("click", (e) => {
  e.stopPropagation();
});