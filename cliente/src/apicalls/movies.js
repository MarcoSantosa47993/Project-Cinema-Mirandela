import { get } from "mongoose";

const { axiosInstance } = require(".");


//Add a new Event
export const AddMovie = async (payload) => {
    try {
        const response = await axiosInstance.post("/api/movies/add-movie", payload);
        return response.data;
    } catch (error) {
        return error.response;
    }
}


//get all movies
export const GetAllMovies = async () => {
    try {
        const response = await axiosInstance.get(("/api/movies/get-all-movies"))
        return response.data;
    } catch (error) {
        return error.response;
    }
}

//update a movie
export const UpdateMovie = async (payload) => {
    try {
        const response = await axiosInstance.post("/api/movies/update-movie", payload)
        return response.data;
    } catch (error) {
        return error.response;
    }
}

//apagar filme
export const DeleteMovie = async (payload) => {
    try {
        
        const response = await axiosInstance.post("/api/movies/delete-movie", payload)
        return response.data;
    } catch (error) {
        return error.response;
    }
}

//filme pelo id
export const GetMoviebyId = async (id) => {
    try {
        const response = await axiosInstance.get(`/api/movies/get-movie-by-id/${id}`)
        return response.data;
    } catch (error) {
        return error.response;
    }
}