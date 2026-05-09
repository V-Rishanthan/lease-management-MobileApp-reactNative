import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { supabase } from "../lib/supabase";
import { VehicleInfo } from "../types";

type VehicleState = {
  vehicleInfo: VehicleInfo | null;
  loading: boolean;
  error: string | null;
};

const initialState: VehicleState = {
  vehicleInfo: null,
  loading: false,
  error: null,
};

// Fetch vehicle info
export const fetchVehicleInfo = createAsyncThunk(
  "vehicle/fetchVehicleInfo",
  async (_, { rejectWithValue }) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return rejectWithValue("No user found");

      const { data, error } = await supabase
        .from("vehicle_info")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) return rejectWithValue(error.message);
      return data as VehicleInfo;
    } catch (e: any) {
      return rejectWithValue(e.message ?? "Failed to fetch vehicle info");
    }
  }
);

// Update vehicle info (partial payload)
export const updateVehicleInfo = createAsyncThunk(
  "vehicle/updateVehicleInfo",
  async (payload: Partial<VehicleInfo>, { rejectWithValue }) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return rejectWithValue("No user found");

      const { data, error } = await supabase
        .from("vehicle_info")
        .update(payload)
        .eq("user_id", user.id)
        .single();

      if (error) return rejectWithValue(error.message);
      return data as VehicleInfo;
    } catch (e: any) {
      return rejectWithValue(e.message ?? "Failed to update vehicle info");
    }
  }
);

// Delete vehicle record
export const deleteVehicleInfo = createAsyncThunk(
  "vehicle/deleteVehicleInfo",
  async (_, { rejectWithValue }) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return rejectWithValue("No user found");

      const { error } = await supabase
        .from("vehicle_info")
        .delete()
        .eq("user_id", user.id);

      if (error) return rejectWithValue(error.message);
      return true;
    } catch (e: any) {
      return rejectWithValue(e.message ?? "Failed to delete vehicle info");
    }
  }
);

const vehicleSlice = createSlice({
  name: "vehicle",
  initialState,
  reducers: {
    setVehicle: (state, action: PayloadAction<VehicleInfo>) => {
      state.vehicleInfo = action.payload;
      state.error = null;
    },
    clearVehicle: (state) => {
      state.vehicleInfo = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetch
      .addCase(fetchVehicleInfo.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchVehicleInfo.fulfilled, (s, a) => {
        s.loading = false;
        s.vehicleInfo = a.payload;
      })
      .addCase(fetchVehicleInfo.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload as string;
      })
      // update
      .addCase(updateVehicleInfo.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(updateVehicleInfo.fulfilled, (s, a) => {
        s.loading = false;
        s.vehicleInfo = a.payload;
      })
      .addCase(updateVehicleInfo.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload as string;
      })
      // delete
      .addCase(deleteVehicleInfo.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(deleteVehicleInfo.fulfilled, (s) => {
        s.loading = false;
        s.vehicleInfo = null;
      })
      .addCase(deleteVehicleInfo.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload as string;
      });
  },
});

export const { setVehicle, clearVehicle } = vehicleSlice.actions;
export default vehicleSlice.reducer;
