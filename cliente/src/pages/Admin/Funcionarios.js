import React from 'react'
import Button from '../../components/button'
import Funcionariosform from './Funcionariosform'
import { Table, message } from 'antd'
import { ShowLoading, HideLoading } from '../../redux/loadersSlice'
import { useDispatch } from 'react-redux';
import { DemoteFuncionario, GetAllFunc } from '../../apicalls/users'
import {Modal, Tabs} from "antd"
import HistoricoFuncionario from './HistoricoFuncionario'
import SessoesFunc from './SessoesFunc'
import { GCompradores, GetAllBilhetes, GetAllBilhetes2 } from '../../apicalls/bilhetes'




function Funcionarios() {
  const [funcionarios = [], setFuncionarios] = React.useState([]);
  const dispatch = useDispatch()

  const [isSessionsModalOpen, setSessionsModalOpen] = React.useState(false);
  const [funcionario, setFuncionario] = React.useState();
  const [bilhetes , setBilhetes ] = React.useState([])
  
  
  const getDataFunc = async () => {
    try {
      dispatch(ShowLoading());
      const response = await GetAllFunc();

      if (response.success) {
        setFuncionarios(response.data)
      } else {
        message.error(response.message)
        dispatch(HideLoading());
      }
      dispatch(HideLoading());
    } catch (error) {
      message.error(error.response)
      dispatch(HideLoading());
    }
  }

  // Primeiro, recuperar todos os bilhetes com a função getBilhetes
const getBilhetes = async () => {
  try {
    dispatch(ShowLoading());
    const response = await GetAllBilhetes2();

    if (response.success) {
      setBilhetes(response.data);
      getCountByFuncionario(response.data);  // Chamada para contar bilhetes por funcionário
    } else {
      message.error(response.message);
      dispatch(HideLoading());
    }
    dispatch(HideLoading());
  } catch (error) {
    message.error(error.response);
    dispatch(HideLoading());
  }
};

const getCountByFuncionario = (funcionario) => {

  const bilhetesDoFuncionario = bilhetes.filter(bilhete => bilhete.user._id === funcionario._id && bilhete.estado !== "Cancelado");
  return bilhetesDoFuncionario.length;
};


const calcularTotalFaturado = (funcionario) => {
  if (bilhetes && bilhetes.length > 0) {
    // Encontrar todos os bilhetes vendidos por este funcionário e que não estão cancelados
    const bilhetesDoFuncionario = bilhetes.filter(bilhete => bilhete.user._id === funcionario._id && bilhete.estado !== "Cancelado");
    console.log('Bilhetes do Funcionário:', bilhetesDoFuncionario);  // Log the array to the console
    
    // Calcular o total faturado por este funcionário
    const totalFaturado = bilhetesDoFuncionario.reduce((total, bilhete, index) => {
      if (!bilhete.sessao) {
        console.warn('Bilhete sem sessão encontrada:', bilhete);
        return total;  // Retorna o total atual se não houver sessão
      }
      return total + (bilhete.sessao ? bilhete.sessao.precobilhete : 0);
    }, 0);
    return (totalFaturado.toFixed(2) + " €");
  } else {
    return "0 €";  // ou retornar "0 €" se preferir
  }
};




  
  

  const DemoteEmployee = async (user) => {
    try {
      const usuario = {
        usuario: user
      };
      dispatch(ShowLoading());
      const response = await DemoteFuncionario(usuario);
      if (response.success) {
        message.success(response.message);

        // Atualizar a lista de funcionários após demitir um funcionário.
        const updatedFuncionarios = funcionarios.filter(funcionario => funcionario.email !== user.email);
        setFuncionarios(updatedFuncionarios);
        
      } else {
        message.error(response.message);
      }
      dispatch(HideLoading());
    } catch (error) {
      message.error(error.message);
      dispatch(HideLoading());
    }
}


  const columns = [

    {
      title: "Nome",
      dataIndex: "nome",
    },
    {
      title: "Email",
      dataIndex: "email",
    },
    // Na sua renderização de coluna:
{
  title: "Total de Vendas",
  align: "center",
  render: (text, record) => {
    return getCountByFuncionario(record);
  }
},
{
  title: "Total de Faturado",
  align: "center",
  render: (text, record) => {
    return calcularTotalFaturado(record)
  }
},
    {
      title: "Ações",
      dataIndex: "acoes",
      render: (text, record) => {
        return <div className="flex gap-1">
          <i className="ri-delete-bin-line "
            style={{ color: "red" }}
            onClick={() => {
             DemoteEmployee(record)
            }}
          ></i>
        
    
         <span className='underline'
         onClick={() => {
          setSessionsModalOpen(true);
          setFuncionario(record)
          
         }}
       >Sessões</span>
     </div>
      }


    }

  ]
  React.useEffect(() => {
    getDataFunc();
  }, []);
  React.useEffect(() => {
    getBilhetes();
  }, []);

  React.useEffect(() => {
    console.log(bilhetes)
  }, [bilhetes]);
    const [openFuncModal = false, setOpenFuncModal] = React.useState(false)
  return (




    <div>  
       <div className="flex justify-end mb-1">
       <Button
          variant="outlined"
          title="Add Funcionario"
          onClick={() => {
           setOpenFuncModal(true)
          }}
        >Add Funcionario</Button>
        </div>  
       <Table columns={columns} dataSource={funcionarios} />
      <div className="flex justify-end mb-1">
      

    {openFuncModal && <Funcionariosform
        openFuncModal={openFuncModal}
        setOpenFuncModal={setOpenFuncModal}
      
      />}

      </div>
      {isSessionsModalOpen && (
   <Modal
      title="Sessões"
      visible={isSessionsModalOpen}
      onCancel={() => setSessionsModalOpen(false)}
      footer={null}
      width={1000}
   >
        <Tabs defaultActiveKey="1">~
         <Tabs.TabPane tab="Sessões Ativas" key="1"><SessoesFunc funcionario={funcionario}></SessoesFunc></Tabs.TabPane>
         <Tabs.TabPane tab="Historico Sessões" key="2"><HistoricoFuncionario funcionario= {funcionario}></HistoricoFuncionario></Tabs.TabPane>
         
      </Tabs>
   </Modal>
)}
    </div>
  )
}

export default Funcionarios
