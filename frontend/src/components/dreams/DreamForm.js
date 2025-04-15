import React from 'react';
import './DreamForm.css';

const DreamForm = ({ dream, setDream, handleSubmit, isLoading }) => {
  return (
    <form onSubmit={handleSubmit} className="dream-form">
      <textarea
        value={dream}
        onChange={(e) => setDream(e.target.value)}
        placeholder="Describe your dream..."
        rows="4"
        required
      />
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Interpreting...' : 'Interpret Dream'}
      </button>
    </form>
  );
};

export default DreamForm;
