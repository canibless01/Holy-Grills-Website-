import { Link, useNavigate } from '@/lib/router';
import { Flame, Mail, Lock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginUserSchema, LoginUserInput } from '@/lib/validations';
import { useForm } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import CustomFormField from '@/components/CustomFormField';
import { FormFieldTypes } from '@/lib/form-field-type';
import { useAuthStore } from '@/stores/authStore';

const LoginPage = () => {
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const form = useForm<LoginUserInput>({
    resolver: zodResolver(loginUserSchema),
    defaultValues: { email: '', password: '' },
  });

  const handleSubmit = async (data: LoginUserInput) => {
    try {
      await login(data.email, data.password);
      toast.success('Welcome back! 🔥');
      navigate('/dashboard');
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : 'Unable to sign in right now. Please try again.';
      form.setError('root', { message });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Flame size={28} className="text-primary" />
            <span className="font-display font-bold text-2xl text-foreground">Holy Grills</span>
          </div>
          <p className="text-muted-foreground font-body text-sm">Sign in to your account</p>
        </div>

        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <CustomFormField
              control={form.control}
              name="email"
              label="Email"
              fieldType={FormFieldTypes.INPUT}
              type="email"
              placeholder="you@futa.edu.ng"
              iconSrc={Mail}
            />

            <CustomFormField
              control={form.control}
              name="password"
              label="Password"
              fieldType={FormFieldTypes.INPUT}
              type="password"
              placeholder="••••••••"
              iconSrc={Lock}
            />

            <div className="flex justify-end -mt-1">
              <Link
                to="/forgot-password"
                className="text-xs font-medium text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            {form.formState.errors.root && (
              <p className="text-sm text-destructive font-body text-center">{form.formState.errors.root.message}</p>
            )}

            <button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="w-full py-3 rounded-lg bg-gradient-fire text-primary-foreground font-display font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {form.formState.isSubmitting ? (
                <><Loader2 size={16} className="animate-spin" /> Signing in...</>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </Form>

        <p className="text-center text-sm text-muted-foreground font-body mt-6">
          Don't have an account?{' '}
          <Link to="/signup" className="text-primary font-medium hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
