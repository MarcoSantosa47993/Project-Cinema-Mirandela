import React from 'react'
import Button from '../../components/button'
import Funcionariosform from './Funcionariosform'
import { Modal, Table, message } from 'antd'
import { ShowLoading, HideLoading } from '../../redux/loadersSlice'
import { useDispatch } from 'react-redux';
import { GetAllFunc } from '../../apicalls/users'
import { GetAllSessoes} from '../../apicalls/cinemas'
import moment from "moment"

function Historico() {

    const [sessao = [], setSessao] = React.useState([]);
    const [bilhetes = [], setBilhetes] = React.useState([]);
    const dispatch = useDispatch()
    const [searchTerm, setSearchTerm] = React.useState("");
    const [showModal, setShowModal] = React.useState(false);


    const handleDeleteClick = () => {
      console.log("Ícone de exclusão clicado");
      setShowModal(true);
    };
  
    const handleModalClose = () => {
      setShowModal(false);
    };
  

    const handleConfirmDelete = () => {
      // Coloque aqui a lógica para remover a sessão do histórico
      // ...
    
      // Feche o modal após a exclusão
      setShowModal(false);
    };

    const getData = async () => {
        try {
          dispatch(ShowLoading());
          const response = await GetAllSessoes();
    
          if (response.success) {
            setSessao(response.data.sessao)
            setBilhetes(response.data.bilhetes)
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
                  onClick={handleDeleteClick} // Apenas chame a função diretamente aqui
                ></i>
              </div>
            );
          },
        },
    
      ]

      React.useEffect(() => {
        getData();
      }, []);

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
            <Table columns={columns} dataSource={filteredSessoes} pagination={{ pageSize: 5 }} />
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
    <Button  title="Confirmar " type="button" onClick={handleConfirmDelete} />
  </div>
</Modal>
        </div>
      );
    }
  


export default Historico
