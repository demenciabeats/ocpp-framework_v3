const apiConfig = {
    login: {
        name: "Login API",
        method: "POST",
        url: "http://localhost:3000/api/auth/login",
        defaultHeaders: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: {
            email: "admin@dhemax.com",
            password: "12345"
        },
        extractToken: true,  // Guarda el token automáticamente
        tokenPath: "token"   // Ruta en la respuesta donde está el token
    },
    api1: {
        name: "API Protegida",
        method: "GET",
        url: "http://localhost:3000/api/users",
        defaultHeaders: {
            "Content-Type": "application/json"
        },
        requiresAuth: true,  // Indica que necesita autenticación
        expectedResponse: {
            status: 200
        }
    },
    api2: {
        name: "API Pública",
        method: "GET",
        url: "https://jsonplaceholder.typicode.com/posts/1",
        defaultHeaders: {
            "Content-Type": "application/json"
        },
        requiresAuth: false,
        expectedResponse: {
            status: 200
        }  // API sin autenticación
    }
};

export default apiConfig;
