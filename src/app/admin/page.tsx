import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { saveAiSettings, moderateReview, updateUserRole } from "./actions"
import {
  ShieldCheck,
  Settings,
  Flag,
  Users,
  CheckCircle2,
  XCircle,
  Star,
  User,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"

export const metadata = { title: "Admin — Open-Recruiter" }

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

async function getAdminData() {
  const [aiSettings, flaggedReviews, users] = await Promise.all([
    prisma.adminSettings.findFirst(),
    prisma.review.findMany({
      where: { status: { in: ["FLAGGED", "UNDER_REVIEW"] } },
      include: {
        candidate: { select: { name: true, email: true } },
        recruiter: { select: { slug: true, user: { select: { name: true } } } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        subscriptionStatus: true,
        createdAt: true,
      },
    }),
  ])
  return { aiSettings, flaggedReviews, users }
}

// ---------------------------------------------------------------------------
// Section: AI Settings
// ---------------------------------------------------------------------------

function AiSettingsSection({
  current,
}: {
  current: { aiProvider: string; aiApiKeyEncrypted: string | null } | null
}) {
  const providers = ["MISTRAL", "GEMINI", "CLAUDE", "OPENAI"]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Settings className="h-4 w-4 text-zinc-500" />
          <CardTitle className="text-base">AI moderation settings</CardTitle>
        </div>
        <CardDescription>
          Configure the AI provider used for automated review moderation. The API key is
          encrypted with AES-256-GCM before being stored.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={saveAiSettings} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="aiProvider">Provider</Label>
            <select
              id="aiProvider"
              name="aiProvider"
              defaultValue={current?.aiProvider ?? "MISTRAL"}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {providers.map((p) => (
                <option key={p} value={p}>
                  {p.charAt(0) + p.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="aiApiKey">
              API key{" "}
              <span className="text-xs font-normal text-zinc-400">
                {current?.aiApiKeyEncrypted ? "(leave blank to keep current)" : "(not set)"}
              </span>
            </Label>
            <Input
              id="aiApiKey"
              name="aiApiKey"
              type="password"
              placeholder={current?.aiApiKeyEncrypted ? "••••••••••••••••" : "Enter API key"}
              autoComplete="off"
            />
            <p className="text-xs text-zinc-400">
              Stored encrypted (AES-256-GCM). Never logged or transmitted in plain text.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button type="submit" size="sm">Save settings</Button>
            {current?.aiApiKeyEncrypted && (
              <span className="flex items-center gap-1 text-xs text-emerald-600">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Key configured
              </span>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Section: Review moderation
// ---------------------------------------------------------------------------

function ReviewModerationSection({
  reviews,
}: {
  reviews: Awaited<ReturnType<typeof getAdminData>>["flaggedReviews"]
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Flag className="h-4 w-4 text-zinc-500" />
          <CardTitle className="text-base">Flagged reviews</CardTitle>
          {reviews.length > 0 && (
            <Badge variant="destructive" className="ml-auto text-xs">
              {reviews.length} pending
            </Badge>
          )}
        </div>
        <CardDescription>
          Reviews marked FLAGGED or UNDER_REVIEW. Approve to restore to Published, or Remove to hide.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {reviews.length === 0 ? (
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            No flagged reviews — all clear.
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="space-y-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
              >
                {/* Review meta */}
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
                      {review.candidate.name ?? review.candidate.email ?? "Unknown"}{" "}
                      <span className="font-normal text-zinc-400">reviewed</span>{" "}
                      <Link
                        href={`/r/${review.recruiter.slug}`}
                        className="text-zinc-700 underline hover:text-zinc-900 dark:text-zinc-300"
                        target="_blank"
                      >
                        {review.recruiter.user.name ?? review.recruiter.slug}
                      </Link>
                    </p>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-zinc-400">
                      <Badge variant="outline" className="text-[10px]">{review.status}</Badge>
                      <span>Overall: {review.overallRating.toFixed(1)}★</span>
                      <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${i < Math.round(review.overallRating) ? "fill-current" : "fill-zinc-200 dark:fill-zinc-700"}`}
                      />
                    ))}
                  </div>
                </div>

                {review.comment && (
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-3">
                    {review.comment}
                  </p>
                )}

                {/* Moderation actions */}
                <Separator />
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  {/* Dispute note input */}
                  <div className="flex-1 space-y-1">
                    <Label htmlFor={`note-${review.id}`} className="text-xs">
                      Moderation note (optional)
                    </Label>
                    <Textarea
                      id={`note-${review.id}`}
                      name="disputeNote"
                      form={`approve-${review.id}`}
                      placeholder="Internal note — not shown publicly"
                      rows={2}
                      className="resize-none text-xs"
                    />
                  </div>
                  {/* Action buttons */}
                  <div className="flex shrink-0 gap-2">
                    <form id={`approve-${review.id}`} action={moderateReview}>
                      <input type="hidden" name="reviewId" value={review.id} />
                      <input type="hidden" name="status" value="PUBLISHED" />
                      <Button type="submit" size="sm" variant="outline" className="gap-1.5 text-emerald-700 border-emerald-300 hover:bg-emerald-50">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Approve
                      </Button>
                    </form>
                    <form action={moderateReview}>
                      <input type="hidden" name="reviewId" value={review.id} />
                      <input type="hidden" name="status" value="REMOVED" />
                      <Button type="submit" size="sm" variant="outline" className="gap-1.5 text-red-700 border-red-300 hover:bg-red-50">
                        <XCircle className="h-3.5 w-3.5" />
                        Remove
                      </Button>
                    </form>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Section: User list
// ---------------------------------------------------------------------------

const ROLE_COLORS: Record<string, string> = {
  ADMIN: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
  RECRUITER: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
  COMPANY: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  CANDIDATE: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
}

function UserListSection({
  users,
}: {
  users: Awaited<ReturnType<typeof getAdminData>>["users"]
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-zinc-500" />
          <CardTitle className="text-base">Users ({users.length})</CardTitle>
        </div>
        <CardDescription>
          Most recent 100 users. Change role directly from this panel.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex flex-wrap items-center gap-3 rounded-lg border border-zinc-100 px-3 py-2.5 dark:border-zinc-800"
            >
              {/* Avatar placeholder */}
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                <User className="h-3.5 w-3.5 text-zinc-400" />
              </div>

              {/* Name + email */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-zinc-800 dark:text-zinc-100">
                  {user.name ?? "(no name)"}
                </p>
                <p className="truncate text-xs text-zinc-400">{user.email}</p>
              </div>

              {/* Role badge */}
              <span className={`rounded px-2 py-0.5 text-[10px] font-semibold ${ROLE_COLORS[user.role]}`}>
                {user.role}
              </span>

              {/* Subscription */}
              <span className="text-xs text-zinc-400">
                {user.subscriptionStatus.replace("_", " ")}
              </span>

              {/* Role change form */}
              <form action={updateUserRole} className="flex items-center gap-1">
                <input type="hidden" name="userId" value={user.id} />
                <select
                  name="role"
                  defaultValue={user.role}
                  className="h-7 rounded border border-zinc-200 bg-white px-1.5 text-[11px] dark:border-zinc-700 dark:bg-zinc-900"
                >
                  {["ADMIN", "RECRUITER", "COMPANY", "CANDIDATE"].map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                <Button type="submit" size="sm" variant="ghost" className="h-7 px-2 text-xs">
                  Set
                </Button>
              </form>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function AdminPage() {
  const session = await auth()
  // Middleware already blocks non-admins, but double-check here
  if ((session?.user as { role?: string } | undefined)?.role !== "ADMIN") {
    redirect("/dashboard")
  }

  const { aiSettings, flaggedReviews, users } = await getAdminData()

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-zinc-900 dark:text-zinc-100">
            <ShieldCheck className="h-5 w-5" />
            Open-Recruiter
          </Link>
          <div className="flex items-center gap-3">
            <Badge variant="destructive" className="text-[10px]">ADMIN</Badge>
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-8 px-4 py-10">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Admin panel</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Site-wide settings, review moderation, and user management.
          </p>
        </div>

        <AiSettingsSection current={aiSettings} />
        <ReviewModerationSection reviews={flaggedReviews} />
        <UserListSection users={users} />
      </main>
    </div>
  )
}
