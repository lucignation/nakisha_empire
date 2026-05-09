import LoadingBlock from "@/components/ui/loading-block";

export default function Loading() {
  return (
    <>
      <section className="border-b border-[var(--brand-border)] bg-[var(--brand-50)] py-6 sm:py-8">
        <div className="container">
          <div className="space-y-4">
            <LoadingBlock className="h-3 w-28 rounded-full bg-[#eadfce]" />
            <LoadingBlock className="h-12 w-64 rounded-full bg-[#eadfce]" />
            <LoadingBlock className="h-4 w-full max-w-2xl rounded-full bg-[#eadfce]" />
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-14 lg:py-16">
        <div className="container">
          <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(18rem,0.75fr)]">
            <div className="grid gap-4">
              {Array.from({ length: 2 }).map((_, index) => (
                <div className="rounded-[24px] border border-[var(--brand-border)] bg-white p-4 shadow-[var(--shadow-soft)] sm:p-5" key={index}>
                  <div className="grid gap-5 sm:grid-cols-[10rem_minmax(0,1fr)]">
                    <LoadingBlock className="min-h-[10rem] rounded-[18px] bg-[#f3eadf]" />
                    <div className="space-y-4">
                      <LoadingBlock className="h-4 w-20 rounded-full bg-[#eadfce]" />
                      <LoadingBlock className="h-8 w-44 rounded-full bg-[#eadfce]" />
                      <LoadingBlock className="h-4 w-full rounded-full bg-[#eadfce]" />
                      <LoadingBlock className="h-4 w-9/12 rounded-full bg-[#eadfce]" />
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <LoadingBlock className="h-11 w-32 rounded-full bg-[#eadfce]" />
                        <LoadingBlock className="h-10 w-24 rounded-full bg-[#eadfce]" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-[24px] border border-[var(--brand-border)] bg-white p-6 shadow-[var(--shadow-soft)]">
              <LoadingBlock className="h-7 w-40 rounded-full bg-[#eadfce]" />
              <LoadingBlock className="mt-3 h-4 w-full rounded-full bg-[#eadfce]" />
              <div className="mt-6 space-y-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <LoadingBlock className="h-4 w-full rounded-full bg-[#eadfce]" key={index} />
                ))}
              </div>
              <LoadingBlock className="mt-6 h-32 w-full rounded-[18px] bg-[#f3eadf]" />
              <div className="mt-6 space-y-3">
                <LoadingBlock className="h-12 w-full rounded-[14px] bg-[#eadfce]" />
                <LoadingBlock className="h-12 w-full rounded-[14px] bg-[#eadfce]" />
                <LoadingBlock className="h-12 w-full rounded-[14px] bg-[#eadfce]" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
