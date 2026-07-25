import { connectDB } from "../../utils/db";
import CompanyProject from "../../models/CompanyProject";
import TeamMember from "../../models/TeamMember";
import Risk from "../../models/Risk";
import ProjectPerformance from "../../models/ProjectPerformance";

export default defineEventHandler(async (event) => {
  try {
    await connectDB();
    const queryParams = getQuery(event);
    const q = (queryParams.q || "").trim();

    // Application Navigation Views & Shortcuts
    const staticShortcuts = [
      { id: "nav-dash", title: "Executive Portfolio Dashboard", subtitle: "Overview of cross-company metrics & KPIs", category: "shortcuts", type: "nav", actionUrl: "/" },
      { id: "nav-sprint-report", title: "Sprint Health Report", subtitle: "Executive performance summary & AI recommendations", category: "shortcuts", type: "nav", actionUrl: "/reports/sprint" },
      { id: "nav-velocity", title: "Velocity & Throughput Analytics", subtitle: "Historical velocity tracking and burndown trend", category: "shortcuts", type: "nav", actionUrl: "/sprint/velocity" },
      { id: "nav-burndown", title: "Sprint Burndown Chart", subtitle: "Real-time task completion burn-rate", category: "shortcuts", type: "nav", actionUrl: "/sprint/burndown" },
      { id: "nav-team-util", title: "Team Utilization & Capacity", subtitle: "Developer workload, allocation & capacity planning", category: "shortcuts", type: "nav", actionUrl: "/team/utilization" },
      { id: "nav-risks", title: "Risk & Blocker Audit Hub", subtitle: "Active impediment tracking and resolution status", category: "shortcuts", type: "nav", actionUrl: "/risks" },
      { id: "nav-settings", title: "Workspace & System Settings", subtitle: "Profile, AI engine defaults & security preferences", category: "shortcuts", type: "nav", actionUrl: "/settings" },
    ];

    if (!q || q.length < 2) {
      return {
        success: true,
        query: q,
        total: staticShortcuts.length,
        results: {
          shortcuts: staticShortcuts,
          projects: [],
          team: [],
          risks: [],
          reports: [],
        },
      };
    }

    const regex = new RegExp(q.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"), "i");

    // 1. Search Projects
    let projects = [];
    try {
      const projDocs = await CompanyProject.find({
        $or: [{ name: regex }, { companyName: regex }, { description: regex }],
      })
        .limit(5)
        .lean();
      projects = projDocs.map((p) => ({
        id: p._id,
        title: p.name || p.companyName,
        subtitle: `${p.companyName || 'Project'} • ${p.activeSprint || 'Active Sprint'}`,
        category: "projects",
        type: "project",
        actionUrl: `/reports/sprint?project=${encodeURIComponent(p.companyName || p.name)}`,
      }));
    } catch (e) {
      console.warn("[Search API] Project search error:", e.message);
    }

    // 2. Search Team Members
    let team = [];
    try {
      const memberDocs = await TeamMember.find({
        $or: [{ name: regex }, { email: regex }, { role: regex }, { primarySkill: regex }],
      })
        .limit(5)
        .lean();
      team = memberDocs.map((m) => ({
        id: m._id,
        title: m.name,
        subtitle: `${m.role} • ${m.companyName || 'Engineering'} (${m.assignedStoryPoints || 0}/${m.capacityStoryPoints || 40} SP)`,
        category: "team",
        type: "member",
        actionUrl: `/team/utilization?search=${encodeURIComponent(m.name)}`,
      }));
    } catch (e) {
      console.warn("[Search API] Team search error:", e.message);
    }

    // 3. Search Risks & Blockers
    let risks = [];
    try {
      const riskDocs = await Risk.find({
        $or: [{ title: regex }, { description: regex }, { companyName: regex }],
      })
        .limit(5)
        .lean();
      risks = riskDocs.map((r) => ({
        id: r._id,
        title: r.title,
        subtitle: `${r.companyName || 'Project'} • Impact: ${r.impact || 'High'} • Status: ${r.status || 'open'}`,
        category: "risks",
        type: "risk",
        actionUrl: "/risks",
      }));
    } catch (e) {
      console.warn("[Search API] Risk search error:", e.message);
    }

    // 4. Search Sprint Health Reports
    let reports = [];
    try {
      const reportDocs = await ProjectPerformance.find({
        $or: [{ companyName: regex }, { sprintName: regex }, { periodLabel: regex }],
      })
        .limit(5)
        .lean();
      reports = reportDocs.map((rep) => ({
        id: rep._id,
        title: `${rep.companyName} — Sprint Health Report`,
        subtitle: `Health: ${rep.kpis?.healthScore || rep.healthScore || 80}% • Period: ${rep.periodLabel || 'Sprint'}`,
        category: "reports",
        type: "report",
        actionUrl: `/reports/sprint?reportId=${rep._id}`,
      }));
    } catch (e) {
      console.warn("[Search API] Report search error:", e.message);
    }

    // 5. Search Navigation Shortcuts
    const shortcuts = staticShortcuts.filter(
      (s) => regex.test(s.title) || regex.test(s.subtitle)
    );

    const total = projects.length + team.length + risks.length + reports.length + shortcuts.length;

    return {
      success: true,
      query: q,
      total,
      results: {
        projects,
        team,
        risks,
        reports,
        shortcuts,
      },
    };
  } catch (error) {
    console.error("[Search API] Unexpected error:", error.message);
    return {
      success: false,
      query: "",
      total: 0,
      results: { projects: [], team: [], risks: [], reports: [], shortcuts: [] },
    };
  }
});
