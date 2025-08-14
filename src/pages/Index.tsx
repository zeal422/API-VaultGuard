import { useState, useEffect } from 'react';
import { AuthScreen } from '@/components/AuthScreen';
import { SecureVault } from '@/components/SecureVault';
import { Footer } from '@/components/Footer';
import { vaultExists } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [masterPassword, setMasterPassword] = useState('');
  const [authMode, setAuthMode] = useState<'create' | 'unlock'>('create');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const { toast } = useToast();

  // Check if vault exists on mount
  useEffect(() => {
    setAuthMode(vaultExists() ? 'unlock' : 'create');
  }, []);

  const handleAuth = async (password: string) => {
    setAuthError('');
    setAuthLoading(true);

    try {
      // Small delay for UX
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (authMode === 'unlock') {
        // Check if we've exceeded max attempts - if so, create new vault
        if (failedAttempts >= 2) {
          // Validate password strength even for vault reset
          const validatePasswordStrength = (password: string) => {
            const hasUpperCase = /[A-Z]/.test(password);
            const hasLowerCase = /[a-z]/.test(password);
            const hasNumbers = /\d/.test(password);
            const hasSymbols = /[!@#$%^&*(),.?":{}|<>]/.test(password);
            const isLongEnough = password.length >= 8;
            
            return hasUpperCase && hasLowerCase && hasNumbers && hasSymbols && isLongEnough;
          };

          if (!validatePasswordStrength(password)) {
            setAuthError('New vault password must include uppercase letters, lowercase letters, numbers, and symbols (! @ # $ % ^ & * etc.)');
            throw new Error('Password does not meet requirements');
          }
          
          // Clear existing vault and create new one
          const { clearVault } = await import('@/lib/storage');
          clearVault();
          
          // Proceed as if creating a new vault
          setMasterPassword(password);
          setIsAuthenticated(true);
          setFailedAttempts(0);
          setAuthMode('unlock'); // Keep as unlock for future sessions
          
          toast({
            title: "New Vault Created",
            description: "Previous data has been erased and a new secure vault has been created",
          });
          return;
        }
        
        // For unlock mode with < 2 failed attempts, validate the password
        try {
          await import('@/lib/storage').then(({ loadVaultData }) => loadVaultData(password));
        } catch (error) {
          const newFailedAttempts = failedAttempts + 1;
          setFailedAttempts(newFailedAttempts);
          
          if (newFailedAttempts >= 2) {
            setAuthError('Too many failed attempts. The next password you enter will create a new vault and erase all existing data.');
            throw new Error('Maximum attempts reached');
          } else {
            setAuthError(`Incorrect password. ${2 - newFailedAttempts} attempt${2 - newFailedAttempts === 1 ? '' : 's'} remaining before data reset.`);
            throw new Error('Incorrect password');
          }
        }
      }
      
      setMasterPassword(password);
      setIsAuthenticated(true);
      setFailedAttempts(0); // Reset on success
      
      toast({
        title: authMode === 'create' ? "Vault Created" : "Vault Unlocked",
        description: authMode === 'create' 
          ? "Your secure vault has been created successfully" 
          : "Welcome back to your secure vault",
      });
    } catch (error) {
      // Error already set above for unlock mode
      if (authMode === 'create') {
        setAuthError(error instanceof Error ? error.message : 'Authentication failed');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLock = () => {
    setIsAuthenticated(false);
    setMasterPassword('');
    setAuthError('');
    setFailedAttempts(0); // Reset attempts on manual lock
    setAuthMode('unlock'); // Always unlock mode after first creation
    
    toast({
      title: "Vault Locked",
      description: "Your vault has been securely locked",
    });
  };

  if (isAuthenticated && masterPassword) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-1">
          <SecureVault 
            masterPassword={masterPassword} 
            onLock={handleLock}
          />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">
        <AuthScreen
          mode={authMode}
          onAuth={handleAuth}
          error={authError}
          loading={authLoading}
          failedAttempts={failedAttempts}
        />
      </div>
      <Footer />
    </div>
  );
};

export default Index;