import React from 'react';
import './DreamList.css';

const DreamList = ({ dreams, onDelete }) => {
  return (
    <div className="dreams-list">
      {dreams.map((dream) => (
        <div key={dream._id} className="dream-card">
          <div className="dream-content">
            <h3>Dream</h3>
            <p>{dream.dream}</p>
          </div>
          <div className="interpretation-content">
            <h3>Interpretation</h3>
            {dream.interpretation.split('\n').map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
          <button 
            onClick={() => onDelete(dream._id)}
            className="delete-btn"
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
};

export default DreamList;
