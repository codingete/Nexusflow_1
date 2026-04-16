import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";


export const createDeadline = createAsyncThunk(
  "createDeadline",
  async ({ id, data }, thunkAPI) => {
    try {
      const res = await axiosInstance.post(
        `/deadline/create-deadline/${id}`,
        data
      );
      toast.success(res.data.message || "Deadline updated successfully");
      return res.data.data?.deadline || res.data.data||res.data;
    } catch (error) {
      toast.error(error.response.data.message||"Failed to update or create deadline");
      return thunkAPI.rejectWithValue(
        error.response?.data?.message
      );
    }
  }
);

export const fetchDeadlines = createAsyncThunk(
  "deadline/fetchAll",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/deadlines");
      return res.data.data?.deadlines;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch deadlines");
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  }
);

export const updateDeadline = createAsyncThunk(
  "deadline/update",
  async ({ id, data }, thunkAPI) => {
    try {
      const res = await axiosInstance.put(`/deadlines/${id}`, data);
      toast.success("Deadline updated!");
      return res.data.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update deadline");
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  }
);

export const deleteDeadline = createAsyncThunk(
  "deadline/delete",
  async (id, thunkAPI) => {
    try {
      const res = await axiosInstance.delete(`/deadlines/${id}`);
      toast.success("Deadline deleted!");
      return id;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete deadline");
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  }
);

export const fetchNearbyDeadlines = createAsyncThunk(
  "deadline/fetchNearby",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/deadlines/nearby");
      return res.data.data?.deadlines;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  }
);

const deadlineSlice = createSlice({
  name: "deadline",
  initialState: {
    deadlines: [],
    nearby: [],
    selected: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearDeadlineError: (state) => {
      state.error = null;
    },
    setSelectedDeadline: (state, action) => {
      state.selected = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createDeadline.pending, (state) => {
        state.loading = true;
      })
      .addCase(createDeadline.fulfilled, (state, action) => {
        state.loading = false;
        if (state.deadlines) state.deadlines.push(action.payload);
      })
      .addCase(createDeadline.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchDeadlines.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDeadlines.fulfilled, (state, action) => {
        state.loading = false;
        state.deadlines = action.payload;
      })
      .addCase(fetchDeadlines.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateDeadline.fulfilled, (state, action) => {
        if (state.deadlines) {
          state.deadlines = state.deadlines.map((d) =>
            d._id === action.payload._id ? { ...d, ...action.payload } : d
          );
        }
      })
      .addCase(deleteDeadline.fulfilled, (state, action) => {
        if (state.deadlines) {
          state.deadlines = state.deadlines.filter((d) => d._id !== action.payload);
        }
      })
      .addCase(fetchNearbyDeadlines.fulfilled, (state, action) => {
        state.nearby = action.payload;
      });
  },
});

export const { clearDeadlineError, setSelectedDeadline } = deadlineSlice.actions;
export default deadlineSlice.reducer;