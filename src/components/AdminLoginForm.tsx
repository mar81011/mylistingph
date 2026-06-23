"use client";

import { useState, useTransition } from "react";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { verifyAdminPin } from "@/lib/actions/admin";
import { setAdminAuthenticated } from "@/lib/admin-auth";

type AdminLoginFormProps = {
  onSuccess: () => void;
};

export function AdminLoginForm({ onSuccess }: AdminLoginFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const pin = new FormData(e.currentTarget).get("pin") as string;

    startTransition(async () => {
      const valid = await verifyAdminPin(pin);
      if (valid) {
        setAdminAuthenticated();
        onSuccess();
      } else {
        setError("Incorrect PIN. Try again.");
      }
    });
  }

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          Admin login
        </CardTitle>
        <p className="text-sm text-slate-500">
          Enter the admin PIN to manage contact settings.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="pin">Admin PIN</Label>
            <Input
              id="pin"
              name="pin"
              type="password"
              inputMode="numeric"
              autoComplete="current-password"
              placeholder="Enter PIN"
              className="mt-1"
              required
            />
          </div>
          {error && (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          )}
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Checking..." : "Enter admin panel"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
