import { redirect } from "next/navigation";

import { LoginView } from "@/components/auth/login-view";
import { getSession } from "@/lib/auth";
import { getDictionary } from "@/lib/i18n";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await getSession();
  if (session) {
    redirect("/dashboard");
  }

  const localeContext = await getDictionary();
  const params = await searchParams;

  return <LoginView localeContext={localeContext} hasError={Boolean(params.error)} />;
}
