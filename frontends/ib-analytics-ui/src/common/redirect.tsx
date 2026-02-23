import React from 'react';
import { useNavigate } from 'react-router-dom';

interface RedirectProps {
  to: string;
}

const Redirect: React.FC<RedirectProps> = ({ to }) => {
  const navigate = useNavigate();
  
  // Use the `navigate` function to perform the redirection
  React.useEffect(() => {
    navigate(to);
  }, [to, navigate]);

  // Return null because this component doesn't render anything
  return null;
};

export default Redirect;
