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
const createBtn = document.getElementById('createBtn');
const createOverlay = document.getElementById('createOverlay');

// Read functionality
const postList = document.getElementById('post-list');

// Update functionality
let updateId;
const updateForm = document.getElementById('updateForm');
const updateOverlay = document.getElementById('updateOverlay');

// Delete functionality
let deleteId;
const confirmDelete = document.getElementById('confirmDelete');
const deleteOverlay = document.getElementById('deleteOverlay');

// 'X' buttons to close modals
const closeBtns = document.querySelectorAll('.closeBtn');

// To store user's position object
let userPos;

let logoutBtn = document.getElementById('logoutBtn');

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
    postForm.activityDate.value === "" ? date = "Unspecified" : date = postForm.activityDate.value; // date = 'Unspedified' if user leaves it empty
    postForm.activityTime.value === "" ? time = "Unspecified" : time = postForm.activityTime.value; // time = 'Unspedified' if user leaves it empty
    let description = postForm.activityDesc.value;
    let category = postForm.activityCategory.value;
    userPos ? latitude = userPos.coords.latitude : latitude = 0; // latitude = '' if the user position is not available
    userPos ? longitude = userPos.coords.longitude : longitude = 0; // longitude = '' if the user position is not available

    // Add post as document to collection
    db.collection('posts').add({
        date: date,
        time: time,
        category: category,
        description: description,
        coordinates: new firebase.firestore.GeoPoint(latitude, longitude)
    });

    // Clear form and close modal
    closeModals();
}

const addButtonListeners = (updateBtn, deleteBtn, doc) => {
    updateBtn.addEventListener('click', (event) => {
        // Get array index of post to update
        updateId = doc.id;

        // Show update form
        updateOverlay.style.display = 'block';

        // Populate form with existing post data
        updateForm.updateDate.value = doc.data().date;
        updateForm.updateTime.value = doc.data().time;
        updateForm.updateDesc.value = doc.data().description;
        updateForm.updateCategory.value = doc.data().category;
    })

    deleteBtn.addEventListener('click', (event) => {
        // Get array index of post to delete
        deleteId = doc.id;

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
    updateForm.updateDate.value === "" ? updateObj.date = 'Unspecified' : updateObj.date = updateForm.updateDate.value; // date = 'Unspedified' if user leaves it empty
    updateForm.updateTime.value === "" ? updateObj.time = 'Unspecified' : updateObj.time = updateForm.updateTime.value; // time = 'Unspedified' if user leaves it empty
    updateObj.category = updateForm.updateCategory.value;
    updateObj.description = updateForm.updateDesc.value;
    if(userPos) { // TODO: Add a checkbox in DOM to choose if users want to update the position or use the pre-existing position?
        updateObj.latitude = userPos.coords.latitude;
        updateObj.longitude = userPos.coords.longitude;
    }

    // Updating document in collection
    db.collection('posts').doc(updateId).update(updateObj);

    // Clear form and close modal
    closeModals();
}

// Delete post
const deletePost = () => {
    // Delete document from collection
    db.collection('posts').doc(deleteId).delete();

    // Close modal
    closeModals();
}

// Close modals
const closeModals = () => {

    // Clear forms
    postForm.reset();
    updateForm.reset();

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

// Log the user out or show error message
logoutBtn.addEventListener('click', () => {
    auth.signOut().then(() => {
        window.location.href = `../index.html`;
    }).catch((error) => {
        console.log(error.message);
    });
});
