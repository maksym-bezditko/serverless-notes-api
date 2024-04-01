import { CognitoJwtVerifier } from "aws-jwt-verify";
import { AuthorizerLambdaFunction } from "../types";
import { generatePolicy } from "../services";

const jwtVerifier = CognitoJwtVerifier.create({
  userPoolId: process.env.COGNITO_USERPOOL_ID || "",
  clientId: process.env.COGNITO_USERPOOL_WEB_CLIENT_ID || "",
  tokenUse: "id",
});

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
