import {
  APIGatewayAuthorizerCallback,
  APIGatewayEvent,
  APIGatewayProxyCallback,
  APIGatewayTokenAuthorizerEvent,
  AuthResponse,
  Context,
} from "aws-lambda";

export type LambdaFunction = (
  event: APIGatewayEvent,
  context: Context,
  callback: APIGatewayProxyCallback
) => Promise<{ statusCode: number; body: string }>;

export type AuthorizerLambdaFunction = (
  event: APIGatewayTokenAuthorizerEvent,
  context: Context,
  callback: APIGatewayAuthorizerCallback
) => void;

export type GeneratePolicyFunction = (
  principalId: string,
  effect: "Allow" | "Deny",
  resource: string
) => AuthResponse;
