"use client"

import React, { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Wallet, ArrowRight, Loader2, Eye, EyeOff, Mail, CheckCircle2, ArrowLeft, KeyRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type Step = 'email' | 'otp' | 'password' | 'success'

export default function ForgotPasswordPage() {
    const router = useRouter()
    const [step, setStep] = useState<Step>('email')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [otpValues, setOtpValues] = useState(['', '', '', '', '', ''])
    const otpRefs = useRef<(HTMLInputElement | null)[]>([])

    const [formData, setFormData] = useState({
        email: "",
        password: "",
        confirmPassword: "",
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
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: formData.email }),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || "Failed to send verification code")
                return
            }

            setSuccess("If an account exists with this email, you will receive a verification code")
            setStep('otp')
        } catch {
            setError("Something went wrong")
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

            const nextIndex = Math.min(index + digits.length, 5)
            otpRefs.current[nextIndex]?.focus()
        } else {
            const newOtpValues = [...otpValues]
            newOtpValues[index] = value.replace(/\D/g, '')
            setOtpValues(newOtpValues)

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

    const handleVerifyAndProceed = async () => {
        const otp = otpValues.join('')
        if (otp.length !== 6) {
            setError("Please enter the complete 6-digit code")
            return
        }

        // Just move to password step, actual verification happens on reset
        setError("")
        setSuccess("")
        setStep('password')
    }

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault()

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match")
            return
        }

        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters")
            return
        }

        setIsLoading(true)
        setError("")

        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: formData.email,
                    code: otpValues.join(''),
                    newPassword: formData.password,
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || "Failed to reset password")
                return
            }

            setStep('success')
        } catch {
            setError("Something went wrong")
        } finally {
            setIsLoading(false)
        }
    }

    const handleResendOtp = async () => {
        setIsLoading(true)
        setError("")
        setOtpValues(['', '', '', '', '', ''])

        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: formData.email }),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || "Failed to resend code")
                return
            }

            setSuccess("New verification code sent!")
        } catch {
            setError("Something went wrong")
        } finally {
            setIsLoading(false)
        }
    }

    const renderStepIndicator = () => {
        if (step === 'success') return null

        return (
            <div className="flex items-center justify-center gap-2 mb-6">
                {(['email', 'otp', 'password'] as Step[]).map((s, i) => (
                    <React.Fragment key={s}>
                        <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${step === s
                                    ? 'bg-violet-600 text-white'
                                    : ((['email', 'otp', 'password'] as Step[]).indexOf(step) > i)
                                        ? 'bg-green-500 text-white'
                                        : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                                }`}
                        >
                            {(['email', 'otp', 'password'] as Step[]).indexOf(step) > i ? (
                                <CheckCircle2 className="h-4 w-4" />
                            ) : (
                                i + 1
                            )}
                        </div>
                        {i < 2 && (
                            <div className={`w-8 h-1 rounded ${(['email', 'otp', 'password'] as Step[]).indexOf(step) > i
                                    ? 'bg-green-500'
                                    : 'bg-slate-200 dark:bg-slate-700'
                                }`} />
                        )}
                    </React.Fragment>
                ))}
            </div>
        )
    }

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
                            {step === 'email' && 'Reset your password'}
                            {step === 'otp' && 'Check your email'}
                            {step === 'password' && 'Create new password'}
                            {step === 'success' && 'Password reset!'}
                        </CardTitle>
                        <CardDescription>
                            {step === 'email' && 'Enter your email to receive a reset code'}
                            {step === 'otp' && `We sent a code to ${formData.email}`}
                            {step === 'password' && 'Enter your new password'}
                            {step === 'success' && 'Your password has been successfully reset'}
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
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="you@example.com"
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
                                                Send reset code
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
                                        onClick={handleVerifyAndProceed}
                                        disabled={isLoading || otpValues.join('').length !== 6}
                                    >
                                        {isLoading ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <>
                                                Continue
                                                <ArrowRight className="h-4 w-4 ml-2" />
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
                                            Change email
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleResendOtp}
                                            disabled={isLoading}
                                            className="text-violet-600 hover:text-violet-700 font-medium"
                                        >
                                            Resend code
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 3: New Password */}
                            {step === 'password' && (
                                <motion.form
                                    key="password"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    onSubmit={handleResetPassword}
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
                                        <Label htmlFor="password">New Password</Label>
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

                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                                        <div className="relative">
                                            <Input
                                                id="confirmPassword"
                                                type={showConfirmPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                value={formData.confirmPassword}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, confirmPassword: e.target.value })
                                                }
                                                required
                                                minLength={6}
                                                className="pr-10"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                            >
                                                {showConfirmPassword ? (
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
                                                Reset password
                                                <KeyRound className="h-4 w-4 ml-2" />
                                            </>
                                        )}
                                    </Button>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setStep('otp')
                                            setError("")
                                        }}
                                        className="w-full text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-1"
                                    >
                                        <ArrowLeft className="h-3 w-3" />
                                        Back to code entry
                                    </button>
                                </motion.form>
                            )}

                            {/* Success */}
                            {step === 'success' && (
                                <motion.div
                                    key="success"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center space-y-4"
                                >
                                    <div className="flex justify-center">
                                        <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                                            <CheckCircle2 className="h-8 w-8 text-green-500" />
                                        </div>
                                    </div>

                                    <p className="text-muted-foreground">
                                        You can now sign in with your new password.
                                    </p>

                                    <Button
                                        className="w-full"
                                        onClick={() => router.push('/auth/login')}
                                    >
                                        Go to login
                                        <ArrowRight className="h-4 w-4 ml-2" />
                                    </Button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {step !== 'success' && (
                            <p className="mt-6 text-center text-sm text-muted-foreground">
                                Remember your password?{" "}
                                <Link
                                    href="/auth/login"
                                    className="font-medium text-violet-600 hover:text-violet-700"
                                >
                                    Sign in
                                </Link>
                            </p>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}
