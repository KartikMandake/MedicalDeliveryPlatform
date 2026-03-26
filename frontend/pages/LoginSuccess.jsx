import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function LoginSuccess() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { fetchMe } = useAuth(); // Assume we have a fetchMe or we handle global token setup

  useEffect(() => {
    const token = params.get("token");

    if (token) {
      localStorage.setItem("token", token);
      
      // Attempt to load user profile context if exists
      if (fetchMe) {
        fetchMe().then(() => { navigate("/"); });
      } else {
        window.location.href = "/";
      }
    } else {
      navigate('/login');
    }
  }, [params, navigate, fetchMe]);

  return <h2 style={{ textAlign: 'center', marginTop: '40px', color: '#0d631b' }}>Logging you in...</h2>;
}

export default LoginSuccess;
