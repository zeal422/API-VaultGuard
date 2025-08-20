import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Lock, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AuthScreenProps {
  mode: 'create' | 'unlock';
  onAuth: (password: string) => Promise<void>;
  error?: string;
  loading?: boolean;
  failedAttempts?: number;
}

export function AuthScreen({ mode, onAuth, error, loading, failedAttempts = 0 }: AuthScreenProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validatePasswordStrength = (password: string) => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSymbols = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isLongEnough = password.length >= 8;
    
    return {
      isValid: hasUpperCase && hasLowerCase && hasNumbers && hasSymbols && isLongEnough,
      missing: {
        upperCase: !hasUpperCase,
        lowerCase: !hasLowerCase,
        numbers: !hasNumbers,
        symbols: !hasSymbols,
        length: !isLongEnough
      }
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === 'create' && password !== confirmPassword) {
      return;
    }
    
    if (mode === 'create') {
      const validation = validatePasswordStrength(password);
      if (!validation.isValid) {
        return;
      }
    } else if (password.length < 8) {
      return;
    }
    
    await onAuth(password);
  };

  const passwordValidation = mode === 'create' ? validatePasswordStrength(password) : { isValid: password.length >= 8, missing: undefined };
  const isValid = passwordValidation.isValid && (mode === 'unlock' || password === confirmPassword);

  return (
    <div className="min-h-screen bg-gradient-to-br from-vault-primary/5 via-background to-vault-accent/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4 sm:space-y-6">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 bg-gradient-vault rounded-2xl flex items-center justify-center shadow-vault">
            <Shield className="w-7 h-7 sm:w-8 sm:h-8 text-vault-primary-foreground" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-vault bg-clip-text text-transparent">
            Secure Vault
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground px-4">
            {mode === 'create' ? 'Create your secure API key vault' : 'Enter your master password'}
          </p>
        </div>

        {/* Auth Form */}
        <Card className="border-0 shadow-surface mx-2 sm:mx-0">
          <CardHeader className="space-y-1 pb-4 px-4 sm:px-6">
            <CardTitle className="text-lg sm:text-xl">
              {mode === 'create' ? 'Create Master Password' : 'Unlock Vault'}
            </CardTitle>
            <CardDescription>
              {mode === 'create' 
                ? (
                  <div className="space-y-2">
                    <p>This password will encrypt all your API keys. Choose a strong password you can remember.</p>
                    <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                      <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">
                        ⚠️ Critical: If you forget this password, your data cannot be recovered. 
                        After 2 failed unlock attempts, the next password will create a new vault and erase all existing data.
                      </p>
                    </div>
                  </div>
                )
                : (
                  <div className="space-y-2">
                    <p>Enter your master password to access your encrypted API keys.</p>
                    {failedAttempts > 0 && (
                      <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
                        <p className="text-sm text-red-800 dark:text-red-200 font-medium">
                          {failedAttempts === 1 && "⚠️ 1 failed attempt. 1 more failed attempt will allow creating a new vault with the next password, erasing all existing data."}
                          {failedAttempts >= 2 && "🚨 Critical: The next password you enter will create a new vault and permanently erase all existing data."}
                        </p>
                      </div>
                    )}
                  </div>
                )
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent className="px-4 sm:px-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Master Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">Master Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your master password"
                    className={cn(
                      "pr-12 min-h-[44px]",
                      password.length > 0 && password.length < 8 && "border-destructive focus:ring-destructive"
                    )}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1 h-10 w-10 p-0"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {mode === 'create' && password.length > 0 && !passwordValidation.isValid && (
                  <div className="text-sm text-destructive space-y-1">
                    <p className="font-medium">Password must include:</p>
                    <ul className="text-xs space-y-0.5 ml-3">
                      {passwordValidation.missing?.upperCase && <li>• At least one uppercase letter (A-Z)</li>}
                      {passwordValidation.missing?.lowerCase && <li>• At least one lowercase letter (a-z)</li>}
                      {passwordValidation.missing?.numbers && <li>• At least one number (0-9)</li>}
                      {passwordValidation.missing?.symbols && <li>• At least one symbol (! @ # $ % ^ & * etc.)</li>}
                      {passwordValidation.missing?.length && <li>• At least 8 characters long</li>}
                    </ul>
                  </div>
                )}
                {mode === 'unlock' && password.length > 0 && password.length < 8 && (
                  <p className="text-sm text-destructive">Password must be at least 8 characters</p>
                )}
              </div>

              {/* Confirm Password (Create mode only) */}
              {mode === 'create' && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your master password"
                      className={cn(
                        "pr-12 min-h-[44px]",
                        confirmPassword.length > 0 && password !== confirmPassword && "border-destructive focus:ring-destructive"
                      )}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1 h-10 w-10 p-0"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {confirmPassword.length > 0 && password !== confirmPassword && (
                    <p className="text-sm text-destructive">Passwords do not match</p>
                  )}
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <Button 
                type="submit" 
                disabled={!isValid || loading}
                className="w-full bg-gradient-vault hover:opacity-90 transition-opacity min-h-[44px]"
              >
                <Lock className="w-4 h-4 mr-2" />
                {loading ? 'Processing...' : mode === 'create' ? 'Create Vault' : 'Unlock Vault'}
              </Button>
            </form>

            {/* Security Notice */}
            <div className="mt-6 p-3 rounded-lg bg-secure-green/10 border border-secure-green/20">
              <div className="flex items-start space-x-2">
                <Shield className="w-4 h-4 text-secure-green mt-0.5 flex-shrink-0" />
                <div className="text-xs text-secure-green">
                  <p className="font-medium">Security Notice</p>
                  <p>All data is encrypted locally using AES-256 encryption. Your master password is never stored or transmitted.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}