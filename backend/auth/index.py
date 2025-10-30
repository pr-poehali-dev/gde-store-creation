import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Handles user authentication, registration, library, frames
    Args: event with httpMethod, body; context with request_id
    Returns: HTTP response with user data or error
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()
    
    try:
        if method == 'GET':
            params = event.get('queryStringParameters') or {}
            action = params.get('action')
            
            if action == 'library':
                user_id = params.get('user_id')
                cur.execute("""
                    SELECT gp.game_id, g.id, g.title, g.description, g.genre, g.age_rating, g.price, g.logo_url, g.file_url, g.status
                    FROM game_purchases gp
                    JOIN games g ON gp.game_id = g.id
                    WHERE gp.user_id = %s
                """, (user_id,))
                purchases = cur.fetchall()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps([{
                        'game_id': p[0],
                        'game': {
                            'id': p[1],
                            'title': p[2],
                            'description': p[3],
                            'genre': p[4],
                            'age_rating': p[5],
                            'price': float(p[6]),
                            'logo_url': p[7],
                            'file_url': p[8],
                            'status': p[9]
                        }
                    } for p in purchases])
                }
            
            elif action == 'frames':
                cur.execute("SELECT id, name, image_url, price FROM frames ORDER BY id")
                frames = cur.fetchall()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps([{
                        'id': f[0],
                        'name': f[1],
                        'image_url': f[2],
                        'price': float(f[3])
                    } for f in frames])
                }
            
            elif action == 'user_frames':
                user_id = params.get('user_id')
                cur.execute("SELECT frame_id FROM user_frames WHERE user_id = %s", (user_id,))
                user_frames = cur.fetchall()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps([{'frame_id': f[0]} for f in user_frames])
                }
        
        elif method == 'POST':
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
            
            elif action == 'purchase_frame':
                user_id = body.get('user_id')
                frame_id = body.get('frame_id')
                
                cur.execute("SELECT price FROM frames WHERE id = %s", (frame_id,))
                frame = cur.fetchone()
                if not frame:
                    return {'statusCode': 404, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Frame not found'})}
                
                price = float(frame[0])
                
                cur.execute("SELECT balance FROM users WHERE id = %s", (user_id,))
                user = cur.fetchone()
                if float(user[0]) < price:
                    return {'statusCode': 400, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Недостаточно средств'})}
                
                cur.execute("INSERT INTO user_frames (user_id, frame_id) VALUES (%s, %s) ON CONFLICT DO NOTHING", (user_id, frame_id))
                cur.execute("UPDATE users SET balance = balance - %s WHERE id = %s", (price, user_id))
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'message': 'Рамка куплена'})
                }
        
        elif method == 'PUT':
            body = json.loads(event.get('body', '{}'))
            action = body.get('action')
            
            if action == 'update_profile':
                user_id = body.get('user_id')
                username = body.get('username')
                avatar_url = body.get('avatar_url')
                
                cur.execute("UPDATE users SET username = %s, avatar_url = %s WHERE id = %s", (username, avatar_url, user_id))
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'message': 'Профиль обновлён'})
                }
            
            elif action == 'set_frame':
                user_id = body.get('user_id')
                frame_id = body.get('frame_id')
                
                cur.execute("UPDATE users SET active_frame_id = %s WHERE id = %s", (frame_id, user_id))
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'message': 'Рамка установлена'})
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