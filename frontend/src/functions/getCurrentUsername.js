import { jwtDecode } from 'jwt-decode';

function getCurrentUsername(token) {
  if (!token) return null;
  
  try {
    const decoded = jwtDecode(token);
    
    // Look for the claim that stores the username (e.g., 'username' or 'sub')
    return decoded.username; 
  } catch (error) {
    console.error("Invalid token:", error);
    return null;
  }
}

export default getCurrentUsername;