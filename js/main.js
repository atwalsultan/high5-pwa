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

// logout modal 
const confirmLogout = document.getElementById('confirmLogout');
const logoutOverlay = document.getElementById('logoutOverlay');

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

// Sidebar
const sidebar = document.getElementById('sidebar');
const sidebarBtn = document.getElementById('sidebar-btn');

// Sections
let icons = document.querySelectorAll('footer .fas');
let sections = document.querySelectorAll('main > section');

// Chats
const chatOverlay = document.getElementById('chatOverlay');
const newMessage = document.getElementById('newMessage');
const previousMessages = document.getElementById('previousMessages');
let chatListener = null;

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

    let latitude;
    let longitude;
    let createObj = {};

    // Get values from DOM
    postForm.activityDate.value === "" ? createObj.date = "Unspecified" : createObj.date = postForm.activityDate.value; // date = 'Unspedified' if user leaves it empty
    postForm.activityTime.value === "" ? createObj.time = "Unspecified" : createObj.time = postForm.activityTime.value; // time = 'Unspedified' if user leaves it empty
    createObj.description = postForm.activityDesc.value;
    createObj.category = postForm.activityCategory.value;
    createObj.uid = auth.currentUser.uid;
    createObj.timestamp = new firebase.firestore.FieldValue.serverTimestamp();
    createObj.updated = new firebase.firestore.FieldValue.serverTimestamp();
    userPos ? latitude = userPos.coords.latitude : latitude = 0; // latitude = '' if the user position is not available
    userPos ? longitude = userPos.coords.longitude : longitude = 0; // longitude = '' if the user position is not available
    createObj.coordinates = new firebase.firestore.GeoPoint(latitude, longitude);

    // Add post as document to collection
    db.collection('posts').add(createObj).then(() => {
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

const createChatForm = (chat) => {
    // Create chat form
    let chatForm = document.createElement('form');
                        
    // Create input field 
    let messageInput = document.createElement('input');
    messageInput.setAttribute('type', 'text');
    messageInput.setAttribute('id', 'message');
    messageInput.setAttribute('required', 'required')

    // Create submit button
    let sendBtn = document.createElement('button');
    sendBtn.setAttribute('type', 'submit');
    sendBtn.textContent = 'Send';

    // Append input and button to form
    chatForm.append(messageInput);
    chatForm.append(sendBtn);

    // Add event listener to form
    chatForm.addEventListener('submit', (e) => {
        // Prevent form from actually submitting
        e.preventDefault();

        // Get contents of message
        let message = chatForm.message.value;

        // Create object to store
        let messageObj = {
            content: message,
            sender: auth.currentUser.uid,
            timestamp: new firebase.firestore.FieldValue.serverTimestamp(),
        }

        // Store object
        db.collection('chats').doc(chat.id).collection('messages').add(messageObj);

        chatForm.reset();
        chatForm.message.focus();
    });

    return chatForm;
};

const createChatListener = (chat) => {
    let listener = db.collection('chats').doc(chat.id).collection('messages').orderBy('timestamp', 'asc').onSnapshot((snapshot) => {
        let changes = snapshot.docChanges();
        changes.forEach((change) => {
            if(change.type === 'added') {
                // Create element
                let message = document.createElement('li');

                // Add content
                message.textContent = `${change.doc.data().content}`;

                // Add class
                message.classList.add('message');

                // Identify messages sent by logged in user
                if (change.doc.data().sender === auth.currentUser.uid) {
                    message.classList.add('my-message');
                }

                // Add to DOM
                previousMessages.append(message);
            }
        })

        // Scroll to bottom of chat
        let lastMessage = previousMessages.querySelector('li:last-of-type');
        lastMessage.scrollIntoView();
    });

    return listener;
};

// Create elements and render post
const renderPost = (doc) => {
    // Create elements to be rendered
    let li = document.createElement('li');
    let date = document.createElement('p');
    let time = document.createElement('p');
    let category = document.createElement('p');
    let description = document.createElement('p');
    let likeBtn = document.createElement('button');

    let dateTime = document.createElement('div');
    dateTime.classList.add('date-time');

    let categoryDistance = document.createElement('div');
    categoryDistance.classList.add('category-distance');

    let buttons = document.createElement('div');
    buttons.classList.add('buttons');

    // Set unique ID for each list item
    li.setAttribute('id', doc.id);

    // Set class names
    category.setAttribute('class', 'category');

    // Contents for each element
    date.textContent = `Expected Date: ${doc.data().date}`;
    time.textContent = `Expected Time: ${doc.data().time}`;
    category.textContent = `${doc.data().category}`;
    description.textContent = `Description: ${doc.data().description}`;
    likeBtn.textContent = 'High5!';

    // Append post data to list item element
    dateTime.appendChild(date);
    dateTime.appendChild(time);
    li.appendChild(dateTime);

    categoryDistance.appendChild(category);
    
    li.appendChild(categoryDistance);

    li.appendChild(description);

    buttons.appendChild(likeBtn);
    li.appendChild(buttons);

    // Display distance if user's position is available
    if(userPos) {
        // Calculate distance
        let km = calculateDistance(doc.data().coordinates.latitude, doc.data().coordinates.longitude, userPos.coords.latitude, userPos.coords.longitude);

        // Create element
        let distance = document.createElement('p');
        distance.setAttribute('class', 'distance');
        distance.textContent = `${km}`;
        categoryDistance.appendChild(distance);
    }

    // Add 'Update' and 'Delete' buttons only for posts owned by the user
    if(auth.currentUser.uid === doc.data().uid) {
        let updateBtn = document.createElement('button');
        let deleteBtn = document.createElement('button');

        updateBtn.textContent = `Update`;
        deleteBtn.textContent = `Delete`;

        // Add event listeners to buttons
        addButtonListeners(updateBtn, deleteBtn, doc);

        buttons.appendChild(updateBtn);
        buttons.appendChild(deleteBtn);
    }
    else {
        let chatBtn = document.createElement('button');
        
        chatBtn.textContent = 'Chat';

        chatBtn.addEventListener('click', (event) => {
            let postId = event.target.parentNode.id;

            // Fetch chat between logged in user and owner of post
            db.collection('chats').where(`members.${auth.currentUser.uid}`, '==', true).where(`members.${doc.data().uid}`, '==', true).get().then((querySnapshot) => {
                if(!querySnapshot.empty) { // If chat already exists
                    querySnapshot.forEach((chat) => {
                        // Create chat form
                        let chatForm = createChatForm(chat);

                        // Append form to div in DOM
                        newMessage.append(chatForm);

                        // Display previous messages from chat
                        chatListener = createChatListener(chat);

                        // Display chat modal
                        chatOverlay.style.display = 'block';

                        // Focus on input field
                        chatForm.message.focus();
                    });
                }
                else { // Create new chat if it doesn't exist
                    // Create users map
                    let usersObj = {};
                    usersObj[auth.currentUser.uid] = true;
                    usersObj[doc.data().uid] = true;

                    // Create chat
                    db.collection('chats').add({
                        members: usersObj,
                    }).then((chat) => {
                        // Create chat form
                        let chatForm = createChatForm(chat);

                        // Append form to div in DOM
                        newMessage.append(chatForm);

                        // Display previous messages from chat
                        chatListener = createChatListener(chat);

                        // Display chat modal
                        chatOverlay.style.display = 'block';

                        // Focus on input field
                        chatForm.message.focus();
                    });
                }
            });
        });

        buttons.appendChild(chatBtn);
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
    chatOverlay.style.display = 'none';
    newMessage.innerHTML = '';
    previousMessages.innerHTML = '';
    if(chatListener != null) {
        chatListener();
        chatListener = null;
    }
    logoutOverlay.style.display = 'none';
}

// Close modals on clicking outside
const outsideClick = (event) => {
    if(event.target === updateOverlay || event.target === deleteOverlay || event.target === createOverlay || event.target === chatOverlay || event.target ===logoutOverlay) {
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

    // // Categories
    // let filterCategories = [];

    // // Get filter categories
    // filterForm.querySelectorAll('input[type="checkbox"]:checked').forEach((category) => {
    //     filterCategories.push(category.value);
    // });

    // if(filterCategories.length === 0) {
    //     showAlert(`You did not select any filter category. Please try again`, `error`);
    //     return;
    // }

    // Distance
    let distance = parseInt(filterForm.distance.value);

    // Filter by category or distance
    document.querySelectorAll('#postList li').forEach((post) => {
        // Get category and distance of post
        let postDistance = parseFloat(post.querySelector('.distance').textContent);

        // Hide or show post as necessary
        if(postDistance > distance) {
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

// Toggle sidebar
const toggleSidebar = () => {
    sidebar.classList.toggle('sidebar-hidden');
}

// Change sections
const changeSections = (index) => {
    sections.forEach((section) => {
        section.classList.add('section-hidden');
    });

    sections[index].classList.remove('section-hidden');
};

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


// Logout functionality
logoutBtn.addEventListener('click', (e) =>{
    logoutOverlay.style.display = 'block';
})

// Log the user out or show error message
confirmLogout.addEventListener('click', logUserOut);


// Filter by category or distance
filterForm.addEventListener('submit', filter);

// Toggle sidebar
sidebarBtn.addEventListener('click', toggleSidebar);

// Change sections
icons.forEach((icon, index) => {
    icon.addEventListener('click', () => {
        changeSections(index);
    });
});

// On category filter click
sidebar.querySelectorAll('input[type="checkbox"]').forEach((category) => {
    category.addEventListener('change', (event) => {
        let checked = sidebar.querySelectorAll('input[type="checkbox"]:checked');

        if(checked.length === 0) {
            // Display all posts
            document.querySelectorAll('#postList li').forEach((post) => {
                post.style.display = 'flex';
            });
        }
        else {
            let checkedCategories = [];

            checked.forEach((category) => {
                checkedCategories.push(category.value);
            });

            document.querySelectorAll('#postList li').forEach((post) => {
                if (checkedCategories.includes(post.querySelector('.category').textContent)) {
                    post.style.display = 'flex';
                }
                else {
                    post.style.display = 'none';
                }
            });
        }
    });
});
