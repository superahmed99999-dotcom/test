import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Mail, Lock, User, CheckCircle2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function SignUp() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState<"form" | "success">("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const registerMutation = trpc.auth.register.useMutation();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    try {
      const result = await registerMutation.mutateAsync({ 
        name: name.trim(),
        email: email.trim().toLowerCase(), 
        password 
      });
      
      if (result.success) {
        toast.success("Account created successfully!");
        setStep("success");
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 2000);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-3xl font-bold">Create Account</CardTitle>
          <CardDescription>
            {step === "form" ? "Join CivicPulse and start making a difference" : "Welcome aboard!"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === "form" ? (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    disabled={loading}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full h-11 text-lg font-semibold" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                Sign Up
              </Button>

              <div className="text-center mt-4">
                <p className="text-sm text-slate-600">
                  Already have an account?{" "}
                  <Link href="/signin" className="text-primary font-bold hover:underline">
                    Sign In
                  </Link>
                </p>
              </div>
            </form>
          ) : (
            <div className="space-y-6 text-center py-8">
              <div className="flex justify-center">
                <CheckCircle2 className="h-20 w-20 text-green-500 animate-bounce" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-slate-900">Success!</h3>
                <p className="text-slate-600">
                  Your account has been created. Redirecting to your dashboard...
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
