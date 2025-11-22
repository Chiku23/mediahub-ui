// Base API endpoints for all services
const IP = "127.0.0.1";
const API = {
    auth: "http://"+IP+":4000",
    upload: "http://"+IP+":4001",
    media: "http://"+IP+":4002",
    metadata: "http://"+IP+":4003",
    thumbnail: "http://"+IP+":4004"
};

// Helper to get JWT token
function getToken() {
    return localStorage.getItem("token");
}

// Redirect user to login page if not logged in
function requireAuth() {
    if (!localStorage.getItem("token")) {
        window.location.href = "../index.html";
    }
}

// Remove Token and Redirect to index page
function logout() {
    localStorage.removeItem("token");
    window.location.href = "../index.html";
}

function setUsername(){
    let username = document.getElementById('username');
    let value = localStorage.getItem('username') ? localStorage.getItem('username') : '';

    if(value){
        username.innerHTML = "Hello&nbsp;"+value;
    } 
}