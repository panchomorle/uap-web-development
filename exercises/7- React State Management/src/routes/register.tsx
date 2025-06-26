import { createFileRoute, Link } from '@tanstack/react-router'
import { useAuth } from '../hooks/useAuth'

export const Route = createFileRoute('/register')({
  component: RegisterPage,
})

function RegisterPage() {
  const { register } = useAuth()

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    const form = event.currentTarget as HTMLFormElement
    const email = (form.elements.namedItem('email') as HTMLInputElement).value
    const password = (form.elements.namedItem('password') as HTMLInputElement).value

    // Agregar validación básica
    if (!email || !password) {
      console.error('Email and password are required')
      return
    }

    try {
      await register({ email, password })
    } catch (error) {
      console.error('Registration failed:', error)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-full pt-32 bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Register</h1>
      <form className="w-80" onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            required
          />
        </div>
        <div className="mb-6">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            required
          />
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-200">
          Register
        </button>
      </form>
      <p className="mt-4 text-sm text-center text-gray-600">
        Already have an account?
        <Link
          to="/login"
          className="text-blue-600 hover:underline ml-1"
        >
          Login
        </Link>
      </p>
    </div>
  )
}
