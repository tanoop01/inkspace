"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "@/features/theme/theme-toggle";
import { useUser } from "@/features/auth/use-user";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const { user, isLoading } = useUser();

  return (
    <main className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <span className="text-lg font-semibold">InkSpace</span>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {!isLoading && user ? (
            <Link href="/dashboard" className={cn(buttonVariants())}>
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className={cn(buttonVariants({ variant: "outline" }))}>
                Log in
              </Link>
              <Link href="/register" className={cn(buttonVariants())}>
                Get started
              </Link>
            </>
          )}
        </div>
      </header>

      <section className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-24 text-center">
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
          An infinite canvas for every note you take.
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground">
          InkSpace organizes your notes like a real notebook — Notebooks, Sections, and
          Pages — while every page is a free-form Excalidraw canvas underneath. Sketch,
          write, diagram, and study, all in one place.
        </p>
        <div className="flex gap-3">
          {!isLoading && user ? (
            <Link href="/dashboard" className={cn(buttonVariants({ size: "lg" }))}>
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link href="/register" className={cn(buttonVariants({ size: "lg" }))}>
                Create your first notebook
              </Link>
              <Link
                href="/login"
                className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
              >
                Log in
              </Link>
            </>
          )}
        </div>
      </section>

      <footer className="border-t border-border px-6 py-4 text-center text-sm text-muted-foreground">
        Built with Next.js, Excalidraw, and Supabase.
      </footer>
    </main>
  );
}
