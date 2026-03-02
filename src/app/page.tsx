import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <nav className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <span className="text-xl font-bold text-white">💪 Workout Planner</span>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-gray-300 hover:text-white text-sm transition-colors">
              Sign In
            </Link>
            <Link
              href="/register"
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-3xl text-center space-y-8">
          <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight">
            Plan Your Workouts,
            <br />
            <span className="text-blue-500">Track Your Progress</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Create custom workout plans, track exercises, set goals, and monitor your
            fitness journey — all in one place.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/register"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium text-lg transition-colors"
            >
              Start Free
            </Link>
            <Link
              href="/login"
              className="border border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white px-8 py-3 rounded-lg font-medium text-lg transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
