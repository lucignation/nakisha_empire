import LoadingBlock from "@/components/ui/loading-block";

export default function Loading() {
  return (
    <>
      <section className="bg-[var(--brand-50)] py-6 sm:py-8">
        <div className="container">
          <div className="overflow-hidden rounded-[28px] border border-[var(--brand-border)] bg-white p-6 shadow-[var(--shadow-soft)] sm:p-8">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(20rem,0.95fr)]">
              <div className="space-y-4">
                <LoadingBlock className="h-3 w-36 rounded-full bg-[#eadfce]" />
                <LoadingBlock className="h-12 w-72 max-w-full rounded-full bg-[#eadfce]" />
                <LoadingBlock className="h-4 w-full max-w-2xl rounded-full bg-[#eadfce]" />
                <LoadingBlock className="h-4 w-10/12 max-w-xl rounded-full bg-[#eadfce]" />
                <div className="flex flex-wrap gap-3 pt-2">
                  <LoadingBlock className="h-11 w-40 rounded-full bg-[#eadfce]" />
                  <LoadingBlock className="h-11 w-40 rounded-full bg-[#eadfce]" />
                </div>
              </div>

              <LoadingBlock className="min-h-[18rem] rounded-[24px] bg-[#eadfce]" />
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
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
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
