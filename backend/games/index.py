import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Handles game operations - submit, approve, list, purchase
    Args: event with httpMethod, body, queryStringParameters; context with request_id
    Returns: HTTP response with games data or status
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()
    
    try:
        if method == 'GET':
            params = event.get('queryStringParameters', {})
            status_filter = params.get('status', 'approved')
            
            cur.execute("SELECT id, title, description, genre, age_rating, price, logo_url, file_url, status, created_by FROM games WHERE status = %s ORDER BY created_at DESC", (status_filter,))
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
                    'status': g[8],
                    'created_by': g[9]
                } for g in games])
            }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            action = body.get('action')
            
            if action == 'submit':
                cur.execute("""INSERT INTO games (title, description, genre, age_rating, price, logo_url, file_url, contact_email, created_by) 
                            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id""",
                           (body.get('title'), body.get('description'), body.get('genre'), 
                            body.get('age_rating'), body.get('price'), body.get('logo_url'), 
                            body.get('file_url'), body.get('contact_email'), body.get('user_id')))
                game_id = cur.fetchone()[0]
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'id': game_id, 'message': 'Игра отправлена на модерацию'})
                }
            
            elif action == 'purchase':
                user_id = body.get('user_id')
                game_id = body.get('game_id')
                
                cur.execute("SELECT price FROM games WHERE id = %s", (game_id,))
                game = cur.fetchone()
                if not game:
                    return {'statusCode': 404, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Game not found'})}
                
                price = float(game[0])
                
                cur.execute("SELECT balance FROM users WHERE id = %s", (user_id,))
                user = cur.fetchone()
                if float(user[0]) < price:
                    return {'statusCode': 400, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Недостаточно средств'})}
                
                cur.execute("INSERT INTO game_purchases (user_id, game_id, purchase_price) VALUES (%s, %s, %s) ON CONFLICT DO NOTHING", (user_id, game_id, price))
                cur.execute("UPDATE users SET balance = balance - %s WHERE id = %s", (price, user_id))
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'message': 'Игра куплена'})
                }
        
        elif method == 'PUT':
            body = json.loads(event.get('body', '{}'))
            game_id = body.get('game_id')
            status = body.get('status')
            
            cur.execute("UPDATE games SET status = %s WHERE id = %s", (status, game_id))
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'message': 'Статус игры обновлён'})
            }
        
        elif method == 'DELETE':
            body = json.loads(event.get('body', '{}'))
            user_id = body.get('user_id')
            game_id = body.get('game_id')
            
            cur.execute("SELECT purchase_price FROM game_purchases WHERE user_id = %s AND game_id = %s", (user_id, game_id))
            purchase = cur.fetchone()
            if purchase:
                refund = float(purchase[0]) * 0.9
                cur.execute("DELETE FROM game_purchases WHERE user_id = %s AND game_id = %s", (user_id, game_id))
                cur.execute("UPDATE users SET balance = balance + %s WHERE id = %s", (refund, user_id))
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'message': 'Игра удалена из библиотеки', 'refund': refund})
                }
        
        return {'statusCode': 405, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Method not allowed'})}
    
    finally:
        cur.close()
        conn.close()
