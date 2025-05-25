import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Users, Shield, UserCheck, UserX, UserPlus, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userApi } from '@/services/api';
import { User } from '@/contexts/AuthContext';

// Esquema de validação para o formulário de criação de usuário
const createUserSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  isAdmin: z.boolean().default(false)
});

type CreateUserFormValues = z.infer<typeof createUserSchema>;

const AdminPanel = () => {
  const { user, getAllUsers, updateUserAdminStatus, createUserByAdmin } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  // Add a state variable to trigger user list refresh
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const form = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      isAdmin: false
    }
  });

  // Fetch users directly from API instead of relying on context
  const fetchUsers = async () => {
    if (!user?.isAdmin) return;
    
    setIsLoading(true);
    try {
      console.log("AdminPanel: Fetching users from API");
      const response = await userApi.getAllUsers();
      
      if (response.success && response.data) {
        console.log("AdminPanel: Users fetched successfully:", response.data);
        setUsers(response.data);
      } else {
        console.error("AdminPanel: Failed to fetch users from API");
        // Fallback to context method
        const contextUsers = getAllUsers();
        console.log("AdminPanel: Fallback users from context:", contextUsers);
        setUsers(contextUsers);
      }
    } catch (error) {
      console.error("AdminPanel: Error fetching users:", error);
      // Fallback to context method
      const contextUsers = getAllUsers();
      setUsers(contextUsers);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log("AdminPanel - Current user:", user);
    console.log("Admin status:", user?.isAdmin);
    
    // Redirect if not admin or not logged in
    if (!user) {
      console.log("User not logged in, redirecting to login");
      navigate('/login');
    } else if (!user.isAdmin) {
      console.log("User is not admin, redirecting to map");
      navigate('/map');
    } else {
      console.log("User is admin, loading user list");
      // Load user list
      fetchUsers();
    }
  }, [user, navigate, refreshTrigger]); // Add refreshTrigger to the dependency array

  // Early return with loading state while checking user and admin status
  if (isLoading && !users.length) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-20">
        <div className="w-12 h-12 border-4 border-eco-green border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-muted-foreground">Carregando painel administrativo...</p>
      </div>
    );
  }

  // Keep this check to prevent rendering if user is not admin
  if (!user?.isAdmin) {
    return null;
  }

  const handleToggleAdmin = async (userId: string, makeAdmin: boolean) => {
    setIsLoading(true);
    try {
      console.log(`AdminPanel: Attempting to update user ${userId} to admin status: ${makeAdmin}`);
      const success = await updateUserAdminStatus(userId, makeAdmin);
      
      if (success) {
        toast.success(`Usuário ${makeAdmin ? 'promovido a administrador' : 'removido de administrador'} com sucesso!`);
        // Trigger a refresh
        setRefreshTrigger(prev => prev + 1);
      } else {
        toast.error('Falha ao atualizar status do usuário');
      }
    } catch (error) {
      toast.error('Erro ao atualizar status do usuário');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitCreateUser = async (data: CreateUserFormValues) => {
    setIsLoading(true);
    try {
      console.log("AdminPanel: Creating new user with data:", {
        ...data,
        password: "[REDACTED]"
      });
      
      const success = await createUserByAdmin(data.name, data.email, data.password, data.isAdmin);
      
      if (success) {
        toast.success('Usuário criado com sucesso!');
        form.reset();
        setShowUserForm(false);
        // Trigger a refresh - increase the delay to ensure Firestore has time to update
        setTimeout(() => {
          setRefreshTrigger(prev => prev + 1);
        }, 1000);
      } else {
        toast.error('Falha ao criar usuário');
      }
    } catch (error) {
      toast.error('Erro ao criar usuário');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Add manual refresh function
  const handleManualRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen flex flex-col pt-20">
      <div className="container px-4 py-8">
        <div className="flex flex-col gap-4 mb-8">
          <Link to="/map" className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar para Mapa</span>
          </Link>
          
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-eco-green" />
            <h1 className="text-3xl md:text-4xl font-bold text-eco-green-dark">Painel de Administração</h1>
          </div>
          
          <p className="text-lg text-muted-foreground">
            Gerencie usuários e tenha acesso a informações privilegiadas
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-eco-green" />
                <h2 className="text-xl font-semibold">Usuários Cadastrados</h2>
              </div>
              
              <div className="flex items-center gap-2">
                <Button 
                  onClick={handleManualRefresh}
                  variant="outline"
                  disabled={isLoading}
                  className="h-9 w-9 p-0"
                  title="Atualizar lista de usuários"
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
                
                <Button 
                  onClick={() => setShowUserForm(!showUserForm)} 
                  className="bg-eco-green hover:bg-eco-green-dark"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  {showUserForm ? 'Cancelar' : 'Adicionar Usuário'}
                </Button>
              </div>
            </div>
            
            {showUserForm && (
              <div className="p-6 border-b bg-gray-50">
                <h3 className="text-lg font-medium mb-4">Adicionar Novo Usuário</h3>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmitCreateUser)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome</FormLabel>
                            <FormControl>
                              <Input placeholder="Nome completo" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="email@exemplo.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Senha</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="******" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="isAdmin"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-end space-x-3 space-y-0 rounded-md py-4">
                            <FormControl>
                              <input
                                type="checkbox"
                                checked={field.value}
                                onChange={field.onChange}
                                className="h-4 w-4 rounded border-gray-300 text-eco-green focus:ring-eco-green"
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-normal">
                              Usuário Administrador
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="flex justify-end">
                      <Button 
                        type="submit" 
                        disabled={isLoading}
                        className="bg-eco-green hover:bg-eco-green-dark"
                      >
                        {isLoading ? 'Criando...' : 'Criar Usuário'}
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            )}
            
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-3 text-left">ID</th>
                      <th className="px-4 py-3 text-left">Nome</th>
                      <th className="px-4 py-3 text-left">Email</th>
                      <th className="px-4 py-3 text-left">Tipo</th>
                      <th className="px-4 py-3 text-left">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id} className="border-t">
                        <td className="px-4 py-3">{user.id}</td>
                        <td className="px-4 py-3">{user.name}</td>
                        <td className="px-4 py-3">{user.email}</td>
                        <td className="px-4 py-3">
                          {user.isAdmin ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-eco-green text-white">
                              Admin
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              Usuário
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {user.isAdmin ? (
                            <Button 
                              size="sm" 
                              variant="destructive"
                              disabled={isLoading}
                              onClick={() => handleToggleAdmin(user.id, false)}
                              className="text-xs"
                            >
                              <UserX className="h-3 w-3 mr-1" />
                              Remover Admin
                            </Button>
                          ) : (
                            <Button 
                              size="sm" 
                              variant="outline"
                              disabled={isLoading}
                              onClick={() => handleToggleAdmin(user.id, true)}
                              className="text-xs"
                            >
                              <UserCheck className="h-3 w-3 mr-1" />
                              Tornar Admin
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {users.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  {isLoading ? 'Carregando usuários...' : 'Nenhum usuário encontrado'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
