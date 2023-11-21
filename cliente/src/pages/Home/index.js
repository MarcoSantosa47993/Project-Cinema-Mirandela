import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { HideLoading, ShowLoading } from '../../redux/loadersSlice';
import { Col, Row, message,Breakpoint, List } from 'antd';
import { GetAllMovies } from '../../apicalls/movies';
import { useNavigate } from "react-router-dom";




export default function Home() {

  const dispatch = useDispatch();
  const [movies, setMovies] = React.useState([])
  const [selectedMovie, onMovieSelect] = React.useState([])
  const [searchTerm, setSearchTerm] = React.useState("");
  const navigate = useNavigate()
  const [zoomedMovieId, setZoomedMovieId] = React.useState(null);

  const handleImageClick = (movieId) => {
    if (zoomedMovieId === movieId) {
      setZoomedMovieId(null);  // Se a imagem já estiver ampliada, retorne ao tamanho original
    } else {
      setZoomedMovieId(movieId); // Se não estiver ampliada, amplie
    }
  };
  const getData = async () => {
    try {
      dispatch(ShowLoading());
      const response = await GetAllMovies();

      if (response.success) {
        setMovies(response.data)
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



  return (
    <div>
      <input 
        type='text'
        className='search-input'
        placeholder='Pesquisar Filmes'
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    
      <Row gutter={[20]} className='mt-2'>
        {
          movies
            .filter(movie => movie.titulo.toLowerCase().includes(searchTerm.toLowerCase()))
            .map((movie) => (
              <Col key={movie._id}>
                <div className='filmecontainer'
                  onClick={() => navigate(`/movie/paginafilme/${movie._id}`)}>
                  <img className="imghome" src={movie.poster} alt=""></img>
                  <div className='flex justify-center p-1'>
                    <h1 style={{textAlign:'center'}} className='textohome'>
                      {movie.titulo}
                    </h1>
                  </div>
                </div>
              </Col>
            ))
        }
      </Row>
    </div>
)

      }
