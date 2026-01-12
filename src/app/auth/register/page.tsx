"use client"

import React, { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Wallet, ArrowRight, Loader2, Eye, EyeOff, Mail, CheckCircle2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useLanguage } from "@/components/providers/LanguageProvider"

type Step = 'email' | 'otp' | 'details'

export default function RegisterPage() {
    const router = useRouter()
    const { t } = useLanguage()
    const [step, setStep] = useState<Step>('email')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [otpValues, setOtpValues] = useState(['', '', '', '', '', ''])
    const otpRefs = useRef<(HTMLInputElement | null)[]>([])

    const [formData, setFormData] = useState({
        email: "",
        name: "",
        familyName: "",
        password: "",
    })

    // Focus first OTP input when step changes to OTP
    useEffect(() => {
        if (step === 'otp' && otpRefs.current[0]) {
            otpRefs.current[0].focus()
        }
    }, [step])

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")

        try {
            const res = await fetch("/api/auth/send-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: formData.email,
                    type: 'REGISTRATION'
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || t.errors.somethingWentWrong)
                return
            }

            setSuccess(t.success.saved)
            setStep('otp')
        } catch {
            setError(t.errors.somethingWentWrong)
        } finally {
            setIsLoading(false)
        }
    }

    const handleOtpChange = (index: number, value: string) => {
        if (value.length > 1) {
            // Handle paste
            const digits = value.replace(/\D/g, '').slice(0, 6).split('')
            const newOtpValues = [...otpValues]
            digits.forEach((digit, i) => {
                if (index + i < 6) {
                    newOtpValues[index + i] = digit
                }
            })
            setOtpValues(newOtpValues)

            // Focus the next empty input or the last one
            const nextIndex = Math.min(index + digits.length, 5)
            otpRefs.current[nextIndex]?.focus()
        } else {
            // Handle single digit
            const newOtpValues = [...otpValues]
            newOtpValues[index] = value.replace(/\D/g, '')
            setOtpValues(newOtpValues)

            // Auto-focus next input
            if (value && index < 5) {
                otpRefs.current[index + 1]?.focus()
            }
        }
    }

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
            otpRefs.current[index - 1]?.focus()
        }
    }

    const handleVerifyOtp = async () => {
        const otp = otpValues.join('')
        if (otp.length !== 6) {
            setError(t.errors.required)
            return
        }

        setIsLoading(true)
        setError("")

        try {
            const res = await fetch("/api/auth/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: formData.email,
                    code: otp,
                    type: 'REGISTRATION'
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || t.errors.somethingWentWrong)
                return
            }

            setSuccess(t.success.saved)
            setStep('details')
        } catch {
            setError(t.errors.somethingWentWrong)
        } finally {
            setIsLoading(false)
        }
    }

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    otpCode: otpValues.join('')
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || t.errors.somethingWentWrong)
                return
            }

            router.push("/")
            router.refresh()
        } catch {
            setError(t.errors.somethingWentWrong)
        } finally {
            setIsLoading(false)
        }
    }

    const handleResendOtp = async () => {
        setIsLoading(true)
        setError("")
        setOtpValues(['', '', '', '', '', ''])

        try {
            const res = await fetch("/api/auth/send-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: formData.email,
                    type: 'REGISTRATION'
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || t.errors.somethingWentWrong)
                return
            }

            setSuccess(t.success.saved)
        } catch {
            setError(t.errors.somethingWentWrong)
        } finally {
            setIsLoading(false)
        }
    }

    const renderStepIndicator = () => (
        <div className="flex items-center justify-center gap-2 mb-6">
            {(['email', 'otp', 'details'] as Step[]).map((s, i) => (
                <React.Fragment key={s}>
                    <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${step === s
                            ? 'bg-violet-600 text-white'
                            : ((['email', 'otp', 'details'] as Step[]).indexOf(step) > i)
                                ? 'bg-green-500 text-white'
                                : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                            }`}
                    >
                        {(['email', 'otp', 'details'] as Step[]).indexOf(step) > i ? (
                            <CheckCircle2 className="h-4 w-4" />
                        ) : (
                            i + 1
                        )}
                    </div>
                    {i < 2 && (
                        <div className={`w-8 h-1 rounded ${(['email', 'otp', 'details'] as Step[]).indexOf(step) > i
                            ? 'bg-green-500'
                            : 'bg-slate-200 dark:bg-slate-700'
                            }`} />
                    )}
                </React.Fragment>
            ))}
        </div>
    )

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-violet-50 dark:from-slate-950 dark:via-background dark:to-violet-950 p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                {/* Logo */}
                <div className="flex justify-center mb-8">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-xl shadow-violet-500/30">
                            <Wallet className="h-7 w-7 text-white" />
                        </div>
                    </Link>
                </div>

                <Card className="border-0 shadow-2xl shadow-slate-200/50 dark:shadow-none">
                    <CardHeader className="text-center pb-2">
                        <CardTitle className="text-2xl font-bold text-foreground">
                            {step === 'email' && t.auth.createAccount}
                            {step === 'otp' && t.auth.verifyOtp}
                            {step === 'details' && t.settings.profile}
                        </CardTitle>
                        <CardDescription>
                            {step === 'email' && t.auth.enterEmail}
                            {step === 'otp' && formData.email}
                            {step === 'details' && t.auth.fullName}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                        {renderStepIndicator()}

                        <AnimatePresence mode="wait">
                            {/* Step 1: Email */}
                            {step === 'email' && (
                                <motion.form
                                    key="email"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    onSubmit={handleSendOtp}
                                    className="space-y-4"
                                >
                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="p-3 rounded-xl bg-destructive/10 text-destructive text-sm"
                                        >
                                            {error}
                                        </motion.div>
                                    )}

                                    <div className="space-y-2">
                                        <Label htmlFor="email">{t.auth.email}</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder={t.auth.enterEmail}
                                            value={formData.email}
                                            onChange={(e) =>
                                                setFormData({ ...formData, email: e.target.value })
                                            }
                                            required
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <>
                                                {t.common.next}
                                                <Mail className="h-4 w-4 ml-2" />
                                            </>
                                        )}
                                    </Button>
                                </motion.form>
                            )}

                            {/* Step 2: OTP Verification */}
                            {step === 'otp' && (
                                <motion.div
                                    key="otp"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-4"
                                >
                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="p-3 rounded-xl bg-destructive/10 text-destructive text-sm"
                                        >
                                            {error}
                                        </motion.div>
                                    )}

                                    {success && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="p-3 rounded-xl bg-green-500/10 text-green-600 dark:text-green-400 text-sm"
                                        >
                                            {success}
                                        </motion.div>
                                    )}

                                    <div className="flex justify-center gap-2">
                                        {otpValues.map((value, index) => (
                                            <Input
                                                key={index}
                                                ref={(el) => { otpRefs.current[index] = el }}
                                                type="text"
                                                inputMode="numeric"
                                                maxLength={6}
                                                value={value}
                                                onChange={(e) => handleOtpChange(index, e.target.value)}
                                                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                                className="w-12 h-12 text-center text-xl font-semibold"
                                            />
                                        ))}
                                    </div>

                                    <Button
                                        type="button"
                                        className="w-full"
                                        onClick={handleVerifyOtp}
                                        disabled={isLoading || otpValues.join('').length !== 6}
                                    >
                                        {isLoading ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <>
                                                {t.auth.verifyOtp}
                                                <CheckCircle2 className="h-4 w-4 ml-2" />
                                            </>
                                        )}
                                    </Button>

                                    <div className="flex items-center justify-between text-sm">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setStep('email')
                                                setError("")
                                                setSuccess("")
                                            }}
                                            className="text-muted-foreground hover:text-foreground flex items-center gap-1"
                                        >
                                            <ArrowLeft className="h-3 w-3" />
                                            {t.common.back}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleResendOtp}
                                            disabled={isLoading}
                                            className="text-violet-600 hover:text-violet-700 font-medium"
                                        >
                                            {t.auth.resendCode}
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 3: Profile Details */}
                            {step === 'details' && (
                                <motion.form
                                    key="details"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    onSubmit={handleRegister}
                                    className="space-y-4"
                                >
                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="p-3 rounded-xl bg-destructive/10 text-destructive text-sm"
                                        >
                                            {error}
                                        </motion.div>
                                    )}

                                    {success && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="p-3 rounded-xl bg-green-500/10 text-green-600 dark:text-green-400 text-sm"
                                        >
                                            {success}
                                        </motion.div>
                                    )}

                                    <div className="space-y-2">
                                        <Label htmlFor="name">{t.auth.fullName}</Label>
                                        <Input
                                            id="name"
                                            type="text"
                                            placeholder="Ali"
                                            value={formData.name}
                                            onChange={(e) =>
                                                setFormData({ ...formData, name: e.target.value })
                                            }
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="familyName">{t.family.title}</Label>
                                        <Input
                                            id="familyName"
                                            type="text"
                                            placeholder="Mammadov"
                                            value={formData.familyName}
                                            onChange={(e) =>
                                                setFormData({ ...formData, familyName: e.target.value })
                                            }
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="password">{t.auth.password}</Label>
                                        <div className="relative">
                                            <Input
                                                id="password"
                                                type={showPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                value={formData.password}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, password: e.target.value })
                                                }
                                                required
                                                minLength={6}
                                                className="pr-10"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <>
                                                {t.auth.createAccount}
                                                <ArrowRight className="h-4 w-4 ml-2" />
                                            </>
                                        )}
                                    </Button>
                                </motion.form>
                            )}
                        </AnimatePresence>

                        <p className="mt-6 text-center text-sm text-muted-foreground">
                            {t.auth.haveAccount}{" "}
                            <Link
                                href="/auth/login"
                                className="font-medium text-violet-600 hover:text-violet-700"
                            >
                                {t.auth.signIn}
                            </Link>
                        </p>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}
