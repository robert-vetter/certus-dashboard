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
  onClick?: () => void;
}

export interface RecentActivity {
  id: string;
  time: string;
  callType: 'phone' | 'delivery' | 'takeout' | 'other' | 'catering';
  icon: string;
  summary: string;
  type: 'order' | 'reservation' | 'inquiry' | 'other';
  callHealth: 'success' | 'warning' | 'error';
  from: string;
  duration: string;
}

export const mockKPIData: KPIData[] = [
  {
    id: 'total-calls',
    icon: 'Phone',
    label: 'Total Calls',
    value: '480 Calls',
  },
  {
    id: 'total-revenue',
    icon: 'CreditCard',
    label: 'Total Revenue',
    value: '$4,000.00',
  },
  {
    id: 'minutes-saved',
    icon: 'ClockCountdown',
    label: 'Minutes Saved',
    value: '440 Mins',
  },
  {
    id: 'orders-placed',
    icon: 'ListDashes',
    label: 'Orders Placed',
    value: '1,640 Orders',
  },
  {
    id: 'reservations-booked',
    icon: 'CallBell',
    label: 'Reservations Booked',
    value: '1,336 Reservations',
  },
  {
    id: 'upsells-attempted',
    icon: 'TrendUp',
    label: 'Total Upsell Attempted',
    value: '1,577 Upsells',
  },
];

export const mockQuickActions: QuickAction[] = [
  {
    id: 'change-voice',
    icon: 'UserSound',
    title: 'Change AI voice',
    description: 'Customize how your AI sounds',
  },
  {
    id: 'update-hours',
    icon: 'Clock',
    title: 'Update hours',
    description: 'Adjust your business hours fast',
  },
  {
    id: 'update-knowledge',
    icon: 'Brain',
    title: 'Update knowledge',
    description: 'Refresh your AI with new info',
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
