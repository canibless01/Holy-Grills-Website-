"use client";
import { Link, useNavigate } from "@/lib/router";
import { Flame, Mail, Loader2, Lock } from "lucide-react";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  forgotPasswordSchema,
  ForgotPasswordInput,
  resetPasswordSchema,
  ResetPasswordInput,
} from "@/lib/validations";
import { requestPasswordResetApi, resetPasswordApi } from "@/lib/api/auth";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import CustomFormField from "@/components/CustomFormField";
import { FormFieldTypes } from "@/lib/form-field-type";
import { useSearchParams } from "next/navigation";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const searchParams = useSearchParams();

  const accessToken = searchParams.get("access_token");
  const isResetMode = Boolean(accessToken);

  const forgotForm = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const resetForm = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const handleForgotSubmit = async (data: ForgotPasswordInput) => {
    try {
      const response = await requestPasswordResetApi(data.email);

      if (response.success) {
        toast.success("Verification email sent. Check your inbox.");
        forgotForm.reset();
        navigate("/login");
        return;
      }

      forgotForm.setError("root", {
        message: "We could not verify that email. Please try again.",
      });
      toast.error("Email verification failed. Please try again.");
    } catch {
      forgotForm.setError("root", {
        message: "We could not verify that email. Please try again.",
      });
      toast.error("Email verification failed. Please try again.");
    }
  };

  const handleResetSubmit = async (data: ResetPasswordInput) => {
    if (!accessToken) return;

    try {
      const response = await resetPasswordApi(accessToken, data.password);

      if (response.success) {
        toast.success("Password reset successful. Please log in.");
        resetForm.reset();
        navigate("/login");
        return;
      }

      resetForm.setError("root", {
        message: "Unable to reset password. Please request a new reset link.",
      });
    } catch {
      resetForm.setError("root", {
        message: "Reset link is invalid or has expired.",
      });
      toast.error("Password reset failed. Request a new link.");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Flame size={28} className="text-primary" />
            <span className="font-display font-bold text-2xl text-foreground">
              Holy Grills
            </span>
          </div>
          <p className="text-muted-foreground font-body text-sm">
            {isResetMode
              ? "Create a new password for your account"
              : "Enter your email to reset your password"}
          </p>
        </div>

        {isResetMode ? (
          <Form {...resetForm}>
            <form
              onSubmit={resetForm.handleSubmit(handleResetSubmit)}
              className="space-y-4"
            >
              <CustomFormField
                control={resetForm.control}
                name="password"
                label="New Password"
                fieldType={FormFieldTypes.INPUT}
                type="password"
                placeholder="••••••••"
                iconSrc={Lock}
              />

              <CustomFormField
                control={resetForm.control}
                name="confirmPassword"
                label="Confirm New Password"
                fieldType={FormFieldTypes.INPUT}
                type="password"
                placeholder="••••••••"
                iconSrc={Lock}
              />

              {resetForm.formState.errors.root && (
                <p className="text-sm text-destructive font-body text-center">
                  {resetForm.formState.errors.root.message}
                </p>
              )}

              <button
                type="submit"
                disabled={resetForm.formState.isSubmitting}
                className="w-full py-3 rounded-lg bg-gradient-fire text-primary-foreground font-display font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {resetForm.formState.isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Updating
                    password...
                  </>
                ) : (
                  "Reset Password"
                )}
              </button>
            </form>
          </Form>
        ) : (
          <Form {...forgotForm}>
            <form
              onSubmit={forgotForm.handleSubmit(handleForgotSubmit)}
              className="space-y-4"
            >
              <CustomFormField
                control={forgotForm.control}
                name="email"
                label="Email"
                fieldType={FormFieldTypes.INPUT}
                type="email"
                placeholder="you@futa.edu.ng"
                iconSrc={Mail}
              />

              {forgotForm.formState.errors.root && (
                <p className="text-sm text-destructive font-body text-center">
                  {forgotForm.formState.errors.root.message}
                </p>
              )}

              <button
                type="submit"
                disabled={forgotForm.formState.isSubmitting}
                className="w-full py-3 rounded-lg bg-gradient-fire text-primary-foreground font-display font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {forgotForm.formState.isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Sending
                    email...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </button>
            </form>
          </Form>
        )}

        <p className="text-center text-sm text-muted-foreground font-body mt-6">
          Remembered your password?{" "}
          <Link
            to="/login"
            className="text-primary font-medium hover:underline"
          >
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
