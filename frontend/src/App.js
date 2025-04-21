import React, { useState, useEffect } from 'react';
import { SignedOut, SignedIn, useUser, useAuth } from '@clerk/clerk-react';
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import AuthPage from './components/auth/AuthPage';
import Header from './components/layout/Header';
import DreamForm from './components/dreams/DreamForm';
import DreamList from './components/dreams/DreamList';
import Modal from './components/common/Modal';
import Settings from './pages/Settings';
import './App.css';

const DreamsPage = () => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [dream, setDream] = useState('');
  const [interpretation, setInterpretation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [pastDreams, setPastDreams] = useState([]);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, dreamId: null });
  const API_BASE_URL = process.env.REACT_APP_API_URL?.replace(/\/+$/, ''); // remove trailing slash
  console.log("Using API:", process.env.REACT_APP_API_URL);


  useEffect(() => {
    if (user) {
      console.log('Fetching past dreams...');
      fetchPastDreams();
    }
  }, [user]);

  const fetchPastDreams = async () => {
    try {
      const token = await getToken();
      console.log('Fetching dreams with token...');
      const res = await fetch(`${API_BASE_URL}/api/dream/history`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to fetch dream history');
      }

      const data = await res.json();
      console.log('Received dreams:', data);
      setPastDreams(data.dreams || []);
    } catch (err) {
      console.error('Error fetching dreams:', err);
      setError('Failed to fetch dream history');
    }
  };

  const handleDeleteConfirm = async () => {
    const id = deleteModal.dreamId;
    setDeleteModal({ isOpen: false, dreamId: null });
    try {
      const token = await getToken();
      console.log('Deleting dream with id:', id);
      
      const res = await fetch(`${API_BASE_URL}/api/dream/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await res.json();
      console.log('Delete response:', data);

      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete dream');
      }

      // Refresh the dreams list after successful deletion
      await fetchPastDreams();
      setError('');
    } catch (err) {
      setError('Failed to delete dream: ' + err.message);
      console.error('Delete error:', err);
    }
  };

  const handleDreamSubmit = async (e) => {
    e.preventDefault();
    const trimmedDream = dream.trim();
    
    if (!trimmedDream) {
      setError('Please enter a dream to interpret');
      return;
    }

    setIsLoading(true);
    setError('');
    setInterpretation(null);

    try {
      const token = await getToken();
      console.log('Submitting dream for interpretation...');
      
      const response = await fetch(`${API_BASE_URL}/api/dream/interpret`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ dream_text: trimmedDream })
      });

      const data = await response.json();
      console.log('Received response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to interpret dream');
      }

      setInterpretation(data.interpretation);
      // Don't clear the dream text immediately so user can see what they submitted
      setTimeout(() => setDream(''), 2000);
      
      // Refresh dream history
      await fetchPastDreams();
    } catch (err) {
      console.error('Interpretation error:', err);
      setError(err.message || 'Failed to interpret dream. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="App">
      <Header />
      <main className="main-content">
          {error && <div className="error-message">{error}</div>}
          <DreamForm
            dream={dream}
            setDream={setDream}
            handleSubmit={handleDreamSubmit}
            isLoading={isLoading}
          />
          {interpretation && (
            <div className="interpretation-result">
              <h3>Dream Interpretation:</h3>
              <p>{interpretation}</p>
            </div>
          )}
          <section className="past-dreams-section">
            <h2>Dream History</h2>
            <DreamList dreams={pastDreams} onDelete={(id) => setDeleteModal({ isOpen: true, dreamId: id })} />
          <Modal
            isOpen={deleteModal.isOpen}
            onClose={() => setDeleteModal({ isOpen: false, dreamId: null })}
            onConfirm={handleDeleteConfirm}
            title="Confirm Delete"
            message="Are you sure you want to delete this dream interpretation? This action cannot be undone."
          />
          </section>
        </main>
    </div>
  );
}

const AuthenticatedApp = () => {
  return (
    <SignedIn>
      <Routes>
        <Route path="/" element={<DreamsPage />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </SignedIn>
  );
};

const App = () => {
  return (
    <Router>
      <SignedOut>
        <AuthPage />
      </SignedOut>
      <AuthenticatedApp />
    </Router>
  );
};

export default App;
