import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <SignIn
        appearance={{
          elements: {
            rootBox: 'mx-auto',
            card: 'bg-white/5 backdrop-blur-xl border border-white/10',
          },
        }}
        routing="path"
        path="/sign-in"
      />
    </div>
  )
}
