
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { toast } from 'sonner';
import { firebaseAuth } from '@/services/firebaseAuth';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/services/firebaseConfig';

// User types
export interface User {
  id: string;
  name: string;
  email: string;
  bio: string;
  photoURL: string;
  isAdmin: boolean;
  emailVerified?: boolean;
}

// Auth context types
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  getAllUsers: () => User[];
  sendPasswordReset: (email: string) => Promise<boolean>;
  sendVerificationEmail: () => Promise<boolean>;
  updateUserAdminStatus: (userId: string, isAdmin: boolean) => Promise<boolean>;
  createUserByAdmin: (name: string, email: string, password: string, isAdmin: boolean) => Promise<boolean>;
  updateUserProfile: (data: { bio?: string, photoURL?: string, name?: string }) => Promise<boolean>;
  checkProfileCompletion: () => boolean;
}

// Creating the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Dummy users list (apenas para fallback, o Firebase é a fonte principal)
const dummyUsers: (User & { password: string })[] = [
  {
    id: '1',
    name: 'Admin',
    email: 'admin@terraverde.com',
    password: 'admin@123',
    bio: 'Administrador do sistema EcoCity',
    photoURL: '',
    isAdmin: true,
    emailVerified: true
  },
  {
    id: '2',
    name: 'Usuário',
    email: 'usuario@terraverde.com',
    password: 'usuario@123',
    bio: 'Usuário comum do EcoCity',
    photoURL: '',
    isAdmin: false,
    emailVerified: true
  }
];

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<(User & { password: string })[]>([]);

  // Initialize with Firebase Auth listener and fallback to local storage
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Manter os dados de usuário dummy apenas para fallback
        setUsers(dummyUsers);
        console.log("Dados de usuário carregados para fallback local");
        
        // Set up Firebase Auth listener
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          console.log("Auth state changed:", firebaseUser ? `User ${firebaseUser.uid}` : "No user");
          
          if (firebaseUser) {
            // User is logged in
            const appUser = await firebaseAuth.convertToContextUser(firebaseUser);
            if (appUser) {
              setUser(appUser);
              localStorage.setItem('currentUser', JSON.stringify(appUser));
              console.log("User auth state updated with emailVerified:", appUser.emailVerified);
            }
          } else {
            // Check if a user is stored locally
            const storedUser = localStorage.getItem('currentUser');
            if (storedUser) {
              setUser(JSON.parse(storedUser));
            } else {
              setUser(null);
            }
          }
          setIsLoading(false);
        });
        
        return unsubscribe;
      } catch (error) {
        console.error("Error loading users:", error);
        
        // Fallback to local storage if Firebase fails
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
        
        setUsers(dummyUsers);
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Login function with improved email verification check
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Try Firebase login first
      try {
        console.log("Attempting login with Firebase...");
        const { user: firebaseUser } = await firebaseAuth.signInWithEmailAndPassword(email, password);
        console.log("Login successful, checking email verification status");
        
        // Explicitly check email verification status
        if (!firebaseUser.emailVerified) {
          console.log("Email not verified, sending verification email and preventing login");
          toast.warning('Por favor, verifique seu email antes de fazer login.');
          await firebaseAuth.sendEmailVerification(firebaseUser);
          await firebaseAuth.signOut(); // Sign out since email isn't verified
          setIsLoading(false);
          return false;
        }
        
        console.log("Email verified, proceeding with login");
        const currentUser = await firebaseAuth.convertToContextUser(firebaseUser);
        
        if (currentUser) {
          setUser(currentUser);
          localStorage.setItem('currentUser', JSON.stringify(currentUser));
          toast.success(`Bem-vindo, ${currentUser.name}!`);
          return true;
        }
      } catch (firebaseError: any) {
        console.error("Firebase login failed:", firebaseError);
        console.error("Error code:", firebaseError.code);
        
        // Handle specific Firebase auth errors
        if (firebaseError.code === 'auth/user-not-found') {
          toast.error('Usuário não encontrado');
        } else if (firebaseError.code === 'auth/wrong-password') {
          toast.error('Senha incorreta');
        } else if (firebaseError.code === 'auth/too-many-requests') {
          toast.error('Muitas tentativas. Tente novamente mais tarde.');
        } else {
          toast.error('Erro ao fazer login');
        }
        
        return false;
      }
      
      // Fallback to local login if Firebase fails but doesn't throw
      return loginWithLocalData(email, password);
    } catch (error) {
      toast.error('Erro ao fazer login');
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Google Login function with improved error handling
  const loginWithGoogle = async (): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      console.log("Attempting login with Google...");
      const { user: firebaseUser } = await firebaseAuth.signInWithGoogle();
      console.log("Google login successful for:", firebaseUser.email);
      
      // Google-authenticated users are already email verified
      const currentUser = await firebaseAuth.convertToContextUser(firebaseUser);
      
      if (currentUser) {
        setUser(currentUser);
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        toast.success(`Bem-vindo, ${currentUser.name}!`);
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error('Google login error:', error);
      
      // Don't show error for user-initiated cancellations
      if (error.code === 'auth/popup-closed-by-user') {
        console.log("User closed the Google login popup");
      } else if (error.code === 'auth/popup-blocked') {
        toast.error('Pop-up bloqueado. Permita pop-ups para continuar.');
      } else {
        toast.error('Erro ao fazer login com Google');
      }
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper for local login (fallback)
  const loginWithLocalData = (email: string, password: string): boolean => {
    const foundUser = users.find(u => 
      u.email.toLowerCase() === email.toLowerCase() && 
      u.password === password
    );
    
    if (foundUser) {
      const { password, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
      toast.success(`Welcome, ${foundUser.name}!`);
      return true;
    } else {
      toast.error('Incorrect email or password');
      return false;
    }
  };
  
  // Send password reset email with improved error handling
  const sendPasswordReset = async (email: string): Promise<boolean> => {
    try {
      console.log("Sending password reset email to:", email);
      await firebaseAuth.sendPasswordResetEmail(email);
      toast.success('Email de recuperação enviado com sucesso!');
      return true;
    } catch (error: any) {
      console.error('Error sending password reset:', error);
      
      if (error.code === 'auth/user-not-found') {
        toast.error('Nenhum usuário encontrado com este email');
      } else {
        toast.error('Erro ao enviar email de recuperação');
      }
      
      return false;
    }
  };
  
  // Send verification email with improved error handling
  const sendVerificationEmail = async (): Promise<boolean> => {
    if (!auth.currentUser) {
      toast.error('Nenhum usuário conectado');
      return false;
    }
    
    try {
      console.log("Sending verification email to:", auth.currentUser.email);
      await firebaseAuth.sendEmailVerification(auth.currentUser);
      toast.success('Email de verificação enviado com sucesso!');
      return true;
    } catch (error: any) {
      console.error('Error sending verification email:', error);
      
      if (error.code === 'auth/too-many-requests') {
        toast.error('Muitos pedidos. Tente novamente mais tarde.');
      } else {
        toast.error('Erro ao enviar email de verificação');
      }
      
      return false;
    }
  };

  // Registration function - Fixed to ensure user is created properly
  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    console.log("Starting registration process for:", name, email);
    
    try {
      // Try Firebase registration
      try {
        console.log("Attempting registration with Firebase...");
        
        // 1. Create user in Firebase Auth and Firestore
        const { user: firebaseUser } = await firebaseAuth.createUserWithEmailAndPassword(email, password, name);
        console.log("User created in Firebase with UID:", firebaseUser.uid);
        
        // 2. Wait a moment for Firestore write to complete (important!)
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 3. Fetch the user data to verify it was created properly
        const newUser = await firebaseAuth.convertToContextUser(firebaseUser);
        console.log("User data from Firestore:", newUser);
        
        // 4. Show toast about email verification
        toast.success('Registro realizado com sucesso! Verifique seu email para completar o cadastro.');
        
        // 5. Sign out to force email verification
        await firebaseAuth.signOut();
        
        return true;
      } catch (firebaseError: any) {
        console.error("Firebase registration failed:", firebaseError);
        console.error("Error code:", firebaseError.code);
        console.error("Error message:", firebaseError.message);
        
        // Handle specific Firebase error codes
        if (firebaseError.code === 'auth/email-already-in-use') {
          toast.error('Este email já está em uso');
          throw new Error('Este email já está em uso');
        }
        
        // Try local registration as fallback
        return registerLocally(name, email, password);
      }
    } catch (error) {
      console.error('Registration error:', error);
      
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Erro ao registrar usuário');
      }
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper for local registration (fallback)
  const registerLocally = (name: string, email: string, password: string): boolean => {
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      toast.error('Email already registered');
      return false;
    }
    
    // Create new user
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password,
      bio: '',
      photoURL: '',
      isAdmin: false,
      emailVerified: true
    };
    
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    
    // Auto-login the user
    const { password: _, ...userWithoutPassword } = newUser;
    setUser(userWithoutPassword);
    localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
    
    toast.success('Registro realizado com sucesso! (modo local)');
    return true;
  };

  // Logout function
  const logout = async () => {
    try {
      // Try Firebase logout first
      try {
        await firebaseAuth.signOut();
        console.log("Logged out from Firebase");
      } catch (firebaseError) {
        console.log("Firebase logout failed", firebaseError);
      }
    } catch (error) {
      console.error('Error logging out:', error);
    }
    
    // Clear local data
    setUser(null);
    localStorage.removeItem('currentUser');
    toast.info('Você saiu do sistema');
  };

  // Function to get all users (admin only)
  const getAllUsers = useCallback((): User[] => {
    if (!user?.isAdmin) return [];
    
    // Use Firebase Auth if available
    const fetchFirebaseUsers = async () => {
      try {
        return await firebaseAuth.getAllUsers();
      } catch (error) {
        console.error('Error fetching Firebase users:', error);
        return null;
      }
    };
    
    // Use local users as fallback
    return users.map(({ password, ...userWithoutPassword }) => userWithoutPassword);
  }, [users, user?.isAdmin]);

  // Function to update a user's admin status
  const updateUserAdminStatus = async (userId: string, isAdmin: boolean): Promise<boolean> => {
    if (!user?.isAdmin) {
      toast.error('You do not have permission to perform this action');
      return false;
    }
    
    try {
      // Try to update in Firebase first
      try {
        console.log(`Updating user ${userId} admin status to ${isAdmin} in Firebase...`);
        await firebaseAuth.updateUserAdmin(userId, isAdmin);
        
        // Update local data for consistency
        updateLocalUserAdminStatus(userId, isAdmin);
        return true;
      } catch (firebaseError) {
        console.log("Firebase update failed, falling back to other methods", firebaseError);
      }
      
      // If Firebase is not available, use local update
      return updateLocalUserAdminStatus(userId, isAdmin);
    } catch (error) {
      console.error('Error updating user status:', error);
      return false;
    }
  };
  
  // Helper for local admin status update
  const updateLocalUserAdminStatus = (userId: string, isAdmin: boolean): boolean => {
    const updatedUsers = users.map(u => {
      if (u.id === userId) {
        return { ...u, isAdmin };
      }
      return u;
    });
    
    // Update state
    setUsers(updatedUsers);
    
    // If the modified user is the current user, update their state too
    if (user && user.id === userId) {
      const updatedUser = { ...user, isAdmin };
      setUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    }
    
    return true;
  };
  
  // Function to create user by admin
  const createUserByAdmin = async (
    name: string, 
    email: string, 
    password: string, 
    isAdmin: boolean
  ): Promise<boolean> => {
    if (!user?.isAdmin) {
      toast.error('You do not have permission to perform this action');
      return false;
    }
    
    setIsLoading(true);
    
    try {
      // Try to create user in Firebase first
      try {
        console.log("Creating user in Firebase...");
        const { user: firebaseUser } = await firebaseAuth.createUserWithEmailAndPassword(email, password, name);
        
        if (isAdmin) {
          await firebaseAuth.updateUserAdmin(firebaseUser.uid, isAdmin);
        }
        
        toast.success('User created successfully in Firebase!');
        return true;
      } catch (firebaseError) {
        console.log("Firebase user creation failed, falling back to local", firebaseError);
        return createLocalUserByAdmin(name, email, password, isAdmin);
      }
    } catch (error) {
      toast.error('Error creating user');
      console.error('User creation error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper for local user creation by admin
  const createLocalUserByAdmin = (name: string, email: string, password: string, isAdmin: boolean): boolean => {
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      toast.error('Email already registered');
      return false;
    }
    
    // Create new user
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password,
      bio: '',
      photoURL: '',
      isAdmin,
      emailVerified: true
    };
    
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    
    toast.success('User created successfully (local mode)!');
    return true;
  };

  // Function to update user profile information
  const updateUserProfile = async (data: { bio?: string, photoURL?: string, name?: string }): Promise<boolean> => {
    if (!user) {
      toast.error("Você precisa estar logado para atualizar seu perfil");
      return false;
    }
    
    setIsLoading(true);
    
    try {
      // Try to update in Firebase first
      try {
        console.log(`Updating user ${user.id} profile:`, data);
        await firebaseAuth.updateUserProfile(user.id, data);
        
        // Update local user data
        const updatedUser = { ...user, ...data };
        setUser(updatedUser);
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        
        toast.success("Perfil atualizado com sucesso!");
        return true;
      } catch (firebaseError) {
        console.log("Firebase update failed, falling back to other methods", firebaseError);
        
        // Update local user data as fallback
        const updatedUser = { ...user, ...data };
        setUser(updatedUser);
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        
        toast.success("Perfil atualizado localmente!");
        return true;
      }
    } catch (error) {
      console.error("Error updating user profile:", error);
      toast.error("Erro ao atualizar perfil");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Function to check if user profile is complete (has bio and photo)
  const checkProfileCompletion = (): boolean => {
    if (!user) return false;
    
    // Check if user has completed their bio
    const hasBio = !!user.bio && user.bio.trim().length > 0;
    
    // We don't require photo for profile completion, just bio
    return hasBio;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      login,
      loginWithGoogle,
      register, 
      logout,
      sendPasswordReset,
      sendVerificationEmail,
      getAllUsers,
      updateUserAdminStatus,
      createUserByAdmin,
      updateUserProfile,
      checkProfileCompletion
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
