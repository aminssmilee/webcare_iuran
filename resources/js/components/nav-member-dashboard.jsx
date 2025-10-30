import { useState } from "react"
import { Menu } from "lucide-react"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { Inertia } from "@inertiajs/inertia"

export function NavMemberDashboard() {
    const [open, setOpen] = useState(false)
    const [loggingOut, setLoggingOut] = useState(false)

    function handleLogout() {
        setLoggingOut(true)
        Inertia.post("/member/logout", {}, { onFinish: () => setLoggingOut(false) })
    }

    return (
        <nav className="fixed top-0 left-0 right-0 flex items-center justify-between px-10 lg:px-24 py-4 border-b bg-white z-50">
            {/* Logo */}
            <div className="flex items-center gap-2">
                <a href="https://forsinergi.com/">
                    <img
                        src="/img/1-asosiasi-teknik-sistem-energi-indonesia.png"
                        alt="FORSINERGI"
                        className="size-8 lg:size-16 object-contain"
                    />
                </a>
            </div>

            {/* Desktop Links */}
            <div className="flex items-center gap-8 text-sm font-medium">
                <Button
                    variant="link"
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="text-green-600 hover:text-red-700 whitespace-nowrap"
                >
                    <LogOut className="h-4 w-4 mr-2" />
                    {loggingOut ? "Memproses..." : "Keluar"}
                </Button>
            </div>
        </nav>
    )
}
