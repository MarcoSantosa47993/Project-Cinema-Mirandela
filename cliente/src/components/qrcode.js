import { Modal } from 'antd'
import React from 'react'
import Barcode from 'react-barcode'

function Qrcode({openQrcode,setopenQrCode,bilhete}) { 
    
 console.log(bilhete.user.nome)
 console.log(bilhete.estado)
  return (
    <div>
      <Modal
            title=""
            open={openQrcode}
            onCancel={() => setopenQrCode(false)}
            width={600}
            footer={null}
        >
            <div className='justify-center flex'>

              


            <Barcode
                      
                        value={bilhete._id}
                       
                    />
          
        </div>
        
        <h3 className='mt-4 justify-center flex'>Nota: Apresente o bar code ao segurança </h3>
        
        </Modal>
    </div>
  )
}

export default Qrcode
