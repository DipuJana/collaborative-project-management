
import { ArrowRight, CheckCircle2, LayoutDashboard, Users } from 'lucide-react'
import { Link } from 'react-router-dom'

const features = [
  {
    icon: LayoutDashboard,
    title: 'Organize your work',
    description:
      'Keep projects, tasks, and progress organized in one shared workspace.',
  },
  {
    icon: Users,
    title: 'Work as a team',
    description:
      'Bring teammates together, assign responsibilities, and coordinate work.',
  },
  {
    icon: CheckCircle2,
    title: 'Track every task',
    description:
      'Make progress visible and help everyone understand what needs attention.',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-hidden bg-white text-slate-900">
      <header className="border-b border-slate-200/80">
        <nav
          aria-label="Main navigation"
          className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8"
        >
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-indigo-600 text-sm font-bold text-white">
              P
            </span>
            <span className="text-xl font-bold tracking-tight">
              ProjectFlow
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              Log in
            </Link>

            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
            >
              Get started
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </nav>
      </header>

      <main>
        <section className="relative isolate">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[500px] bg-gradient-to-b from-indigo-50/80 via-white to-white"
          />

          <div className="mx-auto grid max-w-7xl items-center gap-14 px-6 py-20 sm:py-28 lg:grid-cols-2 lg:gap-16 lg:px-8">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white px-3.5 py-1.5 text-sm font-medium text-indigo-700 shadow-sm">
                <span className="size-2 rounded-full bg-teal-500" />
                One workspace. Better teamwork.
              </span>

              <h1 className="mt-7 max-w-2xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                Bring your team's work
                <span className="block text-indigo-600">
                  into focus.
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
                Plan projects, manage tasks, and keep your team aligned
                with a workspace designed to make collaboration simpler.
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-4">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                >
                  Start collaborating
                  <ArrowRight size={17} aria-hidden="true" />
                </Link>

                <Link
                  to="/login"
                  className="rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Sign in
                </Link>
              </div>

              <p className="mt-5 text-sm text-slate-500">
                Built for project teams, student groups, and small teams.
              </p>
            </div>

            <div className="relative">
              <div
                aria-hidden="true"
                className="absolute -inset-5 rounded-[2rem] bg-indigo-100/60 blur-2xl"
              />

              <div className="relative rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-900/10 sm:p-7">
                <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                      Workspace preview
                    </p>
                    <h2 className="mt-1.5 text-lg font-bold">
                      Website redesign
                    </h2>
                  </div>
                  <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                    On track
                  </span>
                </div>

                <div className="mt-6 grid grid-cols-3 gap-3">
                  {[
                    { label: 'To do', count: 3, color: 'bg-slate-400' },
                    { label: 'In progress', count: 2, color: 'bg-indigo-500' },
                    { label: 'Done', count: 4, color: 'bg-teal-500' },
                  ].map((column) => (
                    <div key={column.label} className="min-w-0">
                      <div className="mb-3 flex items-center gap-2">
                        <span className={`size-2 rounded-full ${column.color}`} />
                        <span className="truncate text-xs font-semibold text-slate-600">
                          {column.label}
                        </span>
                        <span className="ml-auto text-xs text-slate-400">
                          {column.count}
                        </span>
                      </div>

                      <div className="space-y-2.5">
                        {Array.from({ length: column.count }, (_, index) => (
                          <div
                            key={index}
                            className="rounded-lg border border-slate-200 bg-slate-50 p-3"
                          >
                            <div className="h-2 w-full rounded bg-slate-200" />
                            <div className="mt-2 h-2 w-2/3 rounded bg-slate-200" />
                            <div className="mt-4 flex items-center justify-between">
                              <span className="h-1.5 w-7 rounded bg-indigo-200" />
                              <span className="size-5 rounded-full bg-slate-200" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                  <span className="text-sm text-slate-600">
                    Project progress
                  </span>
                  <span className="text-sm font-bold text-slate-900">
                    60%
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full w-3/5 rounded-full bg-indigo-600" />
                </div>

                <p className="mt-3 text-xs text-slate-400">
                  Illustrative preview — sample content, not live project data.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-slate-100 bg-slate-50/70">
          <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
                Everything in one place
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Less coordination overhead. More meaningful progress.
              </h2>
              <p className="mt-4 leading-7 text-slate-600">
                Give your team a clear view of the work, the people
                responsible, and what comes next.
              </p>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {features.map(({ icon: Icon, title, description }) => (
                <article
                  key={title}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <span className="flex size-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <Icon size={21} aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 text-lg font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <span className="font-semibold text-slate-700">ProjectFlow</span>
          <span>Plan together. Make progress together.</span>
        </div>
      </footer>
    </div>
  )
}
