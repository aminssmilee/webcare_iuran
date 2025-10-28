"use client"
import { useForm } from "@inertiajs/react"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp"

export function OTPForm({ email, ...props }) {

    const { data, setData, post, processing, errors } = useForm({
        email: email || "",
        otp_code: "",
    })

    const handleSubmit = (e) => {
        e.preventDefault()
        post("/verify-otp")
    }

    return (
        <Card {...props}>
            <CardHeader className="text-center">
                <CardTitle className="text-xl">Verifikasi Email</CardTitle>
                <CardDescription>Kami telah mengirim kode OTP ke {data.email}.</CardDescription>
            </CardHeader>

            <CardContent>
                <form onSubmit={handleSubmit}>
                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor="otp" className="sr-only">
                                Kode verifikasi
                            </FieldLabel>

                            <InputOTP maxLength={6} value={data.otp_code}  onChange={(value) => setData("otp_code", value)}>
                                <InputOTPGroup className="gap-2.5 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border">
                                    <InputOTPSlot index={0} />
                                    <InputOTPSlot index={1} />
                                    <InputOTPSlot index={2} />
                                    <InputOTPSlot index={3} />
                                    <InputOTPSlot index={4} />
                                    <InputOTPSlot index={5} />
                                </InputOTPGroup>
                            </InputOTP>

                            {errors.otp_code && (
                                <FieldDescription className="text-center text-red-500">
                                    {errors.otp_code}
                                </FieldDescription>
                            )}

                            <FieldDescription className="text-center">
                                Masukkan kode 6 digit yang dikirim ke email Anda.
                            </FieldDescription>
                        </Field>

                        <Button type="submit" 
                            disabled={processing}
                            className="w-full bg-green-600 hover:bg-green-700 text-white"
                        >
                            {processing ? "Memverifikasi..." : "Verifikasi Sekarang"}</Button>

                        <FieldDescription className="text-center">
                            Tidak menerima kode? <a href="#">Kirim ulang</a>
                        </FieldDescription>
                    </FieldGroup>
                </form>
            </CardContent>
        </Card>
    )
}
