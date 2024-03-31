'use strict';

const _ = require('lodash');
const Promise = this.Promise || require('promise');
const agent = require('superagent-promise')(require('superagent'), Promise);

const makeHttpRequest = async (path, method, options) => {
	const root = process.env.TEST_ROOT;
	const url = options.noteId ? `${root}/${path}/${options.noteId}` : `${root}/${path}`;

	console.log(`Invoking ${method} ${url}`);

	const httpReq = agent(method, url);
	const body = _.get(options, 'body');
	const idToken = _.get(options, 'idToken');

	try {
		httpReq.set('Authorization', idToken);

		if (body) {
			httpReq.send(body);
		}

		const response = await httpReq;

		return {
			statusCode: response.status,
			body: response.body
		}
	} catch (e) {
		return {
			statusCode: e.status,
			body: null
		}
	}
}

exports.createNote = async (options) => {
	const result = await makeHttpRequest('notes', 'POST', options);

	return result;
}

exports.updateNote = async (options) => {
	const result = await makeHttpRequest('notes', 'PUT', options);

	return result;
}

exports.deleteNote = async (options) => {
	const result = await makeHttpRequest('notes', 'DELETE', options);

	return result;
}