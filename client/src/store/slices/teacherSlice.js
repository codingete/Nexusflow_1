import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";

export const fetchAssignedStudents = createAsyncThunk(
  "teacher/fetchAssignedStudents",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/teacher/students");
      return res.data.data?.students;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch students");
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  }
);

export const fetchTeacherFiles = createAsyncThunk(
  "teacher/fetchFiles",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/teacher/files");
      return res.data.data?.files;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch files");
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  }
);

export const fetchPendingRequests = createAsyncThunk(
  "teacher/fetchPendingRequests",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/teacher/requests");
      return res.data.data?.requests;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch requests");
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  }
);

export const fetchTeacherDashboardStats = createAsyncThunk(
  "teacher/fetchDashboardStats",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/teacher/dashboard-stats");
      return res.data.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch stats");
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  }
);

export const acceptSupervisorRequest = createAsyncThunk(
  "teacher/acceptRequest",
  async (requestId, thunkAPI) => {
    try {
      const res = await axiosInstance.put(`/teacher/requests/${requestId}/accept`);
      toast.success("Request accepted");
      return res.data.data?.request;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to accept request");
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  }
);

export const rejectSupervisorRequest = createAsyncThunk(
  "teacher/rejectRequest",
  async ({ requestId, reason }, thunkAPI) => {
    try {
      const res = await axiosInstance.put(`/teacher/requests/${requestId}/reject`, { reason });
      toast.success("Request rejected");
      return res.data.data?.request;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reject request");
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  }
);

export const submitFeedback = createAsyncThunk(
  "teacher/submitFeedback",
  async ({ studentId, projectId, feedback }, thunkAPI) => {
    try {
      const res = await axiosInstance.post("/teacher/feedback", { studentId, projectId, feedback });
      toast.success("Feedback submitted");
      return res.data.data?.feedback;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit feedback");
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  }
);

const teacherSlice = createSlice({
  name: "teacher",
  initialState: {
    assignedStudents: [],
    files: [],
    pendingRequests: [],
    dashboardStats: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearTeacherError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAssignedStudents.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAssignedStudents.fulfilled, (state, action) => {
        state.loading = false;
        state.assignedStudents = action.payload ?? [];
      })
      .addCase(fetchAssignedStudents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchTeacherFiles.fulfilled, (state, action) => {
        state.files = action.payload ?? [];
      })
      .addCase(fetchPendingRequests.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPendingRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingRequests = action.payload ?? [];
      })
      .addCase(fetchPendingRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchTeacherDashboardStats.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTeacherDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboardStats = action.payload ?? null;
      })
      .addCase(fetchTeacherDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(acceptSupervisorRequest.fulfilled, (state, action) => {
        if (state.pendingRequests) {
          state.pendingRequests = state.pendingRequests.map((r) =>
            r._id === action.payload._id ? { ...r, status: "accepted" } : r
          );
        }
      })
      .addCase(rejectSupervisorRequest.fulfilled, (state, action) => {
        if (state.pendingRequests) {
          state.pendingRequests = state.pendingRequests.map((r) =>
            r._id === action.payload._id ? { ...r, status: "rejected" } : r
          );
        }
      });
  },
});

export const { clearTeacherError } = teacherSlice.actions;
export default teacherSlice.reducer;