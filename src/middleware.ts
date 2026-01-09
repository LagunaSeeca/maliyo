import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Routes that don't require authentication
const publicRoutes = ["/auth/login", "/auth/register"]

// Static assets that should be publicly accessible
const publicAssets = [
    "/manifest.json",
    "/sw.js",
    "/workbox-",
    "/icons/",
]

// Simple JWT structure validation (basic check without crypto in edge runtime)
function isValidTokenFormat(token: string): boolean {
    // JWT format: header.payload.signature
    const parts = token.split(".")
    if (parts.length !== 3) return false

    // Check each part is base64url encoded
    const base64UrlRegex = /^[A-Za-z0-9_-]+$/
    return parts.every(part => base64UrlRegex.test(part) && part.length > 0)
}

// Check if token is expired by decoding payload (edge runtime safe)
function isTokenExpired(token: string): boolean {
    try {
        const parts = token.split(".")
        if (parts.length !== 3) return true

        // Decode the payload (second part)
        const payload = parts[1]
        const decodedPayload = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
        const parsed = JSON.parse(decodedPayload)

        // Check expiration
        if (parsed.exp) {
            const now = Math.floor(Date.now() / 1000)
            return parsed.exp < now
        }

        return false
    } catch {
        return true // If we can't parse, consider it expired
    }
}

export function middleware(request: NextRequest) {
    const token = request.cookies.get("auth-token")?.value
    const { pathname } = request.nextUrl

    // Allow public assets (PWA files, icons, etc.)
    const isPublicAsset = publicAssets.some((asset) => pathname.startsWith(asset))
    if (isPublicAsset) {
        return NextResponse.next()
    }

    // Check if the route is public
    const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))

    // Validate token if present
    let hasValidToken = false
    if (token) {
        hasValidToken = isValidTokenFormat(token) && !isTokenExpired(token)
    }

    // If no valid token and trying to access protected route
    if (!hasValidToken && !isPublicRoute) {
        // Clear invalid token if present
        const response = NextResponse.redirect(new URL("/auth/login", request.url))
        if (token) {
            response.cookies.set({
                name: "auth-token",
                value: "",
                maxAge: 0,
                path: "/",
            })
        }
        response.headers.set("x-redirect-reason", "auth-required")
        return response
    }

    // If valid token exists and trying to access auth routes, redirect to dashboard
    if (hasValidToken && isPublicRoute) {
        return NextResponse.redirect(new URL("/", request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - api routes (protected at route level)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico
         */
        "/((?!api|_next/static|_next/image|favicon.ico).*)",
    ],
}
