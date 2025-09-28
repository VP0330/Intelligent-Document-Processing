import { useState } from 'react';
import { Eye, EyeOff, FileText, Loader2, UserPlus } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { Separator } from './ui/separator';

interface LoginScreenProps {
  onLogin: (credentials: { email: string; password: string }) => void;
  onRegister?: (userData: { name: string; email: string; password: string }) => void;
}

export function LoginScreen({ onLogin, onRegister }: LoginScreenProps) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const validatePassword = (password: string) => {
    if (password.length < 6) {
      return 'Password must be at least 6 characters long';
    }
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (isLoginMode) {
      if (!email || !password) return;
      
      setIsLoading(true);
      // Simulate API call delay
      setTimeout(() => {
        onLogin({ email, password });
        setIsLoading(false);
      }, 1500);
    } else {
      // Registration mode
      if (!name || !email || !password || !confirmPassword) return;
      
      const passwordValidation = validatePassword(password);
      if (passwordValidation) {
        setPasswordError(passwordValidation);
        return;
      }
      
      if (password !== confirmPassword) {
        setPasswordError('Passwords do not match');
        return;
      }

      setIsLoading(true);
      // Simulate API call delay
      setTimeout(() => {
        if (onRegister) {
          onRegister({ name, email, password });
        }
        setIsLoading(false);
      }, 1500);
    }
  };

  const handleDemoLogin = () => {
    setEmail('admin@docuflow.com');
    setPassword('demo123');
    setTimeout(() => {
      onLogin({ email: 'admin@docuflow.com', password: 'demo123' });
    }, 500);
  };

  const switchMode = () => {
    setIsLoginMode(!isLoginMode);
    setPasswordError('');
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <FileText className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-semibold text-foreground">Welcome to DocuFlow</h1>
          <p className="mt-2 text-muted-foreground">
            Intelligent Document Processing Portal
          </p>
        </div>

        {/* Auth Card */}
        <Card className="shadow-xl border-0 bg-card/50 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl text-center flex items-center justify-center gap-2">
              {isLoginMode ? (
                <>Sign In</>
              ) : (
                <>
                  <UserPlus className="h-6 w-6" />
                  Create Account
                </>
              )}
            </CardTitle>
            <CardDescription className="text-center">
              {isLoginMode 
                ? 'Enter your credentials to access your account'
                : 'Create a new account to get started'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLoginMode && (
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={isLoginMode ? "Enter your password" : "Create a password (min. 6 characters)"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              {!isLoginMode && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="h-11 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {passwordError && (
                <p className="text-sm text-destructive">{passwordError}</p>
              )}

              {isLoginMode && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    />
                    <Label htmlFor="remember" className="text-sm font-normal">
                      Remember me
                    </Label>
                  </div>
                  <Button variant="link" className="px-0 font-normal text-sm">
                    Forgot password?
                  </Button>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-11"
                disabled={
                  isLoading || 
                  !email || 
                  !password || 
                  (!isLoginMode && (!name || !confirmPassword))
                }
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isLoginMode ? 'Signing in...' : 'Creating account...'}
                  </>
                ) : (
                  isLoginMode ? 'Sign In' : 'Create Account'
                )}
              </Button>
            </form>

            {isLoginMode && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-11"
                  onClick={handleDemoLogin}
                >
                  Try Demo Account
                </Button>
              </>
            )}

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {isLoginMode ? "Don't have an account?" : "Already have an account?"}
              </p>
              <Button
                type="button"
                variant="link"
                className="mt-1 p-0 h-auto font-normal"
                onClick={switchMode}
              >
                {isLoginMode ? 'Create one here' : 'Sign in instead'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Demo Credentials */}
        {isLoginMode && (
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              For demo purposes, use any email and password combination
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Or click "Try Demo Account" for instant access
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground">
          <p>© 2024 DocuFlow. All rights reserved.</p>
          <div className="flex items-center justify-center space-x-4 mt-2">
            <Button variant="link" className="text-xs h-auto p-0">
              Privacy Policy
            </Button>
            <span>•</span>
            <Button variant="link" className="text-xs h-auto p-0">
              Terms of Service
            </Button>
            <span>•</span>
            <Button variant="link" className="text-xs h-auto p-0">
              Support
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}