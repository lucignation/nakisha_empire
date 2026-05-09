import LoadingBlock from "@/components/ui/loading-block";

export default function Loading() {
  return (
    <>
      <section className="py-12 sm:py-14 lg:py-16">
        <div className="container space-y-6">
          <LoadingBlock className="h-3 w-32 rounded-full bg-[#eadfce]" />

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-10">
            <LoadingBlock className="min-h-[26rem] rounded-[28px] bg-[#f3eadf]" />

            <div className="rounded-[28px] border border-[var(--brand-border)] bg-white p-6 shadow-[var(--shadow-soft)] sm:p-8">
              <div className="space-y-6">
                <div className="flex gap-3">
                  <LoadingBlock className="h-8 w-28 rounded-full bg-[#eadfce]" />
                  <LoadingBlock className="h-8 w-24 rounded-full bg-[#eadfce]" />
                </div>
                <div className="space-y-4">
                  <LoadingBlock className="h-14 w-64 max-w-full rounded-full bg-[#eadfce]" />
                  <LoadingBlock className="h-4 w-full rounded-full bg-[#eadfce]" />
                  <LoadingBlock className="h-4 w-11/12 rounded-full bg-[#eadfce]" />
                  <LoadingBlock className="h-4 w-9/12 rounded-full bg-[#eadfce]" />
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div className="rounded-[18px] border border-[var(--brand-border)] bg-[var(--brand-50)] p-4" key={index}>
                      <LoadingBlock className="h-5 w-20 rounded-full bg-[#eadfce]" />
                      <LoadingBlock className="mt-3 h-4 w-24 rounded-full bg-[#eadfce]" />
                    </div>
                  ))}
                </div>
                <LoadingBlock className="h-12 w-40 rounded-full bg-[#eadfce]" />
                <div className="space-y-3">
                  <LoadingBlock className="h-4 w-full rounded-full bg-[#eadfce]" />
                  <LoadingBlock className="h-4 w-11/12 rounded-full bg-[#eadfce]" />
                  <LoadingBlock className="h-4 w-10/12 rounded-full bg-[#eadfce]" />
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <LoadingBlock className="h-11 w-full rounded-full bg-[#eadfce] sm:w-36" />
                  <LoadingBlock className="h-11 w-full rounded-full bg-[#eadfce] sm:w-36" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-14 lg:py-16">
        <div className="container grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div className="rounded-[24px] border border-[var(--brand-border)] bg-white p-6 shadow-[var(--shadow-soft)]" key={index}>
              <LoadingBlock className="h-8 w-40 rounded-full bg-[#eadfce]" />
              <LoadingBlock className="mt-5 h-px w-full rounded-full bg-[#eadfce]" />
              <div className="mt-5 space-y-3">
                <LoadingBlock className="h-4 w-full rounded-full bg-[#eadfce]" />
                <LoadingBlock className="h-4 w-11/12 rounded-full bg-[#eadfce]" />
                <LoadingBlock className="h-4 w-9/12 rounded-full bg-[#eadfce]" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
