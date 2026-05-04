"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const newsletterSchema = z.object({
  email: z.string().email("Enter a valid email address.")
});

type NewsletterFormValues = z.infer<typeof newsletterSchema>;

export default function NewsletterSignup() {
  const form = useForm<NewsletterFormValues>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: {
      email: ""
    }
  });

  function onSubmit(values: NewsletterFormValues) {
    toast.success("You joined the Glow Club", {
      description: `${values.email} is set to receive skincare tips and launch updates.`
    });
    form.reset();
  }

  return (
    <Form {...form}>
      <form className="mx-auto w-full max-w-2xl space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="sr-only">Email address</FormLabel>
              <div className="flex flex-col gap-0 overflow-hidden rounded-[4px] shadow-[0_8px_32px_rgba(0,0,0,0.2)] sm:flex-row">
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Your email address"
                    className="h-12 border-0 bg-white text-foreground placeholder:text-[#9c7f6e] sm:rounded-none"
                    {...field}
                  />
                </FormControl>
                <Button className="h-12 px-6 sm:rounded-none" type="submit">
                  Subscribe
                </Button>
              </div>
              <FormDescription className="text-center text-white/65">
                Receive skincare notes, exclusive offers, and early product drops.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
