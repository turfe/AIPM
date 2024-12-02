from flask import Flask, render_template, request, jsonify, redirect, url_for, flash
from flask_sqlalchemy import SQLAlchemy
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
from sklearn.metrics.pairwise import cosine_similarity

app = Flask(__name__, template_folder='templates/', static_folder = 'static/')

# Configuration
app.config["SECRET_KEY"] = os.urandom(32)  # Replace with a secure key
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///database.db"  # SQLite database
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# Initialize extensions
db = SQLAlchemy(app)
login_manager = LoginManager()
login_manager.login_view = "login"  # Redirect to 'login' for @login_required
login_manager.init_app(app)


#############################################################################################
# Recommender
df = pd.read_pickle("embeds.pkl")
top_k = 2 # How many items to recommend per request

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
def is_user_complete(user_likes, user_dislikes, user_seen, df) :
    if (len(user_likes) > 2) :
        return True
    
    return False

def recommender_function(user_likes, user_dislikes, user_seen):
    # Load the clothes data
    clothes_data_path = os.path.join(app.root_path, "static", "data", "clothes_info.json")
    with open(clothes_data_path, "r") as f:
        clothes_json = json.load(f)
    
    total_items = len(clothes_json["item"])
    
    eligible_ids = set(range(total_items)) - set(user_likes) - set(user_dislikes) - set(user_seen)
    
    if not eligible_ids:
        return []  # No more items to recommend
    
    user_profile = update_user_profile(user_likes, user_dislikes, user_seen, df)
    if (is_user_complete(user_likes, user_dislikes, user_seen, df)) :
        print("Recommending...")
        recommended = retrieve_recommendations(user_profile, user_likes, user_dislikes, user_seen, df, top_k=top_k)
    else :
        print("Random...")
        recommended = random.sample([i for i in eligible_ids], top_k)

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

# Route: Home (Redirect to Login)
@app.route("/")
def home():
    return redirect(url_for("login"))

# Route: Register
@app.route("/register", methods=["GET", "POST"])
def register():
    if current_user.is_authenticated:
        return redirect(url_for("index"))

    if request.method == "POST":
        username = request.form.get("username").strip()
        password = request.form.get("password").strip()
        confirm_password = request.form.get("confirm_password").strip()

        # Basic validation
        if not username or not password or not confirm_password:
            flash("Please fill out all fields.", "warning")
            return redirect(url_for("register"))

        if password != confirm_password:
            flash("Passwords do not match.", "warning")
            return redirect(url_for("register"))

        # Check if username already exists
        existing_user = User.query.filter_by(username=username).first()
        if existing_user:
            flash("Username already exists. Please choose a different one.", "warning")
            return redirect(url_for("register"))

        # Create new user with hashed password
        hashed_password = generate_password_hash(
            password, method="pbkdf2:sha256", salt_length=8
        )
        new_user = User(username=username, password=hashed_password)
        db.session.add(new_user)
        db.session.commit()

        flash("Registration successful! Please log in.", "success")
        return redirect(url_for("login"))

    return render_template("register.html")

# Route: Login
@app.route("/login", methods=["GET", "POST"])
def login():
    if current_user.is_authenticated:
        return redirect(url_for("index"))

    if request.method == "POST":
        username = request.form.get("username").strip()
        password = request.form.get("password").strip()

        # Fetch user from database
        user = User.query.filter_by(username=username).first()
        if not user or not check_password_hash(user.password, password):
            flash("Invalid username or password.", "danger")
            return redirect(url_for("login"))

        # Log the user in
        login_user(user)
        flash("Logged in successfully!", "success")
        return redirect(url_for("index"))

    return render_template("login.html")

# Route: Logout
@app.route("/logout")
@login_required
def logout():
    logout_user()
    flash("You have been logged out.", "info")
    return redirect(url_for("login"))

# Route: Swiping Page
@app.route("/index")
@login_required
def index():
    return render_template("index.html")

# Route: Get Images
@app.route("/get_images", methods=["GET"])
@login_required
def get_images():
    # Fetch user's likes
    user_likes = [like.clothing_id for like in Like.query.filter_by(user_id=current_user.id).all()]
    
    # Fetch user's dislikes
    user_dislikes = [dislike.clothing_id for dislike in Dislike.query.filter_by(user_id=current_user.id).all()]
    
    # Fetch user's seen clothes
    user_seen = [seen.clothing_id for seen in Seen.query.filter_by(user_id=current_user.id).all()]
    
    # Call the recommender function to get next 2 clothing_ids
    recommended_ids = recommender_function(user_likes, user_dislikes, user_seen)
    
    if not recommended_ids:
        return jsonify({"images": []})  # No more items to recommend
    
    # Load the clothes data
    clothes_data_path = os.path.join(app.root_path, "static", "data", "clothes_info.json")
    with open(clothes_data_path, "r") as f:
        clothes_json = json.load(f)
    
    # Prepare the data to send
    recommended_items = []
    for clothing_id in recommended_ids:
        clothing = clothes_json["item"][clothing_id]
        item_data = {
            "clothing_id": clothing_id,  # Using index as unique ID
            "name": clothing["name"],
            "description": clothing["description"],
            "prize": clothing["prize"],
            "url": clothing["url"],
            "images": [clothing["img1"], clothing["img2"], clothing["img3"]],
        }
        recommended_items.append(item_data)
    
    # Mark these clothing_ids as seen
    for clothing_id in recommended_ids:
        existing_seen = Seen.query.filter_by(user_id=current_user.id, clothing_id=clothing_id).first()
        if not existing_seen:
            new_seen = Seen(user_id=current_user.id, clothing_id=clothing_id)
            db.session.add(new_seen)
    db.session.commit()
    
    return jsonify({"images": recommended_items})

# Route: Like
@app.route("/like", methods=["POST"])
@login_required
def like():
    data = request.get_json()
    clothing_id = data.get("clothing_id")

    if clothing_id is None:
        return jsonify({"status": "failure", "message": "No clothing ID provided."}), 400

    # Check if already liked
    existing_like = Like.query.filter_by(user_id=current_user.id, clothing_id=clothing_id).first()
    if existing_like:
        return jsonify({"status": "failure", "message": "Already liked this item."}), 400

    # Add like to the database
    new_like = Like(user_id=current_user.id, clothing_id=clothing_id)
    db.session.add(new_like)
    db.session.commit()

    return jsonify({"status": "success"})

# Route: Dislike
@app.route("/dislike", methods=["POST"])
@login_required
def dislike():
    data = request.get_json()
    clothing_id = data.get("clothing_id")

    if clothing_id is None:
        return jsonify({"status": "failure", "message": "No clothing ID provided."}), 400

    # Check if already disliked
    existing_dislike = Dislike.query.filter_by(user_id=current_user.id, clothing_id=clothing_id).first()
    if existing_dislike:
        return jsonify({"status": "failure", "message": "Already disliked this item."}), 400

    # Add dislike to the database
    new_dislike = Dislike(user_id=current_user.id, clothing_id=clothing_id)
    db.session.add(new_dislike)
    db.session.commit()

    return jsonify({"status": "success"})

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 4000))
    app.run(host="0.0.0.0", port=port)
