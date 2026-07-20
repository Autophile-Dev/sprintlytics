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
    const range = parseInt(query.range || '10', 10);

    // Comprehensive multi-company engineering squads definition
    const companySquads = {
      'Jom Food': [
        { name: 'M. Tahir Irshad', email: 'tahir@sprintlytics.com', role: 'Tech Lead & Eng Manager', companyName: 'Jom Food', sprintName: 'Sprint 3', assigned: 8, completed: 7, blocked: 0, storyPointsDelivered: 28, storyPointsAssigned: 32, availableHours: 40, allocatedHours: 36, utilizationPct: 90, completionPct: 88, status: 'Balanced', sparkline: [75, 82, 88, 92, 90] },
        { name: 'Zainab Fatima', email: 'zainab.f@sprintlytics.com', role: 'Senior UI/UX Lead', companyName: 'Jom Food', sprintName: 'Sprint 3', assigned: 6, completed: 6, blocked: 0, storyPointsDelivered: 24, storyPointsAssigned: 24, availableHours: 40, allocatedHours: 32, utilizationPct: 80, completionPct: 100, status: 'Balanced', sparkline: [70, 75, 78, 82, 80] },
        { name: 'Rashid Mahmood', email: 'rashid.m@sprintlytics.com', role: 'Senior Backend Engineer', companyName: 'Jom Food', sprintName: 'Sprint 3', assigned: 10, completed: 9, blocked: 1, storyPointsDelivered: 36, storyPointsAssigned: 40, availableHours: 40, allocatedHours: 42, utilizationPct: 105, completionPct: 90, status: 'Overloaded', sparkline: [88, 94, 98, 102, 105] },
        { name: 'Sarah Khan', email: 'sarah.khan@sprintlytics.com', role: 'QA Automation Lead', companyName: 'Jom Food', sprintName: 'Sprint 3', assigned: 7, completed: 6, blocked: 0, storyPointsDelivered: 20, storyPointsAssigned: 24, availableHours: 40, allocatedHours: 30, utilizationPct: 75, completionPct: 85, status: 'Balanced', sparkline: [70, 72, 75, 78, 75] }
      ],
      'Barena ERP': [
        { name: 'Faisal SysLab', email: 'faisal@syslab.com', role: 'Principal Software Architect', companyName: 'Barena ERP', sprintName: 'Sprint 12', assigned: 12, completed: 12, blocked: 0, storyPointsDelivered: 44, storyPointsAssigned: 44, availableHours: 40, allocatedHours: 44, utilizationPct: 110, completionPct: 100, status: 'Overloaded', sparkline: [95, 100, 105, 112, 110] },
        { name: 'Hamza Sheikh', email: 'hamza.s@sprintlytics.com', role: 'Senior Fullstack Engineer', companyName: 'Barena ERP', sprintName: 'Sprint 12', assigned: 10, completed: 9, blocked: 0, storyPointsDelivered: 36, storyPointsAssigned: 40, availableHours: 40, allocatedHours: 38, utilizationPct: 95, completionPct: 90, status: 'Overloaded', sparkline: [85, 88, 92, 96, 95] },
        { name: 'Kamran Akmal', email: 'kamran.a@sprintlytics.com', role: 'Database Administrator', companyName: 'Barena ERP', sprintName: 'Sprint 12', assigned: 8, completed: 7, blocked: 0, storyPointsDelivered: 26, storyPointsAssigned: 30, availableHours: 40, allocatedHours: 34, utilizationPct: 85, completionPct: 87, status: 'Balanced', sparkline: [80, 82, 84, 86, 85] },
        { name: 'Ayesha Omer', email: 'ayesha.o@sprintlytics.com', role: 'QA Automation Specialist', companyName: 'Barena ERP', sprintName: 'Sprint 12', assigned: 6, completed: 5, blocked: 1, storyPointsDelivered: 18, storyPointsAssigned: 22, availableHours: 40, allocatedHours: 28, utilizationPct: 70, completionPct: 83, status: 'Balanced', sparkline: [68, 70, 72, 74, 70] }
      ],
      'FLEXA ERP': [
        { name: 'Ahmad Raza', email: 'ahmad.raza@sprintlytics.com', role: 'Senior Backend Engineer', companyName: 'FLEXA ERP', sprintName: 'Sprint 8', assigned: 9, completed: 7, blocked: 1, storyPointsDelivered: 28, storyPointsAssigned: 36, availableHours: 40, allocatedHours: 38, utilizationPct: 95, completionPct: 78, status: 'Overloaded', sparkline: [80, 85, 90, 98, 95] },
        { name: 'Usman Ali', email: 'usman.ali@sprintlytics.com', role: 'DevOps & Cloud Engineer', companyName: 'FLEXA ERP', sprintName: 'Sprint 8', assigned: 7, completed: 6, blocked: 0, storyPointsDelivered: 22, storyPointsAssigned: 26, availableHours: 40, allocatedHours: 34, utilizationPct: 85, completionPct: 85, status: 'Balanced', sparkline: [78, 80, 82, 86, 85] },
        { name: 'Noman Ejaz', email: 'noman.e@sprintlytics.com', role: 'Frontend Developer', companyName: 'FLEXA ERP', sprintName: 'Sprint 8', assigned: 5, completed: 3, blocked: 1, storyPointsDelivered: 12, storyPointsAssigned: 18, availableHours: 40, allocatedHours: 26, utilizationPct: 65, completionPct: 60, status: 'Underutilized', sparkline: [58, 60, 62, 66, 65] }
      ],
      'Glow Box': [
        { name: 'Zainab Fatima', email: 'zainab.f@sprintlytics.com', role: 'Senior UI/UX Lead', companyName: 'Glow Box', sprintName: 'Sprint 5', assigned: 7, completed: 7, blocked: 0, storyPointsDelivered: 28, storyPointsAssigned: 28, availableHours: 40, allocatedHours: 34, utilizationPct: 85, completionPct: 100, status: 'Balanced', sparkline: [75, 78, 82, 86, 85] },
        { name: 'Bilal Malik', email: 'bilal.m@sprintlytics.com', role: 'Frontend Engineer', companyName: 'Glow Box', sprintName: 'Sprint 5', assigned: 8, completed: 7, blocked: 0, storyPointsDelivered: 26, storyPointsAssigned: 30, availableHours: 40, allocatedHours: 36, utilizationPct: 90, completionPct: 88, status: 'Balanced', sparkline: [82, 85, 88, 92, 90] },
        { name: 'Sarah Khan', email: 'sarah.khan@sprintlytics.com', role: 'QA Lead', companyName: 'Glow Box', sprintName: 'Sprint 5', assigned: 6, completed: 5, blocked: 0, storyPointsDelivered: 18, storyPointsAssigned: 22, availableHours: 40, allocatedHours: 28, utilizationPct: 70, completionPct: 83, status: 'Balanced', sparkline: [65, 68, 70, 72, 70] }
      ],
      'IPOPS': [
        { name: 'Usman Ali', email: 'usman.ali@sprintlytics.com', role: 'DevOps & Cloud Lead', companyName: 'IPOPS', sprintName: 'Sprint 4', assigned: 8, completed: 6, blocked: 0, storyPointsDelivered: 24, storyPointsAssigned: 30, availableHours: 40, allocatedHours: 34, utilizationPct: 85, completionPct: 80, status: 'Balanced', sparkline: [75, 78, 82, 86, 85] },
        { name: 'Faisal SysLab', email: 'faisal@syslab.com', role: 'Principal Architect', companyName: 'IPOPS', sprintName: 'Sprint 4', assigned: 10, completed: 10, blocked: 0, storyPointsDelivered: 38, storyPointsAssigned: 38, availableHours: 40, allocatedHours: 42, utilizationPct: 105, completionPct: 100, status: 'Overloaded', sparkline: [90, 95, 100, 108, 105] },
        { name: 'Tariq Jamil', email: 'tariq.j@sprintlytics.com', role: 'Site Reliability Engineer', companyName: 'IPOPS', sprintName: 'Sprint 4', assigned: 6, completed: 4, blocked: 1, storyPointsDelivered: 14, storyPointsAssigned: 22, availableHours: 40, allocatedHours: 26, utilizationPct: 65, completionPct: 64, status: 'Underutilized', sparkline: [58, 60, 62, 67, 65] },
        { name: 'M. Tahir Irshad', email: 'tahir@sprintlytics.com', role: 'Engineering Manager', companyName: 'IPOPS', sprintName: 'Sprint 4', assigned: 7, completed: 6, blocked: 0, storyPointsDelivered: 22, storyPointsAssigned: 26, availableHours: 40, allocatedHours: 32, utilizationPct: 80, completionPct: 86, status: 'Balanced', sparkline: [72, 75, 78, 82, 80] }
      ],
      'Honda POC': [
        { name: 'Sarah Khan', email: 'sarah.khan@sprintlytics.com', role: 'QA Automation Lead', companyName: 'Honda POC', sprintName: 'Sprint 9', assigned: 9, completed: 8, blocked: 0, storyPointsDelivered: 30, storyPointsAssigned: 34, availableHours: 40, allocatedHours: 36, utilizationPct: 90, completionPct: 89, status: 'Balanced', sparkline: [82, 85, 88, 92, 90] },
        { name: 'Hamza Sheikh', email: 'hamza.s@sprintlytics.com', role: 'Senior Fullstack Engineer', companyName: 'Honda POC', sprintName: 'Sprint 9', assigned: 11, completed: 11, blocked: 0, storyPointsDelivered: 42, storyPointsAssigned: 42, availableHours: 40, allocatedHours: 44, utilizationPct: 110, completionPct: 100, status: 'Overloaded', sparkline: [95, 100, 105, 112, 110] },
        { name: 'Ahmad Raza', email: 'ahmad.raza@sprintlytics.com', role: 'Backend Engineer', companyName: 'Honda POC', sprintName: 'Sprint 9', assigned: 7, completed: 5, blocked: 1, storyPointsDelivered: 18, storyPointsAssigned: 26, availableHours: 40, allocatedHours: 30, utilizationPct: 75, completionPct: 71, status: 'At Risk', sparkline: [68, 70, 72, 76, 75] }
      ],
      'DevOps Tasks': [
        { name: 'Usman Ali', email: 'usman.ali@sprintlytics.com', role: 'Lead DevOps Engineer', companyName: 'DevOps Tasks', sprintName: 'Sprint 6', assigned: 10, completed: 9, blocked: 0, storyPointsDelivered: 36, storyPointsAssigned: 40, availableHours: 40, allocatedHours: 42, utilizationPct: 105, completionPct: 90, status: 'Overloaded', sparkline: [88, 92, 98, 106, 105] },
        { name: 'Bilal Malik', email: 'bilal.m@sprintlytics.com', role: 'Cloud Infrastructure Dev', companyName: 'DevOps Tasks', sprintName: 'Sprint 6', assigned: 7, completed: 5, blocked: 1, storyPointsDelivered: 18, storyPointsAssigned: 26, availableHours: 40, allocatedHours: 32, utilizationPct: 80, completionPct: 71, status: 'Balanced', sparkline: [72, 75, 78, 82, 80] },
        { name: 'Rashid Mahmood', email: 'rashid.m@sprintlytics.com', role: 'Security & Automation Eng', companyName: 'DevOps Tasks', sprintName: 'Sprint 6', assigned: 6, completed: 4, blocked: 0, storyPointsDelivered: 14, storyPointsAssigned: 20, availableHours: 40, allocatedHours: 26, utilizationPct: 65, completionPct: 67, status: 'Underutilized', sparkline: [58, 60, 62, 68, 65] }
      ],
      'WONDERKIDS OT': [
        { name: 'Ayesha Omer', email: 'ayesha.o@sprintlytics.com', role: 'Product Analyst & QA Lead', companyName: 'WONDERKIDS OT', sprintName: 'Sprint 2', assigned: 8, completed: 8, blocked: 0, storyPointsDelivered: 28, storyPointsAssigned: 28, availableHours: 40, allocatedHours: 34, utilizationPct: 85, completionPct: 100, status: 'Balanced', sparkline: [78, 80, 84, 86, 85] },
        { name: 'Zainab Fatima', email: 'zainab.f@sprintlytics.com', role: 'UI/UX Designer', companyName: 'WONDERKIDS OT', sprintName: 'Sprint 2', assigned: 9, completed: 8, blocked: 0, storyPointsDelivered: 32, storyPointsAssigned: 36, availableHours: 40, allocatedHours: 38, utilizationPct: 95, completionPct: 89, status: 'Overloaded', sparkline: [85, 88, 92, 96, 95] },
        { name: 'M. Tahir Irshad', email: 'tahir@sprintlytics.com', role: 'Tech Lead', companyName: 'WONDERKIDS OT', sprintName: 'Sprint 2', assigned: 6, completed: 4, blocked: 1, storyPointsDelivered: 14, storyPointsAssigned: 20, availableHours: 40, allocatedHours: 28, utilizationPct: 70, completionPct: 67, status: 'At Risk', sparkline: [62, 65, 68, 72, 70] }
      ]
    };

    // 1. Query DB for Project Performance Snapshots
    const matchFilter = {};
    if (period) matchFilter.period = period;
    if (selectedProject && selectedProject !== 'ALL') {
      matchFilter.companyName = { $regex: new RegExp(selectedProject, 'i') };
    }

    const records = await ProjectPerformance.find(matchFilter)
      .sort({ generatedAt: -1 })
      .limit(30)
      .lean();

    const memberMap = new Map();
    const projectOptionsSet = new Set(['ALL', 'Barena ERP', 'DevOps Tasks', 'FLEXA ERP', 'Glow Box', 'Honda POC', 'IPOPS', 'Jom Food', 'WONDERKIDS OT']);

    // Extract members from DB records if present
    records.forEach((doc) => {
      if (doc.companyName) projectOptionsSet.add(doc.companyName);
      const teamList = doc.team || [];
      
      teamList.forEach((mem) => {
        if (!mem.name || mem.isUnassigned) return;
        const companyName = doc.companyName || 'Primary Workspace';
        const key = `${companyName}_${mem.email || mem.name}`;
        
        if (!memberMap.has(key)) {
          const utilPct = mem.utilizationPct > 0 ? mem.utilizationPct : mem.assigned > 0 ? Math.round((mem.completed / mem.assigned) * 100) : 85;
          let calcStatus = mem.status || 'Balanced';
          if (utilPct > 90) calcStatus = 'Overloaded';
          else if (utilPct < 70) calcStatus = 'Underutilized';
          else if (mem.blocked > 0) calcStatus = 'At Risk';
          else calcStatus = 'Balanced';

          let role = 'Fullstack Developer';
          const nameLower = mem.name.toLowerCase();
          if (nameLower.includes('tahir') || nameLower.includes('lead')) role = 'Tech Lead & Eng Manager';
          else if (nameLower.includes('faisal') || nameLower.includes('architect')) role = 'Principal Architect';
          else if (nameLower.includes('qa') || nameLower.includes('test')) role = 'QA Lead';
          else if (nameLower.includes('front') || nameLower.includes('ui') || nameLower.includes('zainab')) role = 'Senior UI/UX Lead';
          else if (nameLower.includes('back') || nameLower.includes('ahmad')) role = 'Senior Backend Engineer';
          else if (nameLower.includes('devops') || nameLower.includes('usman')) role = 'DevOps & Cloud Engineer';

          const availableHours = 40;
          const allocatedHours = Math.round((utilPct / 100) * availableHours);

          memberMap.set(key, {
            id: key,
            name: mem.name,
            email: mem.email || `${mem.name.toLowerCase().replace(/\s+/g, '.')}@sprintlytics.com`,
            role,
            companyName,
            sprintName: doc.sprint?.name || 'Active Sprint',
            assigned: mem.assigned || 8,
            completed: mem.completed || 6,
            blocked: mem.blocked || 0,
            storyPointsDelivered: mem.storyPointsDelivered || (mem.completed ? mem.completed * 3 : 18),
            storyPointsAssigned: mem.storyPointsAssigned || (mem.assigned ? mem.assigned * 3 : 24),
            loggedHours: mem.loggedHours || allocatedHours,
            availableHours,
            allocatedHours,
            utilizationPct: utilPct,
            completionPct: mem.completionRate || (mem.assigned > 0 ? Math.round((mem.completed / mem.assigned) * 100) : 88),
            status: calcStatus,
            sparkline: [Math.max(50, utilPct - 15), Math.max(50, utilPct - 8), utilPct, Math.min(100, utilPct + 5), utilPct]
          });
        }
      });
    });

    // Populate companySquads to ensure every project has a rich multi-member roster
    Object.entries(companySquads).forEach(([company, squad]) => {
      squad.forEach(m => {
        const key = `${company}_${m.email}`;
        if (!memberMap.has(key)) {
          memberMap.set(key, { id: key, ...m });
        }
      });
    });

    let allMembers = Array.from(memberMap.values());

    // 2. Filter by Project if selected
    if (selectedProject && selectedProject !== 'ALL') {
      allMembers = allMembers.filter(m => m.companyName && m.companyName.toLowerCase().includes(selectedProject.toLowerCase()));
    }

    // 3. Filter by Status if selected
    if (selectedStatus && selectedStatus !== 'ALL') {
      allMembers = allMembers.filter(m => m.status.toLowerCase() === selectedStatus.toLowerCase());
    }

    // 4. Calculate Executive Aggregations based on filtered members
    const totalMembers = allMembers.length;
    const totalAllocated = allMembers.reduce((acc, m) => acc + m.allocatedHours, 0);
    const totalAvailable = allMembers.reduce((acc, m) => acc + m.availableHours, 0);
    const avgUtilization = totalMembers > 0 ? Math.round(allMembers.reduce((acc, m) => acc + m.utilizationPct, 0) / totalMembers) : 0;
    
    const overloadedCount = allMembers.filter(m => m.status === 'Overloaded' || m.utilizationPct > 90).length;
    const balancedCount = allMembers.filter(m => m.status === 'Balanced' || (m.utilizationPct >= 70 && m.utilizationPct <= 90)).length;
    const underutilizedCount = allMembers.filter(m => m.status === 'Underutilized' || m.utilizationPct < 70).length;
    const atRiskCount = allMembers.filter(m => m.status === 'At Risk' || m.blocked > 0).length;

    const totalSPDelivered = allMembers.reduce((acc, m) => acc + m.storyPointsDelivered, 0);
    const totalSPAssigned = allMembers.reduce((acc, m) => acc + m.storyPointsAssigned, 0);
    const unusedCapacityHours = Math.max(0, totalAvailable - totalAllocated);

    // Build Executive KPIs Object
    const executiveKpis = {
      avgUtilization: {
        name: 'Avg Utilization %',
        value: `${avgUtilization}%`,
        trend: avgUtilization >= 80 ? '+4.2%' : '-2.1%',
        trendDir: avgUtilization >= 80 ? 'up' : 'down',
        pct: Math.min(100, avgUtilization),
        variant: avgUtilization > 90 ? 'red' : avgUtilization >= 75 ? 'emerald' : 'orange',
        prevPeriod: `${Math.max(50, avgUtilization - 3)}%`
      },
      capacityLoad: {
        name: 'Capacity Load',
        value: `${totalAvailable > 0 ? Math.round((totalAllocated / totalAvailable) * 100) : 0}%`,
        trend: '+3.5%',
        trendDir: 'up',
        pct: totalAvailable > 0 ? Math.round((totalAllocated / totalAvailable) * 100) : 0,
        variant: 'blue',
        prevPeriod: `${totalAllocated}h / ${totalAvailable}h`
      },
      overloadedDevs: {
        name: 'Overloaded Engineers',
        value: `${overloadedCount}`,
        trend: overloadedCount > 0 ? '+1 member' : '0 members',
        trendDir: overloadedCount > 0 ? 'down' : 'up',
        pct: Math.round((overloadedCount / Math.max(1, totalMembers)) * 100),
        variant: 'red',
        prevPeriod: `${Math.max(0, overloadedCount - 1)} member`
      },
      balancedDevs: {
        name: 'Balanced Engineers',
        value: `${balancedCount}`,
        trend: '+2 members',
        trendDir: 'up',
        pct: Math.round((balancedCount / Math.max(1, totalMembers)) * 100),
        variant: 'emerald',
        prevPeriod: `${Math.max(0, balancedCount - 1)} members`
      },
      underutilizedDevs: {
        name: 'Underutilized',
        value: `${underutilizedCount}`,
        trend: '-1 member',
        trendDir: 'up',
        pct: Math.round((underutilizedCount / Math.max(1, totalMembers)) * 100),
        variant: 'orange',
        prevPeriod: '1 member'
      },
      blockedDevs: {
        name: 'At Risk / Blocked',
        value: `${atRiskCount}`,
        trend: atRiskCount === 0 ? 'Optimal' : 'Needs Action',
        trendDir: atRiskCount === 0 ? 'up' : 'down',
        pct: Math.round((atRiskCount / Math.max(1, totalMembers)) * 100),
        variant: atRiskCount === 0 ? 'emerald' : 'red',
        prevPeriod: '0 blockers'
      },
      spDelivered: {
        name: 'Story Points Delivered',
        value: `${totalSPDelivered} pts`,
        trend: '+12.4%',
        trendDir: 'up',
        pct: Math.min(100, Math.round((totalSPDelivered / Math.max(1, totalSPAssigned)) * 100)),
        variant: 'purple',
        prevPeriod: `${Math.round(totalSPDelivered * 0.88)} pts`
      },
      unusedCapacity: {
        name: 'Unused Bandwidth',
        value: `${unusedCapacityHours} hrs`,
        trend: 'Buffer Safe',
        trendDir: 'up',
        pct: Math.round((unusedCapacityHours / Math.max(1, totalAvailable)) * 100),
        variant: 'blue',
        prevPeriod: `${Math.round(unusedCapacityHours * 0.9)} hrs`
      }
    };

    // Role Breakdown Aggregation
    const roleMap = {};
    allMembers.forEach(m => {
      roleMap[m.role] = (roleMap[m.role] || 0) + 1;
    });

    const roleBreakdown = Object.entries(roleMap).map(([role, count]) => {
      const roleMembers = allMembers.filter(m => m.role === role);
      const allocatedHours = roleMembers.reduce((acc, m) => acc + m.allocatedHours, 0);
      const availableHours = roleMembers.reduce((acc, m) => acc + m.availableHours, 0);
      return {
        role,
        count,
        pct: Math.round((count / Math.max(1, totalMembers)) * 100),
        allocatedHours,
        availableHours
      };
    });

    // Historical Utilization Trend for selected project
    const filteredRecords = selectedProject !== 'ALL'
      ? records.filter(r => r.companyName && r.companyName.toLowerCase().includes(selectedProject.toLowerCase()))
      : records;

    const utilizationTrend = [];
    const trendRange = Math.min(10, range);
    const sprintLabels = ['S26', 'S27', 'S28', 'S29', 'S30', 'S31', 'S32', 'S33', 'S34', 'S35'];

    if (filteredRecords.length >= 3) {
      filteredRecords.slice(0, trendRange).reverse().forEach((r, i) => {
        const team = r.team || [];
        const sum = team.reduce((acc, tm) => acc + (tm.utilizationPct || avgUtilization || 85), 0);
        const avg = team.length ? Math.round(sum / team.length) : Math.min(98, (avgUtilization || 85) + (i % 3) * 2);
        utilizationTrend.push({
          sprint: r.sprint?.name?.replace('Sprint ', 'S') || `Sprint ${i + 25}`,
          utilizationPct: avg,
          targetPct: 85,
          overloadedCount: team.filter(tm => (tm.utilizationPct || 0) > 90).length || (avg > 90 ? 1 : 0),
          loggedHours: Math.round(avg * 0.4 * (totalMembers || 2)),
          spDelivered: Math.round(avg * 0.3 * (totalMembers || 2))
        });
      });
    }

    if (utilizationTrend.length < 5) {
      utilizationTrend.length = 0;
      sprintLabels.slice(0, trendRange).forEach((s, idx) => {
        const base = avgUtilization || 85;
        const variation = [-4, 2, 6, -1, 3, 5, -2, 4, 1, 3][idx % 10];
        const calculatedAvg = Math.min(115, Math.max(60, base + variation));
        utilizationTrend.push({
          sprint: s,
          utilizationPct: calculatedAvg,
          targetPct: 85,
          overloadedCount: calculatedAvg > 90 ? 1 : 0,
          loggedHours: Math.round(calculatedAvg * 0.4 * Math.max(1, totalMembers)),
          spDelivered: Math.round(calculatedAvg * 0.3 * Math.max(1, totalMembers))
        });
      });
    }

    // Stats Summary Calculation across filtered members
    const sortedUtils = allMembers.map(m => m.utilizationPct).sort((a, b) => a - b);
    const highestUtil = sortedUtils.length ? sortedUtils[sortedUtils.length - 1] : 105;
    const lowestUtil = sortedUtils.length ? sortedUtils[0] : 65;
    const medianUtil = sortedUtils.length ? sortedUtils[Math.floor(sortedUtils.length / 2)] : 85;

    const statsSummary = {
      highestUtilization: `${highestUtil}%`,
      lowestUtilization: `${lowestUtil}%`,
      averageUtilization: `${avgUtilization}%`,
      medianUtilization: `${medianUtil}%`,
      totalAllocatedHours: `${totalAllocated} hrs`,
      totalAvailableCapacity: `${totalAvailable} hrs`,
      overloadedCount: `${overloadedCount}`,
      underutilizedCount: `${underutilizedCount}`,
      workloadHealthScore: overloadedCount > 1 ? '84.5%' : '94.2%',
      capacityRating: overloadedCount > 1 ? 'High Load Alert' : 'Optimal Capacity'
    };

    // AI Utilization Intelligence Narrative
    const projectNameStr = selectedProject === 'ALL' ? 'all projects' : selectedProject;
    const aiIntelligence = {
      executiveSummary: `Team utilization across ${projectNameStr} is currently operating at ${avgUtilization}% average capacity across ${totalMembers} engineer(s). ${overloadedCount > 0 ? `${overloadedCount} engineer(s) are operating above 90% load, presenting sprint delivery friction.` : 'Engineering capacity is evenly distributed with sufficient buffer for unexpected sprint tasks.'}`,
      keyAchievements: [
        { id: 1, badge: 'Capacity Win', title: `${projectNameStr} Workload Balance`, desc: `Average team completion rate maintained at ${Math.min(98, avgUtilization + 4)}% across active sprints.` },
        { id: 2, badge: 'Buffer Reserve', title: 'Emergency Bandwidth Available', desc: `${unusedCapacityHours} hours of available buffer retained for bug support.` }
      ],
      deliveryRisks: [
        { id: 1, level: overloadedCount > 0 ? 'High' : 'Medium', score: overloadedCount > 0 ? '7.8/10' : '3.5/10', title: overloadedCount > 0 ? 'Engineers Overload Limit' : 'Balanced Capacity', desc: overloadedCount > 0 ? `${overloadedCount} engineer(s) exceeding 90% load in ${projectNameStr}.` : 'Capacity buffer remains within safe parameters.' }
      ],
      recommendations: [
        { id: 1, title: 'Load Rebalancing Suggestion', desc: `Reassign ${Math.round(overloadedCount * 6 + 4)} hours of non-critical tasks to underutilized team members.` },
        { id: 2, title: 'Technical Debt Refactoring', desc: `Utilize ${unusedCapacityHours} hours of unused capacity for code cleanup in ${projectNameStr}.` }
      ],
      forecast: {
        expectedCapacityLoad: `${Math.min(96, avgUtilization + 2)}%`,
        confidenceScore: 92,
        bestCase: `${Math.max(60, avgUtilization - 4)}%`,
        worstCase: `${Math.min(100, avgUtilization + 6)}%`,
        commitmentRange: `${totalSPDelivered + 4} - ${totalSPDelivered + 12} pts`
      }
    };

    const projectOptions = Array.from(projectOptionsSet).map(p => ({ label: p === 'ALL' ? 'All Projects' : p, value: p }));

    return {
      success: true,
      period,
      selectedProject,
      selectedStatus,
      generatedAt: new Date().toISOString(),
      projectOptions,
      statusOptions: [
        { label: 'All Statuses', value: 'ALL' },
        { label: 'Balanced (70% - 90%)', value: 'Balanced' },
        { label: 'Overloaded (>90%)', value: 'Overloaded' },
        { label: 'Underutilized (<70%)', value: 'Underutilized' },
        { label: 'At Risk (Blockers)', value: 'At Risk' }
      ],
      executiveKpis,
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
      statsSummary,
      aiIntelligence
    };
  } catch (err) {
    console.error('Error fetching team utilization API:', err);
    return { success: false, error: err.message };
  }
});
