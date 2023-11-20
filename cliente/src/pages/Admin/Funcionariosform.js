import { Modal,Form,Row,Col,message } from 'antd'
import Button from '../../components/button'
import React from 'react'
import { ShowLoading, HideLoading } from '../../redux/loadersSlice'
import { useDispatch } from 'react-redux';
import { CreateFunc, GetUser, UpdateUserFunc } from '../../apicalls/users';



function Funcionariosform({openFuncModal,setOpenFuncModal}) {
  const dispatch = useDispatch();
  const [email, setEmail] = React.useState('');
  const [user, setUser] = React.useState(null);
  const [showExistModal, setShowExistModal] = React.useState(false);
  const [showNotExistModal, setShowNotExistModal] = React.useState(false);
  const [generatedPassword, setGeneratedPassword] = React.useState('');
  const [userName, setUserName] = React.useState('');


  

  const getData = async (value) => {
    try {
      const email = {
        email: value
      };
      dispatch(ShowLoading());
      console.log(email.email)
      const response = await GetUser(email);
      setUser(response); // Atualiza o estado após a resposta assíncrona
      if (response.success) {
        setUser(response.data);
        setShowExistModal(true); // Mostrar modal "Existe"
        message.success(response.message);
      } else {
          if(response.message == "Usuário é um Admin")
          {
            message.error(response.message)
          }
          else if(response.message == "Utilizador já é Funcionário")
          {
            message.error(response.message)
          }
          else{
            const password = Math.random().toString(36).slice(-8); // Gera uma senha aleatória
            setGeneratedPassword(password);
            setShowNotExistModal(true);
          }

      }
      dispatch(HideLoading());
    } catch (error) {
      message.error(error.message);
      dispatch(HideLoading());
    }
  }

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handleButtonClick = async () => {
    if (email.includes('@')) { // verifica se o email tem o "@"
        await getData(email); // Aguarde a conclusão da chamada assíncrona
        console.log(user); // Agora você pode acessar o estado atualizado do usuário
    } else {
        message.error('Insira um e-mail válido.');
    }
};


  const handleMakeEmployeeExists = async (user) => {
        try {
          const usuario = {
            usuario: user
          };
          dispatch(ShowLoading());
          const response = await UpdateUserFunc(usuario);
          if (response.success) {
            message.success(response.message); 
            setShowExistModal(false)
          } else {
            message.error(response.message);
          }
          dispatch(HideLoading());
        } catch (error) {
          message.error(error.message);
          dispatch(HideLoading());
        }
    }

    


    const handleMakeEmployeeNoExists = async (email, nome, password) => {
      try {
        const usuario = {
          email: email,
          nome: nome,
          password: password
        };
        dispatch(ShowLoading());
        const response = await CreateFunc(usuario);
        if (response.success) {
          message.success(response.message); 
          setShowExistModal(false)
        } else {
          message.error(response.message);
        }
        dispatch(HideLoading());
      } catch (error) {
        message.error(error.message);
        dispatch(HideLoading());
      }
  }


  return (
    <div>
        <Modal
                title={'Adicionar Funcionário'}
                open={openFuncModal}
                onCancel={() => {
                    setOpenFuncModal(false)
                
                }}
                footer={null}

                

            >
 <div>
 <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginTop: '10px' }}>
    <input style={{marginBottom:"10px"}} type="text" value={email} onChange={handleEmailChange} />
    <Button
      title="Criar Func."
      onClick={handleButtonClick}
      className="button-direita"
      style={{ marginTop: '50px' }} 
    />
</div>
       

      {showExistModal && (
  <Modal
    title={'Utilizador Encontrado'}
    open={showExistModal}
    onCancel={() => setShowExistModal(false)}
    footer={null}
  >
    <div style={{ marginTop: '20px', textAlign: 'center' }}>
      <h2>Detalhes do Utilizador</h2>
      <p>Nome: {user.nome}</p>
      <p>Email: {user.email}</p>

      <p style={{ margin: '20px 0', lineHeight: '1.5' }}>
        Pretende tornar este utilizador em funcionário?
      </p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
        <button
          style={{ marginTop: '10px', padding: '10px 20px' }}
           onClick={() =>{handleMakeEmployeeExists(user)}}
        >
          Sim
        </button>
        <button
          style={{ marginTop: '10px', padding: '10px 20px' }}
          onClick={()=>{setShowExistModal(false)}}
        >
          Não
        </button>
      </div>
    </div>
  </Modal>
)}


    </div>
              
    {showNotExistModal && (
  <Modal
    title={'Email não registrado'}
    open={showNotExistModal}
    onCancel={() => setShowNotExistModal(false)}
    footer={null}
  >
    <div style={{ marginTop: '20px', textAlign: 'center' }}>
      <h2>Email não encontrado</h2>
      <div style={{ margin: '20px 0' }}>
        <p><strong>Email:</strong> {email}</p>
        <p className='mt-2'><strong>Senha autogerada:</strong> {generatedPassword}</p>
        <div className='mt-2'>
          <label>Nome: </label>
          <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="Insira o nome" />
        </div>
      </div>
      <p style={{ margin: '20px 0', lineHeight: '1.5' }}>
        Deseja criar uma conta autogerada com estas informações?
      </p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
        <button
          style={{ marginTop: '10px', padding: '10px 20px' }}
          onClick={()=>{handleMakeEmployeeNoExists(email,userName,generatedPassword)}}
        >
          Sim
        </button>
        <button
          style={{ marginTop: '10px', padding: '10px 20px' }}
          onClick={()=>{setShowNotExistModal(false)}}
        >
          Não
        </button>
      </div>
    </div>
  </Modal>
)}
      


            </Modal>
    
  
        
    </div>
  )
}

export default Funcionariosform
