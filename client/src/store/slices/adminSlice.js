import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";

export const createStudent = createAsyncThunk(
  "admin/createStudent",
  async (data, thunkAPI) => {
    try {
      const res = await axiosInstance.post("/admin/create-student", data);
      toast.success(res.data.message || "Student created successfully");
      return res.data.data?.user;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create student");
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  }
);

export const updateStudent = createAsyncThunk(
  "admin/updateStudent",
  async ({ id, data }, thunkAPI) => {
    try {
      const res = await axiosInstance.put(`/admin/update-student/${id}`, data);
      toast.success(res.data.message || "Student updated successfully");
      return res.data.data?.user;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update student");
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  }
);

export const deleteStudent = createAsyncThunk(
  "admin/deleteStudent",
  async (id, thunkAPI) => {
    try {
      const res = await axiosInstance.delete(`/admin/delete-student/${id}`);
      toast.success(res.data.message || "Student deleted successfully");
      return id;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete student");
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  }
);

export const getAllUsers = createAsyncThunk(
  "admin/getAllUsers",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/admin/users");
      return res.data.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch users");
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  }
);

export const createTeacher = createAsyncThunk(
  "admin/createTeacher",
  async (data, thunkAPI) => {
    try {
      const res = await axiosInstance.post("/admin/create-teacher", data);
      toast.success(res.data.message || "Teacher created successfully");
      return res.data.data?.user;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create teacher");
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  }
);

export const updateTeacher = createAsyncThunk(
  "admin/updateTeacher",
  async ({ id, data }, thunkAPI) => {
    try {
      const res = await axiosInstance.put(`/admin/update-teacher/${id}`, data);
      toast.success(res.data.message || "Teacher updated successfully");
      return res.data.data?.user;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update teacher");
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  }
);

export const deleteTeacher = createAsyncThunk(
  "admin/deleteTeacher",
  async (id, thunkAPI) => {
    try {
      const res = await axiosInstance.delete(`/admin/delete-teacher/${id}`);
      toast.success(res.data.message || "Teacher deleted successfully");
      return id;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete teacher");
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  }
);

export const getDashboardStats = createAsyncThunk(
  "getDashboardStats",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get(`/admin/fetch-dashboard-stats`);
      return res.data.data.stats;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch admin dashboard stats");
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  }
);

const adminSlice = createSlice({
  name: "admin",
  initialState: {
    students: [],
    teachers: [],
    projects: [],
    users: [],
    stats: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createStudent.pending, (state) => {
        state.loading = true;
      })
      .addCase(createStudent.fulfilled, (state, action) => {
        state.loading = false;
        if (state.users && action.payload) state.users.unshift(action.payload);
        if (state.students) state.students.unshift(action.payload);
      })
      .addCase(createStudent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateStudent.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateStudent.fulfilled, (state, action) => {
        state.loading = false;
        if (state.users && action.payload) {
          state.users = state.users.map((u) =>
            u._id === action.payload._id ? { ...u, ...action.payload } : u
          );
        }
        if (state.students) {
          state.students = state.students.map((s) =>
            s._id === action.payload._id ? { ...s, ...action.payload } : s
          );
        }
      })
      .addCase(updateStudent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteStudent.fulfilled, (state, action) => {
        if (state.users) state.users = state.users.filter((u) => u._id !== action.payload);
        if (state.students) state.students = state.students.filter((s) => s._id !== action.payload);
      })
      .addCase(getAllUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload?.users || [];
        state.students = action.payload?.students || [];
        state.teachers = action.payload?.teachers || [];
      })
      .addCase(getAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createTeacher.pending, (state) => {
        state.loading = true;
      })
      .addCase(createTeacher.fulfilled, (state, action) => {
        state.loading = false;
        if (state.users && action.payload) state.users.unshift(action.payload);
        if (state.teachers) state.teachers.unshift(action.payload);
      })
      .addCase(createTeacher.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateTeacher.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateTeacher.fulfilled, (state, action) => {
        state.loading = false;
        if (state.users && action.payload) {
          state.users = state.users.map((u) =>
            u._id === action.payload._id ? { ...u, ...action.payload } : u
          );
        }
        if (state.teachers) {
          state.teachers = state.teachers.map((t) =>
            t._id === action.payload._id ? { ...t, ...action.payload } : t
          );
        }
      })
      .addCase(updateTeacher.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteTeacher.fulfilled, (state, action) => {
        if (state.users) state.users = state.users.filter((u) => u._id !== action.payload);
        if (state.teachers) state.teachers = state.teachers.filter((t) => t._id !== action.payload);
      })
      .addCase(getDashboardStats.pending, (state) => {
        state.loading = true;
      })
      .addCase(getDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(getDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = adminSlice.actions;
export default adminSlice.reducer;