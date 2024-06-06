const supertest = require('supertest');
const app = require('../app');
const { describe, test, expect, beforeAll } = require('@jest/globals');
const db = require('../db');
const api = supertest(app);

describe('ruta users', () => {
    describe ('crear usuarios', () => {
        beforeAll(() => {
            const statement = db.prepare('DELETE FROM users');
            statement.run();
        });
        test('crea un usuario cuando todo es correcto', async () => {
            const response = await api.post('/api/users')
            .send({ email: 'gabitodev@gmail.com '})
            .expect(200)
            .expect('Content-type', /json/);
            expect(response.body).toStrictEqual({ message: 'Usuario creado' });
        });
        test('devuelve un error cuando el correo es invalido', async () => {
            const response = await api.post('/api/users')
            .send({ email: 'gabitodevgmail.com '})
            .expect(400)
            .expect('Content-type', /json/);
            expect(response.body).toStrictEqual({ error: 'El email es invalido.' });
        });
        test('devuelve un error cuando el email ya existe', async () => {
            const response = await api.post('/api/users')
            .send({ email: 'gabitodev@gmail.com '})
            .expect(400)
            .expect('Content-type', /json/);
            expect(response.body).toStrictEqual({ error: 'El email ya existe' });
        });
    });
});
