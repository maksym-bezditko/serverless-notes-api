"use strict";

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  UpdateCommand,
  UpdateCommandInput,
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

  if (!event.body) {
    return send(400, "Missing body");
  }

  let data = JSON.parse(event.body);

  try {
    const params: UpdateCommandInput = {
      TableName: NOTES_TABLE_NAME,
      Key: {
        notesId,
      },
      UpdateExpression: `set #title = :title, #body = :body`,
      ExpressionAttributeNames: {
        "#title": "title",
        "#body": "body",
      },
      ExpressionAttributeValues: {
        ":title": data.title,
        ":body": data.body,
      },
      ConditionExpression: "attribute_exists(notesId)",
    };

    await ddbDocClient.send(new UpdateCommand(params));

    return send(200, data);
  } catch (e) {
    return send(500, e.message);
  }
};