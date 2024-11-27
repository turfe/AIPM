import React, { useState, useEffect } from "react";
import "./App.css";

const App = () => {
  const [items, setItems] = useState([]); // Full dataset
  const [queue, setQueue] = useState([]); // Current recommendation queue
  const [userLikes, setUserLikes] = useState([]); // Liked items
  const [userDislikes, setUserDislikes] = useState([]); // Disliked items
  const [belowThreshold, setBelowThreshold] = useState(false); // Show fallback message?

  const MATCH_THRESHOLD = 3; // Minimum similarity score for recommendations
  const MAX_QUEUE_LENGTH = 5; // Maximum number of items in the queue

  // Load Items from JSON
  useEffect(() => {
    fetch("/run_results.json") // Replace with your JSON path
      .then((response) => response.json())
      .then((data) => {
        setItems(data.item);
        setQueue(data.item.slice(0, MAX_QUEUE_LENGTH)); // Initialize queue with the first 5 items
      });
  }, []);

  // Helper: Clean Description Text
  const extractKeywords = (text) => {
    if (!text) return []; // Handle undefined or null text
    return text
      .toLowerCase()
      .replace(/[^a-z\s]/g, "") // Remove punctuation
      .split(/\s+/); // Split into words
  };

  // Calculate Similarity Score Between Items
  const calculateSimilarity = (descA, descB) => {
    const wordsA = extractKeywords(descA || ""); // Fallback to empty string
    const wordsB = extractKeywords(descB || ""); // Fallback to empty string

    const commonWords = wordsA.filter((word) => wordsB.includes(word));
    return commonWords.length; // Score based on the number of shared words
  };

  // Generate Recommendations
  const recommendItems = () => {
    if (userLikes.length === 0) {
      // Fallback: Return all unseen items in default order
      const seenItems = [...userLikes, ...userDislikes];
      return items.filter(
        (item) => !seenItems.some((seen) => seen.name === item.name)
      );
    }

    // Calculate similarity for unseen items
    const seenItems = [...userLikes, ...userDislikes];
    const unseenItems = items.filter(
      (item) => !seenItems.some((seen) => seen.name === item.name)
    );

    const recommendations = unseenItems.map((item) => {
      const similarityScore = userLikes.reduce(
        (score, likedItem) =>
          score + calculateSimilarity(item.description, likedItem.description),
        0
      );
      return { item, score: similarityScore };
    });

    // Sort by similarity score
    recommendations.sort((a, b) => b.score - a.score);

    // Filter items that meet the threshold and limit to top 5
    const matchingItems = recommendations.filter(
      (entry) => entry.score >= MATCH_THRESHOLD
    );

    if (matchingItems.length === 0) {
      // If no items meet the threshold, set belowThreshold to true
      setBelowThreshold(true);
    } else {
      setBelowThreshold(false); // Reset the fallback message
    }

    // Return only the top 5 matches above the threshold
    return matchingItems.slice(0, MAX_QUEUE_LENGTH).map((entry) => entry.item);
  };

  // Recalculate Recommendations When Likes/Dislikes Change
  useEffect(() => {
    const recommendations = recommendItems();
    setQueue(recommendations); // Update queue with top recommendations
  }, [userLikes, userDislikes]);

  // Handle User Actions
  const handleAction = (action, item) => {
    if (action === "like") {
      setUserLikes([...userLikes, item]);
    } else if (action === "dislike") {
      setUserDislikes([...userDislikes, item]);
    }

    // Move to the next item in the queue
    setQueue((prevQueue) => prevQueue.slice(1));
  };

  // Show Remaining Items Below Threshold
  const showRemainingItems = () => {
    const seenItems = [...userLikes, ...userDislikes];
    const unseenItems = items.filter(
      (item) => !seenItems.some((seen) => seen.name === item.name)
    );

    setQueue(unseenItems.slice(0, MAX_QUEUE_LENGTH)); // Add unseen items below the threshold
    setBelowThreshold(false); // Hide fallback message
  };

  return (
    <div className="App">
      <h1>PolySwap Recommender</h1>

      {/* Display Fallback Message if Below Threshold */}
      {belowThreshold && queue.length === 0 && (
        <div className="fallback-message">
          <p>
            There are more products available, but they may not match what
            you're looking for. Do you still want to see them?
          </p>
          <button onClick={showRemainingItems}>Show Remaining Products</button>
        </div>
      )}

      {/* Display Current Item */}
      {queue.length > 0 ? (
        <div className="card">
          <img src={queue[0]?.img1} alt={queue[0]?.name} className="item-image" />
          <div className="info">
            <h3>{queue[0]?.name}</h3>
            <p>{queue[0]?.description}</p>
            <p>
              <strong>Price:</strong> {queue[0]?.prize}
            </p>
          </div>
          <div className="buttons">
            <button onClick={() => handleAction("dislike", queue[0])}>
              Dislike
            </button>
            <button onClick={() => handleAction("like", queue[0])}>
              Like
            </button>
          </div>
        </div>
      ) : !belowThreshold ? (
        <p>No more recommendations! Refresh the page or reset your likes/dislikes.</p>
      ) : null}
    </div>
  );
};

export default App;
