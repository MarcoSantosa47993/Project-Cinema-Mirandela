import React, { useEffect } from 'react';
import { Form, message } from 'antd';
import Button from "../../components/button";
import { Link, useNavigate } from 'react-router-dom'
import { LoginUser, VerifyEmail } from '../../apicalls/users'
import { useDispatch } from 'react-redux';
import { HideLoading, ShowLoading } from '../../redux/loadersSlice';
import { Modal } from 'antd';
function Register() {
 const navigate = useNavigate();
 const dispatch = useDispatch();
 const [modalVisible, setModalVisible] = React.useState(false);
 const [email, setEmail] = React.useState('');
 const onFinish = async (values) => {
    try {
      dispatch(ShowLoading())
      const response = await LoginUser(values);
      dispatch(HideLoading())
      if (response.success) {
        message.success(response.message);
        localStorage.setItem("token", response.data);
        window.location.href = "/";
      }
      else {
        message.error(response.message);
      }
    } catch (error) {
      dispatch(HideLoading())
      message.error(error.message)
    }
  }

  const UserExists = async (values) => {
    try {
    
  
      dispatch(ShowLoading())
      const response = await VerifyEmail(values);
      dispatch(HideLoading())
      if (response.success) {
        message.success("Email Enviado!!!");
      }
      else {
        message.error("Este email não está registado");
      }
    } catch (error) {
      dispatch(HideLoading())
      message.error(error.message)
    }
  }

  /*useEffect(() => {
    if (localStorage.getItem('token'))
      navigate("/")
  }, [])*/

  const handleModalOpen = () => {
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    console.log(email)
  };

  return (
    <div className='flex justify-center h-screen items-center bg-primary'>
      <div className="card p-3 w-400">
        <h1 style={{ textAlign: 'center' }} className="text-xl mb-2">
        <i
  className="ri-arrow-left-circle-line mr-1"
  style={{ fontSize: '24px' }} // Defina o tamanho do ícone aqui
  onClick={() => {
    dispatch(ShowLoading());
    navigate("/");
    dispatch(HideLoading());
  }}
></i>
          Cinema Mirandela - Login
        </h1>
        <hr />
        <Form layout="vertical" className='mt-2'
          onFinish={onFinish}
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: "Por favor coloque o seu email! " }]}
          >
            <input type="email" />
          </Form.Item>
          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Por favor coloque uma password! " }]}
          >
            <input type="password" />
          </Form.Item>
          <div className="flex flex-col mt-1 gap-1">
            <Button fullWidth title="LOGIN" type="submit" />
            <Link to="/Register" >Ainda não tem conta? Registar </Link>
            <Link onClick={handleModalOpen} >Esqueceu-se da Password? </Link>

          </div>
        </Form>
      </div>

      <Modal
        title="Recuperação de Senha"
        open={modalVisible}
        onCancel={handleModalClose}
        onOk={()=>UserExists(email)}
        
      >
        <p>Por favor, insira o seu email:</p>
        <input type="email" value={email} onChange={handleEmailChange}/>
      </Modal>
    </div>
  )
}

export default Register;

