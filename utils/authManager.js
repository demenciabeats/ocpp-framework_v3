const session = {
    token: null,
    user: null
};

function setToken(token, user = null) {
    session.token = token;
    session.user = user;
}

function getToken() {
    return session.token;
}


function clearToken() {
    session.token = null;
    session.user = null;
}

export { setToken, getToken, clearToken };
