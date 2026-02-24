import { createAsyncThunk } from "@reduxjs/toolkit";
import SQL_API from "../../../util/sqlAxiosWrapper";

const SQLReportService = {
    getConfigs: createAsyncThunk(
        "sqlReport/getConfigs",
        async (_, { rejectWithValue }) => {
            try {
                const response = await SQL_API.get(`/sql-report/configs`);
                return response.data;
            } catch (err: any) {
                return rejectWithValue(err.response.data);
            }
        }
    ),

    executeReport: createAsyncThunk(
        "sqlReport/execute",
        async (payload: {
            category: string;
            reportName: string;
            fromDate: string;
            toDate: string;
            page: number;
            limit: number;
            reportKey?: string;
        }, { rejectWithValue }) => {
            try {
                const response = await SQL_API.post(`/sql-report/execute`, payload);
                return response.data;
            } catch (err: any) {
                return rejectWithValue(err.response.data);
            }
        }
    ),
};

export default SQLReportService;
