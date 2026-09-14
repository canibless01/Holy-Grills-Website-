import { useEffect, useState } from "react";
import { Link, useNavigate } from "@/lib/router";
import { Flame, Mail, Lock, User, Loader2, Smile } from "lucide-react";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { createUserSchema, CreateUserInput } from "@/lib/validations";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import CustomFormField from "@/components/CustomFormField";
import { FormFieldTypes } from "@/lib/form-field-type";
import GoogleAuthButton from "@/components/GoogleAuthButton";
import { useAuthStore } from "@/stores/authStore";
import Divider from "@/components/Divider";
import { getDepartmentsApi, getAcademicLevelsApi } from "@/lib/api/auth";

const SignupPage = () => {
  const signup = useAuthStore((s) => s.signup);
  const navigate = useNavigate();

  const [departments, setDepartments] = useState<Array<{ id: string; name: string }>>([]);
  const [levels, setLevels] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    getDepartmentsApi().then(setDepartments).catch(() => {});
    getAcademicLevelsApi().then(setLevels).catch(() => {});
  }, []);

  // React form hook
  const form = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: "",
      nickname: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone_number: "",
      department_id: "",
      academic_level_id: "",
      referral_code: "",
    },
  });

  const handleSubmit = async (data: CreateUserInput) => {
    try {
      await signup(
        data.name,
        data.email,
        data.password,
        data.phone_number,
        data.department_id,
        data.academic_level_id,
        data.referral_code,
        data.nickname,
      );
      toast.success("Welcome to Holy Grill! Account created successfully.");
      navigate("/dashboard");
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : "Registration failed. Please try again.";
      form.setError("root", { message });
    }
  };

  const fields = [
    {
      key: "name",
      label: "Full Name",
      icon: User,
      type: "text",
      placeholder: "John Doe",
      formType: FormFieldTypes.INPUT,
    },
    {
      key: "nickname",
      label: "Nickname (Optional)",
      icon: Smile,
      type: "text",
      placeholder: "e.g. Speedy — this is what friends will call you",
      formType: FormFieldTypes.INPUT,
    },
    {
      key: "email",
      label: "Email",
      icon: Mail,
      type: "email",
      placeholder: "you@futa.edu.ng",
      formType: FormFieldTypes.INPUT,
    },
    {
      key: "phone_number",
      label: "Phone Number",
      icon: User,
      type: "text",
      placeholder: "08012345678",
      formType: FormFieldTypes.PHONE_INPUT,
    },
    {
      key: "referral_code",
      label: "Referral Code (Optional)",
      icon: User,
      type: "text",
      placeholder: "e.g. REF123",
      formType: FormFieldTypes.INPUT,
    },
    {
      key: "password",
      label: "Password",
      icon: Lock,
      type: "password",
      placeholder: "••••••••",
      formType: FormFieldTypes.INPUT,
    },
    {
      key: "confirmPassword",
      label: "Confirm Password",
      icon: Lock,
      type: "password",
      placeholder: "••••••••",
      formType: FormFieldTypes.INPUT,
    },
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Flame size={28} className="text-primary" />
            <span className="font-display font-bold text-2xl text-foreground">
              Holy Grills
            </span>
          </div>
          <p className="text-muted-foreground font-body text-sm">
            Create your account and start earning HP
          </p>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            {fields.map((f) => (
              <div className="relative" key={f.key}>
                <CustomFormField
                  key={f.key}
                  control={form.control}
                  name={f.key}
                  label={f.label}
                  iconSrc={f.icon}
                  type={f.type}
                  placeholder={f.placeholder}
                  fieldType={f.formType}
                />
              </div>
            ))}

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Department</label>
              <select
                {...form.register("department_id")}
                className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">Select Department (Optional)</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Academic Level</label>
              <select
                {...form.register("academic_level_id")}
                className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">Select Academic Level (Optional)</option>
                {levels.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
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
                <>
                  <Loader2 size={16} className="animate-spin" /> Creating
                  account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>
        </Form>

        <p className="text-center text-sm text-muted-foreground font-body mt-6">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-primary font-medium hover:underline"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
