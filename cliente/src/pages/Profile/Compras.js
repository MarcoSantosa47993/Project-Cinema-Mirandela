
import React, { useEffect, useState } from 'react';
import Button from '../../components/button';
import { useNavigate } from "react-router-dom";
import { HideLoading, ShowLoading } from '../../redux/loadersSlice';
import { Table, message } from 'antd';
import { useDispatch } from 'react-redux';
import { GetBilhetesOfUser } from '../../apicalls/bilhetes';
import { Row, Col } from "antd";
import moment from "moment";
import Qrcode from '../../components/qrcode';
import { FaShareAlt, FaFacebook, FaTwitter } from 'react-icons/fa';
function Bilhetes() {

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [bilhetes = [], setBilhetes] = React.useState([])
    const [getbilhetes = null , setgetBilhetes] = React.useState(null)
    const [openQrcode = false, setopenQrCode] = React.useState(false)
 

    const getData = async () => {
        try {
            dispatch(ShowLoading())
            const response = await GetBilhetesOfUser()
            if (response.success) {
                setBilhetes(response.data)
            } else {
                return message.error(response.message)
            }
            dispatch(HideLoading())
        } catch (error) {
            message.error(error.message)
            dispatch(HideLoading())
        }
    }

    useEffect(() => {
        getData()
    }, [])

    
   


    return (
        <div>
            <Row gutter={[16, 16]}>
            {bilhetes
                .filter(bilhete => bilhete.estado === "Comprado" || bilhete.estado === "Validado")
                .map((bilhete) => (<Col span={24} md={12} >

                    <div className='card4 p-2 flex justify-between uppercase'>
                        
                        <div>
                            <h1 className='text-xl'>
                                {bilhete.sessao.filme.titulo} ({bilhete.sessao.filme.idioma})
                            </h1>
                            <div className='divider'></div>
                            <h1 className='text-sm'>
                                {bilhete.sessao.cinema.nome} ({bilhete.sessao.cinema.morada})
                            </h1>
                            <h1 className='text-sm'>
                                Data & Hora: {moment(bilhete.sessao.data).format("DD-MM-YYYY")} - {bilhete.sessao.hora}
                            </h1>
                            <h1 className='text-sm'>
                            Lugares: {bilhete.lugares.map(lugar => lugar).join(", ")}
                            </h1>
                            <h1 className='text-sm'>Preço: € {(
                                bilhete.sessao.precobilhete * bilhete.lugares.length
                            )} </h1>
                            <h1 className='text-sm'>Bilhete Id: {bilhete._id}</h1>

                            <div className='mt-2' style={{ display: 'flex', alignItems: 'center' }}>
    <Button title="Code" onClick={() => {
        setopenQrCode(true);
        setgetBilhetes(bilhete);
    }}>
        Ver qr-code
    </Button>
    <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
    
</div>
                        </div><h1 style={{ fontSize: "15px", marginTop:"10px" }}>Estado: {bilhete.estado}</h1>
                        </div>

                        <div height={10} width={10} >
                       <div className='image-container'>
                            <img  src={bilhete.sessao.filme.poster}
                               
                                className='imagem22 br-1 mt-5'
                            ></img>
                            </div> 
                            <h1 className='text-sm'>
                            Lugares: {
    bilhete.lugares.map((lugar, index) => (
      <span key={index}>
        {typeof lugar === 'object' ? lugar.id : lugar}
        {index < bilhete.lugares.length - 1 ? ', ' : ''}
      </span>
    ))
  }
                            </h1> 
                        </div>

                       
                        

                    </div>
                   

                </Col>   ))}
            </Row>

            {openQrcode && <Qrcode
            openQrcode = {openQrcode}
            setopenQrCode = {setopenQrCode}
            bilhete = {getbilhetes}
            
            >
                
                
                </Qrcode>}
        </div>
    )
}

export default Bilhetes
