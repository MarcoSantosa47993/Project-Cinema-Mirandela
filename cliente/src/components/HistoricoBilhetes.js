import React, { useEffect, useState } from 'react';
import Button from './button';
import { useNavigate } from "react-router-dom";
import { HideLoading, ShowLoading } from '../redux/loadersSlice';
import { Table, message } from 'antd';
import { useDispatch } from 'react-redux';
import { GetBilhetesOfUser } from '../apicalls/bilhetes';
import { Row, Col } from "antd";
import moment from "moment";
import Qrcode from './qrcode';
import { FaShareAlt, FaFacebook, FaTwitter } from 'react-icons/fa';

function HistoricoBilhetes() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [bilhetes = [], setBilhetes] = React.useState([]);
    const [getbilhetes = null, setgetBilhetes] = React.useState(null);
    const [currentPage, setCurrentPage] = React.useState(1);
    const [openQrcode = false, setopenQrCode] = React.useState(false);
    const [showOptions, setShowOptions] = useState(false); // Estado para controlar a exibição das opções

    const getData = async () => {
        try {
            dispatch(ShowLoading());
            const response = await GetBilhetesOfUser();
            if (response.success) {
                setBilhetes(response.data);
            } else {
                return message.error(response.message);
            }
            dispatch(HideLoading());
        } catch (error) {
            message.error(error.message);
            dispatch(HideLoading());
        }
    };

    useEffect(() => {
        getData();
    }, []);

    const pageSize = 4;
    // Calcular os bilhetes a serem exibidos na página atual
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const bilhetesPaginaAtual = bilhetes.slice(startIndex, endIndex);
    console.log(bilhetes.length);
    return (
        <div>
            <div className="bilhetes-container">
                <Row gutter={[16, 16]}>
                {bilhetesPaginaAtual
  .filter(bilhete => 
    bilhete.estado === "Terminado" ||
    bilhete.estado === "Expirado" ||
    bilhete.estado === "Cancelado"
)


  .map((bilhete) => (
                        <Col key={bilhete._id} span={12}>
                            <div className='card p-2 flex justify-between uppercase bilhete-item'>
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
                                        <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                                        </div>
                                    </div>
                                    <h1 style={{ fontSize: "15px", marginTop: "10px" }}>Estado: {bilhete.estado}</h1>
                                </div>

                                <div height={10} width={10}>
                                    <img src={bilhete.sessao.filme.poster}
                                        height={200}
                                        width={200}
                                        className='br-1 mt-5'
                                    ></img>
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
                        </Col>
                    ))}
                </Row>
            </div>
            <div className="pagination">
                <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="pagination-button"
                >
                    Anterior
                </button>
                <span>Página {currentPage}</span>
                <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={endIndex >= bilhetes.length}
                    className="pagination-button"
                >
                    Próxima
                </button>
            </div>
        </div>
    )
}

export default HistoricoBilhetes;
