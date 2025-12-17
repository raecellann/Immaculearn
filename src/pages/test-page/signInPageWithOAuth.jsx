import React, { useState } from 'react';

export const SignInPageWithOAuth = () => {
  const [role, setRole] = useState('');

  const handleRoleSelect = selectedRole => {
    setRole(selectedRole);

    // Redirect to backend Google OAuth endpoint with role query
    window.location.href = `http://localhost:3000/v1/account/oauth/google/redirect?role=${selectedRole}`;
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h2>Sign in with Google</h2>

      {!role && (
        <div style={{ marginTop: '20px' }}>
          <p>Select your role:</p>
          <button onClick={() => handleRoleSelect('student')} style={{ margin: '0 10px' }}>
            Student
          </button>
          <button onClick={() => handleRoleSelect('professor')} style={{ margin: '0 10px' }}>
            Professor
          </button>
        </div>
      )}

      {role && <p>Redirecting to Google Sign-In for <b>{role}</b>...</p>}
    </div>
  );
};
