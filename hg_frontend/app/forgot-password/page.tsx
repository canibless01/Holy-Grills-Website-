import ForgotPasswordPage from "@/app/routes/public/ForgotPassword";
import { SiteLayout } from "@/app/layouts/SiteLayout";
import { Suspense } from "react";
import CustomLoader from "@/components/ui/CustomLoader";

export default function Page() {
  return (
    <Suspense fallback={<CustomLoader />}>
      <SiteLayout title="Forgot Password" hideChrome>
        <ForgotPasswordPage />
      </SiteLayout>
    </Suspense>
  );
}
