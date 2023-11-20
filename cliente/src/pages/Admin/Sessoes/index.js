import React, { useEffect } from 'react'
import { Form, Col, Modal, Row, Table, message } from 'antd'
import Button from "../../../components/button"
import { useDispatch } from 'react-redux';
import { ShowLoading, HideLoading } from '../../../redux/loadersSlice'
import { GetAllMovies } from '../../../apicalls/movies'
import { AddSessao, DeleteCinema, GetAllSessoesbyCinema } from "../../../apicalls/cinemas"
import moment from "moment"
import { EliminarTodosBilhetes, GCompradores } from '../../../apicalls/bilhetes';
import { GetCompradores } from "../../../apicalls/bilhetes"
import Compradores from './compradoresForm';
import AvisoBilhete from "../../../components/avisosessao"
import { Bar } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarController, BarElement } from 'chart.js';
import { GetAllFunc } from '../../../apicalls/users';


function Sessao({ openSessaoModal, setOpenSessaoModal, cinema }) {
  Chart.register(CategoryScale, LinearScale, BarController, BarElement);
  const [view, setview] = React.useState("table")
  const [sessao, setSessao] = React.useState([])
  const [openCompradoresModal = false, setopenCompradoresModal] = React.useState(false)
  const [selectedSessao = null, setSelectedSessao] = React.useState(null);
  const [openModalAvisoSessao = false,setopenModalAvisoSessao] = React.useState(false)
  const [movies, setMovies] = React.useState([])
  const [users, setUsers] = React.useState([])
  const [bilhete , setBilhetes] = React.useState([])
  const [bilhetes , setBilhetess] = React.useState([])
  const dispatch = useDispatch()
  const [openStatModal, setOpenStatModal] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState("");
  const [minTime, setMinTime] = React.useState("");
  const [selectedSessaoId, setSelectedSessaoId] = React.useState(null);
  let [onlineCount, setOnlineCount] = React.useState(0);
  let [fisicoCount, setFisicoCount] = React.useState(0);


  const [totalLugares, setTotalLugares] = React.useState("");

  const getData = async () => {
    try {
      dispatch(ShowLoading());
      const moviesResponse = await GetAllMovies();
      if (moviesResponse.success) {
        setMovies(moviesResponse.data);
      } else {
        message.error(moviesResponse.message)
      }

      const sessoesResponse = await GetAllSessoesbyCinema({
        cinemaId: cinema._id
      })
      if (sessoesResponse.success) {
        setSessao(sessoesResponse.data)
      }
      else {
        message.error(sessoesResponse)
      }

      dispatch(HideLoading());
    } catch (error) {
      message.error(error.message)
      dispatch(HideLoading())
    }
  }
  const getAllFunc = async () => {

    try {
      dispatch(ShowLoading());
      const response = await GetAllFunc();
      if (response.success) {
        setUsers(response.data);
      } else {
        message.error(response.message)
      }
    }catch(error){
      message.error(error.message)
    }

  }

  const handleDeleteSessao = async (id) => {
    try {
      dispatch(ShowLoading())
      const response = await EliminarTodosBilhetes({sessaoId: id })
      if (response.success) {
        message.success(response.message)
        setSessao(response.data)
      } else {
        message.error(response.message)
      }
      dispatch(HideLoading())
    } catch (error) {
      message.error(error.message)
    }
  }



    const handleAddShow = async (values) => {
      try {
          dispatch(ShowLoading());
  
          // Se o cinema for "Auditório Municipal de Mirandela" e não houver valor definido para totallugares, defina-o como 440
          if (cinema.nome === "Auditório Municipal de Mirandela" && !values.totallugares) {
              values.totallugares = 440;
          }

          console.log("TotalLugares => " + values.totallugares)
           
          const response = await AddSessao({
              ...values,
              cinema: cinema._id
          });
  
          if (response.success) {
              message.success(response.message);
              getData();
              setview("table");
          }
          else {
              message.error(response.message);
          }
      } catch (error) {
          message.error(error.message);
          dispatch(HideLoading());
      }
  }


  React.useEffect( ()=>{
    console.log("Bilhetesss", sessao)

  }, [sessao])

  React.useEffect(() => {
    if (cinema.nome === "Auditório Municipal de Mirandela") {
        setTotalLugares(440);
    } else {
        setTotalLugares(""); // ou outro valor padrão que você desejar
    }
}, [cinema.nome]);

  const columns = [
    {
      title: "Nome da Sessão",
      dataIndex: "nome",
      align: "center", // Adicionei esta linha para centralizar o conteúdo
    },
    {
      title: "Data",
      dataIndex: "data",
      render: (text, record) => {
        return moment(text).format("DD-MM-YYYY");
      },
      align: "center", // Adicionei esta linha para centralizar o conteúdo
    },
    {
      title: "Hora",
      dataIndex: "hora",
      align: "center", // Adicionei esta linha para centralizar o conteúdo
    },
    {
      title: "Filme",
      dataIndex: "filme",
      render: (text, record) => {
        return record.filme.titulo;
      },
      align: "center", // Adicionei esta linha para centralizar o conteúdo
    },
    {
      title: "Preço Bilhetes ",
      dataIndex: "precobilhete",
      render: (text, record) => {
        return record.precobilhete + " €";
      },
      align: "center", // Adicionei esta linha para centralizar o conteúdo
    },
    {
      title: "Total de Lugares",
      dataIndex: "totallugares",
      align: "center", // Adicionei esta linha para centralizar o conteúdo
    },
    {
      title: "Lugares disponíveis",
      dataIndex: "lugaresDisponiveis",
      render: (text, record) => {
          // Obtendo bilhetes para esta sessão
          const bilhetesDaSessao = sessao.bilhetesPorSessao[record._id] || [];
  
          // Contando bilhetes válidos
          const validBilhetesCount = bilhetesDaSessao.filter(b => b.estado !== 'Cancelado').length;
  
          return record.totallugares - validBilhetesCount;
      },
      align: "center",
  },
  {
    title: "Total Faturado",
    dataIndex: "totalFaturado",
    render: (text, record) => {
        // Obtendo bilhetes para esta sessão
        const bilhetesDaSessao = sessao.bilhetesPorSessao[record._id] || [];

        // Contando bilhetes válidos
        const validBilhetesCount = bilhetesDaSessao.filter(b => b.estado !== 'Cancelado').length;

        return `${validBilhetesCount * record.precobilhete} €`;
    },
    align: "center",
},
    {
      title: "Estado",
      dataIndex: "estado",
      align: "center", // Adicionei esta linha para centralizar o conteúdo
    },
    {
      title: "Ações",
      dataIndex: "acoes",
      render: (text, record) => {
        return (
          <div className="flex gap-1 items-center">
            {
              <i
                className="ri-delete-bin-line "
                style={{ color: "red" }}
                onClick={() => {
                  if (!record.estado || sessao.bilhetesPorSessao[record._id].length === 0) {
                    handleDeleteSessao(record._id);
                    setOpenSessaoModal(false);
                  } else {
                    setopenModalAvisoSessao(true);
                    setSelectedSessao(record);
                  }
                }}
              ></i>
            }
            <i
              className="ri-user-line"
              onClick={() => {
                setopenCompradoresModal(true);
                setSelectedSessao(record);
              }}
            ></i>
            <i
              className="ri-line-chart-line"
              onClick={() => {
                setOpenStatModal(true);
                handleCompradores(record);
              }}
            ></i>
          </div>
        );
      },
      align: "center", // Adicionei esta linha para centralizar o conteúdo
    },
  ];


// 2. Atualizar o handleCompradores para salvar o _id da sessão no estado
const handleCompradores = async (values) => {
  try {
    console.log(values._id)
    const compradoresResponse = await GCompradores({ sessaoId: values._id });
    if (compradoresResponse.success) {
      setBilhetes(compradoresResponse.data);
      setSelectedSessaoId(values._id);  // <-- Adicione esta linha
    } else {
      message.error(compradoresResponse);
    }
    dispatch(HideLoading());
  } catch (error) {
    message.error(error.message);
    dispatch(HideLoading());
  }
};

// 3. Atualizar o useEffect para processar bilhetes sempre que selectedSessaoId muda
useEffect(() => {
  if (sessao && sessao.bilhetesPorSessao && selectedSessaoId) {  // <-- Certifique-se de que temos um selectedSessaoId
    processBilhetes(sessao.bilhetesPorSessao, selectedSessaoId);  // <-- Use o selectedSessaoId aqui
    console.log(onlineCount);
    console.log(fisicoCount);
  }
}, [sessao, selectedSessaoId]); 



  useEffect(() => {
    getData();
    
  }, [])

  useEffect(() => {
    getAllFunc();
    
  }, [])

  const processBilhetes = (bilhetesPorSessao, sessaoId) => {
    let online = 0;
    let fisico = 0;

    const bilhetesDaSessao = bilhetesPorSessao[sessaoId];

    if (!bilhetesDaSessao) {
      console.log("Nenhum bilhete encontrado para a sessão ID:", sessaoId);
      console.log(bilhetesDaSessao)
      return;
    }

    const validBilhetes = bilhetesDaSessao.filter(b => b.estado !== 'Cancelado');

    validBilhetes.forEach(bilhete => {
        if (bilhete.user.isAdmin || bilhete.user.isFunc) {
            fisico++;
        } else if (!bilhete.user.isAdmin && !bilhete.user.isFunc) {
            online++;
        }
    });

    setOnlineCount(online);
    setFisicoCount(fisico);
};
const data = {
  labels: ['Online', 'Func/Admin'],
  datasets: [
      {
          label: 'Número de Compradores',
          data: [onlineCount, fisicoCount],
          backgroundColor: [
              'rgba(255, 99, 132, 0.2)', 
              'rgba(54, 162, 235, 0.2)'
          ],
          borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)'
          ],
          borderWidth: 1,
      },
  ],
};

const options = {
  scales: {
      y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          }
      },
  },
};

useEffect(() => {
  const currentDate = new Date();
  currentDate.setHours(currentDate.getHours() + 2); // Adicionando 2 horas
  const formattedDate = currentDate.toISOString().split("T")[0];
  const formattedTime = currentDate.toISOString().split("T")[1].substring(0, 5);
  setMinTime(formattedTime);
}, []);

const validateTime = (_, value) => {
  if (selectedDate === new Date().toISOString().split("T")[0]) {
      const currentHour = new Date().getHours();
      const currentMinute = new Date().getMinutes();

      const [selectedHour, selectedMinute] = value.split(":").map(Number);

      if (selectedHour < currentHour || (selectedHour === currentHour && selectedMinute < currentMinute)) {
          return Promise.reject("Por favor, escolha uma hora válida!");
      }
  }
  return Promise.resolve();
};

  return (
    <Modal
      title=""
      open={openSessaoModal}
      onCancel={() => setOpenSessaoModal(false)}
      width={1600}
      footer={null}

    >
      <h1 className='text-primary text-xl uppercase mb-1'>
        Cinema : {cinema.nome}
      </h1>
      <hr />

      <div className='flex justify-between mt-1 mb-1 items-center'>
        <h1 className='text-md uppercase'>
          {view === "table" ? "Sessões" : "Add Sessão"}
        </h1>
        {view === "table" && <Button
          variant="outline"
          title="Add Sessão"
          onClick={() => {
            setview("form");
          }}
        />}
      </div>

      {view === "table" && (
        <Table columns={columns} dataSource={sessao.sessoesValidas} />
      )}

      {view === "form" && <Form layout='vertical'
        onFinish={handleAddShow}
      >

        <Row gutter={[16, 16]}>
          <Col span={8}>
            <Form.Item label="Nome da sessao " name='nome' rules={[{ required: true, message: "Insira o nome do Show! " }]}>
              <input />

            </Form.Item>

          </Col>
          <Col span={8}>
                <Form.Item label="Data" name='data' rules={[{ required: true, message: "Insira uma data!" }]}>
                    <input type="date" min={new Date().toISOString().split("T")[0]}
                        onChange={(e) => {
                            setSelectedDate(e.target.value);
                            if (e.target.value === new Date().toISOString().split("T")[0]) {
                                const currentDate = new Date();
                                const formattedTime = currentDate.toISOString().split("T")[1].substring(0, 5);
                                setMinTime(formattedTime);
                            } else {
                                setMinTime("00:00");
                            }
                        }}
                    />
                </Form.Item>
            </Col>
            <Col span={8}>
                <Form.Item label="Hora" name='hora' rules={[{ required: true, message: "Insira a Hora do show!" }, { validator: validateTime }]}>
                    <input type="time" min={minTime} />
                </Form.Item>
            </Col>

          <Col span={8}>
            <Form.Item label="Preço bilhete " name='precobilhete' initialValue={3.5}>
              <input type="number" step="any" ></input>

            </Form.Item>

            </Col>
            <Col span={8}>
    <Form.Item label="Filme" name='filme' rules={[{ required: true, message: "Insira o Filme!" }]}>
        <select>
            <option value="">Selecione o Filme </option>
            {movies.map((movie) => (
                <option value={movie._id}>{movie.titulo}</option>
            ))}
        </select>
    </Form.Item>
</Col>
<Col span={8}>
    {cinema.nome !== "Auditório Municipal de Mirandela" && (
        <>
            <Form.Item label="Total Lugares" name='totallugares' rules={[{ required: true, message: "Insira o total de lugares! " }]}>
                <input 
                    type="number" 
                    value={totalLugares} 
                    onChange={(e) => {
                        if (cinema.nome !== "Auditório Municipal de Mirandela") {
                            setTotalLugares(e.target.value);
                        }
                    }} 
                />
            </Form.Item>
        </>
    )}
</Col>
        </Row>
       

        <div className='flex justify-end mt-1 gap-1'>
          <Button
            variant="outlined"
            title="Cancel"
            onClick={() => {
              setview("table")
            }}
          />
          <Button
            variant="contained"
            title="SAVE"
            type="submit"
          />



        </div>
      </Form>}
      {openCompradoresModal && <Compradores
        openCompradoresModal={openCompradoresModal}
        setopenCompradoresModal={setopenCompradoresModal}
        sessao={selectedSessao}

      />}

      {openModalAvisoSessao && <AvisoBilhete
        openModalAvisoSessao = {openModalAvisoSessao}
        setopenModalAvisoSessao = {setopenModalAvisoSessao}
        sessao={selectedSessao}
              />}

{openStatModal && (
      <Modal
        title="Estatísticas"
        visible={openStatModal}
        onCancel={() => setOpenStatModal(false)}
        width={500}
        footer={null}
      >
        <Bar data={data} options={options} />
      </Modal>
    )}
        
    </Modal>

    
  )
}

export default Sessao
