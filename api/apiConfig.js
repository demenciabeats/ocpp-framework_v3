const apiConfig = {

    changeAvailability: {
        name: "Change Connector Availability",
        method: "POST",
        url: "/em/connector/changeAvailability",
        defaultHeaders: {
            "Content-Type": "application/json",
            "App-id": "CMS"
        },
        requiresAuth: true,
        expectedResponse: {
            status: 201
        },
        body: {
            connectorId: 123,
            availabilityType: "Operative"
        }
    },

    remoteStartFull: {
        name: "Remote Start Transaction",
        method: "POST",
        url: "/evcaStartTransaction",
        defaultHeaders: {
            "Content-Type": "application/json"
        },
        requiresAuth: true,
        expectedResponse: {
            status: 201
        },
        body: 
            {
                "ocpiPhyConnectorId": 291,
                "companyId": 5,
                "userId": 75,
                "locationId": 15,
              }       
    },

    remoteStop: {
        name: "Remote Stop Transaction",
        method: "POST",
        url: "/evcaStopTransaction",
        defaultHeaders: {
            "Content-Type": "application/json"
        },
        requiresAuth: true,
        expectedResponse: {
            status: 201
        },
        body: {
            companyId: 5, 
            transactionId: 8009
        },
    },
    reset: {
        name: "Reset Station",
        method: "POST",
        url: "https://charger.manager.qa.dhemax.link/reset",
        defaultHeaders: {
            "Content-Type": "application/json",
            "App-id": "CMS"
        },
        requiresAuth: false,
        expectedResponse: {
            status: 201
        },
        body: {
            machineId: 456,
            resetType: "Hard"
        }
    },

    unlock: {
        name: "Unlock Connector",
        method: "POST",
        url: "https://charger.manager.qa.dhemax.link/em/connector/unlock?connectorId=1199",
        defaultHeaders: {
            "Content-Type": "application/json",
            "App-id": "CMS"
        },
        requiresAuth: true,
        expectedResponse: {
            status: 200
        }
    },

    changeConfiguration: {
        name: "Change Configuration",
        method: "PUT",
        url: "/em/changeConfiguration",
        defaultHeaders: {
            "Content-Type": "application/json",
            "App-id": "CMS"
        },
        requiresAuth: true,
        expectedResponse: {
            status: 200
        },
        body: {
            userId: 24,
            stationId: 18,
            configurationkeys: [{ key: "", value: "" }]
        }
    },

    getConfiguration: {
        name: "Get Configuration",
        method: "GET",
        url: "/em/getConfiguration",
        defaultHeaders: {
            "App-id": "CMS"
        },
        requiresAuth: true,
        expectedResponse: {
            status: 200
        }
    },

    getDiagnostic: {
        name: "Get Diagnostics",
        method: "POST",
        url: "/chargerLogs/getDiagnostic",
        defaultHeaders: {
            "Content-Type": "application/json",
            "App-id": "CMS"
        },
        requiresAuth: true,
        expectedResponse: {
            status: 201
        },
        body: {
            stationId: 677,
            startTime: "2024-06-06 00:00:00",
            endTime: "2024-06-06 23:59:59",
            actionType: "SEND",
            userId: 25
        }
    },

    setChargingProfile: {
        name: "Set Charging Profile",
        method: "POST",
        url: "/setChargingProfile",
        defaultHeaders: {
            "Content-Type": "application/json"
        },
        requiresAuth: true,
        expectedResponse: {
            status: 201
        },
        body: {}
    },

    clearChargingProfile: {
        name: "Clear Charging Profile",
        method: "POST",
        url: "/clearChargingProfile",
        defaultHeaders: {
            "Content-Type": "application/json"
        },
        requiresAuth: true,
        expectedResponse: {
            status: 201
        },
        body: {}
    },
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
