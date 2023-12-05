import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { HideLoading, ShowLoading } from '../../redux/loadersSlice';
import { Button, message } from 'antd';
import { GetMoviebyId } from '../../apicalls/movies';
import { useNavigate, useParams } from "react-router-dom"
import moment from 'moment'
import { GetSessaoById } from '../../apicalls/cinemas';
import StripeCheckout from 'react-stripe-checkout';
import { GetCurrentUser } from '../../apicalls/users';
import { SetUser } from "../../redux/usersSlice";
import { ComprarBilhete, MakePagamento } from '../../apicalls/bilhetes';
import Lugares from '../../components/lugares'

function BookSessao2() {
  const { user } = useSelector((state) => state.users);
  const [sessao, setSessao] = React.useState(null)
  const [selectedLugares, setSelectedSeats] = React.useState([]);
  const params = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate()
  const [windowWidth, setWindowWidth] = React.useState(window.innerWidth);

  const getData = async () => {
    try {
      dispatch(ShowLoading())
      const response = await GetSessaoById({ sessaoId: params.id, })
      if (response.success) {
        setSessao(response.data)
      } else {
        message.error(response.message)
      }
      dispatch(HideLoading())
    } catch (error) {
      message.error(error.message)
      dispatch(HideLoading())
    }
  }
  const getCurrentuser = async () => {
    try {
      dispatch(ShowLoading())
      const response = await GetCurrentUser();
      dispatch(HideLoading())
      if (response.success) {
        dispatch(SetUser(response.data))
      }
      else {
        dispatch(SetUser(null))
        message.error(response.message)
      }
    } catch (error) {
      dispatch(HideLoading())
      dispatch(SetUser(null))
      message.error(error.message)
    }
  }

  

 

  useEffect(() => {
    getData();
    if (localStorage.getItem('token')) {
      getCurrentuser();
    }

  }, []);


  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if(sessao)
    {
       console.log("Sessao -> " + JSON.stringify(sessao.sessao))
    }
   
  }, [sessao])



  {
    return sessao && (

      <div>
        {/*show info*/}

        <div className='ola'>
          <div>
            <h1 className='text22'>  {windowWidth <= 768
              ? sessao.sessao.filme.titulo
              : sessao.sessao.cinema.nome}</h1>
           
          </div>

          <div>
            <h1 className='text22'> {windowWidth <= 768
              ? <p></p>
              : sessao.sessao.filme.titulo}</h1>
          </div>
          <div>
            <h1 className='text3'>{moment(sessao.sessao.data).format('DD/MM/yyyy')}
           
            </h1>

          </div>
        </div>

        {/*lugares*/}
       
        <Lugares />
      





       

      </div>)
  }














}


export default BookSessao2
