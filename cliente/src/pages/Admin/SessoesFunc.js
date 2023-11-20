import React from 'react'
import Button from '../../components/button'
import Funcionariosform from './Funcionariosform'
import { Table, message } from 'antd'
import { ShowLoading, HideLoading } from '../../redux/loadersSlice'
import { useDispatch } from 'react-redux';
import { DemoteFuncionario, GetAllFunc } from '../../apicalls/users'
import {Modal, Tabs} from "antd"
import { GetAllSessoesbyFunc } from '../../apicalls/cinemas'
import {GBilhetesbyFunc} from "../../apicalls/bilhetes"
import moment from "moment"
import { set } from 'mongoose'

function SessoesFunc({funcionario}) {
    const dispatch = useDispatch()
    const [sessao = [], setSessao] = React.useState([]);



    const getDataFunc = async (user) => {
        const usuario = {
            usuario: user
          };
        try {
          dispatch(ShowLoading());
          
          const response = await GetAllSessoesbyFunc(usuario)
    
          if (response.success) {
          setSessao(response.data)
      
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

     
   
      React.useEffect(() => {
        getDataFunc(funcionario);
       
      }, []); 

      React.useEffect(()=>{
        console.log(sessao)
      },[sessao])
      



const columns = [
        {
          title: "Nome da Sessão",
          dataIndex: "nome",
          render: (text, record) => {
            return record.nome
          }
        },
        {
          title: "Data",
          dataIndex: "data",
          align: 'center',
          render: (text, record) => {
            return moment(text).format("DD-MM-YYYY")
          }
        },
        {
          title: "Hora",
          render: (text, record) => {
            return record.hora
          }
        },
        {
          title: "Filme",
          dataIndex: "filme",
          render: (text, record) => {
            return record.filme.titulo;
          }
        },
        {
          title: "Preço Bilhete",
          dataIndex: "precobilhete",
          align: 'center',
          render: (text, record) => {
            return `${text} €`;  // Adiciona o símbolo do euro ao valor.
          }
        },
        {
          title: "Vendas",
          dataIndex: "bilhetes",
          align: 'center',
          render: (text, record) => {
            // Filtrar bilhetes pelo ID do funcionário E pelo ID da sessão
            const bilhetesDoFuncionario = sessao.bilhetes.filter(bilhete => 
              bilhete.user === funcionario._id && bilhete.sessao._id === record._id
            );
            return bilhetesDoFuncionario.length;
          } 
        },
        {
          title: "Total",
          dataIndex: "total",
          align: 'center',
          render: (text, record) => {
            // Filtrar bilhetes pelo ID do funcionário E pelo ID da sessão
            const bilhetesDoFuncionario = sessao.bilhetes.filter(bilhete => 
              bilhete.user === funcionario._id && bilhete.sessao._id === record._id
            );
            return bilhetesDoFuncionario.length * record.precobilhete + " €";
          } 
        },
        {
          title: "Estado",
          dataIndex: "estado",
          render: (text, record) => {
            return record.estado
          }
        },
        {

        }
    ]

  return (
    <div>
        <div className='mt-3'>
       <Table columns={columns} dataSource={sessao.sessoes} pagination={{pageSize: 10}} />
       </div>
    </div>
  )
}

export default SessoesFunc
