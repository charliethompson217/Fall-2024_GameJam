import json
import boto3
from datetime import datetime
import time

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table("WebSocketConnections-dev")

def handler(event, context):
    # Log the entire event for full context
    print("Received event:", json.dumps(event))
    
    # Extracting essential details with debugging
    connection_id = event['requestContext'].get('connectionId')
    route_key = event.get('requestContext', {}).get('routeKey')
    
    print("Extracted Connection ID:", connection_id)
    print("Extracted Route Key:", route_key)
    print("Event Body:", event.get("body"))

    if not connection_id:
        print("Error: No connection ID found in the request.")
        return {
            'statusCode': 400,
            'body': json.dumps({'message': 'No connectionId found'})
        }

    # Handle routes based on routeKey for WebSocket
    if route_key == '$connect':
        print("Handling $connect route")
        return add_connection(connection_id)
    elif route_key == '$disconnect':
        print("Handling $disconnect route")
        return delete_connection(connection_id)
    elif route_key == '$default':
        print("Handling $default route - Parsing action in message body")
        # Parse the message to check if it's a getTime request
        try:
            message = json.loads(event.get("body", "{}"))
            print("Parsed Message:", message)
            
            if message.get("action") == "getTime":
                print("Action is getTime, proceeding to broadcast time")
                return broadcast_time(event)
            else:
                print("Action not recognized:", message.get("action"))
        except json.JSONDecodeError as e:
            print("Error parsing JSON:", str(e))
            return {
                'statusCode': 400,
                'body': json.dumps({'message': 'Invalid JSON format'})
            }
        
        print("Invalid action specified in message body")
        return {
            'statusCode': 400,
            'body': json.dumps({'message': 'Invalid action'})
        }
    else:
        print("Invalid route key:", route_key)
        return {
            'statusCode': 400,
            'body': json.dumps({'message': 'Invalid route'})
        }

def add_connection(connection_id):
    try:
        # Get the current Unix timeStamp
        timeStamp = int(time.time())
        print(f"Attempting to add connection ID: {connection_id} with timeStamp: {timeStamp}")
        
        # Add the connection ID and timeStamp to DynamoDB
        table.put_item(Item={'connectionId': connection_id, 'timeStamp': timeStamp})
        print("Successfully added connection.")
        
        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'Connection added', 'connectionId': connection_id})
        }
    except Exception as e:
        print("Failed to add connection:", str(e))
        return {
            'statusCode': 500,
            'body': json.dumps({'message': 'Failed to add connection', 'error': str(e)})
        }

def delete_connection(connection_id):
    try:
        print("Deleting connection from DynamoDB with connection ID:", connection_id)
        table.delete_item(Key={'connectionId': connection_id})
        print("Successfully deleted connection.")
        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'Connection deleted', 'connectionId': connection_id})
        }
    except Exception as e:
        print("Failed to delete connection:", str(e))
        return {
            'statusCode': 500,
            'body': json.dumps({'message': 'Failed to delete connection', 'error': str(e)})
        }

def broadcast_time(event):
    current_time = str(time.time_ns())
    print("Broadcasting current time:", current_time)
    try:
        print("Scanning DynamoDB table for connections")
        response = table.scan()
        items = response.get('Items', [])
        connection_ids = [item['connectionId'] for item in items]
        print("Active connections found:", connection_ids)

        # Setting up the API Gateway client for WebSocket communication
        api_gateway_client = boto3.client(
            'apigatewaymanagementapi', 
            endpoint_url="https://b2b7fdgyj9.execute-api.us-east-2.amazonaws.com/dev"
        )

        for connection_id in connection_ids:
            try:
                print(f"Sending time to connection {connection_id}")
                api_gateway_client.post_to_connection(
                    Data=json.dumps({'time': current_time}),
                    ConnectionId=connection_id
                )
                print(f"Successfully sent time to connection {connection_id}")
            except Exception as e:
                print(f"Error sending time to connection {connection_id}: {str(e)}")
        
        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'Time broadcasted to all connections', 'time': current_time})
        }
    except Exception as e:
        print("Failed to broadcast time:", str(e))
        return {
            'statusCode': 500,
            'body': json.dumps({'message': 'Failed to broadcast time', 'error': str(e)})
        }