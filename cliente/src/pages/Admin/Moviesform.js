import React, { useState } from 'react'
import { Checkbox, Col, Form, Modal, Row, message, Input } from 'antd'
import Button from "../../components/button"
import { useDispatch } from "react-redux";
import { HideLoading, ShowLoading } from "../../redux/loadersSlice";
import { AddMovie, UpdateMovie } from '../../apicalls/movies';
import moment from "moment";
import { Select, Radio } from 'antd';
import { AddIdioma, GetIdioma } from '../../apicalls/idioma';
import { AddDistribuidora, GetDistribuidoras } from '../../apicalls/distribuidora';


function Moviesform({
  showMovieFormModal,
  setShowMovieFormModal,
  selectedMovie,
  setSelectedMovie,
  getData,
  formType

}) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModalVisible2, setIsModalVisible2] = useState(false);
  const [form] = Form.useForm();
  const [newLanguage, setNewLanguage] = useState('');
  const [idiomas, setIdioma] = useState([])
  const [distribuidoras, setdistribuidoras] = useState([])
  const [newDistributor, setNewDistributor] = useState('');
  const [selectedDistributor, setSelectedDistributor] = useState(null);
  const [initialIdioma, setInitialIdioma] = useState(selectedMovie ? selectedMovie.idioma._id : '');
  const showModal = () => {
    setIsModalVisible(true);
  };

  const showModalD = () => {
    setIsModalVisible2(true);
};

  const handleOk = async () => {
    try {
      dispatch(ShowLoading());
      const response = await AddIdioma({ idioma: newLanguage });
      if(response.success) {
        message.success(response.message);
        getIdiomas()
      } else {
        message.error(response.message);
      }
    } catch (error) {
      message.error(error.message);
    } finally {
      dispatch(HideLoading());
      setIsModalVisible(false);
      setNewLanguage('');
    }
  };

  const handleOkD = async () => {
    try {
      dispatch(ShowLoading());
      const response = await AddDistribuidora({ distribuidora: newDistributor }); // Nome da função e parâmetro ajustados
      if(response.success) {
        message.success(response.message);
        getDistribuidoras()  // Nome da função ajustado
      } else {
        message.error(response.message);
      }
    } catch (error) {
      message.error(error.message);
    } finally {
      dispatch(HideLoading());
      setIsModalVisible(false);
      setNewDistributor('');  // Nome da variável de estado ajustada
    }
};


  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleCancelD = () => {
    setIsModalVisible2(false);
  };


  if (selectedMovie) {
    selectedMovie.data = moment(selectedMovie.data).format("YYYY-MM-DD")
  }
  const dispatch = useDispatch();

  const getIdiomas = async () => {
        try {
          const response = await  GetIdioma()
          if(response.success)
          {
            setIdioma(response.data)
          }
          else{
            message.error(response.message)
          }
        } catch (error) {
          message.error(error.message)
        }


  }

  const getDistribuidoras = async () => {
    try {
      const response = await  GetDistribuidoras()
      if(response.success)
      {
        setdistribuidoras(response.data)
      }
      else{
        message.error(response.message)
      }
    } catch (error) {
      message.error(error.message)
    }


}

  

 

  const onFinish = async (values) => {

    try {
      dispatch(ShowLoading())
      let response = null

      if (formType === "add") {
        console.log("Valores: " + JSON.stringify(values))
        response = await AddMovie(values)
      }
      else {
        response = await UpdateMovie({
          ...values,
          movieId: selectedMovie._id
        })

      }
      if (response.success) {
        getData();
        message.success(response.message);
        setShowMovieFormModal(false);
        setSelectedMovie(null)
      }
      else {
        message.error(response.message)
      }
      dispatch(HideLoading());

    } catch (error) {
      dispatch(HideLoading())
      message.error(error.message)
    }


  };

  /*const [filme,setFilme] = useState(true)
  const [outro,setOutro] = useState(true)

  const handleChange=(data)=>{
    if(data == "Filme")
    {
       if(filme==true)
       {
         console.log(data, "our value");
       }
       setFilme(!filme)
      
    }
    if(data == "Outro")
    {
       if(outro==true)
       {
         console.log(data, "our value");
       }
       setOutro(!outro)

    }*/
    React.useEffect(() => {
     
  
      getIdiomas()
    }, []);

    React.useEffect(() => {
     
  
      getDistribuidoras()
    }, []);

    React.useEffect(() => {
     console.log("Idiomas -> " + idiomas)
    }, [idiomas]);

console.log(initialIdioma)
  return (
    <Modal
      title={formType === "add" ? "ADICIONAR FILME" : "EDITAR FILME"}
      open={showMovieFormModal}
      onCancel={() => {
        setShowMovieFormModal(false)
        setSelectedMovie(null)

      }}
      footer={null}
      width={800}
    >



      <Form
        layout='vertical'
        onFinish={onFinish}
        initialValues={selectedMovie}
       
       
      >
        <Row
          gutter={16}
        >
          <Col span={24}>
            <Form.Item label="Nome do Filme" name='titulo' >
              <input type='text' />
            </Form.Item>
          </Col>
          <Col span={24}>
  <Form.Item label="Idade mínima para ver o filme" name="idade">
    <Select>
      <Select.Option value="M/6">M/6</Select.Option>
      <Select.Option value="M/12">M/12</Select.Option>
      <Select.Option value="M/16">M/16</Select.Option>
      <Select.Option value="M/18">M/18</Select.Option>
    </Select>
  </Form.Item>
</Col>

<Col span={24}>
<Form.Item label="Idiomas" name="idiomas">
  <Select
    onSelect={(value) => {
      if (value === 'outro') {
        showModal();
      }
    }}
    defaultValue={initialIdioma} // Certifique-se de que o formato esteja correto
    
  >
    {idiomas.map(idioma => (
      <Select.Option key={idioma._id} value={idioma._id}>
        {idioma.nome}
      </Select.Option>
    ))}
    <Select.Option value="outro">Outro</Select.Option>
  </Select>
</Form.Item>
      <Modal
        title="Novo Idioma"
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Input
          placeholder="Digite o novo idioma"
          value={newLanguage}
          onChange={(e) => setNewLanguage(e.target.value)}
        />
      </Modal>
    </Col>

    <Col span={24}>
  <Form.Item label="Distribuidora" name="distribuidora">
    <Radio.Group
      onChange={(e) => {
        if (e.target.value === 'outro') {
          showModalD();
        }
      }}
    >
      {distribuidoras.map(distribuidora => (
        <Radio key={distribuidora._id} value={distribuidora._id}>{distribuidora.nome}</Radio>
      ))}
      <Radio value="outro">Outro</Radio>
    </Radio.Group>
  </Form.Item>

  <Modal
    title="Nova Distribuidora"
    visible={isModalVisible2}
    onOk={handleOkD}
    onCancel={handleCancelD}
  >
    <Input
      placeholder="Digite a nova distribuidora"
      value={newDistributor}
      onChange={(e) => setNewDistributor(e.target.value)}
    />
  </Modal>
</Col>
    

        </Row>

        <div className="flex justify-end gap-1">
          <Button title="Cancel" variant="outline" type="button"
            onClick={() => {
              setShowMovieFormModal(false)
              setSelectedMovie(null)
            }}
          ></Button>
          <Button title="Salvar" type='submit'> </Button>
        </div>

      </Form>

    </Modal>
  )
}

export default Moviesform
