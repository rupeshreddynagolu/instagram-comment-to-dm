import type { Metadata } from "next";
import { notFound } from "next/navigation";
import InvitationAcceptCard from "@/components/invitation-accept-card";
import SiteShell from "@/components/site-shell";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/client";

type InvitePageProps = {
  params: Promise<{ token: string }>;
};

export const metadata: Metadata = {
  title: "Accept Workspace Invitation - ReplyNxt",
  robots: { index: false, follow: false },
};

export default async function InvitePage({ params }: InvitePageProps) {
  const { token } = await params;
  const [session, invitation] = await Promise.all([
    auth(),
    prisma.workspaceInvitation.findUnique({
      where: { token },
      include: {
        workspace: { select: { name: true } },
      },
    }),
  ]);

  if (!invitation || invitation.status !== "PENDING") {
    notFound();
  }

  const expired = invitation.expiresAt <= new Date();

  return (
    <SiteShell footer={false}>
      <div className="mx-auto flex min-h-[calc(100dvh-7rem)] w-full max-w-xl flex-col justify-center px-4 pb-12 sm:px-6">
        <section className="rounded-3xl border border-site-line bg-site-panel p-6 sm:p-10">
          <p className="site-mono text-[13px] text-site-dim">Workspace invitation</p>
          <h1 className="mt-3 text-4xl font-bold leading-[1.05]">
            Join {invitation.workspace.name}
          </h1>
          <p className="mt-4 text-base leading-7 text-site-dim">
            You were invited as {invitation.role.toLowerCase()} for{" "}
            {invitation.email}.
          </p>
          <div className="mt-8">
            {expired ? (
              <p className="text-base text-error">
                This invitation has expired. Ask the workspace owner to resend it.
              </p>
            ) : (
              <InvitationAcceptCard
                token={token}
                isSignedIn={Boolean(session?.user?.id)}
                invitedEmail={invitation.email}
              />
            )}
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
