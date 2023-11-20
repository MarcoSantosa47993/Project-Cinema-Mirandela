import React, { useEffect } from 'react'
import Button from '../../components/button'
import Moviesform from './Moviesform';
import moment from "moment";
import { Table, message } from 'antd';
import { useDispatch } from 'react-redux';
import { HideLoading, ShowLoading } from '../../redux/loadersSlice';
import { DeleteMovie, GetAllMovies } from '../../apicalls/movies';

function Movies() {
    const [movies, setMovies] = React.useState([])
    const [showMovieFormModal, setShowMovieFormModal] = React.useState(false)
    const [selectedMovie, setSelectedMovie] = React.useState(null);
    const [formType, setFormType] = React.useState("add");
    const [searchTerm, setSearchTerm] = React.useState("");

    const dispatch = useDispatch();

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


    const handleDelete = async (movieId) => {
        try {
            dispatch(ShowLoading());
            console.log(movieId)
            const response = await DeleteMovie({
                movieId,
            })
            if (response.success) {
                message.success(response.message)
                getData();
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

    const columns = [
        {
            title: "Poster",
            dataIndex: "poster",
            render: (text, record) => {
                return (
                    <img
                        src={record.poster}
                        alt="poster"
                        style={{ width: 150, height: 159 }}
                        className="br-1"
                    />



                );
            }

        },
        {
            title: "Título",
            dataIndex: "titulo",
            sorter: (a, b) => a.titulo.localeCompare(b.titulo), // for alphabetical sorting
            
            
        },

        {
            title: "Duração",
    dataIndex: "duracao",
    sorter: (a, b) => a.duracao - b.duracao, // for numerical sorting
        },
        {
            title: "Género",
            dataIndex: "genero",
        },
        {
            title: "Idioma",
            dataIndex: "idioma",
            render: (text,record) => {
                return record.idioma.nome
            }
        },
        {
            title: "Data de lançamento",
    dataIndex: "data_lancamento",
    render: (text, record) => {
        return moment(record.data).format("DD-MM-YYYY");
    },
    sorter: (a, b) => moment(a.data).isBefore(moment(b.data)) ? -1 : 1, // sorting based on date
        },
        {
            title: "Ações",
            dataIndex: "acoes",
            render: (text, record) => {
                return <div className="flex gap-1">
                    <i className="ri-delete-bin-line "
                        style={{ color: "red", fontSize: '40px' }}
                        onClick={() => {
                            handleDelete(record._id)
                        }}
                    ></i>
                    <i className="ri-pencil-line "
                        style={{ color: "#a2840e" , fontSize: '40px'}}
                        onClick={() => {
                            setSelectedMovie(record);
                            setShowMovieFormModal(true);
                            setFormType("edit");
                        }}
                    ></i>

                </div>
            }

        }


    ]

    const filteredSessoes = movies.filter((s) => {
        return (
            s.titulo.toLowerCase().includes(searchTerm.toLowerCase())
        
        );
    });
    return (

        <div>
            <div className='mb-2'>
    <input 
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Pesquisar Filmes..."
    />
</div>
            <div className='flex justify-end mb-1 '>
                <Button
                    title="Add Filme"
                    variant='outlined'

                    onClick={() => {
                        setShowMovieFormModal(true);
                        setFormType("add");

                    }}
                />
            </div>

            <Table className="customTable" dataSource={filteredSessoes} columns={columns} pagination={{pageSize: 3}} />

            {showMovieFormModal && <Moviesform

                showMovieFormModal={showMovieFormModal}
                setShowMovieFormModal={setShowMovieFormModal}
                selectedMovie={selectedMovie}
                setSelectedMovie={setSelectedMovie}
                formType={formType}
                getData={getData}

            />}

        </div>
    )
}

export default Movies
