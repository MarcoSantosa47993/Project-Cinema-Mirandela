import { axiosInstance } from ".";

//fazer pagamento
export const MakePagamento = async (token, amount) => {
    try {
        const response = await axiosInstance.post("/api/bilhetes/make-pagamento", {
            token,
            amount,
        })
        return response.data
    } catch (error) {
        return error.response.data
    }
}


//comprar sessao
export const ComprarBilhete = async (payload) => {
    try {
        const response = await axiosInstance.post("/api/bilhetes/comprar-sessao", payload)
        return response.data
    } catch (error) {
        return error.response.data
    }
}

export const ComprarBilhete2 = async (payload) => {
    try {
        const response = await axiosInstance.post("/api/bilhetes/comprar-sessao-2", payload)
        return response.data
    } catch (error) {
        return error.response.data
    }
}


//get compras de um usuario
export const GetBilhetesOfUser = async () => {
    try {
        const response = await axiosInstance.get("/api/bilhetes/get-bilhetes")
        return response.data
    } catch (error) {
        return error.response
    }
}

export const GetBilhetesOfId = async (payload) => {
    try {
        const response = await axiosInstance.post("/api/bilhetes/get-id-bilhetes",payload)
        return response.data
    } catch (error) {
        return error.response
    }
}

export const GCompradores = async (payload) => {
    try {
        const response = await axiosInstance.post("/api/bilhetes/get-all-compradores", payload)
        return response.data
    } catch (error) {
        return error.response
    }
}

export const EliminarBilhete = async (payload) => {
    try {
        const response = await axiosInstance.post("/api/bilhetes/delete-bilhete", payload)
        return response.data

    } catch (error) {
        return error.response
    }
}

export const EliminarTodosBilhetes = async (payload) => {
    try {
        
        const response = await axiosInstance.post("/api/bilhetes/delete-all-bilhetes-by-sessao", payload)
        return response.data

    } catch (error) {
        return error.response
    }
}

export const GetAllBilhetes = async () => {
    try {
        const response = await axiosInstance.get("/api/bilhetes/get-all-bilhetes")
        return response.data
    } catch (error) {
        return error.response
    }
}

export const GetAllBilhetes2 = async () => {
    try {
        const response = await axiosInstance.get("/api/bilhetes/get-all-bilhetes2")
        return response.data
    } catch (error) {
        return error.response
    }
}


export const ReservarLugares = async (payload) => {
    try {
        
        const response = await axiosInstance.post("/api/bilhetes/reservar-lugar", payload)
        return response.data

    } catch (error) {
        return error.response
    }
}

export const ReservarLugares2 = async (payload) => {
    try {
        
        const response = await axiosInstance.post("/api/bilhetes/reservar-lugar-2", payload)
        return response.data

    } catch (error) {
        return error.response
    }
}

export const EliminarLugarReserva = async (payload) => {
    try {
        
        const response = await axiosInstance.post("/api/bilhetes/eliminar-lugar-reserva", payload)
        return response.data

    } catch (error) {
        return error.response
    }
}

export const EliminarLugarReserva2 = async (payload) => {
    try {
        
        const response = await axiosInstance.post("/api/bilhetes/eliminar-lugar-reserva-2", payload)
        return response.data

    } catch (error) {
        return error.response
    }
}

export const EliminarTodasReservas = async (payload) => {
    try {
        
        const response = await axiosInstance.post("/api/bilhetes/eliminar-todas-reserva",payload)
        return response.data

    } catch (error) {
        return error.response
    }
}

export const GetReservas = async (payload) => {
    try {
        
        const response = await axiosInstance.post("/api/bilhetes/get-reservas",payload)
        return response.data

    } catch (error) {
        return error.response
    }
}

export const GetBilhetes = async (payload) => {
    try {
        const response = await axiosInstance.post("/api/bilhetes/get-all-bilhetes-now",payload)
        return response.data
    } catch (error) {
        return error.response
    }
}

export const EnviarEmail = async (payload) => {
    try {
     
        const response = await axiosInstance.post("/api/bilhetes/enviar-email",payload)
        return response.data
    } catch (error) {
        return error.response
    }
}

export const GBilhetesFunc = async (payload) => {
    try {
        const response = await axiosInstance.post("/api/bilhetes/get-all-bilhetes-func", payload)
        return response.data
    } catch (error) {
        return error.response
    }
}

