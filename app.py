from flask import Flask, render_template, request, jsonify, redirect, url_for, flash
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_login import (
    LoginManager,
    UserMixin,
    login_user,
    login_required,
    logout_user,
    current_user,
)
from werkzeug.security import generate_password_hash, check_password_hash
import os
import json
import random
import numpy as np
import pandas as pd
import re

from typing import List
from sklearn.metrics.pairwise import cosine_similarity

app = Flask(__name__)

# Configuration
# Use a consistent SECRET_KEY from environment variable or fallback to a default (not recommended for production)
app.config["SECRET_KEY"] = os.environ.get('SECRET_KEY', 'your-default-secret-key')  # Replace with a secure key in production
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///database.db"  # SQLite database
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# Session cookie settings
app.config['SESSION_COOKIE_SAMESITE'] = 'None'
app.config['SESSION_COOKIE_SECURE'] = True

# Initialize extensions
db = SQLAlchemy(app)
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = "login"  # Endpoint name (not used with custom handler)

# Configure CORS
CORS(app, supports_credentials=True, origins=['https://polyswipe.netlify.app'])

#############################################################################################
# Recommender
df = pd.read_pickle("embeds.pkl")
top_k = 2  # How many items to recommend per request

def update_user_profile(user_likes, user_dislikes, user_seen, df):
    liked_embeddings = [df.iloc[idx]['embedding'] for idx in user_likes]
    disliked_embeddings = [df.iloc[idx]['embedding'] for idx in user_dislikes]

    user_profile = np.mean(liked_embeddings, axis=0) 

    dislike_weight = 0.5 
    if disliked_embeddings:
        user_profile -= dislike_weight * np.mean(disliked_embeddings, axis=0)

    return user_profile

def retrieve_recommendations(user_profile, user_likes, user_dislikes, user_seen, df, top_k=2):
    item_embeddings = np.array(df['embedding'].tolist())
    similarities = cosine_similarity([user_profile], item_embeddings)[0]

    unseen_indices = [i for i in range(len(df)) if i not in user_seen]
    unseen_similarities = similarities[unseen_indices]

    top_k_indices = [unseen_indices[i] for i in np.argsort(unseen_similarities)[::-1][:top_k]]
    return top_k_indices

# TODO: Add Preferences
def is_user_complete(user_likes, user_dislikes, user_seen, df):
    if len(user_likes) > 2:
        return True
    return False

def load_products_ts(products_path):
    """
    Parse the products.ts file to extract the products array.
    """
    with open(products_path, "r") as f:
        ts_content = f.read()
    
    # Extract the JSON-like part of the file (the array)
    match = re.search(r"export const products: Product\[] = (\[.*\]);", ts_content, re.DOTALL)
    if not match:
        raise ValueError("Could not extract products array from products.ts")

    # Parse the array as JSON
    products_data = json.loads(match.group(1))
    return products_data

def recommender_function(user_likes, user_dislikes, user_seen, top_k=5):
    # Load the products data
    products = load_products_ts('src/data/full_products.ts')
    
    total_items = len(products)
    
    eligible_ids = set(range(total_items)) - set(user_likes) - set(user_dislikes) - set(user_seen)
    
    if not eligible_ids:
        return []  # No more items to recommend
    
    # Update user profile
    user_profile = update_user_profile(user_likes, user_dislikes, user_seen, df)
    
    if is_user_complete(user_likes, user_dislikes, user_seen, df):
        print("Recommending...")
        recommended = retrieve_recommendations(user_profile, user_likes, user_dislikes, user_seen, df, top_k=top_k)
    else:
        print("Random...")
        recommended = random.sample(list(eligible_ids), min(top_k, len(eligible_ids)))
    
    return recommended

#############################################################################################
# User Model
class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)  # Required for Flask-Login
    username = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(150), nullable=False)
    # Additional fields can be added here

# Like Model
class Like(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    clothing_id = db.Column(db.Integer, nullable=False)

    # Ensure a user cannot like the same clothing item multiple times
    __table_args__ = (
        db.UniqueConstraint('user_id', 'clothing_id', name='unique_user_like'),
    )

# Dislike Model
class Dislike(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    clothing_id = db.Column(db.Integer, nullable=False)

    # Ensure a user cannot dislike the same clothing item multiple times
    __table_args__ = (
        db.UniqueConstraint('user_id', 'clothing_id', name='unique_user_dislike'),
    )

# Seen Model
class Seen(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    clothing_id = db.Column(db.Integer, nullable=False)

    # Ensure a user cannot mark the same clothing item as seen multiple times
    __table_args__ = (
        db.UniqueConstraint('user_id', 'clothing_id', name='unique_user_seen'),
    )

# Create the database tables
with app.app_context():
    db.create_all()

# User Loader Callback for Flask-Login
@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Custom Unauthorized Handler
@login_manager.unauthorized_handler
def unauthorized_callback():
    return jsonify({"message": "Unauthorized access"}), 401

# Route: Home (Redirect to Login)
@app.route("/")
def home():
    return redirect(url_for("login"))

# Route: Register
@app.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")
    confirm_password = data.get("confirm_password")
    
    if not username or not password or not confirm_password:
        return jsonify({"message": "Username and passwords are required."}), 400

    if password != confirm_password:
        return jsonify({"message": "Passwords do not match"}), 400
        
    if User.query.filter_by(username=username).first():
        return jsonify({"message": "Username already exists"}), 400
        
    hashed_password = generate_password_hash(password)
    new_user = User(username=username, password=hashed_password)
    
    try:
        db.session.add(new_user)
        db.session.commit()
        login_user(new_user)
        return jsonify({
            "user": {
                "id": new_user.id,
                "username": new_user.username
            }
        }), 201
    except Exception as e:
        db.session.rollback()
        print("Registration error:", str(e))
        return jsonify({"message": "Registration failed"}), 500

# Route: Login (POST Only)
@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"message": "Username and password are required."}), 400

    user = User.query.filter_by(username=username).first()
    
    if user and check_password_hash(user.password, password):
        login_user(user)
        return jsonify({
            "user": {
                "id": user.id,
                "username": user.username
            }
        }), 200
    
    return jsonify({"message": "Invalid credentials"}), 401

# Route: Logout
@app.route("/logout", methods=["POST"])
@login_required
def logout():
    logout_user()
    return jsonify({"message": "Logged out successfully"}), 200

# Route: Check Authentication
@app.route("/check-auth", methods=["GET"])
def check_auth():
    if current_user.is_authenticated:
        return jsonify({
            "user": {
                "id": current_user.id,
                "username": current_user.username
            }
        }), 200
    return jsonify({"message": "Not authenticated"}), 401

# Route: Swiping Page (if needed)
@app.route("/index", methods=["GET"])
def index():
    return render_template("index.html")

# Route: Get Images
@app.route("/get_images", methods=["GET"])
def get_images():
    try:
        # Fetch user's likes
        user_likes = [like.clothing_id for like in Like.query.filter_by(user_id=current_user.id).all()]
        print("User likes:", user_likes)
        
        # Fetch user's dislikes
        user_dislikes = [dislike.clothing_id for dislike in Dislike.query.filter_by(user_id=current_user.id).all()]
        print("User dislikes:", user_dislikes)
        
        # Fetch user's seen clothes
        user_seen = [seen.clothing_id for seen in Seen.query.filter_by(user_id=current_user.id).all()]
        print("User seen:", user_seen)
        
        # Call the recommender function to get next 2 clothing_ids
        products_path = os.path.join(app.root_path, "src", "data", "full_products.ts")
        recommended_ids = recommender_function(user_likes, user_dislikes, user_seen, top_k=2)
        print("Recommended IDs:", recommended_ids)
        
        if not recommended_ids:
            return jsonify({"images": []}), 200
        
        # Load the products data
        products = load_products_ts(products_path)
        
        # Prepare the data to send
        recommended_items = []
        for clothing_id in recommended_ids:
            try:
                clothing = products[int(clothing_id)]  # Access product by index
                item_data = {
                    "clothing_id": clothing_id,
                    "name": clothing["name"],
                    "description": clothing["description"],
                    "price": clothing["price"],
                    "url": clothing["externalUrl"],
                    "images": [clothing["imageUrl"]],  # Only 1 image available in products.ts
                }
                recommended_items.append(item_data)
            except (KeyError, IndexError) as e:
                print(f"Error accessing clothing data for ID {clothing_id}: {e}")
                continue
        
        return jsonify({"images": recommended_items}), 200
    except Exception as e:
        print(f"Error in get_images: {str(e)}")
        return jsonify({"error": str(e)}), 500

# Route: Like
@app.route("/like", methods=["POST"])
@login_required
def like():
    try:
        data = request.get_json()
        clothing_id = data.get("clothing_id")

        if clothing_id is None:
            return jsonify({"status": "failure", "message": "No clothing ID provided."}), 400

        clothing_id = int(clothing_id)

        # Check if already liked
        existing_like = Like.query.filter_by(user_id=current_user.id, clothing_id=clothing_id).first()
        if existing_like:
            return jsonify({"status": "failure", "message": "Already liked this item."}), 400

        # Add like to the database
        new_like = Like(user_id=current_user.id, clothing_id=clothing_id)
        new_seen = Seen(user_id=current_user.id, clothing_id=clothing_id)
        
        db.session.add(new_like)
        db.session.add(new_seen)
        db.session.commit()

        # Get new recommendations immediately
        user_likes = [like.clothing_id for like in Like.query.filter_by(user_id=current_user.id).all()]
        user_dislikes = [dislike.clothing_id for dislike in Dislike.query.filter_by(user_id=current_user.id).all()]
        user_seen = [seen.clothing_id for seen in Seen.query.filter_by(user_id=current_user.id).all()]
        
        recommended_ids = recommender_function(user_likes, user_dislikes, user_seen, top_k=2)
        products = load_products_ts(os.path.join(app.root_path, "src", "data", "full_products.ts"))
        
        recommended_items = []
        for clothing_id in recommended_ids:
            try:
                clothing = products[int(clothing_id)]
                item_data = {
                    "clothing_id": clothing_id,
                    "name": clothing["name"],
                    "description": clothing["description"],
                    "price": clothing["price"],
                    "url": clothing["externalUrl"],
                    "images": [clothing["imageUrl"]],
                }
                recommended_items.append(item_data)
            except (KeyError, IndexError) as e:
                print(f"Error accessing clothing data for ID {clothing_id}: {e}")
                continue

        return jsonify({
            "status": "success",
            "new_recommendations": recommended_items
        }), 200

    except Exception as e:
        db.session.rollback()
        print(f"Error in like route: {str(e)}")
        return jsonify({"status": "failure", "message": "An error occurred while processing your request."}), 500

# Route: Dislike
@app.route("/dislike", methods=["POST"])
@login_required
def dislike():
    try:
        data = request.get_json()
        clothing_id = data.get("clothing_id")

        if clothing_id is None:
            return jsonify({"status": "failure", "message": "No clothing ID provided."}), 400

        clothing_id = int(clothing_id)

        # Check if already disliked
        existing_dislike = Dislike.query.filter_by(user_id=current_user.id, clothing_id=clothing_id).first()
        if existing_dislike:
            return jsonify({"status": "failure", "message": "Already disliked this item."}), 400

        # Add dislike to the database
        new_dislike = Dislike(user_id=current_user.id, clothing_id=clothing_id)
        new_seen = Seen(user_id=current_user.id, clothing_id=clothing_id)
        
        db.session.add(new_dislike)
        db.session.add(new_seen)
        db.session.commit()

        # Get new recommendations immediately
        user_likes = [like.clothing_id for like in Like.query.filter_by(user_id=current_user.id).all()]
        user_dislikes = [dislike.clothing_id for dislike in Dislike.query.filter_by(user_id=current_user.id).all()]
        user_seen = [seen.clothing_id for seen in Seen.query.filter_by(user_id=current_user.id).all()]
        
        recommended_ids = recommender_function(user_likes, user_dislikes, user_seen, top_k=2)
        products = load_products_ts(os.path.join(app.root_path, "src", "data", "full_products.ts"))
        
        recommended_items = []
        for clothing_id in recommended_ids:
            try:
                clothing = products[int(clothing_id)]
                item_data = {
                    "clothing_id": clothing_id,
                    "name": clothing["name"],
                    "description": clothing["description"],
                    "price": clothing["price"],
                    "url": clothing["externalUrl"],
                    "images": [clothing["imageUrl"]],
                }
                recommended_items.append(item_data)
            except (KeyError, IndexError) as e:
                print(f"Error accessing clothing data for ID {clothing_id}: {e}")
                continue

        return jsonify({
            "status": "success",
            "new_recommendations": recommended_items
        }), 200

    except Exception as e:
        db.session.rollback()
        print(f"Error in dislike route: {str(e)}")
        return jsonify({"status": "failure", "message": "An error occurred while processing your request."}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 4000))
    app.run(host="0.0.0.0", port=port)
