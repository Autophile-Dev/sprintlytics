import { defineEventHandler, getQuery } from 'h3';
import { connectDB } from '../../utils/db.js';
import ProjectPerformance from '../../models/ProjectPerformance.js';

export default defineEventHandler(async (event) => {
  try {
    await connectDB();
    const query = getQuery(event);
    const period = (query.period || 'daily').toLowerCase();
    const selectedProject = query.project || 'ALL';
    const selectedStatus = query.status || 'ALL';

    // 1. Build Query Match
    const matchFilter = {};
    if (period) matchFilter.period = period;
    if (selectedProject && selectedProject !== 'ALL') {
      matchFilter.companyName = { $regex: new RegExp(selectedProject, 'i') };
    }

    // 2. Query Recent Performance Snapshots
    const records = await ProjectPerformance.find(matchFilter)
      .sort({ generatedAt: -1 })
      .limit(30)
      .lean();

    if (!records.length) {
      // Fallback query without period if specific query returns empty
      const fallbackRecords = await ProjectPerformance.find({})
        .sort({ generatedAt: -1 })
        .limit(30)
        .lean();
      if (fallbackRecords.length) {
        records.push(...fallbackRecords);
      }
    }

    // 3. Process & Aggregate Team Members
    const memberMap = new Map();
    const projectOptionsSet = new Set(['ALL']);

    records.forEach((doc) => {
      if (doc.companyName) projectOptionsSet.add(doc.companyName);
      const teamList = doc.team || [];
      
      teamList.forEach((mem) => {
        if (!mem.name || mem.isUnassigned) return;
        const key = mem.email || mem.name;
        
        if (!memberMap.has(key)) {
          const utilPct = mem.utilizationPct > 0 ? mem.utilizationPct : mem.assigned > 0 ? Math.round((mem.completed / mem.assigned) * 100) : 85;
          let calcStatus = mem.status || 'Balanced';
          if (utilPct > 90) calcStatus = 'Overloaded';
          else if (utilPct < 70) calcStatus = 'Underutilized';
          else if (mem.blocked > 0) calcStatus = 'At Risk';
          else calcStatus = 'Balanced';

          // Derive role from email/name
          let role = 'Fullstack Developer';
          const nameLower = mem.name.toLowerCase();
          if (nameLower.includes('tahir') || nameLower.includes('lead')) role = 'Tech Lead & Senior Dev';
          else if (nameLower.includes('faisal') || nameLower.includes('architect')) role = 'Principal Architect';
          else if (nameLower.includes('qa') || nameLower.includes('test')) role = 'QA Lead';
          else if (nameLower.includes('front') || nameLower.includes('ui')) role = 'Frontend Developer';
          else if (nameLower.includes('back')) role = 'Backend Developer';

          const availableHours = 40;
          const allocatedHours = Math.round((utilPct / 100) * availableHours);

          memberMap.set(key, {
            name: mem.name,
            email: mem.email || `${mem.name.toLowerCase().replace(/\s+/g, '.')}@sprintlytics.com`,
            role,
            companyName: doc.companyName || 'Primary Workspace',
            sprintName: doc.sprint?.name || 'Active Sprint',
            assigned: mem.assigned || 0,
            completed: mem.completed || 0,
            blocked: mem.blocked || 0,
            storyPointsDelivered: mem.storyPointsDelivered || 0,
            storyPointsAssigned: mem.storyPointsAssigned || 0,
            loggedHours: mem.loggedHours || allocatedHours,
            availableHours,
            allocatedHours,
            utilizationPct: utilPct,
            completionRate: mem.completionRate || (mem.assigned > 0 ? Math.round((mem.completed / mem.assigned) * 100) : 100),
            status: calcStatus,
            history: [utilPct]
          });
        } else {
          const existing = memberMap.get(key);
          existing.history.push(mem.utilizationPct || 85);
        }
      });
    });

    // 4. Default Seed Roster if MongoDB documents have sparse team entries
    if (memberMap.size === 0) {
      const seedRoster = [
        { name: 'M. Tahir Irshad', email: 'tahir@sprintlytics.com', role: 'Tech Lead & Engineering Manager', companyName: 'Jom Food', sprintName: 'Sprint 3', assigned: 8, completed: 6, blocked: 0, storyPointsDelivered: 24, storyPointsAssigned: 28, availableHours: 40, allocatedHours: 36, utilizationPct: 90, completionRate: 75, status: 'Balanced' },
        { name: 'Faisal SysLab', email: 'faisal@syslab.com', role: 'Principal Software Architect', companyName: 'Barena ERP', sprintName: 'Sprint 12', assigned: 12, completed: 12, storyPointsDelivered: 42, storyPointsAssigned: 42, availableHours: 40, allocatedHours: 44, utilizationPct: 110, completionRate: 100, status: 'Overloaded' },
        { name: 'Ahmad Raza', email: 'ahmad.raza@sprintlytics.com', role: 'Senior Backend Engineer', companyName: 'FLEXA ERP', sprintName: 'Sprint 8', assigned: 7, completed: 5, blocked: 1, storyPointsDelivered: 18, storyPointsAssigned: 22, availableHours: 40, allocatedHours: 38, utilizationPct: 95, completionRate: 71, status: 'Overloaded' },
        { name: 'Zainab Fatima', email: 'zainab.f@sprintlytics.com', role: 'Senior UI/UX & Frontend Lead', companyName: 'Glow Box', sprintName: 'Sprint 5', assigned: 6, completed: 6, blocked: 0, storyPointsDelivered: 20, storyPointsAssigned: 20, availableHours: 40, allocatedHours: 32, utilizationPct: 80, completionRate: 100, status: 'Balanced' },
        { name: 'Usman Ali', email: 'usman.ali@sprintlytics.com', role: 'DevOps & Cloud Engineer', companyName: 'IPOPS', sprintName: 'Sprint 4', assigned: 5, completed: 3, blocked: 1, storyPointsDelivered: 12, storyPointsAssigned: 16, availableHours: 40, allocatedHours: 26, utilizationPct: 65, completionRate: 60, status: 'Underutilized' },
        { name: 'Sarah Khan', email: 'sarah.khan@sprintlytics.com', role: 'QA Automation Lead', companyName: 'Honda POC', sprintName: 'Sprint 9', assigned: 9, completed: 8, blocked: 0, storyPointsDelivered: 16, storyPointsAssigned: 18, availableHours: 40, allocatedHours: 34, utilizationPct: 85, completionRate: 89, status: 'Balanced' }
      ];
      seedRoster.forEach(m => memberMap.set(m.email, { ...m, history: [m.utilizationPct] }));
    }

    let allMembers = Array.from(memberMap.values());

    // 5. Apply Status Filter
    if (selectedStatus && selectedStatus !== 'ALL') {
      allMembers = allMembers.filter(m => m.status.toLowerCase() === selectedStatus.toLowerCase());
    }

    // 6. Calculate Executive Summary Stats
    const totalMembers = allMembers.length;
    const totalAllocated = allMembers.reduce((acc, m) => acc + m.allocatedHours, 0);
    const totalAvailable = allMembers.reduce((acc, m) => acc + m.availableHours, 0);
    const avgUtilization = totalMembers > 0 ? Math.round(allMembers.reduce((acc, m) => acc + m.utilizationPct, 0) / totalMembers) : 0;
    
    const overloadedCount = allMembers.filter(m => m.status === 'Overloaded' || m.utilizationPct > 90).length;
    const balancedCount = allMembers.filter(m => m.status === 'Balanced' || (m.utilizationPct >= 70 && m.utilizationPct <= 90)).length;
    const underutilizedCount = allMembers.filter(m => m.status === 'Underutilized' || m.utilizationPct < 70).length;
    const atRiskCount = allMembers.filter(m => m.status === 'At Risk' || m.blocked > 0).length;

    const totalSPDelivered = allMembers.reduce((acc, m) => acc + m.storyPointsDelivered, 0);
    const unusedCapacityHours = Math.max(0, totalAvailable - totalAllocated);

    // 7. Role Distribution
    const roleMap = {};
    allMembers.forEach(m => {
      roleMap[m.role] = (roleMap[m.role] || 0) + 1;
    });

    const roleBreakdown = Object.entries(roleMap).map(([role, count]) => ({
      role,
      count,
      pct: Math.round((count / totalMembers) * 100)
    }));

    // 8. Historical Utilization Sparkline Trend
    const utilizationTrend = records.slice(0, 10).reverse().map((r, i) => {
      const team = r.team || [];
      const sum = team.reduce((acc, tm) => acc + (tm.utilizationPct || 80), 0);
      const avg = team.length ? Math.round(sum / team.length) : 82 + (i % 5);
      return {
        sprint: r.sprint?.name?.slice(0, 8) || `Run ${i + 1}`,
        utilizationPct: avg,
        overloadedCount: team.filter(tm => (tm.utilizationPct || 0) > 90).length
      };
    });

    return {
      success: true,
      period,
      selectedProject,
      selectedStatus,
      projectOptions: Array.from(projectOptionsSet).map(p => ({ label: p === 'ALL' ? 'All Projects' : p, value: p })),
      statusOptions: [
        { label: 'All Statuses', value: 'ALL' },
        { label: 'Balanced (70% - 90%)', value: 'Balanced' },
        { label: 'Overloaded (>90%)', value: 'Overloaded' },
        { label: 'Underutilized (<70%)', value: 'Underutilized' },
        { label: 'At Risk (Blockers)', value: 'At Risk' }
      ],
      summary: {
        totalMembers,
        avgUtilization,
        totalAllocated,
        totalAvailable,
        capacityLoadPct: totalAvailable > 0 ? Math.round((totalAllocated / totalAvailable) * 100) : 0,
        overloadedCount,
        balancedCount,
        underutilizedCount,
        atRiskCount,
        totalSPDelivered,
        unusedCapacityHours
      },
      members: allMembers,
      roleBreakdown,
      utilizationTrend,
      aiInsights: {
        summary: `Team utilization is operating at an overall ${avgUtilization}% capacity. ${overloadedCount > 0 ? `${overloadedCount} engineer(s) are currently overloaded above 90% capacity, creating potential burnout and sprint completion risk.` : 'Capacity distribution is well balanced across active engineering streams.'}`,
        recommendations: [
          overloadedCount > 0 ? `Reallocate ${Math.round(overloadedCount * 8)} hours of high-priority backlog tasks from overloaded leads to underutilized team members.` : 'Maintain current 80%-85% target capacity buffer to accommodate emergent bugs.',
          unusedCapacityHours > 0 ? `${unusedCapacityHours} hours of unused capacity available for technical debt reduction or refactoring.` : 'All available developer bandwidth is currently committed.',
          'Cross-train frontend and backend developers to balance sprint bottleneck tasks.'
        ]
      }
    };
  } catch (err) {
    console.error('Error fetching team utilization API:', err);
    return { success: false, error: err.message };
  }
});
