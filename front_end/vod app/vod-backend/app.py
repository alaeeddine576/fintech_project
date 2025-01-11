from flask import Flask, request, jsonify, redirect, url_for
from flask_cors import CORS
import json
import os
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
CORS(app)

USERS_FILE = 'users.json'

def load_users():
    if not os.path.exists(USERS_FILE):
        with open(USERS_FILE, 'w') as f:
            json.dump({"users": []}, f)
    with open(USERS_FILE, 'r') as f:
        return json.load(f)

def save_users(users_data):
    with open(USERS_FILE, 'w') as f:
        json.dump(users_data, f, indent=4)

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    email = data.get('email')

    users_data = load_users()
    
    # Check if username already exists
    if any(user['username'] == username for user in users_data['users']):
        return jsonify({'error': 'Username already exists'}), 400

    # Create new user
    new_user = {
        'username': username,
        'password': generate_password_hash(password),
        'email': email
    }
    
    users_data['users'].append(new_user)
    save_users(users_data)
    
    return jsonify({'message': 'Registration successful'}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    users_data = load_users()
    
    for user in users_data['users']:
        if user['username'] == username and check_password_hash(user['password'], password):
            return jsonify({
                'message': 'Login successful',
                'username': username
            }), 200
            
    return jsonify({'error': 'Invalid credentials'}), 401

if __name__ == '__main__':
    app.run(debug=True) 