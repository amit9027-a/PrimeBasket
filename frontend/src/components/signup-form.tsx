import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { AxiosError } from "axios";

import api from "@/api/axios";
import { useAuth } from "@/context/AuthContext";

type ApiErrorResponse = {
  message?: string;
};

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<"details" | "otp">("details");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setCountdown((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [countdown]);

  const getErrorMessage = (error: unknown) => {
    const axiosError = error as AxiosError<ApiErrorResponse>;

    return (
      axiosError.response?.data?.message ||
      "Something went wrong. Please try again."
    );
  };

  const validateDetails = () => {
    if (!firstName.trim()) {
      setError("Please enter your first name.");
      return false;
    }

    if (!lastName.trim()) {
      setError("Please enter your last name.");
      return false;
    }

    if (!email.trim()) {
      setError("Please enter your email address.");
      return false;
    }

    if (!password) {
      setError("Please enter a password.");
      return false;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return false;
    }

    return true;
  };

  async function handleSendOtp(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!validateDetails()) {
      return;
    }

    setLoading(true);

    try {
      await api.post("/auth/register/send-otp", {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        password,
      });

      setStep("otp");
      setOtp("");
      setCountdown(60);

      setSuccess(
        `Verification code sent to ${email.trim().toLowerCase()}`
      );
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!/^\d{6}$/.test(otp)) {
      setError("Please enter the 6-digit verification code.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/register/verify-otp", {
        email: email.trim().toLowerCase(),
        otp,
      });

      login(response.data);
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  async function handleResendOtp() {
    if (countdown > 0 || loading) {
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await api.post("/auth/register/send-otp", {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        password,
      });

      setOtp("");
      setCountdown(60);

      setSuccess("A new verification code has been sent to your email.");
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  function handleChangeEmail() {
    setStep("details");
    setOtp("");
    setError("");
    setSuccess("");
    setCountdown(0);
  }

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      {...props}
      onSubmit={step === "details" ? handleSendOtp : handleVerifyOtp}
    >
      <FieldGroup>
        {step === "details" ? (
          <>
            <div className="flex flex-col items-center gap-1 text-center">
              <h1 className="text-2xl font-bold tracking-tight">
                Create your account
              </h1>

              <p className="text-sm text-balance text-muted-foreground">
                Enter your details and verify your email to get started
              </p>
            </div>

            {error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600 dark:text-emerald-400">
                {success}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="firstName">
                  First name
                </FieldLabel>

                <Input
                  id="firstName"
                  type="text"
                  autoComplete="given-name"
                  placeholder="Amit"
                  required
                  className="bg-background"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={loading}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="lastName">
                  Last name
                </FieldLabel>

                <Input
                  id="lastName"
                  type="text"
                  autoComplete="family-name"
                  placeholder="Soam"
                  required
                  className="bg-background"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={loading}
                />
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="email">
                Email address
              </FieldLabel>

              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                required
                className="bg-background"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />

              <FieldDescription>
                We&apos;ll send a verification code to this email.
              </FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="password">
                Password
              </FieldLabel>

              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                required
                minLength={6}
                className="bg-background"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />

              <FieldDescription>
                Password must contain at least 6 characters.
              </FieldDescription>
            </Field>

            <Field>
              <Button
                type="submit"
                disabled={loading}
                className="w-full"
              >
                {loading ? "Sending code..." : "Continue with email"}
              </Button>
            </Field>

            <FieldSeparator>Or continue with</FieldSeparator>

            <Field>
              <Button
                variant="outline"
                type="button"
                disabled={loading}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="size-4"
                >
                  <path
                    d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
                    fill="currentColor"
                  />
                </svg>

                Continue with GitHub
              </Button>

              <FieldDescription className="text-center">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="underline underline-offset-4 hover:text-foreground"
                >
                  Login
                </button>
              </FieldDescription>
            </Field>
          </>
        ) : (
          <>
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="size-6"
                >
                  <rect
                    width="20"
                    height="16"
                    x="2"
                    y="4"
                    rx="2"
                  />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  Verify your email
                </h1>

                <p className="mt-1 text-sm text-muted-foreground">
                  Enter the 6-digit code we sent to
                </p>

                <p className="mt-1 text-sm font-medium">
                  {email.trim().toLowerCase()}
                </p>
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600 dark:text-emerald-400">
                {success}
              </div>
            )}

            <Field>
              <FieldLabel htmlFor="otp">
                Verification code
              </FieldLabel>

              <Input
                id="otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="000000"
                required
                className="h-12 bg-background text-center text-xl font-semibold tracking-[0.5em]"
                value={otp}
                onChange={(e) => {
                  const value = e.target.value
                    .replace(/\D/g, "")
                    .slice(0, 6);

                  setOtp(value);
                }}
                disabled={loading}
              />

              <FieldDescription className="text-center">
                The code is valid for 10 minutes.
              </FieldDescription>
            </Field>

            <Field>
              <Button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full"
              >
                {loading ? "Verifying..." : "Verify email & create account"}
              </Button>
            </Field>

            <div className="flex flex-col items-center gap-2 text-sm">
              <span className="text-muted-foreground">
                Didn&apos;t receive the code?
              </span>

              <button
                type="button"
                onClick={handleResendOtp}
                disabled={loading || countdown > 0}
                className="font-medium text-primary underline-offset-4 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
              >
                {countdown > 0
                  ? `Resend code in ${countdown}s`
                  : "Resend verification code"}
              </button>
            </div>

            <FieldSeparator>or</FieldSeparator>

            <Button
              type="button"
              variant="outline"
              onClick={handleChangeEmail}
              disabled={loading}
              className="w-full"
            >
              Change email or details
            </Button>
          </>
        )}
      </FieldGroup>
    </form>
  );
}
