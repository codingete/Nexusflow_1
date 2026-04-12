import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../lib/axios";

export const getNotifications = createAsyncThunk(
    "notification/getNotifications",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get("/notifications");
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to fetch notifications"
            );
        }
    }
);

export const markAsRead = createAsyncThunk(
    "notification/markAsRead",
    async (id, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.patch(`/notifications/${id}/read`);
            return response.data.data.notification;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to mark as read"
            );
        }
    }
);

export const markAllAsRead = createAsyncThunk(
    "notification/markAllAsRead",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.patch("/notifications/read-all");
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to mark all as read"
            );
        }
    }
);

const notificationSlice = createSlice({
    name: "notification",
    initialState: {
        list: [],
        unreadCount: 0,
        readCount: 0,
        highPriorityMessages: 0,
        thisWeekNotifications: 0,
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getNotifications.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getNotifications.fulfilled, (state, action) => {
                state.loading = false;
                state.list = action.payload.data.notifications;
                state.unreadCount = action.payload.data.unreadOnly;
                state.readCount = action.payload.data.readOnly;
                state.highPriorityMessages = action.payload.data.highPriorityMessages;
                state.thisWeekNotifications = action.payload.data.thisWeekNotifications;
            })
            .addCase(getNotifications.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(markAsRead.fulfilled, (state, action) => {
                const updatedNotification = action.payload;
                const index = state.list.findIndex(
                    (n) => n._id === updatedNotification._id
                );
                if (index !== -1) {
                    state.list[index] = updatedNotification;
                    if (state.unreadCount > 0) {
                        state.unreadCount -= 1;
                    }
                    state.readCount += 1;
                }
            })
            .addCase(markAllAsRead.fulfilled, (state) => {
                state.list.forEach((n) => {
                    n.isRead = true;
                });
                state.readCount += state.unreadCount;
                state.unreadCount = 0;
            });
    },
});

export default notificationSlice.reducer;