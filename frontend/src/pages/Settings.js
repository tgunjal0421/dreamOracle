import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SignedIn, SignOutButton, UserProfile } from '@clerk/clerk-react';
import { useUser, useClerk } from '@clerk/clerk-react';
import Modal from '../components/common/Modal';
import './Settings.css';

const Settings = () => {
  return (
    <SignedIn>
      <SettingsContent />
    </SignedIn>
  );
};

const SettingsContent = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { signOut } = useClerk();
  const [activeSection, setActiveSection] = useState('profile');
  const [deleteModal, setDeleteModal] = useState(false);

  const handleDeleteAccount = async () => {
    try {
      await user.delete();
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error deleting account:', error);
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <div className="settings-content">
            <h2>Profile Settings</h2>
            <div className="profile-info">
              <div className="profile-header">
                <img src={user.imageUrl} alt="Profile" className="profile-image" />
                <div className="profile-details">
                  <h3>{user.fullName}</h3>
                  <p>{user.primaryEmailAddress?.emailAddress}</p>
                </div>
              </div>
              <div className="profile-actions">
                <button onClick={() => window.open('https://accounts.clerk.dev/user/settings', '_blank')} className="edit-button">
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
        );

      case 'account':
        return (
          <div className="settings-content">
            <h2>Account Settings</h2>
            <div className="account-actions">
              <div className="action-card">
                <h3>Sign Out</h3>
                <p>Sign out from your account on this device.</p>
                <SignOutButton className="signout-button">Sign Out</SignOutButton>
              </div>
              <div className="action-card danger">
                <h3>Manage Account</h3>
                <UserProfile className="user-profile" />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="settings-container">
      <div className="settings-sidebar">
        <h2>Settings</h2>
        <nav>
          <button
            className={`nav-item ${activeSection === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveSection('profile')}
          >
            Profile
          </button>
          <button
            className={`nav-item ${activeSection === 'account' ? 'active' : ''}`}
            onClick={() => setActiveSection('account')}
          >
            Account
          </button>
        </nav>
        <button className="back-button" onClick={() => navigate('/')}>
          Back to Dreams
        </button>
      </div>
      
      <div className="settings-main">
        {renderContent()}
      </div>

      <Modal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        onConfirm={handleDeleteAccount}
        title="Delete Account"
        message="Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your dream interpretations."
      />
    </div>
  );
};

export default Settings;
