//**************************************************************
//**************************************************************
//      High5 PWA
//**************************************************************
//**************************************************************


//**************************************************************
//      Root Scope Variable Declarations
//**************************************************************
// Create functionality
const postForm = document.getElementById("postForm");
const activityDate = document.getElementById("activityDate");
const activityTime = document.getElementById("activityTime");
const activityDesc = document.getElementById("activityDesc");
const activityCategory = document.getElementById("activityCategory");
const createBtn = document.getElementById('createBtn');
const createOverlay = document.getElementById('createOverlay');

// Read functionality
const postList = document.getElementById('post-list');

// Update functionality
let updateIndex;
const updateForm = document.getElementById('updateForm');
const updateDate = document.getElementById('updateDate');
const updateTime = document.getElementById('updateTime');
const updateDesc = document.getElementById('updateDesc');
const updateCategory = document.getElementById('updateCategory');
const updateOverlay = document.getElementById('updateOverlay');

// Delete functionality
let deleteIndex;
const confirmDelete = document.getElementById('confirmDelete');
const deleteOverlay = document.getElementById('deleteOverlay');

// 'X' buttons to close modals
const closeBtns = document.querySelectorAll('.closeBtn');

// To store user's position object
let userPos;

//**************************************************************
//      Function Declarations
//**************************************************************

// Create and store new post
const createPost = (event) => {
    // Prevent form from actually submitting
    event.preventDefault();

    let date;
    let time;
    let latitude;
    let longitude;

    // Get values from DOM
    activityDate.value === "" ? date = "Unspecified" : date = activityDate.value; // date = 'Unspedified' if user leaves it empty
    activityTime.value === "" ? time = "Unspecified" : time = activityTime.value; // time = 'Unspedified' if user leaves it empty
    let description = activityDesc.value;
    let category = activityCategory.value;
    userPos ? latitude = userPos.coords.latitude : latitude = ""; // latitude = '' if the user position is not available
    userPos ? longitude = userPos.coords.longitude : longitude = ""; // longitude = '' if the user position is not available

    // Add post as document to collection
    db.collection('posts').add({
        date: date,
        time: time,
        category: category,
        description: description,
        latitude: latitude,
        longitude: longitude
    });

    // Clear inputs and close modal
    closeModals();
}

const addButtonListeners = (updateBtn, deleteBtn, doc) => {
    updateBtn.addEventListener('click', (event) => {
        // Get array index of post to update
        updateIndex = event.target.parentElement.getAttribute('id'); //doc.id??

        // Show update form
        updateOverlay.style.display = 'block';

        // Populate form with existing post data
        updateDate.value = doc.data().date;
        updateTime.value = doc.data().time;
        updateDesc.value = doc.data().description;
        updateCategory.value = doc.data().category;
    })

    deleteBtn.addEventListener('click', (event) => {
        // Get array index of post to delete
        deleteIndex = event.target.parentElement.getAttribute('id'); //doc.id??

        // Show confirmation modal
        deleteOverlay.style.display = 'block';
    });
}

// Create elements and render post
const renderPost = (doc) => {
    // Create elements to be rendered
    let li = document.createElement('li');
    let date = document.createElement('p');
    let time = document.createElement('p');
    let category = document.createElement('p');
    let description = document.createElement('p');
    let updateBtn = document.createElement('button');
    let deleteBtn = document.createElement('button');

    // Set unique ID for each list item
    li.setAttribute('id', doc.id);

    // Contents for each element
    date.textContent = doc.data().date;
    time.textContent = doc.data().time;
    category.textContent = doc.data().category;
    description.textContent = doc.data().description;
    updateBtn.textContent = `Update`;
    deleteBtn.textContent = `Delete`;

    // Add event listeners to buttons
    addButtonListeners(updateBtn, deleteBtn, doc);

    // Append post data to list item element
    li.appendChild(date);
    li.appendChild(time);
    li.appendChild(category);
    li.appendChild(description);
    li.appendChild(updateBtn);
    li.appendChild(deleteBtn);

    // Prepend list item to list
    postList.prepend(li);
};

// Update post
const updatePost = (event) => {
    // Prevent form from actually submitting
    event.preventDefault();

    let updateObj = {};

    // Populating update object
    updateDate.value === "" ? updateObj.date = 'Unspecified' : updateObj.date = updateDate.value; // date = 'Unspedified' if user leaves it empty
    updateTime.value === "" ? updateObj.time = 'Unspecified' : updateObj.time = updateTime.value; // time = 'Unspedified' if user leaves it empty
    updateObj.category = updateCategory.value;
    updateObj.description = updateDesc.value;
    if(userPos) { // TODO: Add a checkbox in DOM to choose if users want to update the position or use the pre-existing position?
        updateObj.latitude = userPos.coords.latitude;
        updateObj.longitude = userPos.coords.longitude;
    }

    // Updating document in collection
    db.collection('posts').doc(updateIndex).update(updateObj);

    // Clear form and close modal
    closeModals();
}

// Delete post
const deletePost = () => {
    // Delete document from collection
    db.collection('posts').doc(deleteIndex).delete();

    // Close modal
    closeModals();
}

// Close modals
const closeModals = () => {

    // Clear inputs
    activityDate.value = '';
    activityTime.value = '';
    activityDesc.value = '';
    activityCategory.value = 'Category A';
    updateDate.value = '';
    updateTime.value = '';
    updateDesc.value = '';
    updateCategory.value = 'Category A';

    // Close modals
    createOverlay.style.display = 'none';
    updateOverlay.style.display = 'none';
    deleteOverlay.style.display = 'none';
}

// Close modals on clicking outside
const outsideClick = (event) => {
    if(event.target === updateOverlay || event.target === deleteOverlay || event.target === createOverlay) {

        // Clear form and close modal
        closeModals();
    }
}

// Get user's position
const getUserPosition = () => {
    if('geolocation' in navigator) {
        navigator.geolocation.watchPosition(position => {
            userPos = position;
            console.log(userPos);
        }, undefined, {maximumAge: 60000}); // New position every minute
    }
    
    else {
        console.log('Geolocation not available');
    }
}

//**************************************************************
//      Event Listeners
//**************************************************************

// On page load
document.addEventListener('DOMContentLoaded', () => {
    // Get user's position
    getUserPosition();

    // Real time listener
    db.collection('posts').onSnapshot((snapshot) => {
        let changes = snapshot.docChanges();
        changes.forEach((change) => {
            // Create functionality
            if(change.type === 'added') {
                renderPost(change.doc);
            }
            // Update functionality
            else if (change.type === 'modified') {
                let li = document.getElementById(change.doc.id);
                postList.removeChild(li);
                renderPost(change.doc);
            }
            // Delete functionality
            else if (change.type === 'removed') {
                // Add updated post to the top 
                let li = document.getElementById(change.doc.id);
                postList.removeChild(li);
            }
        });
    })
});

// Create form submission
postForm.addEventListener('submit', createPost);

// Update form submission
updateForm.addEventListener('submit', updatePost);

// Delete button on confirmation modal
confirmDelete.addEventListener('click', deletePost);

// 'X' button on modals
for(let i = 0; i<closeBtns.length; i++) {
    closeBtns[i].addEventListener('click', closeModals);
}

// Click outside modal
window.addEventListener('click', outsideClick);

// New post button
createBtn.addEventListener('click', () => {
    createOverlay.style.display = 'block'
});
