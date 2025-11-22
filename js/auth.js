async function login(){
    let email = document.getElementById('email').value.trim();
    let password = document.getElementById('password').value.trim();
    let errorBox = document.getElementById('error');
    
    errorBox.innerHTML = '';

    if(!email || !password){
        errorBox.innerHTML = 'Please enter email & password';
        return;
    }

    try {
        let payload = JSON.stringify({ email, password });

        const response = await fetch(API.auth + '/login',  {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: payload
        })

        if(!response){
            errorBox.innerHTML = 'Server Down!';
            return;
        }
        const data = await response.json();

        if (data.token) {
            localStorage.setItem("token", data.token);
            await getUserData();
            window.location.href = "pages/dashboard.html";
        } else {
            errorBox.innerHTML = data.error || "Invalid credentials.";
        }
    } catch (error) {
        errorBox.innerHTML = 'Something went wrong!';
    }
}

async function signup(){
    let email = document.getElementById('email').value.trim();
    let password = document.getElementById('password').value.trim();
    let name = document.getElementById('name').value.trim();

    let errorBox = document.getElementById('error');

    errorBox.innerHTML = '';

    if(!email || !password || !name){
        errorBox.innerHTML = 'Please fill the form';
        return;
    }

    try {
        let payload = JSON.stringify({ name, email, password });

        const response = await fetch(API.auth + '/signup',  {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: payload
        })

        if(!response){
            errorBox.innerHTML = 'Server Down!';
            return;
        }
        const data = await response.json();

        if (data.message) {
           errorBox.innerHTML = data.message;
           errorBox.style.color = "green";
        } else {
            errorBox.innerHTML = data.error || "Invalid credentials.";
        }
    } catch (error) {
        errorBox.innerHTML = 'Something went wrong!';
    }
}

async function getUserData(){

    try {
        const response = await fetch(API.auth + '/verifyuser',  {
            method: "GET",
            headers: { 
                "Content-Type": "application/json",
                Authorization: "Bearer " + getToken()
            },
        })

        if(!response){
            console.error('server down');
            return;
        }
        const data = await response.json();

        localStorage.setItem("username", data.user.name);
        localStorage.setItem("useremail", data.user.email);

    } catch (error) {
        errorBox.innerHTML = 'Something went wrong!';
    }
}