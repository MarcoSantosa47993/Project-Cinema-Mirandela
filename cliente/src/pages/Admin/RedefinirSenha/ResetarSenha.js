import React, { useEffect, useState } from 'react'; // Import useState
import { Form, message } from 'antd';
import Button from "../../../components/button";
import { useNavigate } from 'react-router-dom'; // Removed unused imports
import { useDispatch } from 'react-redux';
import { HideLoading, ShowLoading } from '../../../redux/loadersSlice';
import { useLocation } from 'react-router-dom'; // Removed duplicate import
import { AlterarPassword, VerifyToken } from "../../../apicalls/users";

function ResetarSenha() {
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const token = searchParams.get('token');
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [authorized, setAuthorized] = useState(false); // Moved the useState call to the top level

    useEffect(() => {
        const verifyTokenValidity = async () => {
            if (token) {
                dispatch(ShowLoading());
                const response = await VerifyToken(token);
                dispatch(HideLoading());
                if (response.success) {
                    setAuthorized(true); // If the token is valid, set authorized to true
                } else {
                    message.error('O link de recuperação da senha expirou. Por favor, solicite um novo.');
                    navigate("/login");
                }
            } else {
                navigate("/login");
            }
        };

        verifyTokenValidity();
    }, [dispatch, navigate, token]); // Removed the redundant useEffect hook



 


 useEffect(() => {
   
     if (!token) {
      navigate("/")
     }
 }, [token]);

 // No componente ResetarSenha
const AlterarPass = async (values) => {
    try {
        const { password } = values; // Obtenha apenas a senha dos valores do formulário
        const email = token; // Use o email obtido da URL
        dispatch(ShowLoading());
        const response = await AlterarPassword(email, password); // Passe o email e a senha como argumentos
        dispatch(HideLoading());
        if (response.success) {
            message.success("Password alterada com sucesso");
            navigate("/login")
        } else {
            message.error(response.message);
        }
    } catch (error) {
        dispatch(HideLoading());
        message.error(error.message);
    }
};

    return (
        <div className='flex justify-center h-screen items-center bg-primary'>
          <div className="card p-3 w-400">
            <h1 style={{ textAlign: 'center' }} className="text-xl mb-2">
              Auditório Mirandela<br></br><br></br>
              Recuperar Password
            </h1>
            <hr />
            <Form layout="vertical" className='mt-2'
              onFinish={AlterarPass} // Defina o evento onFinish para chamar a função AlterarPass
            >
              <Form.Item
                label="Password"
                name="password"
                rules={[{ required: true, message: "Por favor coloque uma password! " }]}
              >
                <input type="password" />
              </Form.Item>
              <div className="flex flex-col mt-1 gap-1">
                <Button fullWidth title="ALTERAR" type="submit" />
    
              </div>
            </Form>
          </div>
    
          
        </div>
      )
    }
    



export default ResetarSenha
