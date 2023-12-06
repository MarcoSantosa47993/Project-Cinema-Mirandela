import React from 'react'
import Button from '../../components/button'
import Funcionariosform from './Funcionariosform'
import { Modal, Table, message } from 'antd'
import { ShowLoading, HideLoading } from '../../redux/loadersSlice'
import { useDispatch } from 'react-redux';
import { GetAllFunc } from '../../apicalls/users'
import { DeleteSessaoHist, GetAllSessoes} from '../../apicalls/cinemas'
import moment from "moment"
import { GCompradores } from '../../apicalls/bilhetes'

function Historico() {

    const [sessao , setSessao] = React.useState([]);
    const [sessaoescolhida,Setsessaoescolhida] = React.useState(null)
    const [bilhetes , setBilhetes] = React.useState([]);
    const [bilhetes2 ,setBilhetes2] = React.useState([])
    const dispatch = useDispatch()
    const [searchTerm, setSearchTerm] = React.useState("");
    const [showModal, setShowModal] = React.useState(false);
    const [isSessionsModalOpen, setSessionsModalOpen] = React.useState(false);


    const handleDeleteClick = () => {
      console.log("Ícone de exclusão clicado");
      setShowModal(true);
    };
  
    const handleModalClose = () => {
      setShowModal(false);
    };
  

    const handleConfirmDelete = async () => {
      try {
         dispatch(ShowLoading())
         const response = await DeleteSessaoHist({sessaoId:sessaoescolhida})
         if(response.success)
         {
           message.success(response.message)
         }else{
          message.error(response.message)
         }
         dispatch(HideLoading())
      } catch (error) {
        message.error(error.message)
        dispatch(HideLoading())
      }
      setShowModal(false);
    };




    const handleCompradores2 = async (sessao) => {
      try {
        dispatch(ShowLoading())
          console.log(sessao)
        const compradoresResponse = await GCompradores({ sessaoId: sessao })
        if (compradoresResponse.success) {
          setBilhetes2(compradoresResponse.data)
        }
        else {
          message.error(compradoresResponse)
        }
        dispatch(HideLoading())
      } catch (error) {
        message.error(error.message)
        dispatch(HideLoading())
      }
    }

    const handleCompradores = async () => {
      try {
          console.log(sessao)
        const compradoresResponse = await GCompradores({ sessaoId: sessao })
        if (compradoresResponse.success) {
          setBilhetes(compradoresResponse.data)
        }
        else {
          message.error(compradoresResponse)
        }
        dispatch(HideLoading())
      } catch (error) {
        message.error(error.message)
        dispatch(HideLoading())
      }
    }
  
    const getData = async () => {
        try {
          dispatch(ShowLoading());
          const response = await GetAllSessoes();
    
          if (response.success) {
            setSessao(response.data.sessao)
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
        
         getData();

       
    }, []);

    React.useEffect(() => {
        
      handleCompradores();

    
 }, [sessao]);



      const columns = [
        {
          title: "Id Sessão",
          dataIndex: "_id"
        },
        {
          title: "Nome da Sessão",
          dataIndex: "nome"
        },
        {
          title: "Data",
          dataIndex: "data",
          render: (text, record) => {
            return moment(text).format("DD-MM-YYYY")
          },
          sorter: (a, b) => moment(a.data).isBefore(moment(b.data)) ? -1 : (moment(a.data).isAfter(moment(b.data)) ? 1 : 0)
        },
        {
          title: "Hora",
          dataIndex: "hora",
        },
        {
          title: "Filme",
          dataIndex: "filme",
          render: (text, record) => {
          return record.filme.titulo;
          },
          sorter: (a, b) => a.filme.titulo.localeCompare(b.filme.titulo)
        },
        {
          title: "Preço Bilhetes ",
          dataIndex: "precobilhete",
          align:  'center',
          render: (text, record) => {
            return record.precobilhete + " €"
          }
        }, 
        {
          title: 'Total Faturado',
          dataIndex: 'totalfaturado',
          align: 'center',
          render: (text, record) => {
            // Filtrando os bilhetes para essa sessão específica
            const bilhetesDaSessao = bilhetes.filter(b => b.sessao.toString() === record._id.toString());
            return `${bilhetesDaSessao.length * record.precobilhete} €`;
          },
        },
        
        {
          title: "Total Lugares",
          dataIndex: "totallugares",
          align:  'center',
        },
        {
          title: "Total Disponiveis",
          dataIndex: "totallugares",
          align: 'center',
          render: (text, record) => {
            const bilhetesDaSessao = bilhetes.filter(b => b.sessao.toString() === record._id.toString());
            return `${record.totallugares - bilhetesDaSessao.length}`;
          },
        },
       
        {
          title: 'Estado',
          dataIndex: 'estado',
          sorter: (a, b) => a.estado.localeCompare(b.estado),
        },
        {
          title: "Ações",
          dataIndex: "acoes",
          align: "center",
          render: (text, record) => {
            return (
              <div>
                <i
                  className="ri-delete-bin-line"
                  style={{ color: "red" }}
                  onClick={ () => {
                    handleDeleteClick()
                    Setsessaoescolhida(record._id)}} // Apenas chame a função diretamente aqui
                ></i>
                 <span className='underline ml-2'
         onClick={() => {
          setSessionsModalOpen(true);
          handleCompradores2(record._id)
         }}
       >Bilhetes</span>
     </div>
           
            );
          },
        },
    
      ]

      const columns2 = [
        {
          title: "Id Bilhete",
          dataIndex: "_id"
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
          title: "Estado",
          dataIndex: "estado",
          align: "center",
        },
        
          
      ];


 


      const filteredSessoes = sessao.filter((s) => {
        return s.filme.titulo.toLowerCase().includes(searchTerm.toLowerCase());
      });
      
      // Agora, imprima apenas o título do filme em vez do objeto inteiro
      filteredSessoes.forEach((s) => {
        console.log(s.filme.titulo);
      });

      return (
        <div>
          <div className="mb-3">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Pesquisar sessões..."
            />
          </div>
          <div className='mt-3'>
            <Table columns={columns} dataSource={filteredSessoes} pagination={{ pageSize: 8 }} />
          </div>
    
          <Modal
  title="Confirmação"
  visible={showModal}
  onCancel={handleModalClose}
  footer={null}
>
  <p>
    Ao remover uma sessão do histórico, estará a eliminar os bilhetes da mesma e não será possível recuperar a sessão. Tem a certeza de que deseja continuar?
  </p>
  <div className="flex justify-end gap-1 mt-3">
    <Button title="Cancelar" variant="outline" type="button" onClick={handleModalClose} />
    <Button title="Confirmar " type="button" onClick={handleConfirmDelete} />
  </div>
</Modal>

<Modal
      title="Bilhetes"
      visible={isSessionsModalOpen}
      onCancel={() => setSessionsModalOpen(false)}
      footer={null}
      width={1200}

   >
        <Table columns={columns2} dataSource={bilhetes2} pagination={{ pageSize:5}} />
   </Modal>
        </div>
      );
    }
  


export default Historico