import LoginForm from "../components/LoginForm";

export const metadata = {
  title: "Login | Suzalink CRM",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl">
        <img
          src="/logo.png"
          alt="Suzalink"
          className="mx-auto mb-8 h-12"
        />
        <LoginForm />
      </div>
    </div>
  );
}
