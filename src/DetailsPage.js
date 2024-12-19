import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

function DetailsPage() {
  const [postDetails, setPostDetails] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    fetchPostDetails();
  }, [id]);

  const fetchPostDetails = async () => {
    try {
      const response = await fetch(`https://your-fastapi-url.com/posts/${id}`);
      const data = await response.json();
      setPostDetails(data);
    } catch (error) {
      console.error('Error fetching post details:', error);
    }
  };

  if (!postDetails) {
    return <div>Loading...</div>;
  }

  return (
    <div className="details-page">
      <h2>{postDetails.title}</h2>
      <p>{postDetails.content}</p>
      <p>Sentiment: {postDetails.sentiment}</p>
    </div>
  );
}

export default DetailsPage;

