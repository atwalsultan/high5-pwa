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
const postList = document.getElementById('postList');

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

// Filter
const filterForm = document.getElementById('filter-form');

// Radius of the Earth in kms
const R = 6371;

// Logout button
const logoutBtn = document.getElementById('logoutBtn');

// Alerts
const alertDiv = document.getElementById('alerts');

//**************************************************************
//      Function Declarations
//**************************************************************

// Get user's position
const getUserPosition = () => {
    if('geolocation' in navigator) {
        navigator.geolocation.watchPosition(position => {
            userPos = position;
        }, undefined, {maximumAge: 60000}); // New position every minute
    }
    
    else {
        // Show message?
        console.log('Geolocation not available');
    }
}

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
        coordinates: new firebase.firestore.GeoPoint(latitude, longitude),
        uid: auth.currentUser.uid,
        timestamp: new firebase.firestore.FieldValue.serverTimestamp(),
        updated: new firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        // Show message
        showAlert(`New post created successfully!`, `success`);

    }).catch((err) => {
        // Show message
        showAlert(err.message, `error`);
    });

    // Clear form and close modal
    closeModals();
}

// Add event listeners to update and delete buttons
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

// Convert degrees to radians
const toRad = (degrees) => {
    return degrees * (Math.PI / 180);
}

// Calculate distance between 2 co-ordinates
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    let dLat = toRad(lat2 - lat1);
    let dLon = toRad(lon2 - lon1);

    let a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2);

    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return (R * c).toFixed(1);
};

// Create elements and render post
const renderPost = (doc) => {
    // Create elements to be rendered
    let li = document.createElement('li');
    let date = document.createElement('p');
    let time = document.createElement('p');
    let category = document.createElement('p');
    let description = document.createElement('p');

    // Set unique ID for each list item
    li.setAttribute('id', doc.id);

    // Set class names
    category.setAttribute('class', 'category');

    // Contents for each element
    date.textContent = doc.data().date;
    time.textContent = doc.data().time;
    category.textContent = doc.data().category;
    description.textContent = doc.data().description;

    // Append post data to list item element
    li.appendChild(date);
    li.appendChild(time);
    li.appendChild(category);
    li.appendChild(description);

    // Display distance if user's position is available
    if(userPos) {
        // Calculate distance
        let km = calculateDistance(doc.data().coordinates.latitude, doc.data().coordinates.longitude, userPos.coords.latitude, userPos.coords.longitude);

        // Create element
        let distance = document.createElement('p');
        distance.setAttribute('class', 'distance');
        distance.textContent = km;
        li.appendChild(distance);
    }

    // Add 'Update' and 'Delete' buttons only for posts owned by the user
    if(auth.currentUser.uid === doc.data().uid) {
        let updateBtn = document.createElement('button');
        let deleteBtn = document.createElement('button');

        updateBtn.textContent = `Update`;
        deleteBtn.textContent = `Delete`;

        // Add event listeners to buttons
        addButtonListeners(updateBtn, deleteBtn, doc);

        li.appendChild(updateBtn);
        li.appendChild(deleteBtn);
    }

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
    if(userPos && updateForm.updateLocation.checked) {// If user position is available and user has chosen to update it
        updateObj.coordinates = new firebase.firestore.GeoPoint(userPos.coords.latitude, userPos.coords.longitude)
        console.log();
    }
    updateObj.updated = new firebase.firestore.FieldValue.serverTimestamp();

    // Updating document in collection
    db.collection('posts').doc(updateId).update(updateObj).then(() => {
        // Show message
        showAlert(`Post updated successfully!`, `success`);

    }).catch((err) => {
        // Show message
        showAlert(err.message, `error`);
    });

    // Clear form and close modal
    closeModals();
}

// Delete post
const deletePost = () => {
    // Delete document from collection
    db.collection('posts').doc(deleteId).delete().then(() => {
        // Show message
        showAlert(`Post deleted successfully`, `success`)

    }).catch((err) => {
        // Show message
        showAlert(err.message, `error`);
    });

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

// Log the user out or show error message 
const logUserOut = () => {
    auth.signOut().catch((error) => {
        // Show message
        showAlert(error.message, `error`);
    });
}

// Filter by category or distance
const filter = (event) => {
    // Prevent form from actually submitting
    event.preventDefault();

    // Categories
    let filterCategories = [];

    // Get filter categories
    filterForm.querySelectorAll('input[type="checkbox"]:checked').forEach((category) => {
        filterCategories.push(category.value);
    });

    if(filterCategories.length === 0) {
        showAlert(`You did not select any filter category. Please try again`, `error`);
        return;
    }

    // Distance
    let distance = parseInt(filterForm.distance.value);

    // Filter by category or distance
    document.querySelectorAll('#postList li').forEach((post) => {
        // Get category and distance of post
        let postCategory = post.querySelector('.category').textContent;
        let postDistance = parseFloat(post.querySelector('.distance').textContent);

        // Hide or show post as necessary
        if(!filterCategories.includes(postCategory) || postDistance > distance) {
            post.style.display = 'none';
        }
        else {
            post.style.display = 'list-item';
        }
    });
}

// Show alerts
const showAlert = (content, type) => {
    // Create element to show message
    let alertContent = document.createElement('p');

    // Put contents of the message into element
    alertContent.textContent = content;

    // Prepend element to alert div
    alertDiv.prepend(alertContent);

    // Background colors
    if (type === 'success') {
        alertDiv.style.backgroundColor = `rgba(0, 200, 0, 0.4)`;
    }
    else if (type === 'error') {
        alertDiv.style.backgroundColor = `rgba(200, 0, 0, 0.4)`
    }

    // Slide alert div down
    alertDiv.style.top = "1rem";

    // Push alert div back up after 3 seconds
    setTimeout(() => {
        alertDiv.style.top = "-5rem";
    }, 3000);

    // Clear contents of alert div once it goes back up
    setTimeout(() => {
        alertContent.textContent = "";
    }, 3500);
}

//**************************************************************
//      Event Listeners
//**************************************************************

// On page load
document.addEventListener('DOMContentLoaded', () => {
    // Get user's position
    getUserPosition();

    // Firestore real time listener
    db.collection('posts').orderBy("updated", "asc").onSnapshot((snapshot) => {
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
    }, (err) => {
        // Show message
        showAlert(err.message, `error`);
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
logoutBtn.addEventListener('click', logUserOut);

// Filter by category or distance
filterForm.addEventListener('submit', filter);
