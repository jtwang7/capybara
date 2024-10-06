"use client";

import { useUser } from "@auth0/nextjs-auth0/client";

export default function TaskPage() {
  // const { user, error, isLoading } = useUser();
  const { user } = useUser();
  return <div>{user?.name}</div>;
}
