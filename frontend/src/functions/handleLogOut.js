import { useNavigate } from "react-router-dom";

const handleLogout = () => {
    localStorage.removeItem('token'); 
    
    localStorage.removeItem('refreshToken'); 
};

export default handleLogout;