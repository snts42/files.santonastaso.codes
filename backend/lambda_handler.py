"""
AWS Lambda handler for FastAPI application
Optimized for AWS Free Tier usage
"""

import json
from mangum import Mangum
from main import app

# Create the Lambda handler
handler = Mangum(app, lifespan="off")

def lambda_handler(event, context):
    """
    AWS Lambda entry point
    """
    # Add CORS headers for all responses
    def add_cors_headers(response):
        if isinstance(response, dict) and 'headers' in response:
            response['headers'].update({
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            })
        return response
    
    try:
        # Process the request through Mangum
        response = handler(event, context)
        return add_cors_headers(response)
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
                'message': str(e) if context.invoked_function_arn.endswith(':dev') else 'Something went wrong'
            })
        }
        return error_response
