import React from 'react'
import { Modal } from 'antd'
import Button from './button'
import { useDispatch } from 'react-redux';
import { EliminarBilhete } from "../apicalls/bilhetes"
import { Form, Col, Row, Table, message } from 'antd'
import { ShowLoading, HideLoading } from '../redux/loadersSlice'
import { EliminarTodosBilhetes } from '../apicalls/bilhetes';


function Aviso({ openModalAviso, setopenModalAviso, bilhete ,sessao }) {
    const [bilhetes, setBilhetes] = React.useState([])
    const dispatch = useDispatch()
    const [sessoes, setSessao] = React.useState([])

    const handleDeleteBilhete = async () => {
        try {
            dispatch(ShowLoading())
            const response = await EliminarBilhete({ bilhete: bilhete })
            if (response.success) {
                setBilhetes(response.data)
                message.success(response.message)
            }
            else {
                message.error(response.message)
            }
            dispatch(HideLoading())
        } catch (error) {
            message.error(error.message)
            dispatch(HideLoading())
        }
    }
    console.log(bilhete.lugares)

   console.log(!bilhete.user.isAdmin)

    return !bilhete.user.isAdmin && (
        <Modal
            title=""
            open={openModalAviso}
            onCancel={() => setopenModalAviso(false)}
            width={600}
            footer={null}
        >
            <h1 className='justify-center flex'>Aviso</h1>

            <h1 className='text-sm mt-2 justify-center flex items-center textalign-center'>Tem a certeza que pretende eliminar este bilhete que já foi pago? Por favor entre em contacto com o cliente para um possivel reembolso </h1>
            <div className='divider'></div>
            <div className='justify-center flex items-center textalign-center gap-3'>
  <h1 className='text-sm'>{bilhete._id}</h1>
  <h1 className='text-sm'> {bilhete.user.nome}</h1>
  <h1 className='text-sm'>
    {bilhete.lugares.map((lugar, index) => (
      <span key={index}>{lugar.id}{index < bilhete.lugares.length - 1 ? ', ' : ''}</span>
    ))}
  </h1>
</div>
            <div>
                <div className='justify-center flex mt-3 gap-10'>
                    <Button
                        title="Sim"
                        onClick={() => {
                            handleDeleteBilhete()
                            setopenModalAviso(false)
                        }}
                    ></Button>
                    <Button
                        title="Não"
                        onClick={() => {
                            setopenModalAviso(false)

                        }}
                    ></Button>

                </div>

            </div>
        </Modal>
    )
}

export default Aviso
