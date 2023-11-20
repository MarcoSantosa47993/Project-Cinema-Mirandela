import React, { useEffect, useState } from 'react'
import Button from '../../components/button'
import { useNavigate } from "react-router-dom";
import CinemaForm from "./Cinemaform"
import { DeleteCinema, GetAllCinemas } from '../../apicalls/cinemas';
import { HideLoading, ShowLoading } from '../../redux/loadersSlice';
import { Table, message } from 'antd';
import { useDispatch } from 'react-redux';
import Sessao from './Sessoes/index'

function Cinema() {

  const [showTheatreFormModal = false, setShowTheatreFormModal] = useState(false);
  const [selectedTheatre = null, setSelectedTheatre] = useState(null);
  const [formType = "add", setFormType] = useState("add");
  const [theatres = [], setTheatres] = useState([]);
  const [openModalAviso = false, setopenModalAviso] = useState(false)

  const [openSessaoModal = false, setOpenSessaoModal] = useState(false)




  const navigate = useNavigate();
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
  const handleDelete = async (id) => {

    try {
      dispatch(ShowLoading());
      const response = await DeleteCinema({ cinemaId: id });
      if (response.success) {
        message.success(response.message);
        getData();
      } else {
        message.error(response.message);
      }
      dispatch(HideLoading());
    } catch (error) {
      message.error(error.message)
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
          {record.nome !== "Auditório Municipal de Mirandela" && (
        <i
        className="ri-delete-bin-line"
        style={{ color: "red" }}
        onClick={() => {
          handleDelete(record._id);
        }}
        ></i>
      )}
          <i className="ri-pencil-line "
            style={{ color: "#a2840e" }}
            onClick={() => {
              setSelectedTheatre(record);
              setShowTheatreFormModal(true);
              setFormType("edit");
            }}
          ></i>
          <span className='underline'
            onClick={() => {
              setSelectedTheatre(record);
              setOpenSessaoModal(true);
             
            }}
          >Sessões</span>
        </div>
      }

    }


  ]

  useEffect(() => {
    getData();
  }, []);

  



  return (
    <div>
      <div className="flex justify-end mb-1">
        <Button
          variant="outlined"
          title="Add Cinema"
          onClick={() => {
            setFormType("add")
            setShowTheatreFormModal(true)
          }}
        />

      </div>

      <Table columns={columns} dataSource={theatres} />

      {showTheatreFormModal && <CinemaForm
        showTheatreFormModal={showTheatreFormModal}
        setShowTheatreFormModal={setShowTheatreFormModal}
        formType={formType}
        setFormType={setFormType}
        selectedTheatre={selectedTheatre}
        setSelectedTheatre={setSelectedTheatre}
        getData={getData}
      />}

      {openSessaoModal && <Sessao
        openSessaoModal={openSessaoModal}
        setOpenSessaoModal={setOpenSessaoModal}
        cinema={selectedTheatre}
        
      />}
    </div>
  )
}

export default Cinema
