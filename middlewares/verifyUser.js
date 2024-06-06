const verifyUser = async (request, response, next) => {
    if (!request.query.userId) {
        return response.status(401).json({ error: 'No tienes los permisos' });
    }
    return next();
};

module.exports = verifyUser;