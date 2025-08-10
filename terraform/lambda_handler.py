"""
Minimal Lambda handler for testing
"""

import json

def handler(event, context):
    """
    Minimal AWS Lambda entry point for testing
    """
    try:
        # Return a simple health check response
        response = {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            },
            'body': json.dumps({
                'status': 'ok',
                'message': 'Lambda function is working',
                'environment': 'production'
            })
        }
        return response
    except Exception as e:
        # Return error response with CORS headers
        error_response = {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            },
            'body': json.dumps({
                'error': 'Internal server error',
                'message': str(e)
            })
        }
        return error_response
