import { axiosInstance } from ".";

export const AddCinema = async (payload) => {
    try {
        const response = await axiosInstance.post("/api/cinemas/add-cinema", payload)
        return response.data
    } catch (error) {
        return error.response
    }
}


export const GetAllCinemas = async () => {
    try {
        const response = await axiosInstance.get(("/api/cinemas/get-all-cinemas"))
        return response.data
    } catch (error) {
        return error.response
    }
}

export const UpdateCinema = async (payload) => {
    try {
        const response = await axiosInstance.post(
            "/api/cinemas/update-cinema",
            payload
        )
        return response.data
    } catch (error) {
        return error.response
    }
}

export const DeleteCinema = async (payload) => {
    try {
        const response = await axiosInstance.post(
            "/api/cinemas/delete-cinema",
            payload
        )
        return response.data
    } catch (error) {
        return error.response
    }


}

//Adicionar sessao
export const AddSessao = async (payload) => {
    try {
        const response = await axiosInstance.post("/api/cinemas/add-sessao", payload)
        return response.data
    } catch (error) {
        return error.response
    }
}

//Receber sessoes
export const GetAllSessoesbyCinema = async (payload) => {
    try {
        const response = await axiosInstance.post("/api/cinemas/get-all-sessoes-by-cinema", payload)
        return response.data
    } catch (error) {
        return error.response
    }
}

//Receber sessoes
export const GetAllSessoesbyCinemaFunc = async (payload) => {
    try {
        const response = await axiosInstance.post("/api/cinemas/get-all-sessoes-by-cinema-func", payload)
        return response.data
    } catch (error) {
        return error.response
    }
}




//Todos os cinemas de um filme
export const GetAllCinemasByMovie = async (payload) => {
    try {

        const response = await axiosInstance.post("/api/cinemas/get-all-cinemas-by-movie", payload)
        return response.data
    } catch (error) {
        return error.response
    }
}

export const GetSessaoById = async (payload) => {
    try {
        console.log(payload)
        const response = await axiosInstance.post("/api/cinemas/get-sessao-by-id", payload)
        return response.data
    }
    catch (error) {
        return error.response
    }
}

export const GetAllSessoes = async () => {
    try {
        const response = await axiosInstance.get(("/api/cinemas/get-sessoes"))
        return response.data
    } catch (error) {
        return error.response
    }
}

export const GetAllSessoesHistoricoFunc = async (payload) => {
    try {
        const response = await axiosInstance.post("/api/cinemas/get-sessoes-historico-func",payload)
        return response.data
    } catch (error) {
        return error.response
    }
}

export const GetAllSessoesbyFunc = async (payload) => {
    try {
        const response = await axiosInstance.post("/api/cinemas/get-sessoes-by-func",payload)
        return response.data
    } catch (error) {
        return error.response
    }
}

export const DeleteSessaoHist = async (payload) =>{
    try {
        const response = await axiosInstance.post("/api/cinemas/delete-sessao-historico",payload)
        return response.data
    } catch (error) {
        return error.response
    }
}
