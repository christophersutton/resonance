import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../../supabase';
import LoadingPage from '../LoadingPage';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        // Get the token from URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        if (!accessToken || !refreshToken) {
          throw new Error('No tokens found in URL');
        }

        // Set the session with the tokens
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        });

        if (sessionError) {
          throw sessionError;
        }

        // Redirect to home page
        navigate('/', { replace: true });
      } catch (err) {
        console.error('Error handling auth callback:', err);
        setError(err instanceof Error ? err.message : 'An error occurred during email confirmation');
        // Redirect to sign in page after a delay if there's an error
        setTimeout(() => navigate('/auth/sign-in', { replace: true }), 3000);
      }
    };

    handleEmailConfirmation();
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600">{error}</p>
          <p className="text-sm text-gray-500 mt-2">Redirecting to sign in...</p>
        </div>
      </div>
    );
  }

  return <LoadingPage />;
};

export default AuthCallback; 