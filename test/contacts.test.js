const supertest = require('supertest');
const app = require('../app');
const { describe, test, expect, beforeAll } = require('@jest/globals');
const db = require('../db');
const { error } = require('console');
const api = supertest(app);
let user;
let contact;
let contacts = [
  {
    name: 'Alejandro Perez',
    phone: '02125424484',
  },
  {
    name: 'Pedro Gonzalez',
    phone: '04145877896',
  },
  {
    name: 'Gabriel Garcia',
    phone: '04122110509',
  },
];

describe('ruta contacts', () => {
  describe('crear contacto', () => {
    beforeAll(() => {
      const statementDeleteUsers = db.prepare('DELETE FROM users');
      statementDeleteUsers.run();
      const statementCreateUser = db.prepare(
        `
      INSERT INTO users (email) VALUES (?) RETURNING *
    `,
      );
      user = statementCreateUser.get('gabitodev@gmail.com');
    });
    test('crea un contacto cuando todo es correcto', async () => {
      const response = await api
        .post('/api/contacts')
        .query({ userId: user.user_id })
        .send({ name: 'Gabriel Garcia', phone: '04122110509' })
        .expect(200)
        .expect('Content-type', /json/);
      expect(response.body).toStrictEqual({
        contact_id: 1,
        name: 'Gabriel Garcia',
        phone: '04122110509',
        user_id: 1,
      });
    });
  });
  describe('eliminar contacto', () => {
    beforeAll(() => {
      // Creo un usuario
      const statementDeleteUsers = db.prepare('DELETE FROM users');
      statementDeleteUsers.run();
      const statementCreateUser = db.prepare(
        `
      INSERT INTO users (email) VALUES (?) RETURNING *
    `,
      );
      user = statementCreateUser.get('gabitodev@gmail.com');

      // Creo un contacto
      const statementDeleteContacts = db.prepare('DELETE FROM contacts');
      statementDeleteContacts.run();
      const statementCreateContact = db.prepare(
        `
      INSERT INTO contacts (name, phone, user_id) VALUES (?, ?, ?) RETURNING *
    `,
      );
      contact = statementCreateContact.get('Gabriel Garcia', '04122110509', user.user_id);
    });
    test('elimina un contacto cuando todo es correcto', async () => {
      const response = await api
        .delete(`/api/contacts/${contact.contact_id}`)
        .query({ userId: user.user_id })
        .expect(200)
        .expect('Content-type', /json/);
      expect(response.body).toStrictEqual({
        message: 'El contacto Gabriel Garcia ha sido eliminado',
      });
    });
    test('no elimina cuando el usuario no pertenece al contacto', async () => {
      const response = await api
        .delete(`/api/contacts/${contact.contact_id}`)
        .query({ userId: user.user_id + 1 })
        .expect(400)
        .expect('Content-type', /json/);
      expect(response.body).toStrictEqual({
        message: 'El contacto no existe',
      });
    });
    test('no elimina cuando el contacto no existe', async () => {
      const response = await api
        .delete(`/api/contacts/${contact.contact_id + 1}`)
        .query({ userId: user.user_id })
        .expect(400)
        .expect('Content-type', /json/);
      expect(response.body).toStrictEqual({
        message: 'El contacto no existe',
      });
    });
  });
  describe('actualizar contacto', () => {
    beforeAll(() => {
      // Creo un usuario
      const statementDeleteUsers = db.prepare('DELETE FROM users');
      statementDeleteUsers.run();
      const statementCreateUser = db.prepare(
        `
      INSERT INTO users (email) VALUES (?) RETURNING *
    `,
      );
      user = statementCreateUser.get('gabitodev@gmail.com');

      // Creo un contacto
      const statementDeleteContacts = db.prepare('DELETE FROM contacts');
      statementDeleteContacts.run();
      const statementCreateContact = db.prepare(
        `
      INSERT INTO contacts (name, phone, user_id) VALUES (?, ?, ?) RETURNING *
    `,
      );
      contact = statementCreateContact.get('Gabriel Garcia', '04122110509', user.user_id);
    });
    test('actualiza un contacto cuando todo es correcto', async () => {
      const response = await api
        .put(`/api/contacts/${contact.contact_id}`)
        .send({ name: 'Alejandro Perez', phone: '04145424484' })
        .query({ userId: user.user_id })
        .expect(200)
        .expect('Content-type', /json/);
      expect(response.body).toStrictEqual({
        contact_id: 1,
        name: 'Alejandro Perez',
        phone: '04145424484',
        user_id: 1,
      });
    });
    test('no actualiza cuando el usuario no pertenece al contacto', async () => {
      const response = await api
        .put(`/api/contacts/${contact.contact_id}`)
        .send({ name: 'Alejandro Perez', phone: '04145424484' })
        .query({ userId: user.user_id + 1 })
        .expect(400)
        .expect('Content-type', /json/);
      expect(response.body).toStrictEqual({
        message: 'El contacto no existe',
      });
    });
    test('no actualiza cuando el contacto no existe', async () => {
      const response = await api
        .put(`/api/contacts/${contact.contact_id + 1}`)
        .send({ name: 'Alejandro Perez', phone: '04145424484' })
        .query({ userId: user.user_id })
        .expect(400)
        .expect('Content-type', /json/);
      expect(response.body).toStrictEqual({
        message: 'El contacto no existe',
      });
    });
  });
  describe('obtener contactos', () => {
    beforeAll(() => {
      // Creo un usuario
      const statementDeleteUsers = db.prepare('DELETE FROM users');
      statementDeleteUsers.run();
      const statementCreateUser = db.prepare(
        `
      INSERT INTO users (email) VALUES (?) RETURNING *
    `,
      );
      user = statementCreateUser.get('gabitodev@gmail.com');

      // Creo un contacto
      const statementDeleteContacts = db.prepare('DELETE FROM contacts');
      statementDeleteContacts.run();

      contacts = contacts.map((contact) => {
        const statementCreateContact = db.prepare(
          `
        INSERT INTO contacts (name, phone, user_id) VALUES (?, ?, ?) RETURNING *
      `,
        );
        return statementCreateContact.get(contact.name, contact.phone, user.user_id);
      });
    });
    test('obtener los contactos cuando todo es correcto', async () => {
      const response = await api
        .get('/api/contacts/')
        .query({ userId: user.user_id })
        .expect(200)
        .expect('Content-type', /json/);
      expect(response.body.length).toBe(contacts.length);
    });
    test('no obtengo los contactos cuando el usuario no inicio sesion', async () => {
      const response = await api
        .get('/api/contacts/')
        .query({ userId: null })
        .expect(401)
        .expect('Content-type', /json/);
      expect(response.body).toStrictEqual({
        error: 'No tienes los permisos',
      });
    });
  });
});
