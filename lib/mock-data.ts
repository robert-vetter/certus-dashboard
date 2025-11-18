// Mock data for Overview page
// TODO: Replace with actual API calls to Supabase

export interface KPIData {
  id: string;
  icon: string;
  label: string;
  value: string | number;
  trend?: {
    direction: 'up' | 'down';
    value: string;
  };
}

export interface QuickAction {
  id: string;
  icon: string;
  title: string;
  description: string;
  badge?: string;
  onClick?: () => void;
}

export interface RecentActivity {
  id: string;
  time: string;
  callType: 'phone' | 'delivery' | 'takeout' | 'other' | 'catering';
  icon: string;
  summary: string;
  type: 'order' | 'reservation' | 'inquiry' | 'catering' | 'other';
  callHealth: 'success' | 'warning' | 'error';
  from: string;
  duration: string;
}

export const mockKPIData: KPIData[] = [
  {
    id: 'total-revenue',
    icon: 'CreditCard',
    label: 'Total Revenue',
    value: '$4,247.50',
    trend: {
      direction: 'up',
      value: '+18%',
    },
  },
  {
    id: 'total-calls',
    icon: 'Phone',
    label: 'Total Calls',
    value: '127',
    trend: {
      direction: 'up',
      value: '+12%',
    },
  },
  {
    id: 'orders-placed',
    icon: 'ListDashes',
    label: 'Orders Placed',
    value: '89',
    trend: {
      direction: 'up',
      value: '+15%',
    },
  },
  {
    id: 'reservations-booked',
    icon: 'CallBell',
    label: 'Reservations',
    value: '23',
    trend: {
      direction: 'up',
      value: '+5',
    },
  },
  {
    id: 'upsells-attempted',
    icon: 'TrendUp',
    label: 'Upsells',
    value: '61',
    trend: {
      direction: 'up',
      value: '+22%',
    },
  },
  {
    id: 'minutes-saved',
    icon: 'ClockCountdown',
    label: 'Time Saved',
    value: '2.4 hrs',
    trend: {
      direction: 'up',
      value: '+8%',
    },
  },
];

export const mockQuickActions: QuickAction[] = [
  {
    id: 'update-menu',
    icon: 'Brain',
    title: 'Update menu',
    description: 'Add new items to AI knowledge',
  },
  {
    id: 'update-hours',
    icon: 'Clock',
    title: 'Update hours',
    description: 'Set holiday or special hours',
  },
  {
    id: 'view-analytics',
    icon: 'AlignLeft',
    title: 'View detailed analytics',
    description: 'See full performance report',
  },
];

export const mockRecentActivities: RecentActivity[] = [
  {
    id: '1',
    time: '12:41 PM',
    callType: 'phone',
    icon: 'Phone',
    summary: 'Reservation for 4',
    type: 'reservation',
    callHealth: 'success',
    from: '(614) 648-5339',
    duration: '0m 30s',
  },
  {
    id: '2',
    time: '9:45 AM',
    callType: 'delivery',
    icon: 'Scooter',
    summary: 'Inquiry about opening hours',
    type: 'inquiry',
    callHealth: 'success',
    from: '(410) 123-7890',
    duration: '1m 15s',
  },
  {
    id: '3',
    time: 'Sep 25 . 6:32 PM',
    callType: 'takeout',
    icon: 'ClipboardText',
    summary: 'Inquiry about opening hours',
    type: 'inquiry',
    callHealth: 'warning',
    from: '(800) 555-1212',
    duration: '2m 45s',
  },
  {
    id: '4',
    time: 'Sep 26 . 4:20 PM',
    callType: 'other',
    icon: 'Phone',
    summary: 'Reservation for 4',
    type: 'reservation',
    callHealth: 'error',
    from: '(202) 333-9999',
    duration: '0m 50s',
  },
  {
    id: '5',
    time: 'Sep 10 . 7:30 AM',
    callType: 'other',
    icon: 'Phone',
    summary: 'Inquiry about opening hours',
    type: 'inquiry',
    callHealth: 'success',
    from: '(202) 333-9999',
    duration: '0m 50s',
  },
  {
    id: '6',
    time: 'Sep 10 . 7:30 AM',
    callType: 'catering',
    icon: 'Phone',
    summary: 'Inquiry about opening hours',
    type: 'other',
    callHealth: 'success',
    from: '(202) 333-9999',
    duration: '0m 50s',
  },
];

export type TimeFilter = 'all' | 'today' | 'last24' | 'yesterday';

export const timeFilterOptions: { id: TimeFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'today', label: 'Today' },
  { id: 'last24', label: 'Last 24 hours' },
  { id: 'yesterday', label: 'Yesterday' },
];
