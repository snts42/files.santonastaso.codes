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
        # Log the event for debugging
        print(f"Lambda event: {json.dumps(event)}")
        print(f"Lambda context: {context.function_name}")
        
        # Process the request through Mangum
        response = handler(event, context)
        return add_cors_headers(response)
    except Exception as e:
        # Log the full error for debugging
        import traceback
        print(f"Lambda error: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        
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
                'message': str(e)  # Always show the error for debugging
            })
        }
        return error_response
