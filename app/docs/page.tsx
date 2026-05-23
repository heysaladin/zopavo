import { Suspense } from "react";
import { DocsClient } from "./docs-client";

export default function DocsPage() {
  return (
    <div className="flex-1 min-h-0 overflow-hidden flex">
      <Suspense>
        <DocsClient />
      </Suspense>
    </div>
  );
}
