import React from 'react'
import Button from '../../components/button'
import Funcionariosform from './Funcionariosform'
import { Table, message } from 'antd'
import { ShowLoading, HideLoading } from '../../redux/loadersSlice'
import { useDispatch } from 'react-redux';
import { GetAllFunc } from '../../apicalls/users'
import { GetAllBilhetes} from '../../apicalls/bilhetes'
import moment from "moment"

function HistoricoBilhetes() {
       const dispatch = useDispatch()
       const [ bilhetes = [] , setBilhetes] = React.useState()
       const [searchTerm, setSearchTerm] = React.useState('');


    const getData = async () => {
        try {
          dispatch(ShowLoading());
          const response = await GetAllBilhetes();
    
          if (response.success) {
            setBilhetes(response.data)
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

      const filteredBilhetes = bilhetes.filter((bilhete) => {
        const clienteNome = bilhete.user.nome.toLowerCase();
        const idBilhete = bilhete._id.toLowerCase();
      
        return clienteNome.includes(searchTerm.toLowerCase()) || idBilhete.includes(searchTerm.toLowerCase());
      });


      React.useEffect(() => {
        getData()
      },[])

      
      React.useEffect(() => {
        console.log(bilhetes)
      },[bilhetes])

     const columns = [
        {
            title: "Id Bilhete",
            dataIndex: "_id"
          },
          {
            title: "Pagamento_Id",
            dataIndex: "pagamentoId"
          },
          {
            title: "Compradores",
            dataIndex: "users",
            sorter: (a, b) => {
              const orderValue = (user) => {
                  if (user.isFunc) return 1;
                  if (user.isAdmin) return 2;
                  return 3; // Por padrão, assume que é Online
              };
      
              return orderValue(a.user) - orderValue(b.user);
          },
            render: (text, record) => {
              let clienteNome = record.user.nome;
              if (record.user.isFunc) {
                clienteNome = `Funcionário-${clienteNome}`;
              } else if (record.user.isAdmin) {
                clienteNome = `Admin-${clienteNome}`;
              } else {
                clienteNome = `Online-${clienteNome}`;
              }
        
              return clienteNome;
            }
          },
          {
            title: "Email",
            dataIndex: "email",
            render: (text, record) => {
              return record.user.email;
            }
          },
          {
            title: "Filme",
            dataIndex: "filme",
            render: (text, record) => {
              return record.sessao.filme.titulo;
            }
          },
          {
            title: "Dia da compra",
            dataIndex: "createdAt",
            sorter: (a, b) => moment(a.createdAt).valueOf() - moment(b.createdAt).valueOf(),
            render: (text, record) => {
              return moment(text).format("DD-MM-YYYY");
            }
          },
          {
            title: "lugares",
            dataIndex: "lugares",
            render: (text, record) => {
              return record.lugares.map(lugar => lugar).join(", ");
            }
          },
          {
            title: `Estado`,
            dataIndex: "estado",
            },
       
        ];    

  
  return (
    <div>
       <div className="mb-3">
  <input
    type="text"
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    placeholder="Pesquisar bilhetes por nome do comprador..."
  />
</div>
          <div className='mt-3'>
          <Table columns={columns} dataSource={filteredBilhetes} pagination={{ pageSize: 5 }} />
        
    </div>
    </div>
    
  )
}

export default HistoricoBilhetes
