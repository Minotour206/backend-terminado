const db = require('../db');

const usersRouter = require('express').Router();
const EMAIL_REGEX = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
usersRouter.post('/', async (request, response) => {
  try {
    // Obtener el email del body
  const { email } = request.body;
  
  // Validar el email
  if(!EMAIL_REGEX.test(email)) {
    return response.status(400).json({ error: 'El email es invalido.'});
  }

  // Crear el usuario en la base de datos
  const statement = db.prepare(
    `
    INSERT INTO users (email) VALUES (?)
    `,
  );
  statement.run(email);

  return response.status(200).json({ message: 'Usuario creado' });
  } catch (error) {
    console.log(error);
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return response.status(400).json({ error: 'El email ya existe' });
    }

    return response.sendStatus(400);
  }
});

module.exports = usersRouter;
