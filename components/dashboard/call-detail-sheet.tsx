'use client';

import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { CallDetailSheetSkeleton } from './skeletons';

export interface CallDetailData {
  // Basic call info
  id: string;
  call_id: string;
  started_at: string;
  ended_at: string;
  duration_seconds: number;
  from_number: string;
  certus_number: string;
  status: string;
  recording_url?: string;

  // Call content
  transcript_md?: string;
  summary_md?: string;
  call_summary?: string;
  call_summary_short?: string;

  // Call metadata
  call_type?: string;
  pathway_tags_formatted?: string;
  call_health: 'success' | 'warning' | 'error';

  // Related data
  orders?: Array<{
    order_id: string;
    total_amount: number;
    subtotal: number;
    total_tax?: number;
    service_charge?: number;
    delivery_charge?: number;
    tip?: number;
    fulfillment_type?: string;
    order_status?: string;
    payment_method?: string;
    is_paid?: string;
    full_order?: string;
    pickup_time?: string;
    delivery_time?: string;
  }>;

  reservations?: Array<{
    reservation_id: string;
    reservation_name?: string;
    guest_count?: number;
    reservation_datetime?: string;
    reservation_date?: string;
    reservation_time?: string;
    reservation_notes?: string;
    is_reservation_accepted?: boolean;
    is_reservation_rejected?: boolean;
  }>;

  upsells?: Array<{
    upsell_id: string;
    upselled_value?: number;
    upsold_items?: any[];
    rejected_items?: any[];
  }>;

  complaints?: Array<{
    complaint_id: string;
    type: boolean;
    complaint?: string;
    customer_name?: string;
  }>;

  internal_notes?: Array<{
    note_id: string;
    note_text: string;
    created_at: string;
    created_by?: string;
  }>;
}

interface CallDetailSheetProps {
  call: CallDetailData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isLoading?: boolean;
}

interface ChatMessage {
  speaker: 'certus' | 'customer';
  text: string;
}

export function CallDetailSheet({ call, open, onOpenChange, isLoading = false }: CallDetailSheetProps) {
  // Show loading skeleton while data is being fetched
  if (isLoading || !call) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto p-0">
          <div className="sticky top-0 bg-white border-b border-gray-200 z-10 px-6 py-4">
            <SheetHeader>
              <SheetTitle className="text-xl font-bold text-gray-900">
                Loading...
              </SheetTitle>
            </SheetHeader>
          </div>
          {isLoading && <CallDetailSheetSkeleton />}
        </SheetContent>
      </Sheet>
    );
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  const formatPhoneNumber = (num: string) => {
    if (!num) return 'Unknown';
    const cleaned = num.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    if (cleaned.length === 11 && cleaned[0] === '1') {
      return `(${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }
    return num;
  };

  // Parse transcript into chat messages
  const parseTranscript = (transcript: string): ChatMessage[] => {
    const messages: ChatMessage[] = [];
    const lines = transcript.split('\n').filter(line => line.trim());

    for (const line of lines) {
      if (line.startsWith('**Certus:**')) {
        messages.push({
          speaker: 'certus',
          text: line.replace('**Certus:**', '').trim()
        });
      } else if (line.startsWith('**Customer:**')) {
        messages.push({
          speaker: 'customer',
          text: line.replace('**Customer:**', '').trim()
        });
      }
    }

    return messages;
  };

  const chatMessages = call.transcript_md ? parseTranscript(call.transcript_md) : [];

  const healthColors = {
    success: { dot: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50' },
    warning: { dot: 'bg-amber-500', text: 'text-amber-700', bg: 'bg-amber-50' },
    error: { dot: 'bg-red-500', text: 'text-red-700', bg: 'bg-red-50' },
  };

  const hasOrder = call.orders && call.orders.length > 0;
  const hasReservation = call.reservations && call.reservations.length > 0;
  const hasComplaint = call.complaints && call.complaints.length > 0;

  // Determine what to show at the top
  let topBanner = null;

  if (hasOrder && call.orders[0]) {
    const order = call.orders[0];
    // order_logs table is fully reliable - use total_amount directly
    const displayTotal = order.total_amount || 0;

    topBanner = (
      <div className="bg-gradient-to-br from-emerald-500 to-green-600 text-white rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-emerald-100 text-sm font-medium mb-1">Order Placed</div>
            <div className="text-3xl font-bold">${(displayTotal / 100).toFixed(2)}</div>
            <div className="text-emerald-100 text-sm mt-2 capitalize">
              {order.fulfillment_type || 'Pickup'} • {order.order_status || 'Processing'}
            </div>
          </div>
          <svg className="w-16 h-16 text-emerald-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        </div>
      </div>
    );
  } else if (hasReservation && call.reservations[0]) {
    const res = call.reservations[0];
    topBanner = (
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-blue-100 text-sm font-medium mb-1">Reservation Made</div>
            <div className="text-3xl font-bold">{res.guest_count || 0} Guests</div>
            <div className="text-blue-100 text-sm mt-2">
              {res.reservation_name || 'Guest'} • {res.reservation_date} {res.reservation_time}
            </div>
          </div>
          <svg className="w-16 h-16 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      </div>
    );
  } else if (hasComplaint && call.complaints[0]) {
    topBanner = (
      <div className="bg-gradient-to-br from-red-500 to-pink-600 text-white rounded-xl p-6 mb-6">
        <div className="flex items-center gap-4">
          <svg className="w-12 h-12 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <div className="text-red-100 text-sm font-medium mb-1">Complaint Filed</div>
            <div className="text-lg font-semibold">{call.complaints[0].complaint || 'Customer filed a complaint'}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto p-0">
        <div className="sticky top-0 bg-white border-b border-gray-200 z-10 px-6 py-4">
          <SheetHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <SheetTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
                  {formatPhoneNumber(call.from_number)}
                  <div className={`w-2 h-2 rounded-full ${healthColors[call.call_health].dot}`} />
                </SheetTitle>
                <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                  <span>{formatDate(call.started_at)} at {formatTime(call.started_at)}</span>
                  <span>•</span>
                  <span>{formatDuration(call.duration_seconds)}</span>
                  <span>•</span>
                  <span className="capitalize">{call.call_type || 'Inquiry'}</span>
                </div>
              </div>
            </div>
          </SheetHeader>
        </div>

        <div className="px-6 py-6 space-y-6">
          {/* Top Banner */}
          {topBanner}

          {/* Call Recording */}
          {call.recording_url && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Recording</h3>
              <audio
                controls
                className="w-full"
                preload="metadata"
                style={{
                  height: '40px',
                  borderRadius: '8px',
                }}
              >
                <source src={call.recording_url} type="audio/mpeg" />
                <source src={call.recording_url} type="audio/wav" />
                <source src={call.recording_url} type="audio/ogg" />
                Your browser does not support the audio element.
              </audio>
            </div>
          )}

          {/* Conversation */}
          {chatMessages.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Conversation</h3>
              <div className="space-y-3">
                {chatMessages.map((message, index) => (
                  <div key={index} className="flex gap-3">
                    {/* Avatar */}
                    <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      message.speaker === 'certus'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {message.speaker === 'certus' ? 'AI' : 'C'}
                    </div>

                    {/* Message */}
                    <div className="flex-1">
                      <div className="text-[10px] font-semibold uppercase tracking-wide mb-1 text-gray-500">
                        {message.speaker === 'certus' ? 'Certus AI' : 'Customer'}
                      </div>
                      <p className="text-sm text-gray-900 leading-relaxed">{message.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Order Details */}
          {hasOrder && call.orders[0] && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Order Items</h3>
              {call.orders[0].full_order ? (
                <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-900 whitespace-pre-wrap mb-4">
                  {call.orders[0].full_order}
                </div>
              ) : null}

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${((call.orders[0].subtotal || 0) / 100).toFixed(2)}</span>
                </div>
                {call.orders[0].total_tax && call.orders[0].total_tax > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium">${(call.orders[0].total_tax / 100).toFixed(2)}</span>
                  </div>
                )}
                {call.orders[0].delivery_charge && call.orders[0].delivery_charge > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery</span>
                    <span className="font-medium">${(call.orders[0].delivery_charge / 100).toFixed(2)}</span>
                  </div>
                )}
                {call.orders[0].tip && call.orders[0].tip > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tip</span>
                    <span className="font-medium">${(call.orders[0].tip / 100).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold border-t border-gray-200 pt-2 mt-2">
                  <span>Total</span>
                  <span className="text-emerald-600">${((call.orders[0].total_amount || 0) / 100).toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Reservation Details */}
          {hasReservation && call.reservations[0] && call.reservations[0].reservation_notes && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Special Requests</h3>
              <p className="text-sm text-gray-700">{call.reservations[0].reservation_notes}</p>
            </div>
          )}

          {/* Summary */}
          {(call.call_summary || call.summary_md) && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Summary</h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                {call.call_summary || call.summary_md}
              </p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
