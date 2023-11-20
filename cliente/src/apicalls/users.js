const {axiosInstance} = require(".");

// Resgistar novo usuario
export const RegisterUser = async(payload) => {
    try {
        const response = await axiosInstance.post("/api/users/register",payload);
        return response.data;
    } catch (error) {
        return error.response;
    }
};

//Autenticar usuario
export const LoginUser = async(payload) => {
    try {
        const response = await axiosInstance.post("/api/users/login",payload)
        return response.data;
    } catch (error) {
        return error.message;
    }
};

export const VerifyEmail = async(email) => {
    try {
        
        const response = await axiosInstance.get("/api/users/recuperar-password", {
            params: { email }, // Send email as a query parameter
          });
        return response.data;
    } catch (error) {
        return error.message;
    }
}

export const AlterarPassword = async (token, password) => {
    try {
        console.log("Aqui" + token)
        console.log("Ali" + password)
        const response = await axiosInstance.post("/api/users/alterarpassword", {
            token: token,
            password: password
        });
        return response.data;
    } catch (error) {
        return error.response ? error.response.data : error.message;
    }
};

//get Utilizador corrente
export const GetCurrentUser = async() =>{
    try {
        const response = await axiosInstance.get("/api/users/get-current-user");
        return response.data;
    } catch (error) {
        return error;
        
    }
}

//Autenticar usuario
export const GetUser = async(payload) => {
    try{
        const response = await axiosInstance.post("/api/users/get-user",payload);
        return response.data;
    }catch(error) {
        return error;
    }
 
};

export const UpdateUserFunc = async (payload)=> {
    try {
        const response = await axiosInstance.post("/api/users/user-to-func",payload)
        return response.data;
    }catch(error) {
        return error;
    }
}

export const GetAllFunc = async () => {
    try {
        const response = await axiosInstance.get(("/api/users/get-all-func"))
        return response.data
    } catch (error) {
        return error.response
    }
}


export const CreateFunc = async (payload)=> {
    try {
        const response = await axiosInstance.post("/api/users/create-func",payload)
        return response.data;
    }catch(error) {
        return error;
    }
}


export const DemoteFuncionario = async (payload)=> {
    try {
        const response = await axiosInstance.post("/api/users/func-to-user",payload)
        return response.data;
    }catch(error) {
        return error;
    }
}


export const VerifyToken = async (token) => {
    try {
      const response = await fetch(`/api/users/verify?token=${token}`);
      if (!response.ok) {
        // Handle a non-ok response gracefully
        const errorBody = await response.json(); // Assuming the server sends a JSON response with an error message
        return {
          success: false,
          message: errorBody.message || 'Token verification failed.',
        };
      }
      const data = await response.json();
      return data; // Returns the result of the verification
    } catch (error) {
      console.error("There was a problem with the fetch operation: ", error);
      return {
        success: false,
        message: error.message || 'Network error occurred.',
      };
    }
  };


