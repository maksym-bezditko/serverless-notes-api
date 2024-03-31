'use strict';
const init = require('./steps/init');
const { authenticated_user } = require('./steps/given');
const { createNote, updateNote, deleteNote } = require('./steps/when');

let idToken = null;

describe('Given an authenticated user', () => {
	beforeAll(async () => {
		init();

		const user = await authenticated_user();

		idToken = user.AuthenticationResult.IdToken;
	})

	describe('When we invoke POST /notes endpoint', () => {
		it('should create a new note', async () => {
			const body = {
				id: "1000",
				title: 'My note',
				body: 'My note body',
			}

			const result = await createNote({ idToken: idToken, body: body });

			expect(result.statusCode).toBe(201);
			expect(result.body).not.toBe(null);
		})
	})

	describe('When we invoke PUT /notes/:id endpoint', () => {
		it('should update a note', async () => {
			const noteId = "1000";

			const body = {
				title: 'My updated note',
				body: 'My updated note body',
			}

			const result = await updateNote({ idToken: idToken, body: body, noteId });

			expect(result.statusCode).toBe(200);
			expect(result.body).not.toBe(null);
		})
	})

	describe('When we invoke DELETE /notes/:id endpoint', () => {
		it('should delete a note', async () => {
			const noteId = "1000";

			const result = await deleteNote({ idToken: idToken, noteId });

			expect(result.statusCode).toBe(200);
			expect(result.body).not.toBe(null);
		})
	})
})