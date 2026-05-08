// API service layer — powered by Firebase Firestore
// All data is real and persists in your Firebase database

export {
  propertyService,
  leadService,
  userService as agentService,
  analyticsService,
} from "../firebase/firestoreService";

// dashboardService wraps analyticsService for backward compatibility
export const dashboardService = {
  getStats: () => import("../firebase/firestoreService").then((m) => m.analyticsService.getDashboardStats()),
  getRevenueData: () => import("../data/mockData").then((m) => m.revenueData),
  getPropertySalesData: () => import("../data/mockData").then((m) => m.propertySalesData),
  getLeadsGrowthData: () => import("../data/mockData").then((m) => m.leadsGrowthData),
  getPropertyTypeData: () => import("../data/mockData").then((m) => m.propertyTypeData),
  getActivityData: () => import("../data/mockData").then((m) => m.activityData),
  getRecentActivities: () => import("../data/mockData").then((m) => m.recentActivities),
};
