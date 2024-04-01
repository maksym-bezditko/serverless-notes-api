'use strict';

const init = () => {
	require('dotenv').config({
		path: `${__dirname}/../../.env.test`
	});
}

module.exports = init;