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
const closeBtn = document.querySelector('.closeBtn');
const updateForm = document.getElementById('updateForm');
const updateDate = document.getElementById('updateDate');
const updateTime = document.getElementById('updateTime');
const updateDesc = document.getElementById('updateDesc');
const updateCategory = document.getElementById('updateCategory');
let updateIndex;
let deleteIndex;

// Array to store posts
let postArray = [];


//**************************************************************
//      Class Declarations
//**************************************************************

class Post {
    constructor(date, time, description, category) {
        this.postID
        this.date = date;
        this.time = time;
        this.description = description;
        this.category = category;
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
};

// Create and store new post
const createPost = (event) => {
    // Prevent form from actually submitting
    event.preventDefault();

    // Get values from DOM
    let date = activityDate.value;
    let time = activityTime.value;
    let description = activityDesc.value;
    let category = activityCategory.value;

    // Create and store new post
    let newPost = new Post(date, time, description, category);
    newPost.storePost();

    //Refresh posts table
    showPosts();

    // Clear inputs
    clearInputs();
}

// Update post
const updatePost = (event) => {
    // Prevent form from actually submitting
    event.preventDefault();

    // Get values from DOM
    postArray[updateIndex].date = updateDate.value;
    postArray[updateIndex].time = updateTime.value;
    postArray[updateIndex].description = updateDesc.value;
    postArray[updateIndex].category = updateCategory.value;

    // Refresh to display changes
    showPosts();

    // Close update modal
    closeModals();
}

const addBtnListeners = () => {
    let deleteBtns = document.getElementsByClassName('deleteBtn');
    let updateBtns = document.getElementsByClassName('updateBtn');
    
    for(let i = 0; i < deleteBtns.length; i++) {
        deleteBtns[i].addEventListener('click', (event) => {
            // Get array index of post to delete
            deleteIndex = parseInt(event.target.id.split('deleteBtn')[1]);

            // Delete post
            postArray.splice(deleteIndex, 1);

            // Show all posts
            showPosts();
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
    activityDate.value = '';
    activityTime.value = '';
    activityDesc.value = '';
    activityCategory.value = '';
}

// Close modals
const closeModals = () => {
    // Update modal
    updateOverlay.style.display = 'none';
}

// Hide modals on clicking outside
const outsideClick = (event) => {
    if(event.target === updateOverlay){
        updateOverlay.style.display = 'none';
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

// When close button is clicked on a modal
closeBtn.addEventListener('click', closeModals);

// On clicking outside a modal
window.addEventListener('click', outsideClick);
