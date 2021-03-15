```
npm install -g serverless
sls dynamodb install
sls offline start



npm install -g dynamodb-admin
# For Windows:
set DYNAMO_ENDPOINT=http://localhost:8000
dynamodb-admin

# For Mac/Linux:
DYNAMO_ENDPOINT=http://localhost:8000 dynamodb-admin



```
Steps for the first run
```
java -Djava.library.path=./DynamoDBLocal_lib -jar DynamoDBLocal.jar -sharedDb

aws dynamodb list-tables --endpoint-url http://localhost:8000


npm install
npm run installdb
npm run runOffline


```
Restart only need run
```
npm run runOffline
```


# Serverless CRUD

Serverless service which provides a basic CRUD scaffold.

## Installation

Make sure that you use Serverless v1.

1. Run `serverless install --url https://github.com/pmuens/serverless-crud` to install the service in your current working directory
2. Next up cd into the service with `cd serverless-crud`
3. Run `npm install`
4. Deploy with `serverless deploy`

## How to use

Simply perform requests against the exposed endpoints:

### Create

```bash
curl -X POST https://XXXX.execute-api.region.amazonaws.com/dev/todos --data '{ "body" : "Learn Serverless" }'
```

### Read all


```bash
curl https://XXXX.execute-api.region.amazonaws.com/dev/todos
```

### Read one

```bash
curl https://XXXX.execute-api.region.amazonaws.com/dev/todos/<id>
```

### Update

```bash
curl -X PUT https://XXXX.execute-api.region.amazonaws.com/dev/todos/<id> --data '{ "body" : "Understand Serverless" }'
```

### DELETE

```bash
curl -X DELETE https://XXXX.execute-api.region.amazonaws.com/dev/todos/<id>
```

## AWS services used

- Lambda
- API Gateway
- DynamoDB
