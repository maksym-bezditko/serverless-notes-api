"use strict";

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
  ScanCommand,
  PutCommandInput,
  UpdateCommandInput,
  DeleteCommandInput,
  ScanCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { LambdaFunction } from "./types";

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

export const createNote: LambdaFunction = async (event, context) => {
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

export const updateNote: LambdaFunction = async (event, context) => {
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

export const deleteNote: LambdaFunction = async (event, context) => {
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

export const getAllNotes: LambdaFunction = async (_, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  try {
    const params: ScanCommandInput = {
      TableName: NOTES_TABLE_NAME,
    };

    const notes = await ddbDocClient.send(new ScanCommand(params));

    return send(200, notes);
  } catch (e) {
    return send(500, e.message);
  }
};
