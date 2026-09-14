import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import api from '../services/api';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toast, setToast] = useState(null);
  const [liveDriverLocations, setLiveDriverLocations] = useState({});
  const socketRef = useRef(null);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const role = user.role || '';
      const hospitalId = user.hospitalId || localStorage.getItem('activeHospitalId') || '';
      const driverId = user.driverId || user.id || '';
      const facilityId = user.facilityId || localStorage.getItem('activeFacilityId') || '';
      const query = `?role=${encodeURIComponent(role)}&hospitalId=${encodeURIComponent(hospitalId)}&driverId=${encodeURIComponent(driverId)}&facilityId=${encodeURIComponent(facilityId)}`;
      const res = await api.get(`/notifications${query}`);
      if (res.data?.success) {
        setNotifications(res.data.data);
        setUnreadCount(res.data.unreadCount ?? res.data.data.filter((n) => !n.read).length);
      }
    } catch (err) {
      // silent polling catch
    }
  };

  // 1. Initial and Polling sync
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 4000);
    return () => clearInterval(interval);
  }, [user]);

  // 2. Real-time Socket.IO Connection & Targeted Room Joining
  useEffect(() => {
    if (!user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    const socketUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
    const socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('⚡ [Socket.IO] Connected to real-time notification gateway');

      // Join targeted hospital room
      const activeHospId = user?.hospitalId || localStorage.getItem('activeHospitalId') || 'HOSP-TG-001';
      if (activeHospId) {
        socket.emit('join_hospital', activeHospId);
        console.log(`🏥 [Socket.IO] Joined room hospital:${activeHospId}`);
      }

      // Join targeted driver room
      if (user?.driverId || user?.role === 'driver') {
        const dId = user.driverId || user.id || 'DRV-TS-0101';
        socket.emit('join_driver', dId);
        console.log(`🚛 [Socket.IO] Joined room driver:${dId}`);
      }

      // Join targeted facility room
      const activeFacId = user?.facilityId || localStorage.getItem('activeFacilityId') || 'FAC-TG-001';
      if (activeFacId) {
        socket.emit('join_facility', activeFacId);
        console.log(`🏭 [Socket.IO] Joined room facility:${activeFacId}`);
      }
    });

    // Handle incoming targeted notification
    socket.on('newNotification', (notif) => {
      console.log('🔔 [Socket.IO] Real-time notification received:', notif);
      setNotifications((prev) => [notif, ...prev]);
      setUnreadCount((prev) => prev + 1);

      showToast(notif.message, notif.type === 'REJECTION' ? 'warning' : 'success', notif.title);
    });

    // Handle real-time Order Confirmed (Hospital QR Scanned)
    socket.on('order_confirmed', (data) => {
      console.log('🚛 [Socket.IO] Order confirmed event received:', data);
      const userRole = (user?.role || '').toLowerCase();
      if (userRole === 'hospital' || userRole === 'hospital_admin') {
        showToast(
          `✓ Order Confirmed! Driver ${data.driverName || 'assigned'} scanned Hospital QR. Waste in transit with live GPS tracking.`,
          'success',
          'Order Confirmed & In Transit'
        );
      } else if (userRole === 'driver') {
        showToast(
          `✓ Hospital QR Verified! Order confirmed. Live GPS tracking is active towards disposal plant.`,
          'success',
          'Hospital QR Verified'
        );
      }
      fetchNotifications();
    });

    // Handle incoming carrier dispatched (Facility Portal)
    socket.on('carrier_in_transit', (data) => {
      const userRole = (user?.role || '').toLowerCase();
      if (userRole === 'facility' || user?.facilityId) {
        showToast(
          `🚛 Incoming Waste Carrier: Vehicle ${data.vehicleNumber} carrying ${data.quantityKg} kg waste from ${data.hospitalName} is in transit to your yard.`,
          'info',
          'Carrier Dispatched'
        );
      }
      fetchNotifications();
    });

    // Handle real-time batch completion broadcast (Facility QR Scanned)
    socket.on('batch_completed', (data) => {
      console.log('🎉 [Socket.IO] Batch completed notification received:', data);
      showToast(
        `✓ BATCH COMPLETED: ${data.batchId} safely deposited at ${data.facilityName} by driver ${data.driverName} (${data.vehicleNumber}).`,
        'success',
        'Waste Handover Complete'
      );
      fetchNotifications();
    });

    // Handle real-time waste deposited event
    socket.on('waste_deposited', (data) => {
      console.log('🏭 [Socket.IO] Waste deposited event received:', data);
      const userRole = (user?.role || '').toLowerCase();
      if (userRole === 'facility') {
        showToast(
          `✓ INTAKE VERIFIED: Driver ${data.driverName} (${data.vehicleNumber}) deposited ${data.wasteQuantity} kg waste from ${data.hospitalName}. Gate QR auto-rotated!`,
          'success',
          'Waste Dumped Successfully'
        );
      }
      fetchNotifications();
    });

    // Role-tailored portal status updates
    socket.on('portal_status_update', (data) => {
      const userRole = (user?.role || '').toLowerCase();
      let targetMessage = null;
      let targetTitle = 'Status Update';

      if (userRole === 'driver') {
        targetMessage = data.driverMessage;
        targetTitle = data.step === 'ORDER_CONFIRMED' ? 'Hospital QR Verified • In Transit' : 'Waste Dumped Successfully';
      } else if (userRole === 'facility') {
        targetMessage = data.facilityMessage;
        targetTitle = data.step === 'ORDER_CONFIRMED' ? 'Carrier Dispatched' : 'Waste Intake Recorded';
      } else {
        targetMessage = data.hospitalMessage;
        targetTitle = data.step === 'ORDER_CONFIRMED' ? 'Order Confirmed' : 'Waste Handover Complete';
      }

      if (targetMessage) {
        showToast(targetMessage, 'success', targetTitle);
      }
      fetchNotifications();
    });

    // Handle live driver GPS updates
    socket.on('driver_location_update', (data) => {
      if (data?.driverId) {
        setLiveDriverLocations((prev) => ({
          ...prev,
          [data.driverId]: data,
          ...(data.orderId ? { [data.orderId]: data } : {}),
        }));
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user]);

  const showToast = (message, type = 'info', title = '') => {
    setToast({ message, type, title, id: Date.now() });
    setTimeout(() => {
      setToast(null);
    }, 5000);
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id || n.requestId === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const joinOrderRoom = (orderId) => {
    if (socketRef.current && orderId) {
      socketRef.current.emit('join_order', orderId);
    }
  };

  const joinHospitalRoom = (hospitalId) => {
    if (socketRef.current && hospitalId) {
      socketRef.current.emit('join_hospital', hospitalId);
      console.log(`🏥 [Socket.IO] Dynamically joined room hospital:${hospitalId}`);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        toast,
        showToast,
        markAsRead,
        refreshNotifications: fetchNotifications,
        socket: socketRef.current,
        liveDriverLocations,
        joinOrderRoom,
        joinHospitalRoom,
      }}
    >
      {children}
      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5">
          <div
            className={`flex items-start gap-3 p-4 rounded-2xl shadow-2xl border transition-all max-w-md ${
              toast.type === 'success'
                ? 'bg-slate-950 text-emerald-300 border-emerald-500/50'
                : toast.type === 'error' || toast.type === 'warning'
                ? 'bg-slate-950 text-amber-300 border-amber-500/50'
                : 'bg-slate-950 text-slate-100 border-slate-700'
            }`}
          >
            <div className="flex-1">
              {toast.title && <h4 className="font-black text-xs tracking-wider uppercase mb-0.5">{toast.title}</h4>}
              <p className="text-xs opacity-90 leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => setToast(null)}
              className="text-slate-400 hover:text-white text-xs font-bold px-1"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
};
