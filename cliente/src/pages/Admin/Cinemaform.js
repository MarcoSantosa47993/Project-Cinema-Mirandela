import React from 'react'
import { Form, Modal, message } from "antd"
import Button from '../../components/button'
import { useDispatch } from 'react-redux'
import { HideLoading, ShowLoading } from '../../redux/loadersSlice';
import { AddCinema, UpdateCinema } from '../../apicalls/cinemas';

function Cinemaform({
    showTheatreFormModal,
    setShowTheatreFormModal,
    formType,
    setFormType,
    selectedTheatre,
    setSelectedTheatre,
    getData,

}) {
const dispatch = useDispatch();
const onFinish = async (values) =>{
    try {
        dispatch(ShowLoading())
        let response = null;
        if(formType == "add")
        {
            response = await AddCinema(values);
        }
        else{
             values.cinemaId = selectedTheatre._id;
             response = await UpdateCinema(values);

         }
        if(response.success)
        {
            message.success(response.message)
            setShowTheatreFormModal(false)
            setSelectedTheatre(null)
            getData();
        }
        else{
            message.error(response.message)
        }
        dispatch(HideLoading());
    } catch (error) {
        dispatch(HideLoading());
        message.error(error.message)
    }
}

    return (
        <div>
            <Modal
                title={formType == 'add' ? 'Adicionar Cinema' : 'Editar Cinema'}
                open={showTheatreFormModal}
                onCancel={() => {
                    setShowTheatreFormModal(false)
                    setSelectedTheatre(null)
                }}
                footer={null}

            >
                <Form
                    layout='vertical'
                    onFinish={onFinish}
                    initialValues={selectedTheatre}
                >
                    <Form.Item
                        label="Nome"
                        name="nome"
                        rules={[{ required: true, message: "Por favor digite um nome! " }]}
                    >
                        <input type='text' />
                    </Form.Item>
                    <Form.Item
                        label="Morada"
                        name="morada"
                        rules={[{ required: true, message: "Por favor digite uma Morada! " }]}
                    >
                        <textarea type='text' />
                    </Form.Item>

                    <Form.Item
                        label="Telefone"
                        name="telefone"
                        rules={[{ required: true, message: "Por favor digite um Telefone! " }]}
                    >
                        <input type='Number' />
                    </Form.Item>
                    <Form.Item
                        label="Email"
                        name="email"

                    >
                        <input type='email' />
                    </Form.Item>
                    <div className="flex justify-end gap-1">
                        <Button title="Cancel" variant="outline" type="button"
                            onClick={() => {
                                setShowTheatreFormModal(false)
                                setSelectedTheatre(null)
                            }}
                        ></Button>
                        <Button title="Salvar" type='submit'> </Button>
                    </div>
                </Form>



            </Modal>


        </div>
    )
}

export default Cinemaform
