import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";

const errorMessage = (error, fallback) => error.response?.data?.message || fallback;

// Admins get every project; teachers get the ones they supervise.
export const fetchAllProjects = createAsyncThunk(
  "project/fetchAll",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/projects");
      return res.data.data?.projects || [];
    } catch (error) {
      const message = errorMessage(error, "Failed to fetch projects");
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const getAllProjects = fetchAllProjects;

export const updateProjectStatus = createAsyncThunk(
  "project/updateStatus",
  async ({ projectId, status }, thunkAPI) => {
    try {
      const res = await axiosInstance.put(`/projects/${projectId}/status`, { status });
      toast.success(res.data.message || "Project status updated");
      return res.data.data?.project;
    } catch (error) {
      const message = errorMessage(error, "Failed to update project status");
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Supervisor (or admin) feedback stored on the project itself.
export const addProjectFeedback = createAsyncThunk(
  "project/addFeedback",
  async ({ projectId, title, message, type }, thunkAPI) => {
    try {
      const res = await axiosInstance.post(`/projects/${projectId}/feedback`, {
        title,
        message,
        type,
      });
      toast.success(res.data.message || "Feedback added");
      return res.data.data?.project;
    } catch (error) {
      const msg = errorMessage(error, "Failed to add feedback");
      toast.error(msg);
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

export const downloadProjectFile = createAsyncThunk(
  "project/downloadFile",
  async ({ projectId, fileId }, thunkAPI) => {
    try {
      const res = await axiosInstance.get(
        `/student/${projectId}/files/${fileId}/download`,
        { responseType: "blob" }
      );
      return { blob: res.data, projectId, fileId };
    } catch (error) {
      const message = errorMessage(error, "Failed to download file");
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Downloads a project file and saves it in the browser under `name`.
export const saveProjectFile = ({ projectId, fileId, name }) => async (dispatch) => {
  const res = await dispatch(downloadProjectFile({ projectId, fileId }));
  if (!downloadProjectFile.fulfilled.match(res)) return;

  const url = window.URL.createObjectURL(new Blob([res.payload.blob]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", name || "downloaded-file");
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

const projectSlice = createSlice({
  name: "project",
  initialState: {
    projects: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearProjectError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // The update endpoints return the project without populated refs, so merge
    // only the changed fields and keep the populated student/supervisor.
    const mergeProject = (state, action) => {
      const updated = action.payload;
      if (!updated) return;
      state.projects = state.projects.map((p) =>
        p._id === updated._id
          ? { ...p, status: updated.status, feedback: updated.feedback, updatedAt: updated.updatedAt }
          : p
      );
    };

    builder
      .addCase(fetchAllProjects.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = action.payload;
      })
      .addCase(fetchAllProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateProjectStatus.fulfilled, mergeProject)
      .addCase(addProjectFeedback.fulfilled, mergeProject);
  },
});

export const { clearProjectError } = projectSlice.actions;
export default projectSlice.reducer;
