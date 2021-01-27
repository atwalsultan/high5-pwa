//**************************************************************
//**************************************************************
//      High5 PWA
//**************************************************************
//**************************************************************


//**************************************************************
//      Root Scope Variable Declarations
//**************************************************************
const postForm = document.getElementById("postForm");
const activityDate = document.getElementById("activityDate");
const activityTime = document.getElementById("activityTime");
const activityDesc = document.getElementById("activityDesc");
const activityCategory = document.getElementById("activityCategory");
const tableBody = document.getElementById("tableBody");
const updateOverlay = document.getElementById('updateOverlay');
const deleteOverlay = document.getElementById('deleteOverlay');
const closeBtns = document.querySelectorAll('.closeBtn');
const updateForm = document.getElementById('updateForm');
const updateDate = document.getElementById('updateDate');
const updateTime = document.getElementById('updateTime');
const updateDesc = document.getElementById('updateDesc');
const updateCategory = document.getElementById('updateCategory');
const confirmDelete = document.getElementById('confirmDelete');

let updateIndex;
let deleteIndex;

// Array to store posts
let postArray = [];


//**************************************************************
//      Class Declarations
//**************************************************************

class Post {
    constructor(date, time, description, category, dateObj) {
        this.date = date;
        this.time = time;
        this.description = description;
        this.category = category;
        this.dateObj = dateObj;
        this.lastUpdated = dateObj;
    }

    // Store post in array
    storePost() {
        postArray.push(this);
    }
};


//**************************************************************
//      Function Declarations
//**************************************************************

// Show all posts
const showPosts = () => {
    tableBody.innerHTML = ''
    for(let i = 0; i < postArray.length; i++) {
        tableBody.innerHTML += `
            <tr>
                <td>${postArray[i].date}</td>
                <td>${postArray[i].time}</td>
                <td>${postArray[i].description}</td>
                <td>${postArray[i].category}</td>
                <td>
                    <button class="deleteBtn" id="deleteBtn${i}">Delete</button>
                    <button class="updateBtn" id="updateBtn${i}">Update</button>
                </td>
            </tr>
        `;

        // TODO: Check if event listener for button can be added in this loop
    }

    // Add event listener to all buttons
    addBtnListeners();

    // Clear all inputs
    clearInputs();

    // Close any modals if open
    closeModals();
};

// Create and store new post
const createPost = (event) => {
    // Prevent form from actually submitting
    event.preventDefault();

    // Get values from DOM
    let date;
    let time;
    activityDate.value === "" ? date = "Unspecified" : date = activityDate.value;
    activityTime.value === "" ? time = "Unspecified" : time = activityTime.value;
    let description = activityDesc.value;
    let category = activityCategory.value;

    // Create and store new post
    let newPost = new Post(date, time, description, category, new Date());
    newPost.storePost();

    //Refresh posts table
    showPosts();
}

// Update post
const updatePost = (event) => {
    // Prevent form from actually submitting
    event.preventDefault();

    // Get values from DOM and update
    updateDate.value === "" ? postArray[updateIndex].date = "Unspecified" : postArray[updateIndex].date = updateDate.value;
    updateTime.value === "" ? postArray[updateIndex].time = "Unspecified" : postArray[updateIndex].time = updateTime.value;
    postArray[updateIndex].description = updateDesc.value;
    postArray[updateIndex].category = updateCategory.value;
    postArray[updateIndex].lastUpdated = new Date();

    // Refresh to display changes
    showPosts();
}

// Delete post
const deletePost = () => {
    postArray.splice(deleteIndex, 1);

    // Show all posts
    showPosts();
}

const addBtnListeners = () => {
    let deleteBtns = document.getElementsByClassName('deleteBtn');
    let updateBtns = document.getElementsByClassName('updateBtn');
    
    for(let i = 0; i < deleteBtns.length; i++) {
        deleteBtns[i].addEventListener('click', (event) => {
            // Get array index of post to delete
            deleteIndex = parseInt(event.target.id.split('deleteBtn')[1]);

            // Show confirmation modal
            deleteOverlay.style.display = 'block';
        });

        updateBtns[i].addEventListener('click', (event) => {
            // Get array index of post to update
            updateIndex = parseInt(event.target.id.split('updateBtn')[1]);

            // Show update form
            updateOverlay.style.display = 'block';

            // Populate form with existing data
            updateDate.value = postArray[updateIndex].date;
            updateTime.value = postArray[updateIndex].time;
            updateDesc.value = postArray[updateIndex].description;
            updateCategory.value = postArray[updateIndex].category;
        });
    }
}

// Clear all inputs
const clearInputs = () => {
    // Create post form
    activityDate.value = '';
    activityTime.value = '';
    activityDesc.value = '';
    activityCategory.value = 'Category A';

    // Update post form
    updateDate.value = '';
    updateTime.value = '';
    updateDesc.value = '';
    updateCategory.value = 'Category A';
}

// Close modals
const closeModals = () => {
    // Modal for update action
    updateOverlay.style.display = 'none';

    // Modal for delte action
    deleteOverlay.style.display = 'none';
}

// Hide modals on clicking outside
const outsideClick = (event) => {
    if(event.target === updateOverlay || event.target === deleteOverlay) {
        closeModals();
    }
}


//**************************************************************
//      Event Listeners
//**************************************************************

// On page load
document.addEventListener('DOMContentLoaded', showPosts);

// When post form is submitted
postForm.addEventListener('submit', createPost);

// When update form is submitted
updateForm.addEventListener('submit', updatePost);

// Delete button on confirmation modal
confirmDelete.addEventListener('click', deletePost);

// When close button is clicked on a modal
for(let i = 0; i<closeBtns.length; i++) {
    closeBtns[i].addEventListener('click', closeModals);
}

// On clicking outside a modal
window.addEventListener('click', outsideClick);
