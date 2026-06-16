import type { Metadata } from 'next'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Sign In',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-navy-800">
        <div className="flex flex-col items-center">
          <Image
            src="/logo.png"
            alt="Concierge Portal Logo"
            width={200}
            height={200}
            priority
            className="mb-4"
          />

          <h1 className="text-3xl font-bold text-white">
            Concierge Portal
          </h1>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 flex-col items-center justify-center bg-white px-4 py-12 sm:px-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
            <Image
              src="/logo.png"
              alt="Concierge Portal Logo"
              width={40}
              height={40}
              priority
            />
            <span className="text-xl font-bold text-slate-900">
              Concierge Portal
            </span>
          </div>

          {children}
        </div>
      </div>
    </div>
  )
}