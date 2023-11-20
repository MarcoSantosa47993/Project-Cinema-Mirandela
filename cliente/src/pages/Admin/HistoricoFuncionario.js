import React from 'react'
import Button from '../../components/button'
import Funcionariosform from './Funcionariosform'
import { Table, message } from 'antd'
import { ShowLoading, HideLoading } from '../../redux/loadersSlice'
import { useDispatch } from 'react-redux';
import { DemoteFuncionario, GetAllFunc } from '../../apicalls/users'
import {Modal, Tabs} from "antd"
import { GetAllSessoesHistoricoFunc } from '../../apicalls/cinemas'
import moment from "moment"


function HistoricoFuncionario({funcionario}) {
    const dispatch = useDispatch()
    const [sessao = [], setSessao] = React.useState([]);
    const [bilhetes = [], setBilhetes] = React.useState([]);

    const getDataFunc = async (user) => {
        const usuario = {
            usuario: user
          };
        try {
          dispatch(ShowLoading());
          const response = await GetAllSessoesHistoricoFunc(usuario);
          console.log('API Response:', response);
    
          if (response.success) {
          setSessao(response.data.historico)
          setBilhetes(response.data.bilhetes)
          console.log(response.data)
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

      React.useEffect(()=>{
        sessao.forEach(s => {
          console.log("Sub-sessão:", s.sessao);
        });
      }, [sessao])


      const columns = [
        {
          title: "Nome da Sessão",
          render: (text, record) => record.sessao?.nome
      },
      {
        title: "Data",
        render: (text, record) => {
            if (record.sessao && record.sessao.data) {
                return moment(record.sessao.data).format("DD-MM-YYYY");
            }
            return "N/A";  // ou qualquer valor padrão que você queira exibir quando não houver data
        }
    },
    {
      title: "Hora",
      render: (text, record) => record.sessao && record.sessao.hora
  },
        {
          title: "Filme",
          dataIndex: "filme",
          render: (text, record) => {
            return record.sessao.filme.titulo;
          }
        },
        {
          title: "Preço Bilhete",
          dataIndex: "precobilhete",
          align: 'center',
          render: (text, record) => {
            return `${record.sessao.precobilhete} €`;  // Adiciona o símbolo do euro ao valor.
          }
        },
        {
          title: "Vendas",
          dataIndex: "bilhetes",
          align: 'center',
          render: (text, record) => {
              // Filtrar bilhetes pelo ID do funcionário E pelo ID da sessão
              const bilhetesDoFuncionario = bilhetes.filter(bilhete => 
                  bilhete.user === funcionario._id && bilhete.sessao === record.sessao._id
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
              const bilhetesDoFuncionario = bilhetes.filter(bilhete => 
                  bilhete.user === funcionario._id && bilhete.sessao === record.sessao._id
              );
              return bilhetesDoFuncionario.length * record.sessao.precobilhete + " €";
          }
      },
      {
        title: "Estado",
        dataIndex: "estado",
        render: (text, record) => {
          return record.sessao.estado
        }
      },
    ]
      React.useEffect(() => {
        getDataFunc(funcionario);
      }, []); // Observe o array vazio aqui, isso garante que o efeito seja executado apenas uma vez
      
  return (
    <div>
        <div className='mt-3'>
       <Table columns={columns} dataSource={sessao} pagination={{pageSize: 6}} />
       </div>
    </div>
  )
}

export default HistoricoFuncionario
