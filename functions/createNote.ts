"use strict";

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  PutCommandInput,
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

  if (!event.body) {
    return send(400, "Missing body");
  }

  let data = JSON.parse(event.body);

  try {
    const params: PutCommandInput = {
      TableName: NOTES_TABLE_NAME,
      Item: {
        notesId: data.id,
        title: data.title,
        body: data.body,
      },
      ConditionExpression: "attribute_not_exists(notesId)",
    };

    await ddbDocClient.send(new PutCommand(params));

    return send(201, data);
  } catch (e) {
    return send(500, e.message);
  }
};
