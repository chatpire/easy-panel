import LoginForm from "./login-form";
import { env } from "@/env";
import OIDCLoginButton from "./oidc-login-button";
import { Card } from "@/components/ui/card";

export default async function LoginPage() {
  return (
    <Card className="mx-auto flex w-full flex-col justify-center space-y-6 lg:w-[400px] lg:p-8 p-6">
        <div className="my-4 flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Login</h1>
        </div>
        {env.ENABLE_PASSWORD_LOGIN && <LoginForm />}

        {env.ENABLE_PASSWORD_LOGIN && env.ENABLE_OIDC_LOGIN && <div className="mb-4 border-t" />}

        {env.ENABLE_OIDC_LOGIN && <OIDCLoginButton className="w-full">{env.OIDC_DISPLAY_NAME}</OIDCLoginButton>}

        {!env.ENABLE_PASSWORD_LOGIN && !env.ENABLE_OIDC_LOGIN && (
          <div className="text-center text-gray-500">Login is disabled</div>
        )}
    </Card>
  );
}
