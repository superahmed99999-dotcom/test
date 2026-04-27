import { getLoginUrl } from "@/const";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SignUp() {
  const handleGoogleLogin = () => {
    window.location.href = getLoginUrl();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        {/* Top accent bar */}
        <div className="h-1.5 w-full rounded-t-xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

        <CardHeader className="space-y-3 pt-8 pb-4 text-center">
          {/* Logo / icon */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
            <svg
              className="h-9 w-9 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>

          <CardTitle className="text-3xl font-bold text-slate-900">
            Welcome to CivicPulse
          </CardTitle>
          <CardDescription className="text-base text-slate-500">
            Sign in to report and track civic issues in your community
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pb-8">
          {/* Google sign-in button */}
          <Button
            id="google-signin-btn"
            onClick={handleGoogleLogin}
            className="w-full h-12 gap-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm font-medium text-base transition-all duration-200 hover:shadow-md"
            variant="outline"
          >
            {/* Google logo SVG */}
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-400">Secure sign-in</span>
            </div>
          </div>

          <p className="text-center text-xs text-slate-400 leading-relaxed">
            By continuing, you agree to our{" "}
            <span className="underline cursor-pointer text-slate-500 hover:text-slate-700">
              Terms of Service
            </span>{" "}
            and{" "}
            <span className="underline cursor-pointer text-slate-500 hover:text-slate-700">
              Privacy Policy
            </span>
            .
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
