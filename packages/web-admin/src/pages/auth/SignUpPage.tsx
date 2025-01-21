import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useSession } from "../../context/SessionContext";
import supabase from "../../supabase";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "../../components/ui/alert";

const SignUpPage = () => {
  const { session } = useSession();
  if (session) return <Navigate to="/" />;
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [formValues, setFormValues] = useState({
    email: "",
    password: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormValues({ ...formValues, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccessMessage(null);

    const { data, error } = await supabase.auth.signUp({
      email: formValues.email,
      password: formValues.password,
    });

    if (error) {
      alert(error.message);
    } else if (data?.user) {
      setSuccessMessage("Success! Please check your email to confirm your account.");
      // Clear form
      setFormValues({ email: "", password: "" });
    }
    
    setIsLoading(false);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <Link 
        to="/" 
        className="absolute top-4 left-4 inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Home
      </Link>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Sign Up</CardTitle>
          <CardDescription className="text-center">
            Create a new account to get started
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <Alert className="bg-yellow-50 text-yellow-800 border-yellow-200">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Demo app, please don't use your real email or password
              </AlertDescription>
            </Alert>
            
            {successMessage && (
              <Alert className="bg-green-50 text-green-800 border-green-200">
                <AlertDescription>{successMessage}</AlertDescription>
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
            <div className="space-y-2">
              <Input
                name="password"
                type="password"
                placeholder="Password"
                value={formValues.password}
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
              Create Account
            </Button>
            <Link 
              to="/auth/sign-in"
              className="text-sm text-center text-gray-600 hover:text-gray-900"
            >
              Already have an account? Sign In
            </Link>
          </CardFooter>
        </form>
      </Card>
    </main>
  );
};

export default SignUpPage;
