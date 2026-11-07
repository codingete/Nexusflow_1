import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";

const errorMessage = (error, fallback) => error.response?.data?.message || fallback;

export const getTeacherDashboardStats = createAsyncThunk(
  "teacher/getDashboardStats",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/teacher/fetch-dashboard-stats");
      return res.data.data?.dashboardStats;
    } catch (error) {
      const message = errorMessage(error, "Failed to fetch dashboard stats");
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const getTeacherRequests = createAsyncThunk(
  "teacher/getRequests",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/teacher/requests");
      return res.data.data?.requests || [];
    } catch (error) {
      const message = errorMessage(error, "Failed to fetch requests");
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const acceptRequest = createAsyncThunk(
  "teacher/acceptRequest",
  async (requestId, thunkAPI) => {
    try {
      const res = await axiosInstance.put(`/teacher/requests/${requestId}/accept`);
      toast.success(res.data.message || "Request accepted");
      return res.data.data?.request;
    } catch (error) {
      const message = errorMessage(error, "Failed to accept request");
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const rejectRequest = createAsyncThunk(
  "teacher/rejectRequest",
  async (requestId, thunkAPI) => {
    try {
      const res = await axiosInstance.put(`/teacher/requests/${requestId}/reject`);
      toast.success(res.data.message || "Request rejected");
      return res.data.data?.request;
    } catch (error) {
      const message = errorMessage(error, "Failed to reject request");
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Projects supervised by the logged-in teacher, each with its student.
export const fetchAssignedStudents = createAsyncThunk(
  "teacher/fetchAssignedStudents",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/teacher/assigned-students");
      return res.data.data?.projects || [];
    } catch (error) {
      const message = errorMessage(error, "Failed to fetch students");
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const fetchTeacherFiles = createAsyncThunk(
  "teacher/fetchFiles",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/teacher/files");
      return res.data.data?.files || [];
    } catch (error) {
      const message = errorMessage(error, "Failed to fetch files");
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const teacherSlice = createSlice({
  name: "teacher",
  initialState: {
    dashboardStats: null,
    list: [],
    assignedProjects: [],
    files: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearTeacherError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    const setStatus = (status) => (state, action) => {
      if (!action.payload) return;
      state.list = state.list.map((r) =>
        r._id === action.payload._id ? { ...r, status } : r
      );
    };

    builder
      .addCase(getTeacherDashboardStats.pending, (state) => {
        state.loading = true;
      })
      .addCase(getTeacherDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboardStats = action.payload ?? null;
      })
      .addCase(getTeacherDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getTeacherRequests.pending, (state) => {
        state.loading = true;
      })
      .addCase(getTeacherRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(getTeacherRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(acceptRequest.fulfilled, setStatus("accepted"))
      .addCase(rejectRequest.fulfilled, setStatus("rejected"))
      .addCase(fetchAssignedStudents.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAssignedStudents.fulfilled, (state, action) => {
        state.loading = false;
        state.assignedProjects = action.payload;
      })
      .addCase(fetchAssignedStudents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchTeacherFiles.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTeacherFiles.fulfilled, (state, action) => {
        state.loading = false;
        state.files = action.payload;
      })
      .addCase(fetchTeacherFiles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearTeacherError } = teacherSlice.actions;
export default teacherSlice.reducer;
