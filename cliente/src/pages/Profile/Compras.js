
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
    const [showOptions, setShowOptions] = useState(false); // Estado para controlar a exibição das opções

    const handleFacebookShare = () => {
        const url = encodeURIComponent("https://www.youtube.com/?hl=pt-PT&gl=PT"); // O URL que você deseja compartilhar
        const text = encodeURIComponent("Teste"); // O texto da sua publicação
    
        const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}&t=${text}`;
    
        window.open(shareUrl, '_blank');
    };

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
                .map((bilhete) => (<Col span={12} >

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
                            Lugares: {bilhete.lugares.map(lugar => lugar.name).join(", ")}
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
    <FaShareAlt 
        style={{ marginLeft: '10px', cursor: 'pointer' }} 
        onClick={() => setShowOptions(prev => !prev)} 
    />

    {showOptions && (
        <div style={{ marginLeft: '10px', display: 'flex', background: 'white', boxShadow: '0px 0px 5px rgba(0,0,0,0.2)', zIndex: 1 }}>
            <div style={{ cursor: 'pointer', padding: '10px' }} onClick={handleFacebookShare}>
                <FaFacebook /> Facebook
            </div>
            <div style={{ cursor: 'pointer', padding: '10px' }} onClick={() => {/* Função de compartilhar no Twitter */}}>
                <FaTwitter /> Twitter
            </div>
        </div>
    )}
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
