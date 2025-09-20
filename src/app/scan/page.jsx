
import { auth } from "../../auth";
import { redirect } from "next/navigation";
import PokeScan from "./PokeScan.client";

export default async function Page() {
  const session = await auth(); // server check
  if (!session) redirect("/api/auth/signin?callbackUrl=/scan");
  return <PokeScan />;
}
