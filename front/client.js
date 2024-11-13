// Function to get the token
function getToken() {
    return localStorage.getItem('token') || ''; // Example: retrieving from local storage
}

// Function to initialize the socket connection
function initializeSocket() {
    const socket = io('http://localhost:3000', {
        query: { token: getToken() },
        transports: ['websocket'],
      });
      
    // Handle connection success
    socket.on('connect', () => {
        console.log('Connected to WebSocket server');
    });

    // Display public messages
    socket.on('publicMessage', (msg) => {
        displayMessage(msg, false);
    });

    // Display private messages
    socket.on('privateMessage', (msg) => {
        displayMessage(msg, true);
    });

    // Send public messages
    document.getElementById('sendButton').addEventListener('click', () => {
        const messageInput = document.getElementById('messageInput');
        const message = messageInput.value;
        if (message) {
            socket.emit('publicMessage', message);
            messageInput.value = ''; // Clear input
        }
    });

    // Send private messages
    document.getElementById('sendPrivateButton').addEventListener('click', () => {
        const recipientInput = document.getElementById('recipientInput');
        const privateMessageInput = document.getElementById('privateMessageInput');
        const recipient = recipientInput.value;
        const privateMessage = privateMessageInput.value;

        if (recipient && privateMessage) {
            socket.emit('privateMessage', { to: recipient, msg: privateMessage });
            privateMessageInput.value = ''; // Clear input
        }
    });
}

// Function to display messages
function displayMessage(msg, isPrivate) {
    const messagesDiv = document.getElementById('messages');
    const messageHtml = `<div${isPrivate ? ' style="color: green;"' : ''}>${msg}</div>`;
    messagesDiv.innerHTML += messageHtml;
    messagesDiv.scrollTop = messagesDiv.scrollHeight; // Scroll to bottom
}

document.getElementById('registerForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('http://localhost:3000/api/users/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, email, password }),
        });
        
        const data = await response.json();
        console.log('Registration Response:', data);

        if (response.ok) {
            alert('Registration successful');
            // Redirect or handle success
        } else {
            alert('Registration failed: ' + data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred during registration.');
    }
});

document.getElementById('loginForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('emailL').value;
    const password = document.getElementById('passwordL').value;

    try {
        const response = await fetch('http://localhost:3000/api/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });
        
        const data = await response.json();
        console.log('Login Response:', data);

        if (response.ok) {
            alert('Login successful');
            // Store token, redirect, or handle success
            localStorage.setItem('token', data.token); // Example token storage
        } else {
            alert('Login failed: ' + data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred during login.');
    }
});

// Initialize the socket connection
initializeSocket();
