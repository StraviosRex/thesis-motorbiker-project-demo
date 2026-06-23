import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLogin, useRegister } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import logoImg from "@/assets/logo-40.png";

const schema = z.object({
  username: z.string().min(3, "At least 3 characters"),
  password: z.string().min(6, "At least 6 characters"),
});

type FormValues = z.infer<typeof schema>;

export default function AuthPage() {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const login = useLogin();
  const register = useRegister();

  const {
    register: formRegister,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormValues) => {
    try {
      if (tab === "login") {
        await login.mutateAsync(data);
        toast({ title: "Welcome back!", description: `Signed in as ${data.username}` });
      } else {
        await register.mutateAsync(data);
        toast({ title: "Account created!", description: `Welcome, ${data.username}` });
      }
      setLocation("/");
    } catch (err: any) {
      toast({
        title: tab === "login" ? "Sign in failed" : "Registration failed",
        description: err.message ?? "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const switchTab = (next: "login" | "register") => {
    setTab(next);
    reset();
  };

  const isPending = login.isPending || register.isPending;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-sm">
        {/* Logo + title */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <img src={logoImg} alt="MotoRoute Europe" className="h-14 w-14 rounded-full ring-2 ring-orange-500/40" />
          <h1 className="font-montserrat font-black text-2xl text-white tracking-tight">
            Moto<span className="text-orange-500">Route</span> Europe
          </h1>
        </div>

        {/* Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
          {/* Tab switcher */}
          <div className="flex rounded-lg bg-slate-800 p-1 mb-6">
            {(["login", "register"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => switchTab(t)}
                className={`flex-1 py-1.5 rounded-md text-sm font-semibold transition ${
                  tab === t
                    ? "bg-orange-500 text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {t === "login" ? "Sign In" : "Register"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="username" className="text-slate-300 text-sm">Username</Label>
              <Input
                id="username"
                autoComplete="username"
                placeholder="your_username"
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-orange-500 focus:ring-orange-500"
                {...formRegister("username")}
              />
              {errors.username && (
                <p className="text-xs text-red-400">{errors.username.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-slate-300 text-sm">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete={tab === "login" ? "current-password" : "new-password"}
                placeholder="••••••••"
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-orange-500 focus:ring-orange-500"
                {...formRegister("password")}
              />
              {errors.password && (
                <p className="text-xs text-red-400">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isPending}
              className="w-full bg-orange-500 hover:bg-orange-400 text-white font-bold py-2 rounded-lg transition shadow-lg hover:shadow-orange-500/30 disabled:opacity-50"
            >
              {isPending
                ? "Please wait…"
                : tab === "login"
                ? "Sign In"
                : "Create Account"}
            </Button>
          </form>

          <p className="text-center text-slate-500 text-xs mt-4">
            {tab === "login" ? "No account?" : "Already have one?"}{" "}
            <button
              type="button"
              onClick={() => switchTab(tab === "login" ? "register" : "login")}
              className="text-orange-400 hover:text-orange-300 font-medium transition"
            >
              {tab === "login" ? "Register" : "Sign in"}
            </button>
          </p>
        </div>

        <p className="text-center mt-4">
          <button
            type="button"
            onClick={() => setLocation("/")}
            className="text-slate-500 hover:text-slate-300 text-sm transition"
          >
            ← Back to map
          </button>
        </p>
      </div>
    </div>
  );
}
