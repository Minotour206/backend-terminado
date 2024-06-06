const supertest = require('supertest');
const app = require('../app');
const { describe, test, expect } = require('@jest/globals');
const api = supertest(app);

describe('ruta home', () => {
    test('devuelve respuesta en json con una hola mundo', async () => {
        const response = await api.get('/').expect(200).expect('Content-type', /json/);
        expect(response.body).toStrictEqual({ hola: 'mundo' });
    });
});