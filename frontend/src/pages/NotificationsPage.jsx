import React from 'react';
import { useNotification } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, AlertTriangle, Truck, Info, CheckCircle2 } from 'lucide-react';

const NotificationsPage = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-[#519755]" />
            <span>Real-Time System Notifications</span>
          </h2>
          <p className="text-xs text-slate-500">
            Emergency alerts, pickup dispatch status updates, and regulatory notices
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-4 py-2 rounded-xl text-xs font-bold shadow-2xs transition-all flex items-center gap-1.5 self-start"
          >
            <CheckCheck className="w-4 h-4 text-[#519755]" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-400 text-sm">
            No notifications available.
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => {
                markAsRead(n._id);
                if (n.link) navigate(n.link);
              }}
              className={`p-4 sm:p-5 rounded-3xl border transition-all cursor-pointer ${
                n.read
                  ? 'bg-white border-slate-200 text-slate-700'
                  : 'bg-[#F6FAF6] border-[#A8DCAB] text-slate-900 shadow-xs'
              } hover:border-[#519755] flex items-start gap-3.5`}
            >
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                  n.type === 'emergency'
                    ? 'bg-rose-100 text-rose-700'
                    : n.type === 'dispatch' || n.type === 'pickup'
                    ? 'bg-amber-100 text-amber-800'
                    : n.type === 'success'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-[#A8DCAB]/40 text-[#2B542D]'
                }`}
              >
                {n.type === 'emergency' ? (
                  <AlertTriangle className="w-5 h-5" />
                ) : n.type === 'dispatch' ? (
                  <Truck className="w-5 h-5" />
                ) : (
                  <Info className="w-5 h-5" />
                )}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-extrabold text-sm text-slate-900">{n.title}</h4>
                  <span className="text-[11px] text-slate-400">
                    {new Date(n.createdAt).toLocaleDateString()} {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};

export default NotificationsPage;
