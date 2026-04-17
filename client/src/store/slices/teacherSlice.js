import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";

export const getTeacherDashboardStats = createAsyncThunk(
  "getTeacherDashboardStats",
  async (_, thunkAPI) => {
    try {
  const res = await axiosInstance.get("/teacher/fetch-dashboard-stats");
  return res.data.data?.dashboardStats || res.data.data;
} catch (error) {
  toast.error(
    error.response.data.message || "Failed to fetch dashboard stats")
    
  return thunkAPI.rejectWithValue(error.response.data.message);
}
  }
);

export const getTeacherRequests = createAsyncThunk(
  "getTeacherRequests",
  async (supervisorId, thunkAPI) => {
    try {
  const res = await axiosInstance.get(`/teacher/requests?supervisor=${supervisorId}`);
  return res.data.data?.request || res.data.data;
} catch (error) {
  toast.error(
    error.response.data.message || "Failed to fetch request")
    
  return thunkAPI.rejectWithValue(error.response.data.message);
}
  }
);


export const acceptRequest = createAsyncThunk(
  "acceptRequest",
  async (supervisorId, thunkAPI) => {
    try {
  const res = await axiosInstance.get(`/teacher/requests?${requestId}/accept`);
  return res.data.data?.request || res.data.data;
} catch (error) {
  toast.error(
    error.response.data.message || "Failed to accept request")
    
  return thunkAPI.rejectWithValue(error.response.data.message);
}
  }
);

export const rejectRequest = createAsyncThunk(
  "rejectRequest",
  async (supervisorId, thunkAPI) => {
    try {
  const res = await axiosInstance.get(`/teacher/requests?${requestId}/reject`);

    toast.success(
    error.response.data.message || "Request reject successfully")

  return res.data.data?.request || res.data.data;
} catch (error) {
  toast.error(
    error.response.data.message || "Failed to reject request")
    
  return thunkAPI.rejectWithValue(error.response.data.message);
}
  }
);

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
    list:[],
  },
  reducers: {
    clearTeacherError: (state) => {
      state.error = null;
    },
  },
 extraReducers: (builder) => {
  builder.addCase(getTeacherDashboardStats.fulfilled, (state, action) => {
    state.dashboardStats = action.payload;
  });
  builder.addCase(getTeacherRequests.fulfilled, (state, action) => {
    state.list = action.payload.requests || [];
  });
  builder.addCase(acceptRequest.fulfilled, (state, action) => {
    const updatedRequest = action.payload;
    state.pendingRequests = state.pendingRequests.map((r) =>
      r._id === updatedRequest._id ? updatedRequest : r
    );
  });
  builder.addCase(rejectRequest.fulfilled, (state, action) => {
    const rejectedRequest = action.payload;
    state.pendingRequests = state.pendingRequests.filter(
      (r) => r._id !== rejectedRequest._id
    );
  });
      builder.addCase(fetchAssignedStudents.pending, (state) => {
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