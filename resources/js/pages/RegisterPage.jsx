import { GalleryVerticalEnd } from "lucide-react";
import { RegisterForm } from "@/components/register-form";
import Image from "/public/img/collaborative-process-multicultural-businesspeople-using-laptop-presentation-communication-meeting-brainstorming-ideas-about-project-colleagues-working-plan-success-strategy-modern-office.jpg"



export default function RegisterPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="/" className="flex items-center gap-2 font-medium">
            <img
              src="/img/1-asosiasi-teknik-sistem-energi-indonesia.png"
              // alt={activeTeam.name}
              className="size-8 object-contain"
            />
            FORSINERGI
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <RegisterForm />
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <img
          src={Image}
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
}