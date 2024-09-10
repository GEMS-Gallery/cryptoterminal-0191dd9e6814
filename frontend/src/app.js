import { backend } from 'declarations/backend';

const content = document.getElementById('content');
const commandInput = document.getElementById('command-input');
const newPostBtn = document.getElementById('new-post-btn');
const newPostModal = document.getElementById('new-post-modal');
const submitPostBtn = document.getElementById('submit-post');
const cancelPostBtn = document.getElementById('cancel-post');

let currentView = 'list';
let currentPostId = null;

async function displayPosts() {
    content.innerHTML = '<div class="spinner">|</div> Loading posts...';
    try {
        const posts = await backend.getPosts();
        content.innerHTML = posts.map(post => `
            <div class="post">
                <div class="post-title">${post.title}</div>
                <div class="post-timestamp">${new Date(Number(post.timestamp) / 1000000).toLocaleString()}</div>
                <div class="post-tags">${post.tags.join(', ')}</div>
                <div>${post.content.substring(0, 100)}...</div>
            </div>
        `).join('');
    } catch (error) {
        content.innerHTML = `Error: ${error.message}`;
    }
}

async function displayPost(id) {
    content.innerHTML = '<div class="spinner">|</div> Loading post...';
    try {
        const post = await backend.getPost(id);
        if (post) {
            content.innerHTML = `
                <div class="post">
                    <div class="post-title">${post.title}</div>
                    <div class="post-timestamp">${new Date(Number(post.timestamp) / 1000000).toLocaleString()}</div>
                    <div class="post-tags">${post.tags.join(', ')}</div>
                    <div>${post.content}</div>
                </div>
            `;
            currentPostId = id;
            currentView = 'post';
        } else {
            content.innerHTML = 'Post not found.';
        }
    } catch (error) {
        content.innerHTML = `Error: ${error.message}`;
    }
}

async function createPost(title, content, tags) {
    content.innerHTML = '<div class="spinner">|</div> Creating post...';
    try {
        const id = await backend.createPost(title, content, tags);
        content.innerHTML = `Post created with ID: ${id}`;
        setTimeout(displayPosts, 2000);
    } catch (error) {
        content.innerHTML = `Error: ${error.message}`;
    }
}

async function searchPosts(query) {
    content.innerHTML = '<div class="spinner">|</div> Searching posts...';
    try {
        const posts = await backend.searchPosts(query);
        content.innerHTML = posts.map(post => `
            <div class="post">
                <div class="post-title">${post.title}</div>
                <div class="post-timestamp">${new Date(Number(post.timestamp) / 1000000).toLocaleString()}</div>
                <div class="post-tags">${post.tags.join(', ')}</div>
                <div>${post.content.substring(0, 100)}...</div>
            </div>
        `).join('');
    } catch (error) {
        content.innerHTML = `Error: ${error.message}`;
    }
}

function processCommand(command) {
    const parts = command.split(' ');
    const action = parts[0].toLowerCase();

    switch (action) {
        case 'list':
            displayPosts();
            break;
        case 'view':
            if (parts[1]) {
                displayPost(parseInt(parts[1]));
            } else {
                content.innerHTML = 'Usage: view [post_id]';
            }
            break;
        case 'create':
            showNewPostModal();
            break;
        case 'search':
            if (parts[1]) {
                searchPosts(parts.slice(1).join(' '));
            } else {
                content.innerHTML = 'Usage: search [query]';
            }
            break;
        case 'help':
            content.innerHTML = `
                Available commands:
                - list: Display all posts
                - view [post_id]: View a specific post
                - create: Create a new post
                - search [query]: Search posts
                - help: Display this help message
            `;
            break;
        default:
            content.innerHTML = 'Unknown command. Type "help" for available commands.';
    }
}

function showNewPostModal() {
    newPostModal.style.display = 'block';
}

function hideNewPostModal() {
    newPostModal.style.display = 'none';
    document.getElementById('post-title').value = '';
    document.getElementById('post-tags').value = '';
    document.getElementById('post-content').value = '';
}

commandInput.addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
        const command = this.value.trim();
        this.value = '';
        processCommand(command);
    }
});

newPostBtn.addEventListener('click', showNewPostModal);

submitPostBtn.addEventListener('click', async function() {
    const title = document.getElementById('post-title').value;
    const tags = document.getElementById('post-tags').value.split(',').map(tag => tag.trim());
    const content = document.getElementById('post-content').value;

    if (title && content) {
        await createPost(title, content, tags);
        hideNewPostModal();
    } else {
        alert('Title and content are required!');
    }
});

cancelPostBtn.addEventListener('click', hideNewPostModal);

// Initial display
displayPosts();
