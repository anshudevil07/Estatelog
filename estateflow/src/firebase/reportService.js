// Report & Analytics service — computes real data from Firestore
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "./config";

function docToObj(snap) {
  return { id: snap.id, ...snap.data() };
}

export const reportService = {

  // ── Agent Performance ─────────────────────────────────────────────────────
  async getAgentPerformance() {
    const [usersSnap, leadsSnap, pipelineSnap, visitsSnap] = await Promise.all([
      getDocs(query(collection(db, "users"), where("role", "==", "agent"))),
      getDocs(collection(db, "leads")),
      getDocs(collection(db, "pipeline")),
      getDocs(collection(db, "visits")),
    ]);

    const agents = usersSnap.docs.map(docToObj);
    const leads = leadsSnap.docs.map(docToObj);
    const deals = pipelineSnap.docs.map(docToObj);
    const visits = visitsSnap.docs.map(docToObj);

    return agents.map(agent => {
      const agentLeads = leads.filter(l => l.assignedTo === agent.name);
      const agentDeals = deals.filter(d => d.assignedTo === agent.name);
      const agentVisits = visits.filter(v => v.agentName === agent.name);
      const closedDeals = agentDeals.filter(d => d.stage === "Closed");
      const revenue = closedDeals.reduce((s, d) => s + (Number(d.value) || 0), 0);
      const conversionRate = agentLeads.length > 0
        ? Math.round((agentLeads.filter(l => l.status === "Closed").length / agentLeads.length) * 100)
        : 0;

      return {
        id: agent.id,
        name: agent.name,
        email: agent.email,
        avatar: agent.avatar || "",
        totalLeads: agentLeads.length,
        closedLeads: agentLeads.filter(l => l.status === "Closed").length,
        activeLeads: agentLeads.filter(l => l.status !== "Closed").length,
        totalDeals: agentDeals.length,
        closedDeals: closedDeals.length,
        revenue,
        conversionRate,
        visitsScheduled: agentVisits.length,
        visitsCompleted: agentVisits.filter(v => v.status === "Completed").length,
      };
    });
  },

  // ── Property Report ───────────────────────────────────────────────────────
  async getPropertyReport() {
    const [propertiesSnap, leadsSnap, visitsSnap] = await Promise.all([
      getDocs(collection(db, "properties")),
      getDocs(collection(db, "leads")),
      getDocs(collection(db, "visits")),
    ]);

    const properties = propertiesSnap.docs.map(docToObj);
    const leads = leadsSnap.docs.map(docToObj);
    const visits = visitsSnap.docs.map(docToObj);

    const total = properties.length;
    const available = properties.filter(p => p.status === "Available").length;
    const sold = properties.filter(p => p.status === "Sold").length;
    const pending = properties.filter(p => p.status === "Pending").length;
    const totalValue = properties.reduce((s, p) => s + (Number(p.price) || 0), 0);
    const soldValue = properties.filter(p => p.status === "Sold").reduce((s, p) => s + (Number(p.price) || 0), 0);

    // Type breakdown
    const typeMap = {};
    properties.forEach(p => {
      typeMap[p.type] = (typeMap[p.type] || 0) + 1;
    });
    const byType = Object.entries(typeMap).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);

    // Top properties by inquiries (leads)
    const topProperties = properties.map(p => ({
      ...p,
      inquiries: leads.filter(l => l.propertyInterest === p.name).length,
      visits: visits.filter(v => v.propertyName === p.name).length,
    })).sort((a, b) => b.inquiries - a.inquiries).slice(0, 5);

    return { total, available, sold, pending, totalValue, soldValue, byType, topProperties };
  },

  // ── Commission Report ─────────────────────────────────────────────────────
  async getCommissions() {
    const [dealsSnap, usersSnap] = await Promise.all([
      getDocs(query(collection(db, "pipeline"), where("stage", "==", "Closed"))),
      getDocs(query(collection(db, "users"), where("role", "==", "agent"))),
    ]);

    const deals = dealsSnap.docs.map(docToObj);
    const agents = usersSnap.docs.map(docToObj);

    return agents.map(agent => {
      const agentDeals = deals.filter(d => d.assignedTo === agent.name);
      const totalRevenue = agentDeals.reduce((s, d) => s + (Number(d.value) || 0), 0);
      const commissionRate = agent.commissionRate || 2; // default 2%
      const commission = Math.round(totalRevenue * commissionRate / 100);

      return {
        agentId: agent.id,
        agentName: agent.name,
        email: agent.email,
        avatar: agent.avatar || "",
        closedDeals: agentDeals.length,
        totalRevenue,
        commissionRate,
        commission,
        deals: agentDeals.map(d => ({
          id: d.id,
          clientName: d.clientName,
          propertyName: d.propertyName,
          value: Number(d.value) || 0,
          commission: Math.round((Number(d.value) || 0) * commissionRate / 100),
        })),
      };
    }).filter(a => a.closedDeals > 0 || true); // show all agents
  },

  // ── Activity Log ─────────────────────────────────────────────────────────
  async getActivityLog(limitCount = 50) {
    const snap = await getDocs(collection(db, "notifications"));
    const items = snap.docs.map(docToObj);
    return items
      .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
      .slice(0, limitCount);
  },
};
