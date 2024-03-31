import { CognitoJwtVerifier } from "aws-jwt-verify";
import { AuthorizerLambdaFunction, GeneratePolicyFunction } from "./types";
import { AuthResponse } from "aws-lambda";

const jwtVerifier = CognitoJwtVerifier.create({
  userPoolId: process.env.COGNITO_USERPOOL_ID || "",
  clientId: process.env.COGNITO_USERPOOL_WEB_CLIENT_ID || "",
  tokenUse: "id",
});

const generatePolicy: GeneratePolicyFunction = (principalId, effect, resource) => {
  const tmp = resource.split(":");
  const apiGatewayArnTmp = tmp[5].split("/");
  resource =
    tmp[0] +
    ":" +
    tmp[1] +
    ":" +
    tmp[2] +
    ":" +
    tmp[3] +
    ":" +
    tmp[4] +
    ":" +
    apiGatewayArnTmp[0] +
    "/*/*";

  const authResponse: AuthResponse = {
    principalId: principalId,
    policyDocument: {
      Version: "2012-10-17",
      Statement: [
        {
          Action: "execute-api:Invoke",
          Effect: effect,
          Resource: resource,
        },
      ],
    },
    context: {
      foo: "bar",
    },
  };

  return authResponse;
};

export const handler: AuthorizerLambdaFunction = async (
  event,
  context,
  callback
) => {
  context.callbackWaitsForEmptyEventLoop = false;

  const token = event.authorizationToken;

  try {
    const payload = await jwtVerifier.verify(token);

    console.log(JSON.stringify(payload));

    callback(null, generatePolicy("user", "Allow", event.methodArn));
  } catch (e) {
    callback("Invalid token" + e.message);
  }
};
