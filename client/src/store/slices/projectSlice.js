import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";

export const fetchAllProjects = createAsyncThunk(
  "project/fetchAll",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/projects");
      return res.data.data?.projects;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch projects");
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  }
);

export const fetchProjectById = createAsyncThunk(
  "project/fetchById",
  async (id, thunkAPI) => {
    try {
      const res = await axiosInstance.get(`/projects/${id}`);
      return res.data.data?.project;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch project");
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  }
);

export const createProject = createAsyncThunk(
  "project/create",
  async (data, thunkAPI) => {
    try {
      const res = await axiosInstance.post("/projects", data);
      toast.success("Project created successfully");
      return res.data.data?.project;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create project");
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  }
);

export const updateProject = createAsyncThunk(
  "project/update",
  async ({ id, data }, thunkAPI) => {
    try {
      const res = await axiosInstance.put(`/projects/${id}`, data);
      toast.success("Project updated successfully");
      return res.data.data?.project;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update project");
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  }
);

export const deleteProject = createAsyncThunk(
  "project/delete",
  async (id, thunkAPI) => {
    try {
      const res = await axiosInstance.delete(`/projects/${id}`);
      toast.success("Project deleted successfully");
      return id;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete project");
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  }
);

export const downloadProjectFile = createAsyncThunk(
  "downloadProjectFile",
  async ({ projectId, fileId }, thunkAPI) => {
    try {
      const res = await axiosInstance.get(
        `/student/${projectId}/files/${fileId}/download`,
        { responseType: "blob" }
      );
      return { blob: res.data, projectId, fileId };
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to download file");
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  }
);

export const getAllProjects = fetchAllProjects;

const projectSlice = createSlice({
  name: "project",
  initialState: {
    projects: [],
    selected: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearProjectError: (state) => {
      state.error = null;
    },
    clearSelectedProject: (state) => {
      state.selected = null;
    },
  },
  extraReducers: (builder) => {
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
      .addCase(fetchProjectById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProjectById.fulfilled, (state, action) => {
        state.loading = false;
        state.selected = action.payload;
      })
      .addCase(fetchProjectById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createProject.pending, (state) => {
        state.loading = true;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.loading = false;
        if (state.projects) state.projects.unshift(action.payload);
      })
      .addCase(createProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        if (state.projects) {
          state.projects = state.projects.map((p) =>
            p._id === action.payload._id ? { ...p, ...action.payload } : p
          );
        }
        if (state.selected?._id === action.payload._id) {
          state.selected = { ...state.selected, ...action.payload };
        }
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        if (state.projects) {
          state.projects = state.projects.filter((p) => p._id !== action.payload);
        }
      })
      .addCase(downloadProjectFile.fulfilled, (state, action) => {
      });
  },
});

export const { clearProjectError, clearSelectedProject } = projectSlice.actions;
export default projectSlice.reducer;