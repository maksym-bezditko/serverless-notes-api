"use strict";

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  DeleteCommand,
  DeleteCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { LambdaFunction } from "../types";

const client = new DynamoDBClient({
  region: "eu-north-1",
});

const ddbDocClient = DynamoDBDocumentClient.from(client);

const NOTES_TABLE_NAME = process.env.NOTES_TABLE_NAME;

const send = (statusCode: number, body: unknown) => {
  return {
    statusCode,
    body: JSON.stringify(body),
  };
};

export const handler: LambdaFunction = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  if (!event.pathParameters) {
    return send(400, "Missing path parameters");
  }

  let notesId = event.pathParameters.id;

  try {
    const params: DeleteCommandInput = {
      TableName: NOTES_TABLE_NAME,
      Key: {
        notesId,
      },
      ConditionExpression: "attribute_exists(notesId)",
    };

    await ddbDocClient.send(new DeleteCommand(params));

    return send(200, notesId);
  } catch (e) {
    return send(500, e.message);
  }
};