import { LoginForm } from "@/components/login-form";

const Login = () => {
  return (
    <main className="corner-squircle rounded-xl p-6 bg-neutral-100">
      <div className="grid min-h-svh lg:grid-cols-2">
        <div className="flex flex-col gap-4 p-6 md:p-10 bg-white corner-squircle rounded-s-xl">
          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-xs">
              <LoginForm />
            </div>
          </div>
        </div>
        <div className="relative hidden bg-muted lg:block corner-squircle rounded-e-xl overflow-hidden">
          <img
            src="/plant-img.jpg"
            alt="Image"
            className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale object-center"
          />
        </div>
      </div>
    </main>
  );
};

export default Login;
