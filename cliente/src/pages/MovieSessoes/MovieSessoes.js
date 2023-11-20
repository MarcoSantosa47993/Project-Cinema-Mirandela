import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { HideLoading, ShowLoading } from '../../redux/loadersSlice';
import { Button, message } from 'antd';
import { GetMoviebyId } from '../../apicalls/movies';
import { useNavigate, useParams } from "react-router-dom"
import moment from 'moment'
import { GetAllCinemasByMovie } from '../../apicalls/cinemas';



function MovieSessoes() {
    //get date from query string
    const dispatch = useDispatch();
    const [movie, setMovie] = React.useState([])
    const [cinema, setCinema] = React.useState([])
    const [compradores, setCompradores] = React.useState([])
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

    const GetCinemas = async () => {
        try {
            dispatch(ShowLoading());
            console.log(params.id)
            const response = await GetAllCinemasByMovie({ filme: params.id });
            if (response.success) {
                setCinema(response.data)
            } else {
                message.error(response.message)
            }
            dispatch(HideLoading())
        } catch (error) {
            dispatch(HideLoading())
            message.error(error.message)
        }
    }

   
  

    useEffect(() => {
        getData();

    }, []);

    useEffect(() => {
        GetCinemas();
    }, [])
    return (
        <div>
            <div className='flex justify-between items-center mb-2'>
                <div>
                    <h1 className='text-xl2 uppercase'>
                        {movie.titulo} {/*({movie.idioma})*/}
                        <h1 className='text-xl'>Duração: {movie.duracao} minutos</h1>
                    </h1>
                </div>


            </div>

            <hr></hr>

            <div className='mt-1'>
                <h1 className='text-2xl uppercase'>Cinemas</h1>
            </div>


            <div className='mt-1'>
                {cinema.map((cinema) => (
                    <div className='card p-2 mt-3'>
                        <h1 className='text-md uppercase'>{cinema.nome}</h1>
                        <h1 className='text-sm'>Morada:  {cinema.morada}</h1>
                        <div className='divider' />

                        <div className='flex gap-2'>
                            {cinema.sessoes.map((sessao) => (
                             
                         
                                <div className='card p-1 cursor-pointer'
                                    onClick={() => {
                                        if(sessao.estado == "Criada" && localStorage.getItem('token')!=null)
                                        {
                                          if(sessao.cinema.nome == "Auditório Municipal de Mirandela")
                                          {
                                             navigate(`/book-sessao2/${sessao._id}`)
                                            console.log(sessao.estado )
                                          }
                                          else{
                                            navigate(`/book-sessao/${sessao._id}`)
                                            console.log(sessao.estado )
                                          } 
                                           
                                        }
                                        else if (localStorage.getItem('token')==null) {
                                            navigate('/login')
                                            message.error("Precisa de fazer login para continuar!!")
                                        }
                                        
                                        else if( sessao.estado == "A decorrer" )
                                        {
                                            
                                               message.error("A compra de bilhetes desta sessão encerrou!!")
                                             
                                            
                                        }
                                           
                                        }
                                        
                                    }
                                >

                                    <h1 className='text-sm'>{moment(sessao.data).format("YYYY-MM-DD")}  {sessao.hora}</h1>
                                </div>

                                    
                            ))}

                        </div>


                    </div>

                ))}
            </div>
        </div>


    )
}

export default MovieSessoes
