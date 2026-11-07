import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import popupReducer from "./slices/popupSlice";
import adminReducer from "./slices/adminSlice";
import deadlineReducer from "./slices/deadlineSlice";
import notificationReducer from "./slices/notificationSlice";
import projectReducer from "./slices/projectSlice";
import studentReducer from "./slices/studentSlice";
import teacherReducer from "./slices/teacherSlice";
import feedbackReducer from "./slices/feedbackSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    popup: popupReducer,
    admin: adminReducer,
    deadline: deadlineReducer,
    notification: notificationReducer,
    project: projectReducer,
    student: studentReducer,
    teacher: teacherReducer,
    feedback: feedbackReducer,
  },
  devTools: import.meta.env.DEV,
});
