import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import HomeLanding from "./HomeLanding";

export default async function HomePage() {
  const session = await auth();
  if (session?.user) {
    redirect("/decouvrir");
  }

  return <HomeLanding />;
}
