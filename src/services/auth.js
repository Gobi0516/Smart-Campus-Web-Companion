const USERS_KEY = 'scwc_users';
const CURRENT_USER_KEY = 'scwc_currentUser';

/**
 * Get all users from LocalStorage
 * @returns {Array} Array of user objects
 */
const getUsers = () => {
  try {
    const usersJson = localStorage.getItem(USERS_KEY);
    return usersJson ? JSON.parse(usersJson) : [];
  } catch (e) {
    console.error("Error parsing users from local storage", e);
    return [];
  }
};

/**
 * Save users array to LocalStorage
 * @param {Array} users 
 */
const saveUsers = (users) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const signup = ({ name, email, password, studentId }) => {
  const users = getUsers();
  
  // Check for duplicate email
  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    throw new Error('An account with this email already exists.');
  }

  // Create new user
  const newUser = {
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    name,
    email,
    password, // Storing in plain text as per requirements (LocalStorage only, no backend)
    studentId
  };

  users.push(newUser);
  saveUsers(users);
  
  // Initialize or update the profile with the new name and student ID
  try {
    const existingProfileJson = localStorage.getItem('smart-campus-profile');
    let profile = {
      name: name,
      studentId: studentId,
      totalCreditsRequired: 120,
      completedCourses: []
    };
    
    if (existingProfileJson) {
      const existingProfile = JSON.parse(existingProfileJson);
      profile = { ...existingProfile, name, studentId };
    }
    
    localStorage.setItem('smart-campus-profile', JSON.stringify(profile));
  } catch (e) {
    console.error("Error setting profile during signup", e);
  }
  
  return true;
};

export const login = ({ email, password }) => {
  const users = getUsers();
  
  const user = users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    throw new Error('Invalid email or password');
  }

  const sessionData = {
    email: user.email,
    loggedInAt: new Date().toISOString()
  };

  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(sessionData));
  return user;
};

export const logout = () => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

export const getCurrentUser = () => {
  try {
    const sessionJson = localStorage.getItem(CURRENT_USER_KEY);
    if (!sessionJson) return null;

    const sessionData = JSON.parse(sessionJson);
    const users = getUsers();
    
    // Look up full user record by email
    const fullUser = users.find(u => u.email === sessionData.email);
    
    // If user was deleted from users array but session exists, clear session
    if (!fullUser) {
      logout();
      return null;
    }
    
    return fullUser;
  } catch (e) {
    console.error("Error getting current user from local storage", e);
    return null;
  }
};
