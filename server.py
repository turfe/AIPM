from flask import Flask, request, jsonify  # for server work
from flask_cors import CORS 

import os
import random
import requests
import numpy as np
import pandas as pd
from tqdm.notebook import tqdm
from PIL import Image
from io import BytesIO
from IPython.display import display, Image as IPImage
from sklearn.metrics.pairwise import cosine_similarity
from sentence_transformers import SentenceTransformer
from transformers import CLIPProcessor, CLIPModel
import torch


# create and update user embeds
def update_user_profile(user_likes, user_dislikes, df):
    liked_embeddings = [df.iloc[idx]['embedding'] for idx in user_likes]
    disliked_embeddings = [df.iloc[idx]['embedding'] for idx in user_dislikes]

    # Calculate the user profile embedding
    user_profile = np.mean(liked_embeddings, axis=0)  # average liked
    
    dislike_weight = 0.5  # maybe needs to be changed ?
    if disliked_embeddings:
        user_profile -= dislike_weight * np.mean(disliked_embeddings, axis=0)

    return user_profile

def retrieve_recommendations(user_profile, df, seen_indices, top_k=5):
    
    item_embeddings = np.array(df['embedding'].tolist())
    similarities = cosine_similarity([user_profile], item_embeddings)[0]

    # exclude seen items
    unseen_indices = [i for i in range(len(df)) if i not in seen_indices]
    unseen_similarities = similarities[unseen_indices]

    # top-k recomm
    top_k_indices = [unseen_indices[i] for i in np.argsort(unseen_similarities)[::-1][:top_k]]
    # recommendations = df.iloc[top_k_indices]
    return top_k_indices


app = Flask(__name__)
CORS(app) 
df = pd.read_pickle("embeds.pkl")

user_likes=[]
user_dislikes=[]
seen_indices=[]
user_profile = None
user_created = False

# Settings
min_liked = 3 # minimum number of likes and dislikes required for predictor
top_k = 2 # number of recomended images which predictor gives per request

@app.route('/get_images', methods=['GET'])
def get_images():
    if (user_created) :
        print("Recommending...")
        recommendations = retrieve_recommendations(user_profile, df, seen_indices, top_k)
    else: # send random
        print("Random...")
        recommendations = random.sample(range(len(df)), top_k)

    return jsonify({'status': 'ok', 'images': recommendations})  # Send up to 5 images


@app.route('/like_image', methods=['POST'])
def like_image():
    global user_created, user_profile
    data = request.get_json()
    liked = data.get('liked_image')
    print("Like!")

    # Process liked images
    if liked not in user_likes:
        user_likes.append(liked)
    if liked not in seen_indices:
        seen_indices.append(liked)

    if (len(user_likes) >= min_liked) :
        print("Updating user!")
        user_profile = update_user_profile(user_likes, user_dislikes, df)
        user_created = True

    return jsonify({'status': 'received'})

@app.route('/dislike_image', methods=['POST'])
def dislike_image():
    global user_profile
    data = request.get_json()
    disliked = data.get('disliked_image')
    print("Dislike!")

    # Process liked images
    if disliked not in user_dislikes:
        user_dislikes.append(disliked)
    if disliked not in seen_indices:
        seen_indices.append(disliked)

    if (len(user_likes) >= min_liked) :
        print("Updating user!")
        user_profile = update_user_profile(user_likes, user_dislikes, df)

    return jsonify({'status': 'received'})

if __name__ == '__main__':
    app.run(debug=True, port=5000)