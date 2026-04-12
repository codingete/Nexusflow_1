import{Notification} from"../models/notification.js";

export const createNotification = async (notificationData) => {
  const notification = new Notification(notificationData);
  return await notification.save();
};

export const notifyUser = async (
  userId,
  message,
  type = "general",
  link = null,
  priority = "low"
) => {
  return await createNotification({
   user: userId,
    message,
    type,
    link,
    priority,
  });
};

export const markAsRead = async (id, userId) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: id, user: userId },
    { isRead: true },
    { new: true }
  );
  return notification;
};

export const markAllAsRead = async (userId) => {
  const result = await Notification.updateMany(
    { user: userId, isRead: false },
    { isRead: true }
  );
  return result;
};

export const deleteNotification = async (id, userId) => {
  const notification = await Notification.findOneAndDelete({
    _id: id,
    user: userId,
  });
  return notification;
};

export const getUnreadCount = async (userId) => {
  return await Notification.countDocuments({ user: userId, isRead: false });
};