import { createAppAsyncThunk } from "../../createAppAsyncThunk";
import axios, { AxiosError } from "axios";

interface IupdateTransaction {
  transactionId: string;
  status: "SUCCESS" | "PENDING" | "FAILED";
}

const updateTransaction = async ({
  transactionId,

  status,
}: IupdateTransaction) => {
  await axios.patch("/api/transactions", {
    transactionId,
    status,
  });
};

export const updateFailedTransaction = async (transactionId: string) => {
  try {
    return await axios.patch("/api/transactions?failed=true", {
      status: "FAILED",
      transactionId,
    });
  } catch (error) {
    return error;
  }
};

export const verifyByNIN = createAppAsyncThunk(
  "services/verifyByNIN",
  async (
    {
      nin,
      transactionId,
    }: {
      nin: string;
      transactionId: string;
    },
    thunkAPI
  ) => {
    try {
      const res = await axios.post("/api/services/verify/nin", { nin });

      if (res.status === 200) {
        await updateTransaction({
          transactionId,

          status: "SUCCESS",
        });
      }

      return res.data;
    } catch (error) {
      await updateFailedTransaction(transactionId);
      if (error && error instanceof AxiosError) {
        return thunkAPI.rejectWithValue(error.response?.data);
      }
      return thunkAPI.rejectWithValue("Could not Verify by NIN");
    }
  }
);
export const verifyByVNIN = createAppAsyncThunk(
  "services/verifyByVNIN",
  async (
    {
      vnin,
      transactionId,
    }: {
      vnin: string;
      transactionId: string;
    },
    thunkAPI
  ) => {
    try {
      const res = await axios.post("/api/services/verify/nin", { vnin });

      if (res.status === 200) {
        await updateTransaction({
          transactionId,
          status: "SUCCESS",
        });
      }

      return res.data;
    } catch (error) {
      await updateFailedTransaction(transactionId);
      if (error && error instanceof AxiosError) {
        return thunkAPI.rejectWithValue(error.response?.data);
      }
      return thunkAPI.rejectWithValue("Counld not verify by VNIN");
    }
  }
);

export const verifyByDemography = createAppAsyncThunk(
  "services/verifyByDemography",
  async (
    {
      firstname,
      lastname,
      dob,
      gender,
      transactionId,
    }: {
      firstname: string;
      lastname: string;
      dob: string;
      gender: string;
      transactionId: string;
    },
    thunkAPI
  ) => {
    try {
      const res = await axios.post("/api/services/verify/nin/demography", {
        firstname,
        lastname,
        dob,
        gender,
      });

      if (res.status === 200) {
        await updateTransaction({
          transactionId,
          status: "SUCCESS",
        });
      }

      return res.data;
    } catch (error) {
      await updateFailedTransaction(transactionId);
      if (error && error instanceof AxiosError) {
        return thunkAPI.rejectWithValue(error.response?.data);
      }
      return thunkAPI.rejectWithValue("Could not Verify by Demography");
    }
  }
);
export const verifyByPhone = createAppAsyncThunk(
  "services/verifyByPhone",
  async (
    {
      phone,
      transactionId,
    }: {
      phone: string;
      transactionId: string;
    },
    thunkAPI
  ) => {
    try {
      const res = await axios.post("/api/services/verify/nin/phone", { phone });

      if (res.status === 200) {
        await updateTransaction({
          transactionId,
          status: "SUCCESS",
        });
      } else {
        await updateFailedTransaction(transactionId);
      }

      return res.data;
    } catch (error) {
      await updateFailedTransaction(transactionId);
      if (error && error instanceof AxiosError) {
        return thunkAPI.rejectWithValue(error.response?.data);
      }
      return thunkAPI.rejectWithValue("Could not Verify by Phone");
    }
  }
);
export const getAllSlips = createAppAsyncThunk(
  "services/getAllSlips",
  async (_, thunkAPI) => {
    try {
      const res = await axios.get("/api/slips");

      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue("Could not get Slips");
    }
  }
);
