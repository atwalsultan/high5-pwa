//**************************************************************
//**************************************************************
//      High5 PWA
//**************************************************************
//**************************************************************


//**************************************************************
//      Root Scope Variable Declarations
//**************************************************************

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

// Create and store new post
const createPost = () => {
    let date = activityDate.value;
    let time = activityTime.value;
    let description = activityDesc.value;
    let category = activityCategory.value;

    let newPost = new Post(date, time, description, category);
    newPost.storePost();

    //Refresh posts table
    showPosts();

    console.log(postArray);
}

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
            </tr>
        `;
    }
};

// Clear all inputs
const clearInputs = () => {
    activityDate.value = '';
    activityTime.value = '';
    activityDesc.value = '';
    activityCategory.value = '';
}


//**************************************************************
//      Event Listeners
//**************************************************************

// On page load
document.addEventListener('DOMContentLoaded', showPosts);

// When post form is submitted
postForm.addEventListener('submit', (event) => {
    // Prevent form from actually submitting
    event.preventDefault();

    // Create and store new post
    createPost();

    // Clear inputs
    clearInputs();
});
