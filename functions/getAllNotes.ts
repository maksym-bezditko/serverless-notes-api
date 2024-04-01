"use strict";

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
  ScanCommandInput,
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

export const handler: LambdaFunction = async (_, context) => {
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
