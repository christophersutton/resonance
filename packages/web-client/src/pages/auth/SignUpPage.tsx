import { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { useSession } from "../../context/SessionContext";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card";
import { Loader2, ArrowLeft } from "lucide-react";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { signUpWithInvite, validateInvite } from '../../services/authService';

interface InviteDetails {
  client_id: string;
  client_name?: string;
  role: string;
}

const SignUpPage = () => {
  const navigate = useNavigate();
  const { session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'email' | 'details'>('email');
  const [inviteDetails, setInviteDetails] = useState<InviteDetails | null>(null);
  const [formValues, setFormValues] = useState({
    email: "",
    password: "",
    fullName: "",
  });

  // Redirect if already logged in
  if (session?.user) {
    return <Navigate to="/" />;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormValues({ ...formValues, [e.target.name]: e.target.value });
  };

  const handleEmailCheck = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { isValid, invite } = await validateInvite(formValues.email);

    if (!isValid || !invite) {
      setError('No valid invitation found for this email address.');
      setIsLoading(false);
      return;
    }

    console.log('Invite data:', invite); // Debug log

    // Get client details from the invite
    setInviteDetails({
      client_id: invite.client_id,
      client_name: invite.client_name,
      role: invite.role
    });
    
    setStep('details');
    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { error } = await signUpWithInvite(
      formValues.email,
      formValues.password,
      formValues.fullName
    );

    if (error) {
      setError(error.message);
      setIsLoading(false);
      return;
    }

    // On success, redirect to email verification page
    navigate('/auth/verify-email');
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Sign Up</CardTitle>
          <CardDescription className="text-center">
            {step === 'email' 
              ? "Enter your email to get started"
              : "Complete your account details"
            }
          </CardDescription>
        </CardHeader>

        {step === 'email' ? (
          <form onSubmit={handleEmailCheck}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Input
                  name="email"
                  type="email"
                  placeholder="Email"
                  value={formValues.email}
                  onChange={handleInputChange}
                  required
                  className="w-full"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Check Invitation
              </Button>
              <Link 
                to="/auth/sign-in"
                className="text-sm text-center text-gray-600 hover:text-gray-900"
              >
                Already have an account? Sign In
              </Link>
            </CardFooter>
          </form>
        ) : (
          <form onSubmit={handleSignUp}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {inviteDetails && (
                <Alert className="bg-blue-50 border-blue-200">
                  <AlertDescription>
                    You've been invited as a {inviteDetails.role.replace('_', ' ').toLowerCase()}.
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Input
                  name="fullName"
                  type="text"
                  placeholder="Full Name"
                  value={formValues.fullName}
                  onChange={handleInputChange}
                  required
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Input
                  name="email"
                  type="email"
                  value={formValues.email}
                  disabled
                  className="w-full bg-gray-50"
                />
              </div>
              <div className="space-y-2">
                <Input
                  name="password"
                  type="password"
                  placeholder="Password"
                  value={formValues.password}
                  onChange={handleInputChange}
                  required
                  minLength={8}
                  className="w-full"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <div className="w-full flex flex-col space-y-2">
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Account
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => setStep('email')}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              </div>
            </CardFooter>
          </form>
        )}
      </Card>
    </main>
  );
};

export default SignUpPage;
