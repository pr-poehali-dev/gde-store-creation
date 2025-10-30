import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Handles user authentication and registration
    Args: event with httpMethod, body; context with request_id
    Returns: HTTP response with user data or error
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()
    
    try:
        if method == 'POST':
            body = json.loads(event.get('body', '{}'))
            action = body.get('action')
            
            if action == 'login':
                email = body.get('email', '')
                password = body.get('password', '')
                
                cur.execute("SELECT id, email, username, avatar_url, role, balance, is_banned, is_verified, time_spent_hours FROM users WHERE email = %s AND password = %s", (email, password))
                user = cur.fetchone()
                
                if not user:
                    return {
                        'statusCode': 401,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'isBase64Encoded': False,
                        'body': json.dumps({'error': 'Неверный email или пароль'})
                    }
                
                if user[6]:
                    return {
                        'statusCode': 403,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'isBase64Encoded': False,
                        'body': json.dumps({'error': 'Вы заблокированы'})
                    }
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({
                        'id': user[0],
                        'email': user[1],
                        'username': user[2],
                        'avatar_url': user[3],
                        'role': user[4],
                        'balance': float(user[5]),
                        'is_verified': user[7],
                        'time_spent_hours': user[8]
                    })
                }
            
            elif action == 'register':
                email = body.get('email', '')
                password = body.get('password', '')
                username = body.get('username', '')
                
                cur.execute("SELECT id FROM users WHERE email = %s", (email,))
                if cur.fetchone():
                    return {
                        'statusCode': 409,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'isBase64Encoded': False,
                        'body': json.dumps({'error': 'Пользователь с таким email уже существует'})
                    }
                
                cur.execute("INSERT INTO users (email, password, username) VALUES (%s, %s, %s) RETURNING id, email, username, avatar_url, role, balance, is_verified, time_spent_hours", 
                           (email, password, username))
                user = cur.fetchone()
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({
                        'id': user[0],
                        'email': user[1],
                        'username': user[2],
                        'avatar_url': user[3],
                        'role': user[4],
                        'balance': float(user[5]),
                        'is_verified': user[6],
                        'time_spent_hours': user[7]
                    })
                }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    finally:
        cur.close()
        conn.close()
