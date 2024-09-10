import { backend } from 'declarations/backend';

let content = document.getElementById('content');
if (!content) {
    content = document.createElement('div');
    content.id = 'content';
    document.body.appendChild(content);
}

const commandInput = document.getElementById('command-input');
const newPostBtn = document.getElementById('new-post-btn');
const newPostModal = document.getElementById('new-post-modal');
const submitPostBtn = document.getElementById('submit-post');
const cancelPostBtn = document.getElementById('cancel-post');

let currentView = 'list';
let currentPostId = null;

function setContent(html) {
    if (content) {
        content.innerHTML = html;
    } else {
        console.error('Content element not found');
    }
}

async function displayPosts() {
    setContent('<div class="spinner">|</div> Loading posts...');
    try {
        const posts = await backend.getPosts();
        setContent(posts.map(post => `
            <div class="post">
                <div class="post-title">${post.title}</div>
                <div class="post-timestamp">${new Date(Number(post.timestamp) / 1000000).toLocaleString()}</div>
                <div class="post-tags">${post.tags.join(', ')}</div>
                <div>${post.content.substring(0, 100)}...</div>
            </div>
        `).join(''));
    } catch (error) {
        setContent(`Error: ${error.message}`);
    }
}

async function displayPost(id) {
    setContent('<div class="spinner">|</div> Loading post...');
    try {
        const post = await backend.getPost(id);
        if (post) {
            setContent(`
                <div class="post">
                    <div class="post-title">${post.title}</div>
                    <div class="post-timestamp">${new Date(Number(post.timestamp) / 1000000).toLocaleString()}</div>
                    <div class="post-tags">${post.tags.join(', ')}</div>
                    <div>${post.content}</div>
                </div>
            `);
            currentPostId = id;
            currentView = 'post';
        } else {
            setContent('Post not found.');
        }
    } catch (error) {
        setContent(`Error: ${error.message}`);
    }
}

async function createPost(title, content, tags) {
    setContent('<div class="spinner">|</div> Creating post...');
    try {
        const id = await backend.createPost(title, content, tags);
        setContent(`Post created with ID: ${id}`);
        setTimeout(displayPosts, 2000);
    } catch (error) {
        setContent(`Error: ${error.message}`);
    }
}

async function searchPosts(query) {
    setContent('<div class="spinner">|</div> Searching posts...');
    try {
        const posts = await backend.searchPosts(query);
        setContent(posts.map(post => `
            <div class="post">
                <div class="post-title">${post.title}</div>
                <div class="post-timestamp">${new Date(Number(post.timestamp) / 1000000).toLocaleString()}</div>
                <div class="post-tags">${post.tags.join(', ')}</div>
                <div>${post.content.substring(0, 100)}...</div>
            </div>
        `).join(''));
    } catch (error) {
        setContent(`Error: ${error.message}`);
    }
}

async function fetchICPPrice() {
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=internet-computer&vs_currencies=usd');
        const data = await response.json();
        return data['internet-computer'].usd;
    } catch (error) {
        console.error('Error fetching ICP price:', error);
        return null;
    }
}

async function showICPPrice() {
    setContent('<div class="spinner">|</div> Fetching ICP price...');
    try {
        const price = await fetchICPPrice();
        if (price !== null) {
            setContent(`Current ICP Price: $${price}`);
        } else {
            setContent('Unable to fetch ICP price. Please try again later.');
        }
    } catch (error) {
        setContent(`Error: ${error.message}`);
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
                setContent('Usage: view [post_id]');
            }
            break;
        case 'create':
            showNewPostModal();
            break;
        case 'search':
            if (parts[1]) {
                searchPosts(parts.slice(1).join(' '));
            } else {
                setContent('Usage: search [query]');
            }
            break;
        case 'price':
            showICPPrice();
            break;
        case 'help':
            setContent(`
                Available commands:
                - list: Display all posts
                - view [post_id]: View a specific post
                - create: Create a new post
                - search [query]: Search posts
                - price: Show current ICP Price
                - help: Display this help message
            `);
            break;
        default:
            setContent('Unknown command. Type "help" for available commands.');
    }
}

function showNewPostModal() {
    if (newPostModal) {
        newPostModal.style.display = 'block';
    }
}

function hideNewPostModal() {
    if (newPostModal) {
        newPostModal.style.display = 'none';
    }
    const titleInput = document.getElementById('post-title');
    const tagsInput = document.getElementById('post-tags');
    const contentInput = document.getElementById('post-content');
    if (titleInput) titleInput.value = '';
    if (tagsInput) tagsInput.value = '';
    if (contentInput) contentInput.value = '';
}

if (commandInput) {
    commandInput.addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            const command = this.value.trim();
            this.value = '';
            processCommand(command);
        }
    });
}

if (newPostBtn) {
    newPostBtn.addEventListener('click', showNewPostModal);
}

if (submitPostBtn) {
    submitPostBtn.addEventListener('click', async function() {
        const titleInput = document.getElementById('post-title');
        const tagsInput = document.getElementById('post-tags');
        const contentInput = document.getElementById('post-content');
        
        if (titleInput && contentInput) {
            const title = titleInput.value;
            const tags = tagsInput ? tagsInput.value.split(',').map(tag => tag.trim()) : [];
            const content = contentInput.value;

            if (title && content) {
                await createPost(title, content, tags);
                hideNewPostModal();
            } else {
                alert('Title and content are required!');
            }
        } else {
            console.error('Required input elements not found');
        }
    });
}

if (cancelPostBtn) {
    cancelPostBtn.addEventListener('click', hideNewPostModal);
}

// Initial display
displayPosts();
