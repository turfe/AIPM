import pandas as pd
from sentence_transformers import SentenceTransformer
import json

# Step 1: Load the JSON dataset
with open("items.json", "r") as f:
    data = json.load(f)

# Step 2: Convert the JSON data into a DataFrame
df = pd.DataFrame(data)

# Step 3: Load pre-trained SentenceTransformer model
model = SentenceTransformer("all-MiniLM-L6-v2")

# Step 4: Generate embeddings for the 'description' field
print("Generating embeddings for descriptions...")
df["embedding"] = df["description"].apply(lambda desc: model.encode(desc).tolist())

# Step 5: Save the DataFrame with embeddings as a pickle file
df.to_pickle("embeds.pkl")
print("embeds.pkl generated successfully!")
