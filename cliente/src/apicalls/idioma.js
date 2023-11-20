import { axiosInstance } from ".";

export const AddIdioma = async (payload) => {
    try {
        const response = await axiosInstance.post("/api/idioma/add-idioma", payload)
        return response.data
    } catch (error) {
        return error.response
    }

    
}


export const GetIdioma = async () => {
    try {
        const response = await axiosInstance.get("/api/idioma/get-idiomas")
        return response.data
    } catch (error) {
        return error.response
    }

    
}