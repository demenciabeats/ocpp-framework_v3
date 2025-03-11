const queryConfig = {
    getUsers: {
        name: "Obtener usuarios activos",
        query: "SELECT * FROM usuarios WHERE id in ($1)",
        params: [73],
        expectedResult: {}
    },
    getOrders: {
        name: "Obtener órdenes recientes",
        query: "SELECT * FROM orders WHERE order_date > $1",
        params: ["2023-01-01"],
        expectedResult: {} 
    }
    // ...otras queries...
};

export default queryConfig;
