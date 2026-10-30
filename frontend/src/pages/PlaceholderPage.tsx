
import { Link } from 'react-router-dom'

type PlaceholderPageProps = {
  title: string
}

export default function PlaceholderPage({
  title,
}: PlaceholderPageProps) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <span className="text-sm font-semibold tracking-wide text-indigo-600">
        PROJECTFLOW
      </span>

      <h1 className="text-3xl font-bold tracking-tight text-slate-900">
        {title}
      </h1>

      <p className="max-w-md text-slate-500">
        This page will be implemented as part of the ProjectFlow frontend.
      </p>

      <Link
        to="/"
        className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
      >
        Back to home
      </Link>
    </main>
  )
}
