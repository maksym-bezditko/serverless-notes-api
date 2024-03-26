'use strict';

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, UpdateCommand, DeleteCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({
  region: 'eu-north-1',
  maxRetries: 3,
  httpOptions: {
    timeout: 5000, // increases the default timeout
  },
});

const ddbDocClient = DynamoDBDocumentClient.from(client);

const NOTES_TABLE_NAME = process.env.NOTES_TABLE_NAME;

const send = (statusCode, body) => {
  return {
    statusCode,
    body: JSON.stringify(body),
  };
}

module.exports.createNote = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  let data = JSON.parse(event.body);

  try {
    const params = {
      TableName: NOTES_TABLE_NAME,
      Item: {
        notesId: data.id,
        title: data.title,
        body: data.body
      },
      ConditionExpression: "attribute_not_exists(notesId)"
    }

    await ddbDocClient.send(new PutCommand(params));

    return send(201, data);
  } catch (e) {
    return send(500, e.message);
  }
};

module.exports.updateNote = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  let notesId = event.pathParameters.id;

  let data = JSON.parse(event.body);

  try {
    const params = {
      TableName: NOTES_TABLE_NAME,
      Key: {
        notesId
      },
      UpdateExpression: `set #title = :title, #body = :body`,
      ExpressionAttributeNames: {
        '#title': 'title',
        '#body': 'body'
      },
      ExpressionAttributeValues: {
        ':title': data.title,
        ':body': data.body
      },
      ConditionExpression: 'attribute_exists(notesId)'
    }

    await ddbDocClient.send(new UpdateCommand(params));

    return send(200, data);
  } catch (e) {
    return send(500, e.message);
  }
};

module.exports.deleteNote = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  let notesId = event.pathParameters.id;

  try {
    const params = {
      TableName: NOTES_TABLE_NAME,
      Key: {
        notesId
      },
      ConditionExpression: 'attribute_exists(notesId)'
    };

    await ddbDocClient.send(new DeleteCommand(params));

    return send(200, notesId);
  } catch (e) {
    return send(500, e.message);
  }
};

module.exports.getAllNotes = async (_, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  try {
    const params = {
      TableName: NOTES_TABLE_NAME
    }

    const notes = await ddbDocClient.send(new ScanCommand(params));

    return send(200, notes);
  } catch (e) {
    return send(500, e.message);
  }
};

