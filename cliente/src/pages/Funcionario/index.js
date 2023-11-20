import React from 'react'
import PageTitle from '../../components/PageTitle'
import { Tabs } from 'antd'
import { Table, message } from 'antd';
import { useDispatch } from 'react-redux';
import { GetAllCinemas } from '../../apicalls/cinemas';
import { HideLoading, ShowLoading } from '../../redux/loadersSlice';
import SessaoModal from './Sessao/sessao';

function Func() {
  const [theatres = [], setTheatres] = React.useState([]);
  const [openSessaoModal = false, setOpenSessaoModal] = React.useState(false)
  const [selectedTheatre = null, setSelectedTheatre] = React.useState(null);
  const [sessao = null, setSessao] = React.useState(null);

  const dispatch = useDispatch();
  const getData = async () => {
    try {
      dispatch(ShowLoading());
      const response = await GetAllCinemas();

      if (response.success) {
        setTheatres(response.data)
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
      title: "Nome",
      dataIndex: "nome",
    },
    {
      title: "Morada",
      dataIndex: "morada",
    },
    {
      title: "Telefone",
      dataIndex: "telefone",
    },
    {
      title: "Email",
      dataIndex: "email",
    },
    {
      title: "Ações",
      dataIndex: "acoes",
      render: (text, record) => {
        return <div className="flex gap-1">
         
         
          <span className='underline'
            onClick={() => {
              setSelectedTheatre(record);

              setOpenSessaoModal(true);
             
            }}
          >Sessões Atribuídas</span>
        </div>
      }

    }]
  
  React.useEffect(() => {
    getData();
  }, []);

    return (
        <div>
          <PageTitle title="Funcionário " />
    
          <Tabs defaultActiveKey="1">
             <Tabs.TabPane tab="Cinemas" key="1">
           

             <Table columns={columns} dataSource={theatres} />


             </Tabs.TabPane>
         
          </Tabs>

          {openSessaoModal && <SessaoModal
        openSessaoModal={openSessaoModal}
        setOpenSessaoModal={setOpenSessaoModal}
        cinema={selectedTheatre}
        
      />}
        </div>
      )
}

export default Func
