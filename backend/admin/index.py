import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Admin operations - manage users, frames, moderate games
    Args: event with httpMethod, body, queryStringParameters; context with request_id
    Returns: HTTP response with admin data or status
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
            
            if action == 'maintenance_status':
                cur.execute("SELECT value FROM t_p74122035_gde_store_creation.system_settings WHERE key = 'maintenance_mode'")
                result = cur.fetchone()
                is_maintenance = result[0] == 'true' if result else False
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'maintenance_mode': is_maintenance})
                }
            
            elif action == 'users':
                search = params.get('search', '')
                if search:
                    cur.execute("SELECT id, email, username, avatar_url, role, balance, is_banned, is_verified FROM t_p74122035_gde_store_creation.users WHERE username ILIKE %s ORDER BY is_verified DESC, username", (f'%{search}%',))
                else:
                    cur.execute("SELECT id, email, username, avatar_url, role, balance, is_banned, is_verified FROM t_p74122035_gde_store_creation.users ORDER BY is_verified DESC, username")
                users = cur.fetchall()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps([{
                        'id': u[0],
                        'email': u[1],
                        'username': u[2],
                        'avatar_url': u[3],
                        'role': u[4],
                        'balance': float(u[5]),
                        'is_banned': u[6],
                        'is_verified': u[7]
                    } for u in users])
                }
            
            elif action == 'pending_games':
                cur.execute("SELECT id, title, description, genre, age_rating, price, logo_url, file_url, contact_email, created_by, engine_type FROM t_p74122035_gde_store_creation.games WHERE status = 'pending' ORDER BY created_at DESC")
                games = cur.fetchall()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps([{
                        'id': g[0],
                        'title': g[1],
                        'description': g[2],
                        'genre': g[3],
                        'age_rating': g[4],
                        'price': float(g[5]),
                        'logo_url': g[6],
                        'file_url': g[7],
                        'contact_email': g[8],
                        'created_by': g[9],
                        'engine_type': g[10]
                    } for g in games])
                }
            
            return {'statusCode': 400, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'isBase64Encoded': False, 'body': json.dumps({'error': 'Invalid action'})}
        
        elif method == 'PUT':
            body = json.loads(event.get('body', '{}'))
            action = body.get('action')
            
            if action == 'ban_user':
                user_id = body.get('user_id')
                is_banned = body.get('is_banned', True)
                cur.execute("UPDATE t_p74122035_gde_store_creation.users SET is_banned = %s WHERE id = %s", (is_banned, user_id))
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'message': 'Статус бана обновлён'})
                }
            
            elif action == 'update_balance':
                user_id = body.get('user_id')
                balance = body.get('balance')
                cur.execute("UPDATE t_p74122035_gde_store_creation.users SET balance = %s WHERE id = %s", (balance, user_id))
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'message': 'Баланс обновлён'})
                }
            
            elif action == 'verify_user':
                user_id = body.get('user_id')
                is_verified = body.get('is_verified', True)
                cur.execute("UPDATE t_p74122035_gde_store_creation.users SET is_verified = %s WHERE id = %s", (is_verified, user_id))
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'message': 'Статус верификации обновлён'})
                }
            
            elif action == 'toggle_maintenance':
                enabled = body.get('enabled', False)
                value = 'true' if enabled else 'false'
                cur.execute("INSERT INTO t_p74122035_gde_store_creation.system_settings (key, value, updated_at) VALUES ('maintenance_mode', %s, CURRENT_TIMESTAMP) ON CONFLICT (key) DO UPDATE SET value = %s, updated_at = CURRENT_TIMESTAMP", (value, value))
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'message': 'Режим тех. работ обновлён', 'enabled': enabled})
                }
            
            elif action == 'add_balance':
                user_id = body.get('user_id')
                amount = body.get('amount')
                cur.execute("UPDATE t_p74122035_gde_store_creation.users SET balance = balance + %s WHERE id = %s RETURNING balance", (amount, user_id))
                new_balance = cur.fetchone()[0]
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'message': 'Баланс добавлен', 'new_balance': float(new_balance)})
                }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            action = body.get('action')
            
            if action == 'create_frame':
                name = body.get('name')
                image_url = body.get('image_url')
                price = body.get('price')
                
                cur.execute("INSERT INTO t_p74122035_gde_store_creation.frames (name, image_url, price) VALUES (%s, %s, %s) RETURNING id", (name, image_url, price))
                frame_id = cur.fetchone()[0]
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'id': frame_id, 'message': 'Рамка создана'})
                }
        
        return {'statusCode': 405, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Method not allowed'})}
    
    finally:
        cur.close()
        conn.close()