import React from 'react'
import { Modal } from 'antd'
import Button from './button'
import { useDispatch } from 'react-redux';
import { EliminarBilhete } from "../apicalls/bilhetes"
import { Form, Col, Row, Table, message } from 'antd'
import { ShowLoading, HideLoading } from '../redux/loadersSlice'
import { EliminarTodosBilhetes } from '../apicalls/bilhetes';


function AvisoSessao({ openModalAvisoSessao, setopenModalAvisoSessao,sessao }) {
    const dispatch = useDispatch()
    const [sessoes, setSessao] = React.useState([])

   

    const handleDeleteSessao = async () => {
        try {
          dispatch(ShowLoading())
          const response = await EliminarTodosBilhetes({ sessaoId: sessao })
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
        console.log(sessao.estado)
    
      {return sessao.estado &&  (
        <Modal
            title=""
            open={openModalAvisoSessao}
            onCancel={() => setopenModalAvisoSessao(false)}
            width={600}
            footer={null}
        >
              <h1 className='justify-center flex'>Aviso</h1>

<h1 className='text-sm mt-2 justify-center flex items-center textalign-center'>Tem a certeza de que deseja eliminar esta Sessão? Ela ainda não terminou e existem lugares reservados. Se optar por eliminar, todos os clientes serão notificados do cancelamento! Após o término da Sessão, esta será automaticamente removida. </h1>
<div className='divider'></div>
<div className='justify-center flex items-center textalign-center gap-3'>
    <h1 className='text-sm'>{sessao._id}</h1>
    <h1 className='text-sm'> {sessao.filme.titulo}</h1>
</div>
<div>
    <div className='justify-center flex mt-3 gap-10'>
        <Button
            title="Sim"
            onClick={() => {
                handleDeleteSessao()
                setopenModalAvisoSessao(false)
            }}
        ></Button>
        <Button
            title="Não"
            onClick={() => {
                setopenModalAvisoSessao(false)

            }}
        ></Button>

    </div>

</div>

   
            
        
        </Modal>
    )}


    
}

export default AvisoSessao
