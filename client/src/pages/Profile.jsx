import React, { useContext, useState, useEffect, useRef } from 'react';
import { UserContext } from '../../context/userContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faCamera } from '@fortawesome/free-solid-svg-icons';
import '../assets/styles/profile.css';
import axios from 'axios';
import { toast } from 'react-hot-toast';

export default function Profile() {
  const { user, setUser } = useContext(UserContext);
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);

  // When user data is available, split the full name into first and last name
  useEffect(() => {
    if (user) {
      const fullName = user.name || "";
      const spaceIndex = fullName.indexOf(' ');
      const firstName = spaceIndex > -1 ? fullName.substring(0, spaceIndex) : fullName;
      const lastName = spaceIndex > -1 ? fullName.substring(spaceIndex + 1) : "";
      setProfile({ firstName, lastName, email: user.email, password: '' });
      setSelectedImage(user.profilePicture); // Assuming user object has profilePicture field
    }
  }, [user]);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    // Add password validation
    if (profile.password && profile.password.length < 6) {
        toast.error('Password must be at least 6 characters long');
        return;
    }

    try {
        const fullName = `${profile.firstName} ${profile.lastName}`;
        const { data } = await axios.put('/update-profile', {
            name: fullName,
            email: profile.email,
            password: profile.password || undefined
        }, {
            withCredentials: true
        });
        
        if (data.error) {
            toast.error(data.error);
        } else {
            // Update the user context with new data
            setUser(data.user);
            
            // Update local state
            setProfile(prev => ({
                ...prev,
                firstName: profile.firstName,
                lastName: profile.lastName,
                email: profile.email,
                password: ''
            }));

            toast.success('Profile updated successfully');
            
            // Force refresh user data from server
            const profileResponse = await axios.get('/profile', {
                withCredentials: true
            });
            if (profileResponse.data) {
                setUser(profileResponse.data);
            }
        }
    } catch (error) {
        console.error('Update failed:', error);
        toast.error('Failed to update profile');
    }
  };

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
        if (file.size > 1024 * 1024) { // 1MB limit
            toast.error('Image size must be less than 1MB');
            return;
        }
        
        try {
            const formData = new FormData();
            formData.append('profilePicture', file);
            
            const { data } = await axios.post('/upload-profile-picture', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                withCredentials: true
            });
            
            if (data.error) {
                toast.error(data.error);
            } else {
                setSelectedImage(data.imageUrl);
                toast.success('Profile picture updated successfully');
            }
        } catch (error) {
            console.error('Upload failed:', error);
            toast.error('Failed to upload profile picture');
        }
    }
};

  return (
    <div className="profile-container">
      <h1 className="profile-header">Profile</h1>
      <div className="profile-form-container">
        <div className="profile-picture-container" onClick={handleImageClick}>
            {selectedImage ? (
                <>
                    <img 
                        src={selectedImage}
                        alt="Profile" 
                        className="profile-picture"
                    />
                    <div className="camera-overlay">
                        <FontAwesomeIcon icon={faCamera} className="camera-icon" />
                    </div>
                </>
            ) : (
                <div className="profile-picture-placeholder">
                    <FontAwesomeIcon icon={faUser} />
                    <div className="camera-overlay">
                        <FontAwesomeIcon icon={faCamera} className="camera-icon" />
                    </div>
                </div>
            )}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                style={{ display: 'none' }}
            />
        </div>
        
        <form onSubmit={handleSave} className="profile-form">
          <div className="profile-item mb-5">
            <div className="name-group">
              <div className="name-field">
                <label className="profile-label">
                  First Name
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
                  Last Name 
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
              Email
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
              Password
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
          <button type="submit" className="btn update-btn">
            Update
          </button>
        </form>
      </div>
    </div>
  );
}

