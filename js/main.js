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
const sidebarOverlay = document.getElementById('sidebarOverlay');

// Sections
let icons = document.querySelectorAll('footer li button');
let sections = document.querySelectorAll('main > section');

// Chats
const chatOverlay = document.getElementById('chatOverlay');
const newMessage = document.getElementById('newMessage');
const previousMessages = document.getElementById('previousMessages');
let chatListener = null;
const chatUserName = document.getElementById('chatUserName');
const chatList = document.getElementById('chatList');

const newPostImage = document.getElementById('newPostImage');
const canvas = document.querySelector('#canvas');
const context = canvas.getContext("2d");
const videoElement = document.querySelector('#video');
const uploadButton = document.getElementById('uploadButton');
const flipButton = document.getElementById('flipButton')
const snapButton = document.getElementById('snapButton');
const uploadPhoto = document.getElementById('uploadPhoto');
const cameraOverlay = document.getElementById('cameraOverlay');
let blobToUpload = null;

const newUpdateImageBtn = document.getElementById('newUpdateImage');

const profileInfo = document.getElementById('profileInfo');

//**************************************************************
//      Function Declarations
//**************************************************************

// Get user's position
const getUserPosition = () => {
    if ('geolocation' in navigator) {
        navigator.geolocation.watchPosition(position => {
            userPos = position;
        }, undefined, { maximumAge: 60000 }); // New position every minute
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
    console.log(postForm.activityCategory.value);
    createObj.uid = auth.currentUser.uid;
    createObj.timestamp = new firebase.firestore.FieldValue.serverTimestamp();
    createObj.updated = new firebase.firestore.FieldValue.serverTimestamp();
    userPos ? latitude = userPos.coords.latitude : latitude = 0; // latitude = '' if the user position is not available
    userPos ? longitude = userPos.coords.longitude : longitude = 0; // longitude = '' if the user position is not available
    createObj.coordinates = new firebase.firestore.GeoPoint(latitude, longitude);

    // Add post as document to collection
    db.collection('posts').add(createObj)
        .then((post) => {
            let file = postForm.postImage.files[0];

            if (file) {
                let name = new Date() + '-' + file.name;
                let metaData = {
                    contentType: file.type,
                };

                let task = ref.child(name).put(file, metaData);
                task
                    .then(snapshot => {
                        snapshot.ref.getDownloadURL()
                            .then(url => {
                                updateObj = {
                                    photoURL: url,
                                };
                                db.collection('posts').doc(post.id).update(updateObj)
                                    .then(() => {
                                        // Show message
                                        showAlert(`New post created successfully!`, `success`);
                                    });
                            });
                    });
            }

            else if (blobToUpload != null) {
                let name = new Date() + '-';
                let metaData = {
                    contentType: blobToUpload.type,
                };

                let task = ref.child(name).put(blobToUpload, metaData);
                task
                    .then((snapshot) => {
                        snapshot.ref.getDownloadURL()
                            .then((url) => {
                                updateObj = {
                                    photoURL: url,
                                };
                                db.collection('posts').doc(post.id).update(updateObj)
                                    .then(() => {
                                        // Show message
                                        showAlert(`New post created successfully`, `success`);
                                    });
                            });
                    });

                blobToUpload = null;
            }

            else {
                // Show message
                showAlert(`New post created successfully!`, `success`);
            }

        })
        .catch((err) => {
            // Show message
            console.log(err);
        });

    // Clear form and close modal
    closeModal(createOverlay);
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

    let a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return (R * c).toFixed(1);
};

const createChatForm = (chat) => {
    // Create chat form
    let chatForm = document.createElement('form');

    // Create input field 
    let messageInput = document.createElement('input');
    messageInput.setAttribute('type', 'text');
    messageInput.setAttribute('id', 'message');
    messageInput.setAttribute('placeholder', 'Type your message here...');
    messageInput.setAttribute('required', 'required')

    // Create submit button
    let sendBtn = document.createElement('button');
    sendBtn.setAttribute('type', 'submit');
    let sendIcon = document.createElement('img');
    sendIcon.setAttribute('src', '../images/send-message-icon.svg');
    sendBtn.appendChild(sendIcon);

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
            if (change.type === 'added') {
                // Create element
                let message = document.createElement('li');
                let content = document.createElement('span');
                content.textContent = `${change.doc.data().content}`;
                message.append(content);

                let time = document.createElement('span');
                let dt = new Date(change.doc.data().timestamp * 1000);

                let hours = ('0' + dt.getHours()).slice(-2);
                let minutes = ('0' + dt.getMinutes()).slice(-2);
                time.textContent = hours + ': ' + minutes;
                message.append(time);

                // Add class
                message.classList.add('message');

                message.style.opacity = '0';
                message.style.marginTop = '4rem';

                // Identify messages sent by logged in user
                if (change.doc.data().sender === auth.currentUser.uid) {
                    message.classList.add('my-message');
                }

                // Add to DOM
                previousMessages.append(message);

                setTimeout(() => {
                    message.style.opacity = '1';
                    message.style.marginTop = '0';
                }, 200);
            }

            if (change.type === 'modified') {
                let lastMessageTime = previousMessages.querySelector('li:last-of-type > span:last-of-type');
                let dt = new Date(change.doc.data().timestamp * 1000);
                let hours = ('0' + dt.getHours()).slice(-2);
                let minutes = ('0' + dt.getMinutes()).slice(-2);
                lastMessageTime.textContent = hours + ': ' + minutes;
            }
        })

        // Scroll to bottom of chat
        let lastMessage = previousMessages.querySelector('li:last-of-type');
        if (lastMessage) {
            lastMessage.scrollIntoView();
        }
    });

    return listener;
};

// Create elements and render post
const renderPost = (doc) => {

    // Create elements to be rendered

    // Outermost container for the post
    let li = document.createElement('li');
    li.setAttribute('id', doc.id);
    postList.appendChild(li); // Append to post list

    // Container for profile picture
    let profilePicDiv = document.createElement('div');
    profilePicDiv.classList.add('profile-pic-div');
    li.appendChild(profilePicDiv); // Append to container

    // Profile picture
    let profilePic = document.createElement('img');
    profilePicDiv.appendChild(profilePic);
    db.collection('users').doc(doc.data().uid).get().then((user) => {
        // Set source
        profilePic.setAttribute('src', user.data().photoURL);
    });

    // Container for post content and buttons
    let postDiv = document.createElement('div');
    postDiv.classList.add('post-div');
    li.appendChild(postDiv); // Append to container

    // Container for user name, distance and time of post
    let nameDistanceTime = document.createElement('div');
    nameDistanceTime.classList.add('name-distance-time');
    postDiv.appendChild(nameDistanceTime); // Append to container

    // User name
    let name = document.createElement('p');
    name.textContent = `Anonymous User`; // Set generic name
    db.collection('users').doc(doc.data().uid).get().then((user) => {
        name.textContent = user.data().name; // Set actual name
    });
    nameDistanceTime.appendChild(name);

    // Display distance if user's position is available
    if (userPos) {
        // Calculate distance
        let km = calculateDistance(doc.data().coordinates.latitude, doc.data().coordinates.longitude, userPos.coords.latitude, userPos.coords.longitude);

        // Icon and distance container
        let distanceSpan = document.createElement('span');

        // Icon
        let icon = document.createElement('img');
        icon.setAttribute('src', '../images/location-icon.svg');

        // Distance
        let distance = document.createElement('p');
        distance.setAttribute('class', 'distance');
        distance.textContent = `${km} km`;

        distanceSpan.appendChild(icon);
        distanceSpan.appendChild(distance);

        nameDistanceTime.appendChild(distanceSpan);
    }

    // Time since creation
    let timeCreated = document.createElement('p');
    timeCreated.textContent = '2d';
    nameDistanceTime.appendChild(timeCreated);

    // Description
    let description = document.createElement('p');
    description.textContent = `${doc.data().description}`;
    postDiv.appendChild(description); // Append to container

    // Add post image if it exists
    if (doc.data().photoURL) {
        let img = document.createElement('img');
        img.setAttribute('src', doc.data().photoURL); // Set source
        postDiv.appendChild(img); // Append to container
    }

    // Container for category icon and text
    let categoryDiv = document.createElement('div');
    categoryDiv.setAttribute('id', 'categoryDiv');

    // Icon
    let categoryIcon = document.createElement('img');
    categoryIcon.setAttribute('src', '../images/category-icon.svg');
    categoryDiv.appendChild(categoryIcon);

    // Category
    let category = document.createElement('span');
    category.setAttribute('class', 'category');
    category.textContent = `Category: ${doc.data().category}`;
    categoryDiv.appendChild(category);

    // Check if category has been provided
    if (doc.data().category !== 'Unspecified') {
        postDiv.appendChild(categoryDiv); // Append to container
    }

    // Container for expected date and time
    let dateTimeDiv = document.createElement('div');
    dateTimeDiv.setAttribute('id', 'dateTimeDiv');

    // Calendar icon for date and time
    let dateTimeIcon = document.createElement('img');
    dateTimeIcon.setAttribute('src', '../images/calendar-icon.svg');
    dateTimeDiv.appendChild(dateTimeIcon); // Append to container

    // Date and time
    let dateTime = document.createElement('span');

    // Check if any values have not been provided
    if (doc.data().date === "Unspecified" && doc.data().time !== "Unspecified") {
        dateTime.textContent = `Expected Date & Time: ${doc.data().time}`;
        dateTimeDiv.appendChild(dateTime); // Append to container
        postDiv.appendChild(dateTimeDiv); // Append to container

    }
    else if (doc.data().date !== "Unspecified" && doc.data().time === "Unspecified") {
        dateTime.textContent = `Expected Date & Time: ${doc.data().date}`;
        dateTimeDiv.appendChild(dateTime); // Append to container
        postDiv.appendChild(dateTimeDiv); // Append to container

    }
    else if (doc.data().date !== "Unspecified" && doc.data().time !== "Unspecified") {
        dateTime.textContent = `Expected Date & Time: ${doc.data().date} | ${doc.data().time}`;
        dateTimeDiv.appendChild(dateTime); // Append to container
        postDiv.appendChild(dateTimeDiv); // Append to container
    }

    // Container for buttons
    let buttons = document.createElement('div');
    buttons.classList.add('buttons');
    postDiv.appendChild(buttons); // Append to container

    // Container for like icon and button
    let likeBtn = document.createElement('button');
    buttons.appendChild(likeBtn); // Append to container

    // Icon
    let likeIcon = document.createElement('img');
    likeIcon.setAttribute('src', '../images/high5-icon.svg');
    likeBtn.appendChild(likeIcon);

    // Text
    let likeText = document.createElement('span');
    likeText.textContent = `High5!`;
    likeBtn.appendChild(likeText);

    // Event listener for like button
    likeBtn.addEventListener('click', (e) => {
        likeBtn.classList.toggle('active'); // Add active class
        let url = likeBtn.querySelector('img').src.split('/images/')[1]; // Get url of current icon

        // Toggle icon
        if (url === "high5-icon.svg") {
            likeBtn.querySelector('img').src = `../images/high5-icon-active.svg`;
        }
        else if (url === "high5-icon-active.svg") {
            likeBtn.querySelector('img').src = `../images/high5-icon.svg`;
        }
    });

    // Add 'Update' and 'Delete' buttons only for posts owned by the user
    if (auth.currentUser.uid === doc.data().uid) {
        let updateBtn = document.createElement('button');
        let updateIcon = document.createElement('img');
        updateIcon.setAttribute('src', '../images/update-icon.svg');
        let updateText = document.createElement('span');
        updateText.textContent = `Update`;
        updateBtn.append(updateIcon)
        updateBtn.append(updateText);

        let deleteBtn = document.createElement('button');
        let deleteIcon = document.createElement('img');
        deleteIcon.setAttribute('src', '../images/delete-icon.svg');
        let deleteText = document.createElement('span');
        deleteText.textContent = `Delete`
        deleteBtn.append(deleteIcon);
        deleteBtn.append(deleteText);

        // Add event listeners to buttons
        addButtonListeners(updateBtn, deleteBtn, doc);

        buttons.appendChild(updateBtn);
        buttons.appendChild(deleteBtn);
    }
    else {
        let chatBtn = document.createElement('button');
        let chatIcon = document.createElement('img');
        chatIcon.setAttribute('src', '../images/send-message-icon-2.svg');
        let chatText = document.createElement('span');
        chatText.textContent = `Chat`;
        chatBtn.appendChild(chatIcon);
        chatBtn.appendChild(chatText);

        chatBtn.addEventListener('click', () => {
            // Fetch chat between logged in user and owner of post
            db.collection('chats').where(`members.${auth.currentUser.uid}`, '==', true).where(`members.${doc.data().uid}`, '==', true).get()
                .then((querySnapshot) => {
                    if (!querySnapshot.empty) { // If chat already exists
                        querySnapshot.forEach((chat) => {
                            // Create chat form
                            let chatForm = createChatForm(chat);

                            // Get user's name
                            db.collection('users').doc(doc.data().uid).get()
                                .then((user) => {
                                    chatUserName.innerText = user.data().name;
                                });

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
                        })
                            .then((chat) => {
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
    if (userPos && updateForm.updateLocation.checked) {// If user position is available and user has chosen to update it
        updateObj.coordinates = new firebase.firestore.GeoPoint(userPos.coords.latitude, userPos.coords.longitude)
    }
    updateObj.updated = new firebase.firestore.FieldValue.serverTimestamp();


    // Updating document in collection
    db.collection('posts').doc(updateId).update(updateObj)
        .then(() => {
            let file = updateForm.updatePostImage.files[0];
            if (file) {

                db.collection('posts').doc(updateId).get()
                    .then((post) => {
                        photoURL = post.data().photoURL;

                        let httpsReference = firebase.storage().refFromURL(photoURL);
                        httpsReference.delete()
                            .then(() => {
                                let name = new Date() + '-' + file.name;
                                let metaData = {
                                    contentType: file.type,
                                }

                                let task = ref.child(name).put(file, metaData);
                                task
                                    .then(snapshot => {
                                        snapshot.ref.getDownloadURL()
                                            .then(url => {
                                                updateObj = {
                                                    photoURL: url,
                                                }
                                                db.collection('posts').doc(updateId).update(updateObj)
                                                    .then(() => {
                                                        // Show message
                                                        showAlert(`Post updated successfully!`, `success`);
                                                    });
                                            });
                                    });
                            });
                    });
            }
            else {
                // Show message
                showAlert(`Post updated successfully!`, `success`);
            }

        })
        .catch((err) => {
            // Show message
            showAlert(err.message, `error`);
        });

    // Clear form and close modal
    closeModal(updateOverlay);
};

// Delete post
const deletePost = () => {
    // Delete document from collection
    db.collection('posts').doc(deleteId).delete()
        .then(() => {
            // Show message
            showAlert(`Post deleted successfully`, `success`)

        })
        .catch((err) => {
            // Show message
            showAlert(err.message, `error`);
        });

    // Close modal
    closeModal(deleteOverlay);
};

// Close modals on clicking outside
const closeModal = (overlay) => {

    switch (overlay) {
        case updateOverlay:
            updateForm.reset(); // Reset form in modal
            updateOverlay.style.display = 'none';  // Close modal
            break;

        case deleteOverlay:
            deleteOverlay.style.display = 'none'; // Close modal
            break;

        case createOverlay:
            postForm.reset(); // Reset form in modal
            createOverlay.style.display = 'none'; // Close modal
            break;

        case chatOverlay:
            chatOverlay.style.display = 'none'; // Close modal

            // Remove new message form and chat history from modal
            newMessage.innerHTML = '';
            previousMessages.innerHTML = '';

            // Remove real time listener for chat messages
            if (chatListener != null) {
                chatListener();
                chatListener = null;
            }
            break;

        case logoutOverlay:
            logoutOverlay.style.display = 'none'; // Close modal
            break;

        case cameraOverlay:
            cameraOverlay.style.display = 'none'; // Close modal
            uploadPhoto.innerHTML = ``; // Clear any photo that might have been selected
            blobToUpload = null; // Remove any photo that was selected but not uploaded

            // Stop live video and prepare canvas for next time the modal opens
            videoElement.srcObject.getVideoTracks().forEach(track => track.stop());
            context.clearRect(0, 0, canvas.width, canvas.height);

            canvas.style.display = 'none'; // Close modal
            uploadButton.style.display = 'none'; // Hide upload button until photo is captured
            break;

        case sidebar:
            sidebar.classList.add('sidebar-hidden');

            setTimeout(() => {
                sidebarOverlay.style.display = 'none';
            }, 500);

            break;
    }
}

const outsideClick = (event) => {
    // Get overlay that has open modal
    let target = event.target;

    switch (target) {
        case updateOverlay:
            // Close modal
            closeModal(updateOverlay);
            break;

        case deleteOverlay:
            // Close modal
            closeModal(deleteOverlay);
            break;

        case createOverlay:
            // Close modal
            closeModal(createOverlay);
            break;

        case chatOverlay:
            // Close modal
            closeModal(chatOverlay);
            break;

        case logoutOverlay:
            // Close modal
            closeModal(logoutOverlay);
            break;

        case cameraOverlay:
            // Close modal
            closeModal(cameraOverlay);
            break;

        case sidebarOverlay:
            // Close sidebar
            closeModal(sidebar);
            break;
    }
};

// Log the user out or show error message 
const logUserOut = () => {
    auth.signOut()
        .catch((error) => {
            // Show message
            showAlert(error.message, `error`);
        });
};

// Filter by category or distance
const filter = (event) => {
    // Prevent form from actually submitting
    event.preventDefault();

    // Distance
    let distance = parseInt(filterForm.distance.value);

    // Filter by category or distance
    document.querySelectorAll('#postList li').forEach((post) => {
        // Get category and distance of post
        let postDistance = parseFloat(post.querySelector('.distance').textContent);

        // Hide or show post as necessary
        if (postDistance > distance) {
            post.style.display = 'none';
        }
        else {
            post.style.display = 'flex';
        }
    });
};

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
        alertDiv.style.border = `1px solid #4BB543`;
        alertDiv.style.backgroundColor = `#ECFFEB`;
    }
    else if (type === 'error') {
        alertDiv.style.border = `1px solid #FF0000`
        alertDiv.style.backgroundColor = `#FFD6D6`;
    }

    // Slide alert div down
    alertDiv.style.top = ".5rem";

    // Push alert div back up after 3 seconds
    setTimeout(() => {
        alertDiv.style.top = "-5rem";
    }, 3000);

    // Clear contents of alert div once it goes back up
    setTimeout(() => {
        alertContent.textContent = "";
    }, 3500);
};

// Toggle sidebar
const toggleSidebar = () => {
    sidebarOverlay.style.display = 'block'

    setTimeout(() => {
        sidebar.classList.remove('sidebar-hidden');
    }, 150);
};

// Change sections
const changeSections = (index) => {
    // Hide all sections
    sections.forEach((section) => {
        section.classList.add('section-hidden');
    });

    // Reset all footer icons to normal
    icons.forEach((icon) => {
        icon.classList.remove('footer-btn-active');
    });

    // Show relevant section
    sections[index].classList.remove('section-hidden');

    // Activate relevant footer icon
    icons[index].classList.add('footer-btn-active');
    let icon = icons[index].querySelector('img');

    switch (index) {
        case 0:
            icons[0].querySelector('img').src = "../images/home-icon-active.svg";
            icons[1].querySelector('img').src = "../images/notification-icon.svg";
            icons[2].querySelector('img').src = "../images/message-icon.svg";
            icons[3].querySelector('img').src = "../images/profile-icon.svg";
            break;

        case 1:
            icons[0].querySelector('img').src = "../images/home-icon.svg";
            icons[1].querySelector('img').src = "../images/notification-icon-active.svg";
            icons[2].querySelector('img').src = "../images/message-icon.svg";
            icons[3].querySelector('img').src = "../images/profile-icon.svg";
            break;

        case 2:
            icons[0].querySelector('img').src = "../images/home-icon.svg";
            icons[1].querySelector('img').src = "../images/notification-icon.svg";
            icons[2].querySelector('img').src = "../images/message-icon-active.svg";
            icons[3].querySelector('img').src = "../images/profile-icon.svg";
            break;

        case 3:
            icons[0].querySelector('img').src = "../images/home-icon.svg";
            icons[1].querySelector('img').src = "../images/notification-icon.svg";
            icons[2].querySelector('img').src = "../images/message-icon.svg";
            icons[3].querySelector('img').src = "../images/profile-icon-active.svg";
            break;
    }
};

// Create elements and render chat
const renderChat = (doc, uids) => {
    uids.forEach((uid) => {
        if (uid != auth.currentUser.uid) {
            db.collection('users').doc(uid).get()
                .then((user) => {
                    let li = document.createElement('li');

                    let picture = document.createElement('img');
                    picture.setAttribute('src', user.data().photoURL);


                    let contentDiv = document.createElement('div');
                    let userName = document.createElement('p');

                    let name = user.data().name;
                    userName.textContent = name;
                    contentDiv.append(userName);

                    let time = document.createElement('span');

                    let lastMessage = document.createElement('p');
                    lastMessage.innerHTML = '<span>No messages yet.</span>';
                    contentDiv.append(lastMessage);

                    doc.ref.collection('messages').orderBy("timestamp", "desc").limit(1).get()
                        .then((snapshot) => {
                            snapshot.forEach((message) => {
                                lastMessage.textContent = message.data().content;
                                contentDiv.append(lastMessage);

                                let dt = new Date(message.data().timestamp * 1000);
                                let hours = ('0' + dt.getHours()).slice(-2);
                                let minutes = ('0' + dt.getMinutes()).slice(-2);
                                time.textContent = hours + `: ` + minutes;
                            });
                        });

                    // Set unique ID for each list item
                    li.setAttribute('id', `ch-${doc.id}`);
                    li.append(picture);
                    li.append(contentDiv);
                    li.append(time);

                    li.addEventListener('click', () => {
                        let userId;

                        // Create chat form
                        let chatForm = createChatForm(doc);

                        // Get user's name
                        uids.forEach((uid) => {
                            if (uid !== auth.currentUser.uid) {
                                userId = uid;
                            }
                        });

                        db.collection('users').doc(userId).get()
                            .then((user) => {
                                chatUserName.innerText = user.data().name;
                            });

                        // Append form to div in DOM
                        newMessage.append(chatForm);

                        // Display previous messages from chat
                        chatListener = createChatListener(doc);

                        // Display chat modal
                        chatOverlay.style.display = 'block';

                        // Focus on input field
                        chatForm.message.focus();
                    })

                    chatList.prepend(li);
                });
        }
    });
};

// On file input field change
const newFileImage = () => {
    // Remove live image blob if it was created previously
    blobToUpload = null;

    // Create img element and set it's source
    let image = new Image();
    let fr = new FileReader();
    fr.onload = () => {
        image.src = fr.result;
    }

    if (createOverlay.style.display !== 'none') {
        // Get image url
        fr.readAsDataURL(postImage.files[0]);

        // Render uploaded image in DOM
        uploadPhoto.innerHTML = ``;
        uploadPhoto.append(image);
    }
    else if (updateOverlay.style.display !== 'none') {
        // Get image url
        fr.readAsDataURL(updatePostImage.files[0]);

        // Render uploaded image in DOM
        updateUploadPhoto.innerHTML = ``;
        updateUploadPhoto.append(image);
    }
}

// On upload image button click
const uploadImage = () => {
    canvas.toBlob((blob) => {
        // Create img element to render in DOM
        let image = new Image();
        image.src = window.URL.createObjectURL(blob);

        // Remove any files added in input field
        postForm.postImage.value = ``;

        // Render image in DOM
        uploadPhoto.innerHTML = ``;
        uploadPhoto.append(image);

        // Set blob for image that will be uploaded when post is created
        blobToUpload = blob;

        // Hide and refresh camera overlay for next time
        cameraOverlay.style.display = 'none';
        canvas.style.display = 'none';
        uploadButton.style.display = 'none';

        // Remove event listener from upload button
        uploadButton.removeEventListener('click', uploadImage);
    });
}

// On snap image button click
const snapImage = () => {
    // Hide video and snap button and show canvas and upload button
    canvas.style.display = 'block';
    uploadButton.style.display = 'block';
    videoElement.style.display = 'none';
    snapButton.style.display = 'none';
    flipButton.style.display = 'none';
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(videoElement, 0, 0, 640, 480);

    // Stop live video stream
    videoElement.srcObject.getVideoTracks().forEach(track => track.stop());

    // Add event listener to upload button
    uploadButton.addEventListener('click', uploadImage);

    // Remove event listener from snap button
    snapButton.removeEventListener('click', snapImage);
}

// Capture and add new image
const addNewImage = (e) => {
    // Prevent form from actually submitting
    e.preventDefault();

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {

        // Toggle between front and back camera when possible
        let front = false;
        flipButton.addEventListener('click', () => {
            front = !front;
        });

        // Display live stream in DOM
        navigator.mediaDevices.getUserMedia({ video: true })
            .then((stream) => {
                // Decide source of video element
                videoElement.srcObject = stream;

                // Play video element
                videoElement.play();
            })
            .catch((err) => {
                // Show message
                showAlert(err.message, `error`);
            });

        // Display camera overlay and child elements
        cameraOverlay.style.display = 'block';
        videoElement.style.display = 'block';
        snapButton.style.display = 'block';
        flipButton.style.display = 'block';

        // On snap button click
        snapButton.addEventListener('click', snapImage);
    }
    else {
        // Show message
        showAlert(`Camera not available`, `error`);
    }
}

// Render a user's profile
const renderProfile = () => {
    db.collection('users').doc(auth.currentUser.uid).get().then((user) => {
        let profileImg = document.createElement('img');
        profileImg.setAttribute('src', user.data().photoURL);

        let profileDisplayName = document.createElement('p');
        profileDisplayName.textContent = user.data().name;

        let profileEmail = document.createElement('p');
        profileEmail.textContent = user.data().email;

        let profileBio = document.createElement('p');
        profileBio.textContent = `" ${user.data().bio} "`;

        profileInfo.append(profileImg);
        profileInfo.append(profileDisplayName);
        profileInfo.append(profileEmail);
        profileInfo.append(profileBio);
    });
}

//**************************************************************
//      Event Listeners
//**************************************************************

// On page load
document.addEventListener('DOMContentLoaded', () => {
    // Get user's position
    getUserPosition();

    // Real time listener for posts
    db.collection('posts').orderBy("updated", "asc").onSnapshot((snapshot) => {
        let changes = snapshot.docChanges();
        changes.forEach((change) => {
            // Create functionality
            if (change.type === 'added') {
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
    });

    db.collection('chats').get().then((querySnapshot) => {
        querySnapshot.docs.forEach((doc) => {
            let members = doc.data().members;
            let uids = Object.keys(members);

            if (uids.includes(auth.currentUser.uid)) {
                renderChat(doc, uids);

                db.collection('chats').doc(doc.id).collection('messages').onSnapshot((snapshot) => {
                    let changes = snapshot.docChanges();
                    changes.forEach((change) => {
                        if (change.type === 'modified') {
                            let previousChat = document.getElementById(`ch-${doc.id}`);
                            chatList.removeChild(previousChat);
                            renderChat(doc, uids);
                        }
                    });
                });
            }
        });
    });

    setTimeout(() => {
        renderProfile();
    }, 2500)
});

// Create form submission
postForm.addEventListener('submit', createPost);

// Update form submission
updateForm.addEventListener('submit', updatePost);

// Delete button on confirmation modal
confirmDelete.addEventListener('click', deletePost);

// 'X' button on modals
for (let i = 0; i < closeBtns.length; i++) {
    closeBtns[i].addEventListener('click', (e) => {
        closeModal(e.target.parentElement.parentElement.parentElement);
        closeModal(e.target.parentElement.parentElement.parentElement.parentElement); // For camera modals

        if (e.target.parentElement.id === "sidebarHeader") {
            closeModal(sidebar);
        }
    });
}

// Click outside modal
window.addEventListener('click', outsideClick);

// New post button
createBtn.addEventListener('click', () => {
    createOverlay.style.display = 'block'
});


// Logout functionality
logoutBtn.addEventListener('click', (e) => {
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
sidebar.querySelectorAll('.category-filters li').forEach((category) => {

    category.addEventListener('click', () => {
        category.classList.toggle('active-category');

        let icon = category.querySelector('button img');
        let url = icon.src.split('.svg')[0];
        if (url.includes('active')) {
            let newUrl = url.split('-active')[0] + '.svg';
            icon.src = newUrl;
        }
        else {
            let newUrl = url + '-active.svg';
            icon.src = newUrl;
        }

        let checked = sidebar.querySelectorAll('.active-category');

        if (checked.length === 0) {
            // Display all posts
            document.querySelectorAll('#postList li').forEach((post) => {
                post.style.display = 'flex';
            });
        }
        else {
            let checkedCategories = [];

            checked.forEach((checkedCategory) => {
                checkedCategories.push(checkedCategory.querySelector('input[type="checkbox"]').value);
            });

            document.querySelectorAll('#postList li').forEach((post) => {
                let postCategory = post.querySelector('.category').textContent.split('Category: ')[1];
                if (checkedCategories.includes(postCategory)) {
                    post.style.display = 'flex';
                }
                else {
                    post.style.display = 'none';
                }
            });
        }

        if (category.querySelector('input[type="checkbox"]').checked) {
            category.querySelector('input[type="checkbox"]').checked = false;
        }
        else {
            category.querySelector('input[type="checkbox"]').checked = true;
        }
    })
})

// When new post image button is clicked
newPostImage.addEventListener('click', addNewImage);

// When new file is added to input field in create form
postForm.postImage.addEventListener('change', newFileImage);

// When new file is added to input field in create form
updateForm.updatePostImage.addEventListener('change', newFileImage);

// Do nothing when camera button is clicked in update modal
newUpdateImageBtn.addEventListener('click', (e) => {
    e.preventDefault();
})