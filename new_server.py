from flask import Flask, request, jsonify, session
from flask_cors import CORS

import os
import random
import numpy as np
import pandas as pd

from sklearn.metrics.pairwise import cosine_similarity
from werkzeug.security import generate_password_hash, check_password_hash


def update_user_profile(user_likes, user_dislikes, df):
    liked_embeddings = [df.iloc[idx]['embedding'] for idx in user_likes]
    disliked_embeddings = [df.iloc[idx]['embedding'] for idx in user_dislikes]


    user_profile = np.mean(liked_embeddings, axis=0) 

    dislike_weight = 0.5 
    if disliked_embeddings:
        user_profile -= dislike_weight * np.mean(disliked_embeddings, axis=0)

    return user_profile

def retrieve_recommendations(user_profile, df, seen_indices, top_k=5):
    item_embeddings = np.array(df['embedding'].tolist())
    similarities = cosine_similarity([user_profile], item_embeddings)[0]

    unseen_indices = [i for i in range(len(df)) if i not in seen_indices]
    unseen_similarities = similarities[unseen_indices]

    top_k_indices = [unseen_indices[i] for i in np.argsort(unseen_similarities)[::-1][:top_k]]
    return top_k_indices

app = Flask(__name__)
app.secret_key = 'your-secret-key' 
CORS(app)
df = pd.read_pickle("embeds.pkl")

users = {} 
user_likes = {} 
user_dislikes = {} 
user_profiles = {} 

min_liked = 3 
top_k = 2     

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    age = data.get('age')
    gender = data.get('gender')
    location = data.get('location')


    if not username or not email or not password:
        return jsonify({'status': 'error', 'message': 'Missing required fields'}), 400

    if username in users:
        return jsonify({'status': 'error', 'message': 'Username already exists'}), 400


    password_hash = generate_password_hash(password)
    users[username] = {
        'email': email,
        'password_hash': password_hash,
        'age': age,
        'gender': gender,
        'location': location,
        'seen_indices': []
    }


    user_likes[username] = []
    user_dislikes[username] = []
    user_profiles[username] = None

    return jsonify({'status': 'success', 'message': 'User registered successfully'}), 201


@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')


    if not username or not password:
        return jsonify({'status': 'error', 'message': 'Missing username or password'}), 400

    user = users.get(username)
    if not user or not check_password_hash(user['password_hash'], password):
        return jsonify({'status': 'error', 'message': 'Invalid username or password'}), 401


    session['username'] = username

    return jsonify({'status': 'success', 'message': 'Logged in successfully'}), 200


@app.route('/logout', methods=['POST'])
def logout():
    session.pop('username', None)
    return jsonify({'status': 'success', 'message': 'Logged out successfully'}), 200


@app.route('/get_images', methods=['GET'])
def get_images():
    if 'username' not in session:
        return jsonify({'status': 'error', 'message': 'User not logged in'}), 401

    username = session['username']
    user_profile = user_profiles.get(username)
    seen_indices = users[username]['seen_indices']

    if user_profile is not None:
    
        recommendations = retrieve_recommendations(user_profile, df, seen_indices, top_k)
    else:
    
        recommendations = random.sample([i for i in range(len(df)) if i not in seen_indices], top_k)

    return jsonify({'status': 'ok', 'images': recommendations}), 200

@app.route('/like_image', methods=['POST'])
def like_image():
    if 'username' not in session:
        return jsonify({'status': 'error', 'message': 'User not logged in'}), 401

    username = session['username']
    data = request.get_json()
    liked = data.get('liked_image')

    if liked is None:
        return jsonify({'status': 'error', 'message': 'No image specified'}), 400

    if liked not in user_likes[username]:
        user_likes[username].append(liked)


    if liked not in users[username]['seen_indices']:
        users[username]['seen_indices'].append(liked)

    if len(user_likes[username]) >= min_liked:
        user_profile = update_user_profile(user_likes[username], user_dislikes[username], df)
        user_profiles[username] = user_profile

    return jsonify({'status': 'received'}), 200

@app.route('/dislike_image', methods=['POST'])
def dislike_image():
    if 'username' not in session:
        return jsonify({'status': 'error', 'message': 'User not logged in'}), 401

    username = session['username']
    data = request.get_json()
    disliked = data.get('disliked_image')


    if disliked is None:
        return jsonify({'status': 'error', 'message': 'No image specified'}), 400


    if disliked not in user_dislikes[username]:
        user_dislikes[username].append(disliked)


    if disliked not in users[username]['seen_indices']:
        users[username]['seen_indices'].append(disliked)


    if len(user_likes[username]) >= min_liked:
        user_profile = update_user_profile(user_likes[username], user_dislikes[username], df)
        user_profiles[username] = user_profile

    return jsonify({'status': 'received'}), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)
