import React, { useEffect, useState } from 'react'
import { Button, Form, Modal,message } from 'antd'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWheelchair } from '@fortawesome/free-solid-svg-icons';
import AvisoDef from './avisodef';
import { useDispatch } from 'react-redux';
import "../stylesheets/lugares.css"
import { HideLoading, ShowLoading } from '../redux/loadersSlice';
import { EliminarLugarReserva, EliminarTodasReservas, GetBilhetes, GetReservas, ReservarLugares } from '../apicalls/bilhetes';
import io from 'socket.io-client';
let socket;
function Lugarestopo({showMovieFormModal2,
    setShowMovieFormModal2, selectedPlacesParent, setSelectedPlacesParent,handleSelectedPlaces,sessao,user}) {

      const dispatch = useDispatch();
      let lugarclass = "seat"
      const isFirstLoad = React.useRef(true);
      let [lugar, setLugar] = React.useState(null);
      const [bilhete,setBilhete]  = useState([])
      const [timeouts, setTimeouts] = useState({});
      const [reservas , setReservas ] = useState([])
      const [accessiblePlacesList, setAccessiblePlacesList] = useState([]);
  

      const [selectedPlaces, setSelectedPlaces] = useState([]);
      const [showModal, setShowModal] = useState(false);
      const [selectedAccessiblePlace, setSelectedAccessiblePlace] = useState(null);
      const [placesListQ, setPlacesListQ] = useState(generatePlacesList('Q', 19))
      const [placesListP, setPlacesListP] = useState(generatePlacesList('P', 19))
      const [placesListO, setPlacesListO] = useState(generatePlacesList('O', 20))
      const [placesListN, setPlacesListN] = useState(generatePlacesList('N', 22))
      const [placesListM, setPlacesListM] = useState(generatePlacesList('M',22))
      const [placesListL, setPlacesListL] = useState(generatePlacesList('L',22))
      const [placesListK, setPlacesListK] = useState(generatePlacesList('K',22))
      const [placesListJ, setPlacesListJ] = useState(generatePlacesList('J',22))
      const [placesListI, setPlacesListI] = useState([
        { id: 'I1', name: 'I1', isAccessible: false },
  { id: 'D-I1', name: 'D-I1', isAccessible: true },
  { id: 'D-I2', name: 'D-I2', isAccessible: true },
  { id: 'D-I3', name: 'D-I3', isAccessible: true },
  { id: 'I2', name: 'I2', isAccessible: false },
  { id: 'I3', name: 'I3', isAccessible: false },
  { id: 'I4', name: 'I4', isAccessible: false },
  { id: 'I5', name: 'I5', isAccessible: false },
  { id: 'I6', name: 'I6', isAccessible: false },
  { id: 'I7', name: 'I7', isAccessible: false },
  { id: 'I8', name: 'I8', isAccessible: false },
  { id: 'I9', name: 'I9', isAccessible: false },
  { id: 'I10', name: 'I10', isAccessible: false },
  { id: 'I11', name: 'I11', isAccessible: false },
  { id: 'I12', name: 'I12', isAccessible: false },
  { id: 'I13', name: 'I13', isAccessible: false },
  { id: 'I14', name: 'I14', isAccessible: false },
  { id: 'I15', name: 'I15', isAccessible: false },
  { id: 'I16', name: 'I16', isAccessible: false },
  { id: 'I17', name: 'I17', isAccessible: false },
  { id: 'I18', name: 'I18', isAccessible: false },
  { id: 'D-I4', name: 'D-I4', isAccessible: true },
  { id: 'D-I5', name: 'D-I5', isAccessible: true },
  { id: 'I19', name: 'I19', isAccessible: false },
      ])

      useEffect(() => {
        // Conectar-se ao servidor
        socket = io('https://cinema-mirandela2.onrender.com');
        socket.on('lugar-liberado', (data) => {
          console.log(`O lugar ${data.lugarId} foi liberado.`);
          // Verifica se o ID do lugar é da fila I ou de lugares acessíveis na fila I
          if (data.lugarId.startsWith('I') || data.lugarId.startsWith('D-I')) {
            // Atualize a lista placesListI diretamente, para lugares acessíveis e regulares
            setPlacesListI(prevList => freePlaceInList(prevList, data.lugarId));
          } else {
            const listPrefix = data.lugarId[0];
            // Dependendo da primeira letra, atualizamos a lista apropriada
            switch(listPrefix) {
                case 'Q':
                    setPlacesListQ(prevList => freePlaceInList(prevList, data.lugarId));
                    break;
                case 'P':
                    setPlacesListP(prevList => freePlaceInList(prevList, data.lugarId));
                    break;
                case 'O':
                    setPlacesListO(prevList => freePlaceInList(prevList, data.lugarId));
                    break;
                case 'N':
                    setPlacesListN(prevList => freePlaceInList(prevList, data.lugarId));
                    break;
                case 'M':
                    setPlacesListM(prevList => freePlaceInList(prevList, data.lugarId));
                    break;
                case 'L':
                    setPlacesListL(prevList => freePlaceInList(prevList, data.lugarId));
                    break;
                case 'K':
                    setPlacesListK(prevList => freePlaceInList(prevList, data.lugarId));
                    break;
                case 'J':
                    setPlacesListJ(prevList => freePlaceInList(prevList, data.lugarId));
                    break;
                default:
                    console.error("Prefixo de lugar desconhecido:", listPrefix);
            }
          }
        });
        socket.on('lugar-reservado', (data) => {
          console.log(`O lugar ${data.lugarId} na sessão ${data.sessaoId} foi reservado pelo usuário ${data.userId}.`);
          if (data.userId !== user._id) {
            if (data.lugarId.startsWith('I') || data.lugarId.startsWith('D-I')) {
              setPlacesListI(prevList => updatePlaceInList(prevList, data.lugarId, data.userId));
            } else  {
          const listPrefix = data.lugarId[0];
      
          // Dependendo da primeira letra, atualizamos a lista apropriada
          switch(listPrefix) {
              case 'Q':
                  setPlacesListQ(prevList => updatePlaceInList(prevList, data.lugarId,data.userId));
                  break;
              case 'P':
                  setPlacesListP(prevList => updatePlaceInList(prevList, data.lugarId,data.userId));
                  break;
              case 'O':
                  setPlacesListO(prevList => updatePlaceInList(prevList, data.lugarId,data.userId));
                  break;
              case 'N':
                  setPlacesListN(prevList => updatePlaceInList(prevList, data.lugarId,data.userId));
                  break;
              case 'M':
                  setPlacesListM(prevList => updatePlaceInList(prevList, data.lugarId,data.userId));
                  break;
              case 'L':
                  setPlacesListL(prevList => updatePlaceInList(prevList, data.lugarId,data.userId));
                  break;
              case 'K':
                  setPlacesListK(prevList => updatePlaceInList(prevList, data.lugarId,data.userId));
                  break;
              case 'J':
                  setPlacesListJ(prevList => updatePlaceInList(prevList, data.lugarId,data.userId));
                  break;
              default:
                  console.error("Prefixo de lugar desconhecido:", listPrefix);
          }
        }
        }
      });
      
      window.addEventListener('beforeunload', () => {
        socket.emit('cliente_desconectando', { userId :  user._id });
     });
        return () => {
            socket.disconnect();
        };
      }, []);
      

      const getBilhetes = async () => {
        try {
          if (!sessao) {  // Se sessao é null ou undefined
            message.error("Sessão não definida");
            return;
        }
            if (isFirstLoad.current) {
                console.log("Primeira carga, mostrando spinner");
                dispatch(ShowLoading());
            }
    
            const response2 = await GetBilhetes(sessao.sessao);
            console.log("Response from GetBilhetes:", response2); // <- adicione isso
    
            if (response2.success) {
                setBilhete(response2.data);
            } else {
                message.error(response2.message);
            }
    
            if (isFirstLoad.current) {
                setTimeout(() => {
                    console.log("Escondendo spinner após 2 segundos");
                    dispatch(HideLoading());
                    isFirstLoad.current = false;
                }, 2000);
            }
        } catch (error) {
            message.error(error.message);
            if (isFirstLoad) {
                dispatch(HideLoading());
            }
        }
    };


      const dataReserva = new Date(); // Isso já estará em UTC.

      const ReservarLugar = async (value) => {
        const lugar = {
          id: value.id,
          userid: user._id,
          date: dataReserva,
          sessaoId: sessao.sessao._id
      };
        try {
          dispatch(ShowLoading())
          const response = await ReservarLugares(lugar)
          if (response.success) {
            message.success(response.message)
          } else {
            message.error(response.message)
          }
          dispatch(HideLoading())
        } catch (error) {
          message.error(error.message)
          dispatch(HideLoading())
        }
      }


      const EliminarLugarReservas = async (value) => {
        const lugar = {
          lugar: value.id,
          sessao: sessao

      };
        try {
          dispatch(ShowLoading())
          const response = await EliminarLugarReserva(lugar)
          if (response.success) {
            message.success(response.message)
          } else {
            message.error(response.message)
          }
          dispatch(HideLoading())
        } catch (error) {
          message.error(error.message)
          dispatch(HideLoading())
        }
      }

      const EliminarLugarReservasTime = async (value) => {
        const lugar = {
          lugar: value.id,
          sessao:sessao
      };
        try {
          const response = await EliminarLugarReserva(lugar)
          if (response.success) {
            message.error("A sua reserva expirou!")
          }
        } catch (error) {
          message.error(error.message)
        }
      }


      const EliminarTodasReserva = async () => {
        try {
          dispatch(ShowLoading())
          const response = await EliminarTodasReservas(user)
          if (response.success) {
          } else {
            message.error(response.message)
          }
          dispatch(HideLoading())
        } catch (error) {
          message.error(error.message)
          dispatch(HideLoading())
        }
      }

      useEffect(() => {
        if (sessao) {  // Verifica se sessao está definido e não é null
            getBilhetes();
        }
    }, []);  // Adiciona sessao como uma dependência do useEffect

    // Adicione um novo useEffect para monitorar mudanças em reservas
    useEffect(() => {
      // Função para atualizar a lista de lugares
    const updatePlacesState = (currentList, setListFunction) => {
      const updatedList = updateOccupiedPlaces(currentList);
      if (JSON.stringify(currentList) !== JSON.stringify(updatedList)) {
          setListFunction(updatedList);
      }
  };


  updatePlacesState(placesListQ, setPlacesListQ);
  updatePlacesState(placesListP, setPlacesListP);
  updatePlacesState(placesListO, setPlacesListO);
  updatePlacesState(placesListN, setPlacesListN);
  updatePlacesState(placesListM, setPlacesListM);
  updatePlacesState(placesListL, setPlacesListL);
  updatePlacesState(placesListK, setPlacesListK);
  updatePlacesState(placesListJ, setPlacesListJ);
  updatePlacesState(placesListI, setPlacesListI);
    }, [bilhete]);

    const updatePlaceInList = (list, lugarId, reservedUserId) => {
      return list.map(place => {
        if (place.id === lugarId) {
          // Se é um lugar acessível e o usuário atual fez a reserva, não marque como ocupado.
          // Se não, marque o lugar acessível como ocupado quando outro usuário o reserva.
          const isOccupied = place.isAccessible ? (reservedUserId !== user._id ? true : false) : (reservedUserId !== user._id);
          return { ...place, isOccupied };
        }
        return place;
      });
    };


    const freePlaceInList = (list, lugarId) => {
      return list.map(place => {
        if (place.id === lugarId) {
          // Liberando o lugar, removendo a informação do usuário que reservou se existir.
          return { ...place, isOccupied: false, userId: null };
        }
        return place;
      });
    };





      useEffect(() => {
        // Define os lugares selecionados iniciais quando o modal é aberto
        setSelectedPlaces(selectedPlacesParent);
      }, [showMovieFormModal2, selectedPlacesParent, setSelectedPlaces]);

      function generatePlacesList(prefix, numPlaces) {
        const placesList = [];
        for (let i = 1; i <= numPlaces; i++) {
          const id = `${prefix}${i}`;
          placesList.push({ id, name: id });
        }
        return placesList;
      }
      const updateOccupiedPlaces = (lugares) => {
        const updatedPlaces = [...lugares];
    
        const currentUser = user._id  // Obtenha o usuário atual de onde for necessário
    
        updatedPlaces.forEach(lugarAtual => {
            // Inicialmente, suponha que o lugar não está ocupado
            lugarAtual.isOccupied = false;
            
            // Iterar sobre cada bilhete para verificar se o lugar está comprado ou reservado por outro usuário
            bilhete.forEach(b => {
                b.lugares.forEach(lugar => {
                    if (lugar === lugarAtual.id) {
                        if (b.estado === "Comprado" || (b.estado === "Reservado" && b.user._id !== currentUser)) {
                            lugarAtual.isOccupied = true;
                        }
                    }
                });
            });
        });
    
        return updatedPlaces;
    };
     
    
     if (sessao && sessao.bilhetes) {
   

   
 
     
    const handlePlaceClick = (place) => {

      if (place.isOccupied) {
        // Se o lugar estiver ocupado, não faça nada (não permita a seleção)
        return;
      }
      // Verifica se o lugar já está selecionado
      const isSelected = selectedPlaces.some((selectedPlace) => selectedPlace.id === place.id);
      lugar = place
      if (isSelected) {
         // Se o lugar já estiver selecionado, remove-o da lista de lugares selecionados
    setSelectedPlaces(selectedPlaces.filter((selectedPlace) => selectedPlace.id !== place.id));
    
    // Limpe o setTimeout para este lugar para que ele não seja desselecionado automaticamente
    clearTimeout(timeouts[place.id]);
    const newTimeouts = { ...timeouts };
    delete newTimeouts[place.id];
    setTimeouts(newTimeouts);

    // Supondo que você tenha uma função chamada "EliminarLugarReservas"
    EliminarLugarReservas(place);

  } else {
    // Se o lugar não está selecionado, adiciona o lugar à lista de lugares selecionados
    setSelectedPlaces([...selectedPlaces, place]);
    ReservarLugar(place);

   // Inicie um setTimeout para desselecionar o lugar após um minuto
   const timeout = setTimeout(() => {
    setSelectedPlaces(prevSelectedPlaces => 
      prevSelectedPlaces.filter((selectedPlace) => selectedPlace.id !== place.id)
    );

 
    setSelectedPlacesParent([])
      EliminarLugarReservasTime(place);
 
    }, 60000); // 60,000 ms = 1 minuto

    // Armazene o setTimeout para que possamos limpá-lo mais tarde se necessário
    setTimeouts(prevTimeouts => ({ ...prevTimeouts, [place.id]: timeout }));
  }
}

const handleAccessiblePlaceClick = (place) => {
  if (place.isOccupied) {
    // Se o lugar acessível estiver ocupado, não faça nada (não permita a seleção)
    return;
  }
  
  if (!place.isAccessible) {
    // Se o lugar não for acessível, trate-o como um lugar comum
    handlePlaceClick(place);
    return;
  }
  
  // Verifica se o lugar acessível já está selecionado
  const isAccessiblePlaceSelected = selectedPlaces.some(selectedPlace => selectedPlace.id === place.id);
  
  if (isAccessiblePlaceSelected) {
    // Se o lugar acessível já estiver selecionado, remove-o dos lugares selecionados
    setSelectedPlaces(selectedPlaces.filter(selectedPlace => selectedPlace.id !== place.id));

    // Limpe o setTimeout para este lugar acessível
    clearTimeout(timeouts[place.id]);
    const newTimeouts = { ...timeouts };
    delete newTimeouts[place.id];
    setTimeouts(newTimeouts);

    // Chame a função para cancelar a reserva do lugar acessível
    EliminarLugarReservas(place);

  } else {
    // Se o lugar acessível não estiver selecionado, mostre o modal de aviso antes de selecioná-lo
    setSelectedAccessiblePlace(place); // Defina o lugar acessível atual como selecionado para uso no modal
    setShowModal(true); // Mostre o modal
    
    // O restante da lógica de adição à lista de lugares selecionados e reserva do lugar
    // agora será tratado na confirmação do modal, dependendo da escolha do usuário.
  }
};

// Suponha que você tenha uma função que é chamada quando o usuário confirma no modal
const onConfirmModal = () => {
  // Se o usuário confirmar no modal, adicione o lugar acessível à lista de lugares selecionados
  setSelectedPlaces([...selectedPlaces, selectedAccessiblePlace]);

  // Chame a função para reservar o lugar acessível
  ReservarLugar(selectedAccessiblePlace);

  // Inicie um setTimeout para desselecionar o lugar acessível após um tempo determinado
  const timeout = setTimeout(() => {
    setSelectedPlaces(prevSelectedPlaces =>
      prevSelectedPlaces.filter(selectedPlace => selectedPlace.id !== selectedAccessiblePlace.id)
    );
    setSelectedPlacesParent([])
    // Chame a função para cancelar a reserva do lugar acessível após o tempo expirar
    EliminarLugarReservasTime(selectedAccessiblePlace);

  }, 60000); // 60,000 ms = 1 minuto

  // Armazene o setTimeout para que possamos limpá-lo mais tarde se necessário
  setTimeouts(prevTimeouts => ({ ...prevTimeouts, [selectedAccessiblePlace.id]: timeout }));

  setShowModal(false); // Feche o modal após a confirmação
};






    const allPlaces = [
      ...placesListQ,
      ...placesListP,
      ...placesListO,
      ...placesListN,
      ...placesListM,
      ...placesListL,
      ...placesListK,
      ...placesListJ,
      ...placesListI,
    ];
    
    const totalPlaces = allPlaces.length;
    const occupiedPlaces = allPlaces.filter(place => place.isOccupied).length;
    const availablePlaces = totalPlaces - occupiedPlaces;

  return (
    
   <Modal
   className="myModalStyle"
         title="Lugares:"
      open={showMovieFormModal2}
      onCancel={() => {
        setSelectedPlacesParent([]); // Limpar os lugares selecionados ao fechar o modal
        EliminarTodasReserva()
        setShowMovieFormModal2(false); // Fechar o modal
      

      }}
      
      footer={null}
     

   >
     <div style={{ marginBottom: '20px', textAlign: 'center' }}>
    <h2>Total de Lugares: {totalPlaces}</h2>
    <h3>Lugares Disponíveis: {availablePlaces}</h3>
  </div>
     <div className='seat-list-container' style={{ alignItems: 'center', flexDirection: 'column', display: 'flex' }}>
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <div className="seat-list-letter">Q</div> {/* Letra 'Q' aparece à esquerda */}
        <ul className="seat-list" >
          {placesListQ.map(place => (
            <li
              key={place.id}
              onClick={() => handlePlaceClick(place)}
              className={`seat ${selectedPlaces.some(selectedPlace => selectedPlace.id === place.id) ? 'selected' : ''} ${place.isOccupied ? 'occupied-place' : ''}`}
              style={{ display: 'flex' }}
            >
              <div style={{ display: 'flex' }}>
                <div className="seat-content" style={{ color: 'white', textAlign: 'center' }}>
                  {place.id}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
    <div style={{ alignItems: 'center', flexDirection: 'column', display: 'flex' }}>
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <div style={{ marginRight: '10px', marginTop: '5px', fontSize: '20px' }}> P</div> {/* Letra 'Q' aparece à esquerda */}
        <ul style={{ display: 'flex', listStyle: 'none', padding: 0, marginTop: '5px' }}>
          {placesListP.map(place => (
            <li
              key={place.id}
              onClick={() => handlePlaceClick(place)}
              className={`seat ${selectedPlaces.some(selectedPlace => selectedPlace.id === place.id) ? 'selected' : ''} ${place.isOccupied ? 'occupied-place' : ''}`}
              style={{ display: 'flex' }}
            >
              <div style={{ display: 'flex' }}>
                <div className="seat-content" style={{ color: 'white', textAlign: 'center' }}>
                  {place.id}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
    <div style={{ alignItems: 'center', flexDirection: 'column', display: 'flex' }}>
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <div style={{ marginRight: '10px', marginTop: '5px', fontSize: '20px' }}>O</div> {/* Letra 'Q' aparece à esquerda */}
        <ul style={{ display: 'flex', listStyle: 'none', padding: 0, marginTop: '5px' }}>
          {placesListO.map(place => (
            <li
              key={place.id}
              onClick={() => handlePlaceClick(place)}
              className={`seat ${selectedPlaces.some(selectedPlace => selectedPlace.id === place.id) ? 'selected' : ''} ${place.isOccupied ? 'occupied-place' : ''}`}
              style={{ display: 'flex' }}
            >
              <div style={{ display: 'flex' }}>
                <div className="seat-content" style={{ color: 'white', textAlign: 'center' }}>
                  {place.id}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
    <div style={{ alignItems: 'center', flexDirection: 'column', display: 'flex' }}>
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <div style={{ marginRight: '10px', marginTop: '5px', fontSize: '20px' }}>N</div> {/* Letra 'Q' aparece à esquerda */}
        <ul style={{ display: 'flex', listStyle: 'none', padding: 0, marginTop: '5px' }}>
          {placesListN.map(place => (
            <li
              key={place.id}
              onClick={() => handlePlaceClick(place)}
              className={`seat ${selectedPlaces.some(selectedPlace => selectedPlace.id === place.id) ? 'selected' : ''} ${place.isOccupied ? 'occupied-place' : ''}`}
              style={{ display: 'flex' }}
            >
              <div style={{ display: 'flex' }}>
                <div className="seat-content" style={{ color: 'white', textAlign: 'center' }}>
                  {place.id}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
    <div style={{ alignItems: 'center', flexDirection: 'column', display: 'flex' }}>
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <div style={{ marginRight: '10px', marginTop: '5px', fontSize: '20px' }}>M</div> {/* Letra 'Q' aparece à esquerda */}
        <ul style={{ display: 'flex', listStyle: 'none', padding: 0, marginTop: '5px' }}>
          {placesListM.map(place => (
            <li
              key={place.id}
              onClick={() => handlePlaceClick(place)}
              className={`seat ${selectedPlaces.some(selectedPlace => selectedPlace.id === place.id) ? 'selected' : ''} ${place.isOccupied ? 'occupied-place' : ''}`}
              style={{ display: 'flex' }}
            >
              <div style={{ display: 'flex' }}>
                <div className="seat-content" style={{ color: 'white', textAlign: 'center' }}>
                  {place.id}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
    <div style={{ alignItems: 'center', flexDirection: 'column', display: 'flex' }}>
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <div style={{ marginRight: '10px', marginTop: '5px', fontSize: '20px' }}>L</div> {/* Letra 'Q' aparece à esquerda */}
        <ul style={{ display: 'flex', listStyle: 'none', padding: 0, marginTop: '2px',marginLeft:'7px' }}>
          {placesListL.map(place => (
            <li
              key={place.id}
              onClick={() => handlePlaceClick(place)}
              className={`seat ${selectedPlaces.some(selectedPlace => selectedPlace.id === place.id) ? 'selected' : ''} ${place.isOccupied ? 'occupied-place' : ''}`}
              style={{ display: 'flex' }}
            >
              <div style={{ display: 'flex' }}>
                <div className="seat-content" style={{ color: 'white', textAlign: 'center' }}>
                  {place.id}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
    <div style={{ alignItems: 'center', flexDirection: 'column', display: 'flex' }}>
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <div style={{ marginRight: '10px', marginTop: '5px', fontSize: '20px' }}>K</div> {/* Letra 'Q' aparece à esquerda */}
        <ul style={{ display: 'flex', listStyle: 'none', padding: 0, marginTop: '2px' ,marginLeft:'5px'}}>
          {placesListK.map(place => (
            <li
              key={place.id}
              onClick={() => handlePlaceClick(place)}
              className={`seat ${selectedPlaces.some(selectedPlace => selectedPlace.id === place.id) ? 'selected' : ''} ${place.isOccupied ? 'occupied-place' : ''}`}
              style={{ display: 'flex' }}
            >
              <div style={{ display: 'flex' }}>
                <div className="seat-content" style={{ color: 'white', textAlign: 'center' }}>
                  {place.id}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
    
    <div style={{ alignItems: 'center', flexDirection: 'column', display: 'flex' }}>
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <div style={{ marginRight: '10px', marginTop: '5px', fontSize: '20px' }}>J</div> {/* Letra 'Q' aparece à esquerda */}
        <ul style={{ display: 'flex', listStyle: 'none', padding: 0, marginTop: '5px' }}>
          {placesListJ.map(place => (
            <li
              key={place.id}
              onClick={() => handlePlaceClick(place)}
              className={`seat ${selectedPlaces.some(selectedPlace => selectedPlace.id === place.id) ? 'selected' : ''} ${place.isOccupied ? 'occupied-place' : ''}`}
              style={{ display: 'flex' }}
            >
              <div style={{ display: 'flex' }}>
                <div className="seat-content" style={{ color: 'white', textAlign: 'center' }}>
                  {place.id}
                </div>
              </div>
              {place.isAccessible && <div style={{ marginLeft: '5px' }}>Icone de acessibilidade</div>}
            </li>
          ))}
        </ul>
      </div>
    </div>
    
    <div style={{ alignItems: 'center', flexDirection: 'column', display: 'flex' }}>
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <div style={{ marginRight: '10px', marginTop: '5px', fontSize: '20px' }}>I</div>
        <ul style={{ display: 'flex', listStyle: 'none', padding: 0, marginTop: '5px' }}>
          {placesListI.map(place => (
            <li
              key={place.id}
              className={`seat ${selectedPlaces.some(selectedPlace => selectedPlace.id === place.id) ? 'selected' : ''} ${place.isOccupied ? 'occupied-place' : ''}`}
              style={{ display: 'flex', cursor: 'pointer' }}
            >
                 <div onClick={() => handleAccessiblePlaceClick(place)} style={{ display: 'flex' }}>
                {place.isAccessible ? (
                  <div  style={{ marginRight: '5px' }}>
                    <FontAwesomeIcon icon={faWheelchair} size="2x" color="white" /> {/* Cor preta para o ícone */}
                  </div>
                ) : null}
                <div className="seat-content" style={{ color: 'white', textAlign: 'center' }}>
                  {place.isAccessible ? '' : place.name}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
      {selectedPlaces.length > 0 && (
   
        <div>
            <hr  style={{marginTop:'20px'}}/>   
          <h2 style={{textAlign:'center',marginTop:'10px'}}>Lugares Selecionados:</h2>
          <ul>
            {selectedPlaces.map((selectedPlace) => (
              <li key={selectedPlace.id} style={{fontSize:'20px'}}>
                {selectedPlace.name}
              </li>
            ))}
          </ul>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
          <Button
              style={{ backgroundColor: 'blue', color: 'white' }}
              onClick={() => {
                setShowMovieFormModal2(false);
                handleSelectedPlaces(selectedPlaces); // Chamando a função com os lugares selecionados
              }}
            >
              CONFIRMAR
            </Button>
                </div>
        </div>
      )}
{showModal && (
        <AvisoDef
          show={showModal}
          setshow={setShowModal}
          place={selectedAccessiblePlace}
          onConfirm={onConfirmModal}
        />
      )}

   
    </Modal>
  )
}}

export default Lugarestopo
