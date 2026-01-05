import axios from "axios";
import config from "../config";

export const api = axios.create({
    baseURL: "http://localhost:3000/v1",
    withCredentials: true,
    headers: {
        Authorization: `Bearer ${config.APIKEY}`,
        "Cache-Control": "no-cache",
    },
});
