import { AuthResponse } from "aws-lambda";
import { GeneratePolicyFunction } from "../types";

export const generatePolicy: GeneratePolicyFunction = (principalId, effect, resource) => {
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