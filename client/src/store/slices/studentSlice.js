import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";


export const submitProjectProposal = createAsyncThunk(
  "student/submitProjectProposal",
  async (inputAPI, thunkAPI) => {
    try {
      const res = await axiosInstance.post("/student/proposal", inputAPI);
      toast.success("Project proposal submitted successfully");
      return res.data.data?.project || res.data.data || res.data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to submit project proposal";
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const fetchProject = createAsyncThunk(
  "student/fetchProject",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/student/project");
      return res.data.data?.project;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to fetch project";
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const fetchAvailableSupervisors = createAsyncThunk(
  "student/fetchAvailableSupervisors",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/student/fetch-supervisors");
      return res.data.data?.supervisors;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to fetch supervisors";
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const fetchSupervisor = createAsyncThunk(
  "student/fetchSupervisor",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/student/supervisor");
      return res.data.data?.supervisor || null;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to fetch supervisor";
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const requestSupervisor = createAsyncThunk(
  "student/requestSupervisor",
  async (inputAPI, thunkAPI) => {
    try {
      const res = await axiosInstance.post("/student/request-supervisor", inputAPI);
      toast.success("Supervisor request sent successfully");
      // Refresh so the new request shows up with its populated supervisor.
      thunkAPI.dispatch(fetchMyRequests());
      return res.data.data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to send supervisor request";
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const fetchMyRequests = createAsyncThunk(
  "student/fetchMyRequests",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/student/my-requests");
      return res.data.data?.requests;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to fetch requests";
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const uploadProjectFiles = createAsyncThunk(
  "student/uploadProjectFiles",
  async ({ projectId, files }, thunkAPI) => {
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));
      const res = await axiosInstance.post(`/student/upload/${projectId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Files uploaded successfully");
      return res.data.data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to upload files";
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const fetchStudentDashboard = createAsyncThunk(
  "student/fetchDashboard",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/student/fetch-dashboard-stats");
      return res.data.data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to fetch dashboard";
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const studentSlice = createSlice({
  name: "student",
  initialState: {
    project: null,
    files: [],
    supervisors: [],
    dashboardStats: null,
    supervisor: null,
    deadlines: [],
    feedback: [],
    status: null,
    loading: false,
    requests: [],
  },
  reducers: {
    clearStudentError: (state) => {
      state.error = null;
    },
    clearProject: (state) => {
      state.project = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitProjectProposal.pending, (state) => {
        state.loading = true;
      })
      .addCase(submitProjectProposal.fulfilled, (state, action) => {
        state.loading = false;
        state.project = action.payload;
        state.files = [];
      })
      .addCase(submitProjectProposal.rejected, (state) => {
        state.loading = false;
      })
      .addCase(fetchProject.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProject.fulfilled, (state, action) => {
        state.loading = false;
        state.project = action.payload || null;
        state.files = action.payload?.files || [];
      })
      .addCase(fetchStudentDashboard.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchStudentDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboardStats = action.payload;
      })
      .addCase(fetchStudentDashboard.rejected, (state) => {
        state.loading = false;
      })
      .addCase(fetchProject.rejected, (state) => {
        state.loading = false;
      })
      .addCase(fetchAvailableSupervisors.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAvailableSupervisors.fulfilled, (state, action) => {
        state.loading = false;
        state.supervisors = action.payload;
      })
      .addCase(fetchAvailableSupervisors.rejected, (state) => {
        state.loading = false;
      })
      .addCase(fetchSupervisor.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSupervisor.fulfilled, (state, action) => {
        state.loading = false;
        state.supervisor = action.payload;
      })
      .addCase(fetchSupervisor.rejected, (state) => {
        state.loading = false;
      })
      .addCase(requestSupervisor.pending, (state) => {
        state.loading = true;
      })
      .addCase(requestSupervisor.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(requestSupervisor.rejected, (state) => {
        state.loading = false;
      })
      .addCase(fetchMyRequests.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.requests = action.payload;
      })
      .addCase(fetchMyRequests.rejected, (state) => {
        state.loading = false;
      })
      .addCase(uploadProjectFiles.pending, (state) => {
        state.loading = true;
      })
      .addCase(uploadProjectFiles.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.project) {
          state.project = action.payload.project;
        }
        if (action.payload?.project?.files) {
          state.files = action.payload.project.files;
        }
      })
      .addCase(uploadProjectFiles.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { clearStudentError, clearProject } = studentSlice.actions;
export default studentSlice.reducer;
