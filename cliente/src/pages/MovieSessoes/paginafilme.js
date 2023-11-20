import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { HideLoading, ShowLoading } from '../../redux/loadersSlice';
import { Button, message } from 'antd';
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
                            isFluidWidth: true,
                            src: movie.poster,
                            sizes: '(max-width: 480px) 100vw, (max-width: 1200px) 30vw, 360px'
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
                 <h1 className='titulot'>{movie.titulo} <i class="ri-star-line"> {parseFloat(avaliacao).toFixed(1)}/10</i> <a href={movie.trailer} target='_blank'><i class="ri-movie-line" ></i></a></h1>
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

                </div>
    


     



    )




}

export default PaginaFilme
