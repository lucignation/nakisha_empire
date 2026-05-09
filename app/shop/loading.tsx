import LoadingBlock from "@/components/ui/loading-block";

export default function Loading() {
  return (
    <>
      <section className="border-b border-[var(--brand-border)] bg-[var(--brand-50)] py-6 sm:py-8">
        <div className="container">
          <div className="overflow-hidden rounded-[28px] border border-[var(--brand-border)] bg-white p-6 shadow-[var(--shadow-soft)] sm:p-8">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.02fr)_minmax(20rem,0.98fr)]">
              <div className="space-y-4">
                <LoadingBlock className="h-3 w-28 rounded-full bg-[#eadfce]" />
                <LoadingBlock className="h-11 w-56 rounded-full bg-[#eadfce]" />
                <LoadingBlock className="h-4 w-full max-w-2xl rounded-full bg-[#eadfce]" />
                <LoadingBlock className="h-4 w-10/12 max-w-xl rounded-full bg-[#eadfce]" />
                <div className="flex flex-wrap gap-2 pt-1">
                  <LoadingBlock className="h-9 w-32 rounded-full bg-[#eadfce]" />
                  <LoadingBlock className="h-9 w-36 rounded-full bg-[#eadfce]" />
                  <LoadingBlock className="h-9 w-36 rounded-full bg-[#eadfce]" />
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                {Array.from({ length: 2 }).map((_, index) => (
                  <div className="rounded-[20px] border border-[var(--brand-border)] bg-[var(--brand-50)] p-3" key={index}>
                    <LoadingBlock className="min-h-[12rem] rounded-[18px] bg-[#eadfce]" />
                    <LoadingBlock className="mt-4 h-4 w-20 rounded-full bg-[#eadfce]" />
                    <LoadingBlock className="mt-3 h-6 w-32 rounded-full bg-[#eadfce]" />
                    <LoadingBlock className="mt-3 h-4 w-40 rounded-full bg-[#eadfce]" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-8 sm:py-10">
        <div className="container">
          <LoadingBlock className="h-14 w-full rounded-full bg-[#f3eadf]" />
        </div>
      </section>

      <section className="bg-[var(--brand-50)] py-12 sm:py-14">
        <div className="container">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div className="rounded-[24px] border border-[var(--brand-border)] bg-white p-4 shadow-[var(--shadow-soft)]" key={index}>
                <LoadingBlock className="aspect-square rounded-[18px] bg-[#f3eadf]" />
                <LoadingBlock className="mt-4 h-4 w-24 rounded-full bg-[#eadfce]" />
                <LoadingBlock className="mt-3 h-7 w-40 rounded-full bg-[#eadfce]" />
                <LoadingBlock className="mt-3 h-4 w-28 rounded-full bg-[#eadfce]" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
