import LoadingBlock from "@/components/ui/loading-block";

export default function AdminRouteLoading() {
  return (
    <section className="min-h-screen overflow-x-clip bg-[#0b1020] text-slate-900">
      <div className="mx-auto w-full max-w-[1800px] px-2 py-2 sm:px-6 sm:py-4 lg:px-8">
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-[17rem_minmax(0,1fr)]">
          <aside className="hidden lg:block lg:sticky lg:top-4 lg:self-start">
            <div className="overflow-hidden rounded-[32px] border border-white/10 bg-slate-950 text-white shadow-[0_30px_90px_rgba(0,0,0,0.35)]">
              <div className="border-b border-white/10 px-5 py-6">
                <LoadingBlock className="h-3 w-28 rounded-full bg-white/10" />
                <LoadingBlock className="mt-4 h-8 w-40 rounded-full bg-white/10" />
                <div className="mt-4 space-y-2">
                  <LoadingBlock className="h-4 w-full rounded-full bg-white/10" />
                  <LoadingBlock className="h-4 w-11/12 rounded-full bg-white/10" />
                  <LoadingBlock className="h-4 w-9/12 rounded-full bg-white/10" />
                </div>
              </div>

              <div className="space-y-2 p-3">
                {Array.from({ length: 7 }).map((_, index) => (
                  <div className="rounded-2xl border border-white/5 px-4 py-4" key={index}>
                    <LoadingBlock className="h-4 w-24 rounded-full bg-white/10" />
                    <LoadingBlock className="mt-3 h-3 w-11/12 rounded-full bg-white/10" />
                    <LoadingBlock className="mt-2 h-3 w-8/12 rounded-full bg-white/10" />
                  </div>
                ))}
              </div>
            </div>
          </aside>

          <div className="min-w-0 space-y-4 sm:space-y-6">
            <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white px-3 py-4 shadow-sm sm:rounded-[32px] sm:px-6 sm:py-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-3">
                  <LoadingBlock className="h-3 w-36 rounded-full" />
                  <LoadingBlock className="h-9 w-80 max-w-full rounded-full" />
                  <LoadingBlock className="h-4 w-full max-w-3xl rounded-full" />
                  <LoadingBlock className="h-4 w-10/12 max-w-2xl rounded-full" />
                  <LoadingBlock className="h-8 w-52 rounded-full" />
                </div>

                <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap sm:gap-3">
                  <LoadingBlock className="h-11 w-full sm:w-32" />
                  <LoadingBlock className="h-11 w-full sm:w-32" />
                </div>
              </div>
            </div>

            <div className="rounded-[22px] border border-slate-200 bg-white p-3 shadow-sm sm:hidden">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <LoadingBlock className="h-10 w-10 rounded-2xl" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <LoadingBlock className="h-4 w-28 rounded-full" />
                    <LoadingBlock className="h-3 w-40 rounded-full" />
                  </div>
                </div>
                <LoadingBlock className="h-9 w-24 rounded-xl" />
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm" key={index}>
                  <LoadingBlock className="h-8 w-36 rounded-full" />
                  <LoadingBlock className="mt-6 h-10 w-28 rounded-full" />
                  <LoadingBlock className="mt-3 h-4 w-32 rounded-full" />
                </div>
              ))}
            </div>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(22rem,0.85fr)]">
              <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                <LoadingBlock className="h-8 w-56 rounded-full" />
                <LoadingBlock className="mt-3 h-4 w-80 max-w-full rounded-full" />
                <div className="mt-6 space-y-4">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div className="rounded-[22px] border border-slate-200 p-5" key={index}>
                      <LoadingBlock className="h-5 w-56 rounded-full" />
                      <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        <LoadingBlock className="h-4 w-28 rounded-full" />
                        <LoadingBlock className="h-4 w-24 rounded-full" />
                        <LoadingBlock className="h-4 w-32 rounded-full" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                {Array.from({ length: 2 }).map((_, index) => (
                  <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm" key={index}>
                    <LoadingBlock className="h-8 w-48 rounded-full" />
                    <LoadingBlock className="mt-3 h-4 w-64 max-w-full rounded-full" />
                    <div className="mt-6 space-y-3">
                      <LoadingBlock className="h-24 w-full" />
                      <LoadingBlock className="h-24 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
