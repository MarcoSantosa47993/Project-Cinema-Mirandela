import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { HideLoading, ShowLoading } from '../../redux/loadersSlice';
import { Button, Modal, message } from 'antd';
import { GetMoviebyId } from '../../apicalls/movies';
import { useNavigate, useParams } from "react-router-dom"
import moment from 'moment'
import ReactImageMagnify from 'react-image-magnify';
import "../../stylesheets/paginafilme.css"


function PaginaFilme() {
    const dispatch = useDispatch();
    const [movie, setMovie] = React.useState([])
    const navigate = useNavigate()
    const params = useParams();

    
    const [isModalVisible, setIsModalVisible] = React.useState(false);
    const [trailerUrl, setTrailerUrl] = React.useState('');

    const extractVideoId = (link) => {
        // Regular expression to extract the video ID from various YouTube link formats
        const regex = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?|watch|.*[?&]v=|.*[?&]vi=))|youtu\.be\/)([^"&?/\s]{11})/;
        const match = link.match(regex);
        if (match && match[1]) {
            return match[1];
        }
        return null;
    };

    const showModal = () => {
        const videoId = extractVideoId(movie.trailer);
        if (videoId) {
            const embedUrl = `https://www.youtube.com/embed/${videoId}`;
            setTrailerUrl(embedUrl);
            setIsModalVisible(true);
        } else {
            console.log("nao deu")
        }
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const getData = async () => {
        try {
            dispatch(ShowLoading());
            const response = await GetMoviebyId(params.id);
            if (response.success) {
                setMovie(response.data)
            } else {
                message.error(response.message)
                dispatch(HideLoading());
            }
            dispatch(HideLoading());
     
        } catch (error) {
            message.error(error.message)
            dispatch(HideLoading());
        }
    }

    useEffect(() => {
        getData();
    }, []);

    const avaliacao = movie.avaliacao
     
    console.log( parseFloat(avaliacao).toFixed(1))

    {/*informação do filme */ }
    return movie  && (
        
            
                <div className='container'>
                 <div className='movie'>
                 <ReactImageMagnify
    {...{
        smallImage: {
            alt: movie.descricao,
            isFluidWidth: false,
            src: movie.poster,
            width: 500, // largura desejada
            height: 600, // altura desejada
        },
        largeImage: {
            src: movie.poster,
            width: 1000,
            height: 1600
        },
        enlargedImagePosition: "over"
    }}
/>
         
                 <div className="details"> 
                 <h1 className='titulot'>{movie.titulo} <i class="ri-star-line"> {parseFloat(avaliacao).toFixed(1)}/10</i> <a  target='_blank' onClick={showModal}><i class="ri-movie-line"></i></a></h1>
                      <div className="atributos">  
                      <span> {movie.descricao}</span>
                      <span className='mt-1'>Realizador: {movie.realizador} </span>
                      
                      <span className='mt-1'>Elenco: {movie.elenco} </span>
                      <span className='mt-1'>Duração: {movie.duracao} minutos</span>
                      <span className='mt-1'>Data de Lançamento: {moment(movie.data).format("DD-MM-YYYY")}</span>
                      <span className='mt-1'>Género: {movie.genero} </span>
                      <span className='mt-1'>Idioma: {movie.idioma ? movie.idioma.nome : 'N/A'} </span>
                      <span className='mt-1'>Idade: {movie.idade} </span>
                      
                      <span className='mt-1'>Distribuidora: {movie.distribuidora ? movie.distribuidora.nome : 'N/A'} </span>
                    </div>
                            <div className="btn">
                      <Button onClick={() => navigate(`/movie/MovieSessoes/${movie._id}?date=${moment().format("YYYY-MM-DD")}`)} >Ver sessões</Button>
                    </div>
                     
                        </div>
                 </div>

                 <Modal
    visible={isModalVisible}
    onCancel={handleCancel}
    closable={false} // Disable the default close (X) button
    footer={null}
    width={1000} // Adjust the width as per your preference
    bodyStyle={{ height: '500px', position: 'relative' }} // Set position to relative
    title={null} // Remove the title
>
    <Button
        className="custom-close-button"
        onClick={handleCancel}
        style={{
            position: 'absolute',
            top: '1px', // Adjust the top position as needed
            right: '1px', // Adjust the right position as needed
            zIndex: 9999, // Ensure it's above the iframe
        }}
    >
       X
    </Button>
    <iframe
        width="100%" // Adjust the width to fill the modal
        height="100%" // Adjust the height to fill the modal
        src={trailerUrl}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
    ></iframe>
</Modal>
  


                </div>
    


     



    )




}

export default PaginaFilme