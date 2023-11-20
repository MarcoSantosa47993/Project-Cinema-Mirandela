import React from 'react'
import { Modal } from 'antd'
import { Form, Col, Row, Table, message } from 'antd'
import {Button} from 'antd'


function AvisoDef({  show,setshow,place,onConfirm }){
    const handleConfirm = () => {
        onConfirm(place);
        setshow(false);
      };
    
return show && (<Modal
    title="Aviso de Responsabilidade"
          open={show}
          onCancel={() => setshow(false)}
          width={600}
          footer={
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
              <Button style={{backgroundColor:'#6654DA',color:'white'}} onClick={handleConfirm}>Sim</Button>
              <Button style={{backgroundColor:'#6654DA',color:'white'}} onClick={() => setshow(false)}>Não</Button>
            </div>
          }
>
<p>
            Este lugar é destinado a pessoas com deficiência. Por favor, respeite e ceda o lugar caso alguém com necessidades especiais precise utilizá-lo.
            </p>
          <p style={{alignItems:'center', display:'flex',justifyContent:'center', marginTop:'20px'}}>
            Deseja continuar?
          </p>

</Modal>
 )
    
 
};

export default AvisoDef;