/* src/pages/Recommendations.css */

.recommendations-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
  font-family: sans-serif;
  color: #333;
}

.recommendations-page h1 {
  margin-bottom: 1rem;
  color: #444;
}

.intro-text {
  margin-bottom: 1.5rem;
  font-size: 1rem;
  color: #555;
}

.recommendation-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.recommendation-filters label {
  display: flex;
  align-items: center;
  font-weight: 500;
}

.recommendation-filters input[type="date"],
.recommendation-filters select {
  margin-left: 0.5rem;
  padding: 0.3rem;
  font-size: 1rem;
}

.recommendation-card {
  background-color: #f9f9f9;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 1.5rem;
}

.recommendation-card h2 {
  margin-top: 0;
  color: #666;
}

.recommendation-card ul {
  margin-top: 0.5rem;
  margin-left: 1.2rem;
  list-style: disc;
}

