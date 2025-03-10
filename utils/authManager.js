const session = {
    token: null,
    user: null
};

/**
 * Guarda el token en memoria.
 * @param {string} token - Token de autenticación.
 * @param {string} user - Usuario autenticado (opcional).
 */
function setToken(token, user = null) {
    session.token = token;
    session.user = user;
}

/**
 * Obtiene el token almacenado.
 * @returns {string|null} Token de autenticación actual.
 */
function getToken() {
    return session.token;
}

/**
 * Limpia el token almacenado.
 */
function clearToken() {
    session.token = null;
    session.user = null;
}

export { setToken, getToken, clearToken };
