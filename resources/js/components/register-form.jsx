import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";

function handleSubmit(e) {
  e.preventDefault(); // mencegah reload halaman

  const formData = new FormData(e.target); // ambil semua input form

  // kirim ke route backend Laravel
  Inertia.post("/register", formData, {
    onSuccess: () => {
      // redirect ke halaman Pending Status setelah sukses
      Inertia.visit("/");
    },
  });
}


export function RegisterForm({ className, ...props }) {
    return (
        <form className={cn("flex flex-col gap-6", className)} {...props}>
            <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Create a new account</h1>
                <p className="text-sm text-muted-foreground">
                    Fill in your details to register a new account
                </p>
            </div>

            <div className="grid gap-6">
                {/* Username */}
                <div className="grid gap-2">
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" type="text" placeholder="Your username" required />
                </div>

                {/* Email */}
                <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="you@example.com" required />
                </div>

                {/* Password */}
                <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" placeholder="Enter password" required />
                </div>

                {/* Confirm Password */}
                <div className="grid gap-2">
                    <Label htmlFor="password_confirmation">Confirm Password</Label>
                    <Input
                        id="password_confirmation"
                        type="password"
                        placeholder="Repeat password"
                        required
                    />
                </div>

                {/* Document */}
                <div className="grid gap-2">
                    <Label htmlFor="document">Upload Your Document</Label>
                    <label
                        htmlFor="document"
                        className="flex h-32 w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-input bg-background text-muted-foreground hover:bg-muted transition-colors"
                    >
                        <div className="flex flex-col items-center justify-center gap-2">
                            <Upload className="h-4 w-4" />
                            <span className="text-sm">Upload a document (PDF)</span>
                        </div>
                        <Input
                            id="document"
                            type="file"
                            accept="application/pdf"
                            className="hidden"
                        />
                    </label>
                </div>

                {/* Submit button */}
                <Button type="submit" className="w-full" onClick={handleSubmit}>
                    Register
                </Button>
            </div>

            <div className="text-center text-sm">
                Already have an account?{" "}
                <a href="/login" className="underline underline-offset-4">
                    Sign in
                </a>
            </div>
        </form>
    );
}
