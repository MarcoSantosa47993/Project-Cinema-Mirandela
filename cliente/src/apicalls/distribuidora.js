import { axiosInstance } from ".";
export const AddDistribuidora = async (payload) => {
    try {
        const response = await axiosInstance.post("/api/distribuidora/add-distribuidora", payload)
        return response.data
    } catch (error) {
        return error.response
    }

    
}

export const GetDistribuidoras = async () => {
    try {
        const response = await axiosInstance.get("/api/distribuidora/get-distribuidoras")
        return response.data
    } catch (error) {
        return error.response
    }

    
}
