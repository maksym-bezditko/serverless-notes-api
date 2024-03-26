const { CognitoJwtVerifier } = require('aws-jwt-verify');

const jwtVerifier = CognitoJwtVerifier.create({
	userPoolId: process.env.COGNITO_USERPOOL_ID,
	tokenUse: 'id',
	clientId: process.env.COGNITO_USERPOOL_WEB_CLIENT_ID,
});

const generatePolicy = (principalId, effect, resource) => {
	var authResponse = {};

	authResponse.principalId = principalId;

	if (effect && resource) {
		let policyDocument = {
			Version: '2012-10-17',
			Statement: [
				{
					Effect: effect,
					Resource: resource,
					Action: 'execute-api:Invoke'
				}
			]
		};

		authResponse.policyDocument = policyDocument;
	}

	authResponse.context = {
		foo: 'bar'
	};

	console.log(JSON.stringify(authResponse));

	return authResponse;
};

module.exports.handler = async (event, context, callback) => {
	context.callbackWaitsForEmptyEventLoop = false;

	const token = event.authorizationToken;

	console.log(token);

	try {
		const payload = await jwtVerifier.verify(token);

		console.log(JSON.stringify(payload));

		callback(null, generatePolicy('user', "Allow", event.methodArn));
	} catch (e) {
		callback('Invalid token' + e.message);
	}
}