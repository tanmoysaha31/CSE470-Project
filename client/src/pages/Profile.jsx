import React, { useContext, useState, useEffect } from 'react';
import { UserContext } from '../../context/userContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import '../assets/styles/profile.css';

export default function Profile() {
  const { user } = useContext(UserContext);
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });

  // When user data is available, split the full name into first and last name
  useEffect(() => {
    if (user) {
      const fullName = user.name || "";
      const spaceIndex = fullName.indexOf(' ');
      const firstName = spaceIndex > -1 ? fullName.substring(0, spaceIndex) : fullName;
      const lastName = spaceIndex > -1 ? fullName.substring(spaceIndex + 1) : "";
      setProfile({ firstName, lastName, email: user.email, password: '' });
    }
  }, [user]);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = (e) => {
    e.preventDefault();
    // Combine first and last name to form full name and send along with email and password
    const fullName = `${profile.firstName} ${profile.lastName}`;
    console.log("Saved Profile:", {
      name: fullName,
      email: profile.email,
      password: profile.password
    });
    // TODO: Call your update profile API here.
  };

  return (
    <div className="profile-container">
      <h1 className="profile-header">Profile</h1>
      <div className="profile-form-container">
        <form onSubmit={handleSave} className="profile-form">
          <div className="profile-item mb-5">
            <div className="name-group">
              <div className="name-field">
                <label className="profile-label">
                  First Name <FontAwesomeIcon icon={faEdit} className="text-muted" />
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={profile.firstName}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
              <div className="name-field">
                <label className="profile-label">
                  Last Name <FontAwesomeIcon icon={faEdit} className="text-muted" />
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={profile.lastName}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
            </div>
          </div>
          <div className="profile-item mb-5">
            <label className="profile-label">
              Email <FontAwesomeIcon icon={faEdit} className="text-muted" />
            </label>
            <input
              type="email"
              name="email"
              value={profile.email}
              onChange={handleChange}
              className="form-control"
            />
          </div>
          <div className="profile-item mb-5">
            <label className="profile-label">
              Password <FontAwesomeIcon icon={faEdit} className="text-muted" />
            </label>
            <input
              type="password"
              name="password"
              placeholder='********'
              value={profile.password}
              onChange={handleChange}
              className="form-control"
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Update
          </button>
        </form>
      </div>
    </div>
  );
}

