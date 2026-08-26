"use client";

import { useMemo, useState } from "react";
import { Check, Download, Mail, Minus, ShieldCheck, UserPlus, Users, UserX } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Drawer, DetailRow } from "@/components/ui/drawer";
import { Field, Input, SegmentedControl, Select } from "@/components/ui/field";
import { Avatar, Badge, MemberStatusBadge, RoleBadge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/states";
import { useAppContext, useFormat } from "@/components/providers/app-provider";
import { useSimulatedLoading } from "@/lib/hooks";
import { permissionCatalogue, roleMap, roles, teamMembers as seedMembers } from "@/lib/mock-data";
import { csvFilename, downloadCsv, toCsv } from "@/lib/csv";
import { cn } from "@/lib/utils";
import type { MemberStatus, RoleId, TeamMember } from "@/lib/types";

type StatusFilter = MemberStatus | "all";

const statusTabs: Array<{ id: StatusFilter; label: string }> = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "invited", label: "Invited" },
  { id: "suspended", label: "Suspended" }
];

const groupOrder = ["Read", "Manage", "Administer"] as const;

export function TeamPage() {
  const { addToast, refreshKey } = useAppContext();
  const loading = useSimulatedLoading(600, refreshKey);
  const fmt = useFormat();

  const [members, setMembers] = useState<TeamMember[]>(seedMembers);
  const [status, setStatus] = useState<StatusFilter>("all");
  const [selected, setSelected] = useState<TeamMember | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<RoleId>("analyst");

  const visible = useMemo(
    () => members.filter((member) => status === "all" || member.status === status),
    [members, status]
  );

  const counts = useMemo(
    () => ({
      active: members.filter((member) => member.status === "active").length,
      invited: members.filter((member) => member.status === "invited").length,
      admins: members.filter(
        (member) => member.roleId === "owner" || member.roleId === "admin"
      ).length
    }),
    [members]
  );

  function changeRole(memberId: string, roleId: RoleId) {
    const member = members.find((item) => item.id === memberId);
    if (!member) return;

    if (member.roleId === "owner") {
      addToast({
        title: "Owner role is fixed",
        body: "Transfer ownership from Settings before changing this role.",
        tone: "warning"
      });
      return;
    }

    setMembers((current) =>
      current.map((item) => (item.id === memberId ? { ...item, roleId } : item))
    );
    setSelected((current) => (current?.id === memberId ? { ...current, roleId } : current));
    addToast({
      title: "Role updated",
      body: `${member.name} is now ${roleMap[roleId].label.toLowerCase()}.`,
      tone: "success"
    });
  }

  function toggleSuspension(member: TeamMember) {
    if (member.roleId === "owner") {
      addToast({
        title: "Cannot suspend the owner",
        body: "Transfer ownership first if this account must be disabled.",
        tone: "warning"
      });
      return;
    }

    const next: MemberStatus = member.status === "suspended" ? "active" : "suspended";
    setMembers((current) =>
      current.map((item) => (item.id === member.id ? { ...item, status: next } : item))
    );
    setSelected((current) => (current?.id === member.id ? { ...current, status: next } : current));
    addToast({
      title: next === "suspended" ? "Access suspended" : "Access restored",
      body: `${member.name} ${next === "suspended" ? "can no longer sign in" : "can sign in again"}.`,
      tone: next === "suspended" ? "warning" : "success"
    });
  }

  function sendInvite() {
    if (!inviteName.trim()) {
      addToast({ title: "Name required", body: "Enter the person's name.", tone: "warning" });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteEmail)) {
      addToast({
        title: "Check the email",
        body: "That address does not look valid.",
        tone: "warning"
      });
      return;
    }
    if (members.some((member) => member.email.toLowerCase() === inviteEmail.toLowerCase())) {
      addToast({
        title: "Already invited",
        body: "Someone with that email is already in this workspace.",
        tone: "warning"
      });
      return;
    }

    const initials = inviteName
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => word[0] ?? "")
      .join("")
      .toUpperCase();

    setMembers((current) => [
      ...current,
      {
        id: `tm-${inviteEmail.split("@")[0].replace(/[^a-z0-9]/gi, "")}-${current.length}`,
        name: inviteName.trim(),
        initials,
        email: inviteEmail.trim(),
        roleId: inviteRole,
        status: "invited",
        joinedOn: "2026-07-31",
        lastActiveOn: "2026-07-31",
        department: "Pending"
      }
    ]);

    addToast({
      title: "Invitation sent",
      body: `${inviteName.trim()} was invited as ${roleMap[inviteRole].label.toLowerCase()}.`,
      tone: "success"
    });

    setInviteName("");
    setInviteEmail("");
    setInviteRole("analyst");
    setInviteOpen(false);
  }

  function exportMembers() {
    const csv = toCsv<TeamMember>(members, [
      { header: "Name", value: (member) => member.name },
      { header: "Email", value: (member) => member.email },
      { header: "Role", value: (member) => roleMap[member.roleId].label },
      { header: "Status", value: (member) => member.status },
      { header: "Department", value: (member) => member.department },
      { header: "Joined", value: (member) => member.joinedOn },
      { header: "Last active", value: (member) => member.lastActiveOn },
      {
        header: "Permissions",
        value: (member) => roleMap[member.roleId].permissions.join(" | ")
      }
    ]);

    const ok = downloadCsv(csvFilename("team"), csv);
    addToast(
      ok
        ? { title: "Team exported", body: `${members.length} members saved as CSV.`, tone: "success" }
        : {
            title: "Export blocked",
            body: "Your browser prevented the download. Check its download settings.",
            tone: "error"
          }
    );
  }

  return (
    <>
      <section aria-label="Team summary" className="grid animate-rise gap-4 sm:grid-cols-3">
        <StatCard
          label="Active members"
          value={counts.active}
          icon={Users}
          caption={`of ${members.length} in the workspace`}
          loading={loading}
          format={(value) => String(Math.round(value))}
        />
        <StatCard
          label="Pending invitations"
          value={counts.invited}
          icon={Mail}
          caption="awaiting acceptance"
          loading={loading}
          format={(value) => String(Math.round(value))}
        />
        <StatCard
          label="Elevated access"
          value={counts.admins}
          icon={ShieldCheck}
          caption="owners and admins"
          loading={loading}
          format={(value) => String(Math.round(value))}
        />
      </section>

      {/* Members */}
      <Card flush className="animate-rise stagger-1">
        <div className="border-b border-line p-5">
          <CardHeader
            title="Members"
            description="Change a role here and the permission matrix below updates immediately"
            actions={
              <>
                <SegmentedControl
                  label="Member status"
                  options={statusTabs}
                  value={status}
                  onChange={setStatus}
                />
                <Button variant="secondary" size="md" icon={Download} onClick={exportMembers}>
                  <span className="hidden sm:inline">Export</span>
                </Button>
                <Button variant="accent" icon={UserPlus} onClick={() => setInviteOpen(true)}>
                  <span className="hidden sm:inline">Invite</span>
                </Button>
              </>
            }
          />
        </div>

        {loading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-14 w-full" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No members in this view"
            description="Change the status filter to see the rest of the workspace."
            action={
              <Button variant="secondary" size="sm" onClick={() => setStatus("all")}>
                Show everyone
              </Button>
            }
          />
        ) : (
          <ul className="divide-y divide-line">
            {visible.map((member) => (
              <li
                key={member.id}
                className="flex flex-wrap items-center gap-3 p-4 transition-colors hover:bg-surfaceMuted sm:px-5"
              >
                <button
                  type="button"
                  onClick={() => setSelected(member)}
                  className="flex min-w-0 flex-1 items-center gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aurum-400"
                >
                  <Avatar initials={member.initials} />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-ink">
                      {member.name}
                    </span>
                    <span className="block truncate text-xs text-inkMuted">{member.email}</span>
                  </span>
                </button>

                <span className="hidden w-32 shrink-0 text-xs text-inkMuted lg:block">
                  {member.department}
                </span>

                <MemberStatusBadge status={member.status} className="shrink-0" />

                <div className="w-full shrink-0 sm:w-44">
                  <Select
                    value={member.roleId}
                    aria-label={`Role for ${member.name}`}
                    disabled={member.roleId === "owner"}
                    onChange={(event) => changeRole(member.id, event.target.value as RoleId)}
                  >
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.label}
                      </option>
                    ))}
                  </Select>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  icon={UserX}
                  aria-label={
                    member.status === "suspended"
                      ? `Restore access for ${member.name}`
                      : `Suspend ${member.name}`
                  }
                  onClick={() => toggleSuspension(member)}
                  className="shrink-0"
                />
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Permission matrix */}
      <Card flush className="animate-rise stagger-2">
        <div className="border-b border-line p-5">
          <CardHeader
            title="Permission matrix"
            description="What each role can do. Ten permissions across five roles — this is the live definition, not a diagram."
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <caption className="sr-only">Permissions granted to each role</caption>
            <thead>
              <tr className="border-b border-line bg-surfaceMuted/60">
                <th scope="col" className="px-5 py-3 text-label font-semibold uppercase text-inkMuted">
                  Permission
                </th>
                {roles.map((role) => (
                  <th
                    key={role.id}
                    scope="col"
                    className="px-4 py-3 text-center text-sm font-semibold text-ink"
                  >
                    {role.label}
                    <span className="mt-0.5 block text-[10px] font-normal text-inkSubtle">
                      {members.filter((member) => member.roleId === role.id).length} member
                      {members.filter((member) => member.roleId === role.id).length === 1 ? "" : "s"}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {groupOrder.map((group) => (
                <PermissionGroup key={group} group={group} />
              ))}
            </tbody>
          </table>
        </div>

        <div className="border-t border-line px-5 py-3.5">
          <p className="text-xs leading-relaxed text-inkMuted">
            Owners always hold every permission. Admins hold everything except organisation
            settings, so ownership cannot be transferred sideways.
          </p>
        </div>
      </Card>

      {/* Member detail */}
      <Drawer
        open={selected !== null}
        title={selected?.name ?? ""}
        subtitle={selected?.email}
        onClose={() => setSelected(null)}
        footer={
          selected ? (
            <>
              <Button variant="secondary" onClick={() => setSelected(null)}>
                Close
              </Button>
              <Button
                variant={selected.status === "suspended" ? "accent" : "danger"}
                icon={UserX}
                disabled={selected.roleId === "owner"}
                onClick={() => toggleSuspension(selected)}
              >
                {selected.status === "suspended" ? "Restore access" : "Suspend access"}
              </Button>
            </>
          ) : null
        }
      >
        {selected ? (
          <>
            <div className="flex items-center gap-4">
              <Avatar initials={selected.initials} size="lg" />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <RoleBadge roleId={selected.roleId} label={roleMap[selected.roleId].label} />
                  <MemberStatusBadge status={selected.status} />
                </div>
                <p className="mt-1.5 text-sm text-inkMuted">{selected.department}</p>
              </div>
            </div>

            <p className="mt-5 rounded-control border border-line bg-surfaceMuted px-4 py-3 text-xs leading-relaxed text-inkMuted">
              {roleMap[selected.roleId].description}
            </p>

            <dl className="mt-5 divide-y divide-line border-y border-line">
              <DetailRow label="Email">{selected.email}</DetailRow>
              <DetailRow label="Department">{selected.department}</DetailRow>
              <DetailRow label="Joined">{fmt.date(selected.joinedOn)}</DetailRow>
              <DetailRow label="Last active">{fmt.date(selected.lastActiveOn)}</DetailRow>
            </dl>

            <h3 className="mt-6 text-sm font-semibold text-ink">
              Permissions ({roleMap[selected.roleId].permissions.length} of{" "}
              {permissionCatalogue.length})
            </h3>
            <ul className="mt-3 space-y-2">
              {permissionCatalogue.map((permission) => {
                const granted = roleMap[selected.roleId].permissions.includes(permission.id);
                return (
                  <li
                    key={permission.id}
                    className={cn(
                      "flex items-start gap-3 rounded-control border px-3 py-2.5",
                      granted ? "border-line" : "border-line opacity-55"
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full",
                        granted
                          ? "bg-gain-100 text-gain-700 dark:bg-gain-900/40 dark:text-gain-300"
                          : "bg-surfaceMuted text-inkSubtle"
                      )}
                    >
                      {granted ? <Check size={12} aria-hidden /> : <Minus size={12} aria-hidden />}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-ink">{permission.label}</span>
                      <span className="block text-xs text-inkMuted">{permission.description}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </>
        ) : null}
      </Drawer>

      {/* Invite */}
      <Modal
        open={inviteOpen}
        title="Invite a member"
        description="They receive an email invitation and appear as pending until it is accepted."
        onClose={() => setInviteOpen(false)}
        onSubmit={sendInvite}
        submitLabel="Send invitation"
      >
        <div className="space-y-4">
          <Field label="Full name" htmlFor="invite-name">
            <Input
              id="invite-name"
              value={inviteName}
              onChange={(event) => setInviteName(event.target.value)}
              placeholder="e.g. Jordan Availe"
            />
          </Field>
          <Field label="Work email" htmlFor="invite-email">
            <Input
              id="invite-email"
              type="email"
              value={inviteEmail}
              onChange={(event) => setInviteEmail(event.target.value)}
              placeholder="name@aurelium.io"
            />
          </Field>
          <Field label="Role" htmlFor="invite-role" hint={roleMap[inviteRole].description}>
            <Select
              id="invite-role"
              value={inviteRole}
              onChange={(event) => setInviteRole(event.target.value as RoleId)}
            >
              {roles
                .filter((role) => role.id !== "owner")
                .map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.label}
                  </option>
                ))}
            </Select>
          </Field>

          <div className="rounded-control border border-line bg-surfaceMuted p-3">
            <p className="eyebrow">Grants</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {roleMap[inviteRole].permissions.map((permission) => (
                <Badge key={permission} tone="neutral">
                  {permissionCatalogue.find((item) => item.id === permission)?.label ?? permission}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}

/** One labelled band of the matrix — Read, Manage or Administer. */
function PermissionGroup({ group }: { group: "Read" | "Manage" | "Administer" }) {
  const rows = permissionCatalogue.filter((permission) => permission.group === group);

  return (
    <>
      <tr className="bg-surfaceMuted/40">
        <th
          scope="colgroup"
          colSpan={roles.length + 1}
          className="px-5 py-2 text-left text-label font-semibold uppercase text-inkMuted"
        >
          {group}
        </th>
      </tr>
      {rows.map((permission) => (
        <tr key={permission.id} className="border-b border-line last:border-0">
          <th scope="row" className="px-5 py-3 text-left font-normal">
            <span className="block text-sm text-ink">{permission.label}</span>
            <span className="block text-xs text-inkMuted">{permission.description}</span>
          </th>
          {roles.map((role) => {
            const granted = role.permissions.includes(permission.id);
            return (
              <td key={role.id} className="px-4 py-3 text-center">
                {granted ? (
                  <>
                    <Check
                      size={16}
                      className="mx-auto text-gain-600 dark:text-gain-400"
                      aria-hidden
                    />
                    <span className="sr-only">{role.label} has {permission.label}</span>
                  </>
                ) : (
                  <>
                    <Minus size={16} className="mx-auto text-inkSubtle" aria-hidden />
                    <span className="sr-only">
                      {role.label} does not have {permission.label}
                    </span>
                  </>
                )}
              </td>
            );
          })}
        </tr>
      ))}
    </>
  );
}
