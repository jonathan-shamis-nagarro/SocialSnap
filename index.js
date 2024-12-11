// JS
const apiUrl = "https://jsonplaceholder.typicode.com";

// Elements
const usernameInput = document.getElementById("username");
const loadPostsButton = document.getElementById("load-posts");
const postListContainer = document.getElementById("post-list");
const updateModal = document.getElementById("update-modal");
const closeUpdateModal = document.getElementById("close-update-modal");
const updateForm = document.getElementById("update-form");
const postTitleInput = document.getElementById("post-title");
const postBodyInput = document.getElementById("post-body");
let userId = null;
let currentPost = null;

// Fetch user by name and load posts
loadPostsButton.addEventListener("click", () => {
    const username = usernameInput.value.trim();
    if (!username) {
        alert("Please enter a valid name");
        return;
    }

    fetch(`${apiUrl}/users?name=${username}`)
        .then((response) => response.json())
        .then((users) => {
            if (users.length === 0) {
                alert("User not found");
                return;
            }
            userId = users[0].id;
            loadUserPosts(userId);
        })
        .catch((err) => console.error("Error fetching user:", err));
});

// Load posts by user ID
function loadUserPosts(userId) {
    fetch(`${apiUrl}/posts?userId=${userId}`)
        .then((response) => response.json())
        .then((posts) => {
            postListContainer.innerHTML = "";
            posts.forEach((post) => {
                const postDiv = document.createElement("div");
                postDiv.classList.add(`post`);
                postDiv.id = `post${post.id}`;

                // Post details template
                postDiv.innerHTML = `
                    <div class="post-title">${post.title}</div>
                    <div class="post-details">
                        <p>${post.body}</p>
                        <div class="post-buttons">
                            <button class="edit-button" data-id="${post.id}" data-title="${post.title}" data-body="${post.body}">Edit</button>
                        </div>
                    </div>
                `;

                // Toggle post details
                postDiv.querySelector(".post-title").addEventListener("click", () => {
                    const details = postDiv.querySelector(".post-details");
                    details.style.display =
                        details.style.display === "block" ? "none" : "block";
                });

                postListContainer.appendChild(postDiv);
            });

            attachEditListeners();

            document.getElementById("user-posts").classList.remove("hidden");
        })
        .catch((err) => console.error("Error fetching posts:", err));
}

// Attach event listeners to Edit buttons
function attachEditListeners() {
    const editButtons = document.querySelectorAll(".edit-button");
    editButtons.forEach((button) => {
        button.addEventListener("click", (e) => {
            const postId = e.target.dataset.id;
            const postTitle = e.target.dataset.title;
            const postBody = e.target.dataset.body;
            openEditModal(postId, postTitle, postBody);
        });
    });
}

// Open edit modal
function openEditModal(postId, postTitle, postBody) {
    currentPost = { id: postId, title: postTitle, body: postBody };
    postTitleInput.value = postTitle;
    postBodyInput.value = postBody;
    updateModal.classList.add("active");
}

// Close update modal
closeUpdateModal.addEventListener("click", () => {
    updateModal.classList.remove("active");
});

// Submit updated post
updateForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const updatedPost = {
      ...currentPost,
      title: postTitleInput.value,
      body: postBodyInput.value,
      userId,
  };

  fetch(`${apiUrl}/posts/${currentPost.id}`, {
      method: "PUT",
      headers: { "Content-type": "application/json; charset=UTF-8" },
      body: JSON.stringify(updatedPost),
  })
      .then((response) => response.json())
      .then((updatedData) => {
          const postDiv = document.querySelector(`#post${currentPost.id}`);
          if (postDiv) {
              postDiv.querySelector(".post-title").textContent = updatedData.title;
              postDiv.querySelector(".post-details p").textContent = updatedData.body;

              const editButton = postDiv.querySelector(".edit-button");
              editButton.dataset.title = updatedData.title;
              editButton.dataset.body = updatedData.body;
          }

          updateModal.classList.remove("active");
      })
      .catch((err) => console.error("Error updating post:", err));
});
