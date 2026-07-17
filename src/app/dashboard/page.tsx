"use client";

import { useRouter } from "next/navigation";
import { useUser } from "@/features/auth/use-user";
import { useNotebooks } from "@/features/notebooks/use-notebooks";
import { NotebookCard } from "@/features/notebooks/notebook-card";
import { NotebookCardSkeleton } from "@/features/notebooks/notebook-card-skeleton";
import { CreateNotebookDialog } from "@/features/notebooks/create-notebook-dialog";
import { SearchBar } from "@/features/search/search-bar";
import { ThemeToggle } from "@/features/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const { user, isLoading: userLoading } = useUser();
  const { data: notebooks, isLoading: notebooksLoading } = useNotebooks();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  if (userLoading) return <main className="p-4 sm:p-8">Loading...</main>;

  return (
    <main className="p-4 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Your Notebooks</h1>
          <p className="text-sm text-muted-foreground">Logged in as {user?.email}</p>
        </div>
        <SearchBar />
        <div className="flex items-center gap-2">
          <CreateNotebookDialog />
          <ThemeToggle />
          <Button variant="outline" onClick={handleLogout}>
            Log out
          </Button>
        </div>
      </div>

      <div className="mt-8">
        {notebooksLoading && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <NotebookCardSkeleton key={i} />
            ))}
          </div>
        )}
        {!notebooksLoading && notebooks?.length === 0 && (
          <p className="text-muted-foreground">
            No notebooks yet. Create your first one to get started.
          </p>
        )}
        {!notebooksLoading && notebooks && notebooks.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {notebooks.map((notebook) => (
              <NotebookCard key={notebook.id} notebook={notebook} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
