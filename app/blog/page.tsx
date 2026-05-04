import { Card, CardContent } from "@/components/ui/card";

export const metadata = {
  title: "Blog"
};

export default function BlogPage() {
  const articles = [
    {
      title: "How to layer your skincare correctly",
      copy: "Learn the best order for cleanser, toner, serum, moisturizer, and SPF."
    },
    {
      title: "Choosing sunscreen for deeper skin tones",
      copy: "A quick breakdown of what to look for if you want protection without white cast."
    },
    {
      title: "Starter routines for new skincare shoppers",
      copy: "Keep your first skincare routine simple, effective, and easy to maintain."
    }
  ];

  return (
    <section className="bg-[#faf6f1] py-12 sm:py-14">
      <div className="container">
        <div className="mb-8 text-center">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-gold-500">Blog</p>
          <h1 className="mt-3 font-display text-4xl font-medium text-foreground sm:text-5xl">Skincare Notes</h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-[#8f7767] sm:text-base">
            Quick reads to help shoppers choose products, build routines, and understand ingredients better.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {articles.map((article) => (
            <Card className="border-[#eadfce] bg-white" key={article.title}>
              <CardContent className="p-5">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-gold-500">Article</p>
                <h2 className="mt-3 text-lg font-semibold text-foreground">{article.title}</h2>
                <p className="mt-2 text-sm leading-7 text-[#8f7767]">{article.copy}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
