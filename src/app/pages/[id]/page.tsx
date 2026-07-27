import { notFound } from "next/navigation";
import { db } from "@/src/db";

export default async function PageView({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const page = await db.query.pages.findFirst({
    where: { id, deletedAt: { isNull: true } },
  });

  if (!page) notFound();

  return <h1>{page.title || "Untitled"}</h1>;
}