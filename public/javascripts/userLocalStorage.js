function addUserToStorage(userLogin){
    localStorage.setItem('user', userLogin);
}

function checkIfUserIsLogged(){
    var user;
    if (localStorage.getItem('user')){
        user = localStorage.getItem('user');
        return true;
    } else return false;        
}

function clearLS(){
    localStorage.removeItem('user');
}