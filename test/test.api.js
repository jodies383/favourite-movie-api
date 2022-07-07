const supertest = require('supertest');
const PgPromise = require("pg-promise")
const express = require('express');
const assert = require('assert');
const fs = require('fs');
require('dotenv').config()

const API = require('../server/api');
const { default: axios } = require('axios');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const DATABASE_URL = process.env.DATABASE_URL;
const pgp = PgPromise({});
const db = pgp(DATABASE_URL);

API(app, db);

describe('The Movie API', function () {

	before(async function () {
		this.timeout(5000);
		await db.none(`delete from playlist`);
		// await db.none(`delete from users`)
	});


	it('should have a test method', async () => {

		const response = await supertest(app)
			.get('/api/test')
			.expect(200);

		assert.deepStrictEqual({ name: 'joe' }, response.body);

	});

	it('should be able to register a new user', async () => {
		const response = await supertest(app)
			.post('/api/register')
			.send({
				username: 'JoeSmith01',
				password: '123',
				firstName: 'Joe',
				lastName: 'Smith'
			});


		const user = await db.one(`select username from users where username = 'JoeSmith01'`);
		assert.equal('JoeSmith01', user.username);

	})

	it('should not register a duplicate username', async () => {
		const response = await supertest(app)
			.post('/api/register')
			.send({
				username: 'JoeSmith01',
				password: '123',
				firstName: 'Joe',
				lastName: 'Smith'
			});


		const { message } = response.body;
		assert.equal('duplicate', message);

	})

	it('should be able to log in', async () => {
		const response = await supertest(app)
			.post('/api/login')
			.send({
				username: 'JoeSmith01',
				password: '123'
			});

		const garments = response.body.message;
		assert.equal('success', garments);
	});

	it('should not log in when username and password do not match', async () => {
		const response = await supertest(app)
			.post('/api/login')
			.send({
				username: 'JoeSmith01',
				password: '7826187217'
			});

		const { message } = response.body;
		assert.equal('unmatched', message);
	});

	it('should not log in an unregistered user', async () => {
		const response = await supertest(app)
			.post('/api/login')
			.send({
				username: 'AmyAllen',
				password: '7826187217'
			});

		const { message } = response.body;
		assert.equal('unregistered', message);
	});

	it('should be able to add a new movie to favourites', async () => {
		// change the code statement below

		const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IkpvZVNtaXRoMDEiLCJpYXQiOjE2NTcxOTU1MDQsImV4cCI6MTY1NzIwOTkwNH0.5LES6GtV9_AhwDNlhXhJ5i59hAK8oaN4w1lk9kKXleU`
		const response = await supertest(app)
			.post('/api/playlist/JoeSmith01')
			.set({ "Authorization": `Bearer ${token}` })
			.send({ movieId: '4765' })
			.expect(200);

		const { message } = response.body;
		assert.equal('success', message);

	});

	it('should not add a duplicate movie to favourites', async () => {
		// change the code statement below

		const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IkpvZVNtaXRoMDEiLCJpYXQiOjE2NTcxOTU1MDQsImV4cCI6MTY1NzIwOTkwNH0.5LES6GtV9_AhwDNlhXhJ5i59hAK8oaN4w1lk9kKXleU`
		const response = await supertest(app)
			.post('/api/playlist/JoeSmith01')
			.set({ "Authorization": `Bearer ${token}` })
			.send({ movieId: '4765' })
			.send({ movieId: '4765' })
			.expect(200);


		const garments = response.body.message;
		assert.equal('duplicate', garments);

	});

	it('should be able to find all the favourite movies for a user', async () => {
		// add some code below

		const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IkpvZVNtaXRoMDEiLCJpYXQiOjE2NTcxOTU1MDQsImV4cCI6MTY1NzIwOTkwNH0.5LES6GtV9_AhwDNlhXhJ5i59hAK8oaN4w1lk9kKXleU`
		const response = await supertest(app)
			.get('/api/playlist/JoeSmith01')
			.set({ "Authorization": `Bearer ${token}` })
			.expect(200);
		const playlist = response.body.playlist
		assert.equal(1, playlist.length);
	});


	it('you should be able to remove a movie from favourites list', async () => {

		const response = await supertest(app)
			.delete(`/api/playlist?username=JoeSmith01&movie_id=4765`)
			.expect(200);


		assert.equal('success', response.body.status);
	});

	after(() => {
		db.$pool.end();
	});
});