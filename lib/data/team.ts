import type { PermissionId, Role, RoleId, TeamMember } from "@/lib/types";

/**
 * Permission catalogue. Every gate in the app names one of these, so the matrix
 * on the Team page is the single source of truth rather than a static picture.
 */
export const permissionCatalogue: Array<{
  id: PermissionId;
  label: string;
  description: string;
  group: "Read" | "Manage" | "Administer";
}> = [
  {
    id: "view_dashboard",
    label: "View dashboard",
    description: "See balances, cashflow and KPI summaries.",
    group: "Read"
  },
  {
    id: "view_transactions",
    label: "View transactions",
    description: "Open the full ledger and account statements.",
    group: "Read"
  },
  {
    id: "export_data",
    label: "Export data",
    description: "Download ledgers, reports and statements as CSV.",
    group: "Read"
  },
  {
    id: "view_audit",
    label: "View audit log",
    description: "Read the record of who changed what, and when.",
    group: "Read"
  },
  {
    id: "manage_budgets",
    label: "Manage budgets",
    description: "Create, edit and reallocate category budgets.",
    group: "Manage"
  },
  {
    id: "manage_invoices",
    label: "Manage invoices",
    description: "Draft, send and void client invoices.",
    group: "Manage"
  },
  {
    id: "manage_bills",
    label: "Manage bills",
    description: "Enter vendor bills and schedule them for payment.",
    group: "Manage"
  },
  {
    id: "approve_payments",
    label: "Approve payments",
    description: "Release scheduled payments and payroll runs.",
    group: "Administer"
  },
  {
    id: "manage_team",
    label: "Manage team",
    description: "Invite members, change roles and revoke access.",
    group: "Administer"
  },
  {
    id: "manage_settings",
    label: "Manage settings",
    description: "Change organisation-wide preferences and security policy.",
    group: "Administer"
  }
];

const allPermissions = permissionCatalogue.map((entry) => entry.id);

export const roles: Role[] = [
  {
    id: "owner",
    label: "Owner",
    description: "Full control, including billing and the ability to delete the workspace.",
    permissions: allPermissions
  },
  {
    id: "admin",
    label: "Admin",
    description: "Everything an owner can do except transfer or close the workspace.",
    permissions: allPermissions.filter((permission) => permission !== "manage_settings")
  },
  {
    id: "accountant",
    label: "Accountant",
    description: "Books, invoices and bills. Cannot release payments or change access.",
    permissions: [
      "view_dashboard",
      "view_transactions",
      "export_data",
      "view_audit",
      "manage_budgets",
      "manage_invoices",
      "manage_bills"
    ]
  },
  {
    id: "analyst",
    label: "Analyst",
    description: "Read and export everything financial; no write access.",
    permissions: ["view_dashboard", "view_transactions", "export_data", "manage_budgets"]
  },
  {
    id: "viewer",
    label: "Viewer",
    description: "Dashboards only. Suitable for advisors and board observers.",
    permissions: ["view_dashboard"]
  }
];

export const roleMap = roles.reduce<Record<RoleId, Role>>((acc, role) => {
  acc[role.id] = role;
  return acc;
}, {} as Record<RoleId, Role>);

export const teamMembers: TeamMember[] = [
  {
    id: "tm-sarah",
    name: "Sarah Kim",
    initials: "SK",
    email: "sarah.kim@aurelium.io",
    roleId: "owner",
    status: "active",
    joinedOn: "2021-04-12",
    lastActiveOn: "2026-07-31",
    department: "Finance"
  },
  {
    id: "tm-daniel",
    name: "Daniel Ross",
    initials: "DR",
    email: "daniel.ross@aurelium.io",
    roleId: "admin",
    status: "active",
    joinedOn: "2021-09-01",
    lastActiveOn: "2026-07-30",
    department: "Operations"
  },
  {
    id: "tm-mia",
    name: "Mia Patel",
    initials: "MP",
    email: "mia.patel@aurelium.io",
    roleId: "accountant",
    status: "active",
    joinedOn: "2022-02-14",
    lastActiveOn: "2026-07-31",
    department: "Finance"
  },
  {
    id: "tm-ava",
    name: "Ava Liu",
    initials: "AL",
    email: "ava.liu@aurelium.io",
    roleId: "accountant",
    status: "active",
    joinedOn: "2022-11-07",
    lastActiveOn: "2026-07-29",
    department: "Finance"
  },
  {
    id: "tm-noah",
    name: "Noah Bennett",
    initials: "NB",
    email: "noah.bennett@aurelium.io",
    roleId: "analyst",
    status: "active",
    joinedOn: "2023-05-22",
    lastActiveOn: "2026-07-28",
    department: "Strategy"
  },
  {
    id: "tm-elena",
    name: "Elena Vargas",
    initials: "EV",
    email: "elena.vargas@aurelium.io",
    roleId: "analyst",
    status: "active",
    joinedOn: "2024-01-15",
    lastActiveOn: "2026-07-27",
    department: "Strategy"
  },
  {
    id: "tm-marcus",
    name: "Marcus Hale",
    initials: "MH",
    email: "marcus.hale@harborTax.com",
    roleId: "viewer",
    status: "active",
    joinedOn: "2024-08-30",
    lastActiveOn: "2026-07-19",
    department: "External advisor"
  },
  {
    id: "tm-priya",
    name: "Priya Raman",
    initials: "PR",
    email: "priya.raman@aurelium.io",
    roleId: "analyst",
    status: "invited",
    joinedOn: "2026-07-24",
    lastActiveOn: "2026-07-24",
    department: "Finance"
  }
];

export const teamMap = teamMembers.reduce<Record<string, TeamMember>>((acc, member) => {
  acc[member.id] = member;
  return acc;
}, {});

/** Members who can actually own a client relationship. */
export const accountManagers = teamMembers.filter(
  (member) => member.status === "active" && member.roleId !== "viewer"
);
