import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { updateRecruiterProfile } from "./actions"

export const metadata = { title: "Edit profile — Open-Recruiter" }

export default async function EditProfilePage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/sign-in")

  const profile = await prisma.recruiterProfile.findUnique({
    where: { userId: session.user.id },
    select: { slug: true, bio: true, linkedInUrl: true, isPublic: true },
  })

  if (!profile) redirect("/r/onboarding")

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-zinc-900 dark:text-zinc-100">
            <ShieldCheck className="h-5 w-5" />
            Open-Recruiter
          </Link>
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard">← Dashboard</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-12">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Edit your profile</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Changes will be reflected on your public profile at{" "}
            <Link href={`/r/${profile.slug}`} className="underline underline-offset-2 hover:text-zinc-700 dark:hover:text-zinc-300">
              /r/{profile.slug}
            </Link>
            .
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Profile details</CardTitle>
            <CardDescription>
              Update your bio and LinkedIn link. Your invite code and public URL cannot be changed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={updateRecruiterProfile} className="space-y-6">
              {/* Bio */}
              <div className="space-y-1.5">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  rows={4}
                  defaultValue={profile.bio ?? ""}
                  placeholder="Tell candidates a bit about yourself — your specialisms, industries you recruit for, and your approach."
                  maxLength={800}
                />
                <p className="text-xs text-zinc-400">Max 800 characters.</p>
              </div>

              {/* LinkedIn URL */}
              <div className="space-y-1.5">
                <Label htmlFor="linkedInUrl">LinkedIn URL</Label>
                <Input
                  id="linkedInUrl"
                  name="linkedInUrl"
                  type="url"
                  defaultValue={profile.linkedInUrl ?? ""}
                  placeholder="https://linkedin.com/in/your-profile"
                />
              </div>

              {/* Visibility */}
              <div className="space-y-2">
                <Label>Profile visibility</Label>
                <div className="flex flex-col gap-2">
                  <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-zinc-200 px-4 py-3 dark:border-zinc-700">
                    <input
                      type="radio"
                      name="isPublic"
                      value="true"
                      defaultChecked={profile.isPublic}
                      className="accent-zinc-900 dark:accent-zinc-100"
                    />
                    <div>
                      <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Public</p>
                      <p className="text-xs text-zinc-500">Anyone can find and view your profile.</p>
                    </div>
                  </label>
                  <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-zinc-200 px-4 py-3 dark:border-zinc-700">
                    <input
                      type="radio"
                      name="isPublic"
                      value="false"
                      defaultChecked={!profile.isPublic}
                      className="accent-zinc-900 dark:accent-zinc-100"
                    />
                    <div>
                      <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Hidden</p>
                      <p className="text-xs text-zinc-500">Your profile won&apos;t appear in search, but direct links still work.</p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="submit" className="flex-1">Save changes</Button>
                <Button asChild variant="outline">
                  <Link href="/dashboard">Cancel</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
