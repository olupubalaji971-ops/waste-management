const { Notification } = require('../models');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Protected
exports.getNotifications = async (req, res) => {
  try {
    const userRole = req.user ? req.user.role : 'all';
    const hospitalId = req.user ? req.user.hospitalId : null;

    const query = {
      $or: [
        { recipientRole: { $in: ['all', userRole, 'HOSPITAL', 'hospital_admin'] } },
        { targetRole: { $in: ['all', userRole] } },
        ...(hospitalId ? [{ recipientId: hospitalId }, { hospitalId }] : []),
        ...(req.user ? [{ recipientId: req.user._id }, { userId: req.user._id }, { recipientId: req.user.driverId }] : []),
      ],
    };

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(30);

    const unreadCount = notifications.filter(n => !n.read).length;

    return res.status(200).json({
      success: true,
      unreadCount,
      count: notifications.length,
      data: notifications,
    });
  } catch (error) {
    console.error('Get Notifications Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve notifications' });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Protected
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByIdAndUpdate(
      id,
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    return res.status(200).json({ success: true, data: notification });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error marking notification as read' });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Protected
exports.markAllAsRead = async (req, res) => {
  try {
    const userRole = req.user ? req.user.role : 'all';
    const hospitalId = req.user ? req.user.hospitalId : null;

    await Notification.updateMany(
      {
        $or: [
          { targetRole: 'all' },
          { targetRole: userRole },
          ...(hospitalId ? [{ hospitalId }] : []),
        ],
      },
      { read: true }
    );

    return res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error marking notifications as read' });
  }
};
