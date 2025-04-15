import React from 'react';
import { useUser, useClerk } from '@clerk/clerk-react';
import './UserProfile.css';

const UserProfile = () => {
  const { user } = useUser();
  const { signOut } = useClerk();

  if (!user) return null;

  return (
    <div className="user-profile">
      <div className="user-info">
        {user.imageUrl && (
          <img 
            src={user.imageUrl} 
            alt="Profile" 
            className="user-avatar"
          />
        )}
        <div className="user-details">
          <span className="user-name">
            {user.firstName} {user.lastName}
          </span>
          <span className="user-email">{user.primaryEmailAddress?.emailAddress}</span>
        </div>
      </div>
      <button onClick={() => signOut()} className="sign-out-button">
        Sign Out
      </button>
    </div>
  );
};

export default UserProfile;
