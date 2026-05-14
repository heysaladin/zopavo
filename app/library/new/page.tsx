import { PostForm } from "@/components/posts/post-form";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function NewPostPage() {
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <Link href="/library" className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-5">
          <ChevronLeft className="w-3.5 h-3.5" /> Library
        </Link>
        <h1 className="text-2xl font-semibold text-zinc-100 tracking-tight">New Post</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Create a new social media post</p>
      </div>
      <PostForm mode="create" />
    </div>
  );
}
