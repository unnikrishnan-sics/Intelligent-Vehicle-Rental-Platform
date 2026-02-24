import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const fetchMessages = createAsyncThunk(
    'chat/fetchMessages',
    async (userId, thunkAPI) => {
        try {
            const response = await api.get(`chat/${userId}`);
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const fetchChatList = createAsyncThunk(
    'chat/fetchChatList',
    async (_, thunkAPI) => {
        try {
            const response = await api.get('chat/list');
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

const chatSlice = createSlice({
    name: 'chat',
    initialState: {
        messages: [],
        chatList: [],
        loading: false,
        error: null
    },
    reducers: {
        addMessage: (state, action) => {
            state.messages.push(action.payload);
        },
        clearMessages: (state) => {
            state.messages = [];
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchMessages.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchMessages.fulfilled, (state, action) => {
                state.loading = false;
                state.messages = action.payload;
            })
            .addCase(fetchMessages.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchChatList.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchChatList.fulfilled, (state, action) => {
                state.loading = false;
                state.chatList = action.payload;
            })
            .addCase(fetchChatList.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { addMessage, clearMessages } = chatSlice.actions;
export default chatSlice.reducer;
