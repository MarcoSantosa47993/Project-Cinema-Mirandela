import React, { useEffect, useState } from 'react'
import { Button, Form, Modal,message } from 'antd'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWheelchair } from '@fortawesome/free-solid-svg-icons';
import AvisoDef from './avisodef';
import { useDispatch } from 'react-redux';
import io from 'socket.io-client';
import { HideLoading, ShowLoading } from '../redux/loadersSlice';
import { EliminarLugarReserva, EliminarTodasReservas, GetBilhetes, GetReservas, ReservarLugares } from '../apicalls/bilhetes';
let socket;
function Lugaresdireita({showMovieFormModal4,
    setShowMovieFormModal4, selectedPlacesParent, setSelectedPlacesParent,handleSelectedPlaces,sessao,user}) {


      let lugarclass = "seat"
      const dispatch = useDispatch();
      const [selectedPlaces, setSelectedPlaces] = useState([]);
      const isFirstLoad = React.useRef(true);
      const [showModal, setShowModal] = useState(false);
      const [selectedAccessiblePlace, setSelectedAccessiblePlace] = useState(null);
      let [lugar, setLugar] = React.useState(null);
      const [bilhete,setBilhete]  = useState([])
      const [timeouts, setTimeouts] = useState({});
      const [placesListG, setPlacesListG] = useState(generatePlacesList('G',28,7));
      const [placesListH, setPlacesListH] = useState([
        { id: 'H26', name: 'H26' },
        { id: 'H27', name: 'H27' },
        { id: 'H28', name: 'H28' },
        { id: 'H29', name: 'H29' },
        { id: 'D-H30', name: 'D-H1' , isAccessible: true },
        { id: 'D-H31', name: 'D-H2', isAccessible: true },
]);
      const [placesListF, setPlacesListF] = useState(generatePlacesList('F',27,7))
      const [placesListE, setPlacesListE] = useState(generatePlacesList('E',26,7))
      const [placesListD, setPlacesListD] = useState(generatePlacesList('D',25,7))
      const [placesListC, setPlacesListC] = useState(generatePlacesList('C',24,7))
      const [placesListB, setPlacesListB] = useState(generatePlacesList('B',22,6))
      const [placesListA, setPlacesListA] = useState(generatePlacesList('A',22,7))
      
      useEffect(() => {
        // Conectar-se ao servidor
        socket = io('http://localhost:5000');
        socket.on('lugar-liberado', (data) => {
          console.log(`O lugar ${data.lugarId} foi liberado.`);
  // Verifica se o ID do lugar é da fila I ou de lugares acessíveis na fila I
  if (data.lugarId.startsWith('H') || data.lugarId.startsWith('D-H')) {
    // Atualize a lista placesListI diretamente, para lugares acessíveis e regulares
    setPlacesListH(prevList => freePlaceInList(prevList, data.lugarId));
  } else {
          const listPrefix = data.lugarId[0];
  
          // Atualize a lista apropriada usando a função freePlaceInList
          switch(listPrefix) {
               case 'G':
                  setPlacesListG(prevList => freePlaceInList(prevList, data.lugarId));
                   break;
              case 'F':
                  setPlacesListF(prevList => freePlaceInList(prevList, data.lugarId));
                  break;
              case 'E':
                  setPlacesListE(prevList => freePlaceInList(prevList, data.lugarId));
                  break;
              case 'D':
                  setPlacesListD(prevList => freePlaceInList(prevList, data.lugarId));
                  break;
              case 'C':
                  setPlacesListC(prevList => freePlaceInList(prevList, data.lugarId));
                  break;
              case 'B':
                  setPlacesListB(prevList => freePlaceInList(prevList, data.lugarId));
                  break;
              case 'A':
                  setPlacesListA(prevList => freePlaceInList(prevList, data.lugarId));
                  break;
              default:
                  console.error("Prefixo de lugar desconhecido:", listPrefix);
          }}
      });
        socket.on('lugar-reservado', (data) => {
          console.log(`O lugar ${data.lugarId} na sessão ${data.sessaoId} foi reservado pelo usuário ${data.userId}.`);
          console.log(user)
          if (data.userId !== user._id) {
            if (data.lugarId.startsWith('H') || data.lugarId.startsWith('D-H')) {
              setPlacesListH(prevList => updatePlaceInList(prevList, data.lugarId, data.userId));
            } else  {
          const listPrefix = data.lugarId[0];
      
          // Dependendo da primeira letra, atualizamos a lista apropriada
          switch(listPrefix) {
            case 'G':
              setPlacesListG(prevList => updatePlaceInList(prevList, data.lugarId,data.userId));
              break;
              case 'F':
                  setPlacesListF(prevList => updatePlaceInList(prevList, data.lugarId,data.userId));
                  break;
              case 'E':
                  setPlacesListE(prevList => updatePlaceInList(prevList, data.lugarId,data.userId));
                  break;
              case 'D':
                  setPlacesListD(prevList => updatePlaceInList(prevList, data.lugarId,data.userId));
                  break;
              case 'C':
                  setPlacesListC(prevList => updatePlaceInList(prevList, data.lugarId,data.userId));
                  break;
              case 'B':
                  setPlacesListB(prevList => updatePlaceInList(prevList, data.lugarId,data.userId));
                  break;
              case 'A':
                  setPlacesListA(prevList => updatePlaceInList(prevList, data.lugarId,data.userId));
                  break;
              default:
                  console.error("Prefixo de lugar desconhecido:", listPrefix);
          }
        }}
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
          sessao : sessao
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
          sessao: sessao

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


  updatePlacesState(placesListH, setPlacesListH);
  updatePlacesState(placesListG, setPlacesListG);
  updatePlacesState(placesListF, setPlacesListF);
  updatePlacesState(placesListE, setPlacesListE);
  updatePlacesState(placesListD, setPlacesListD);
  updatePlacesState(placesListC, setPlacesListC);
  updatePlacesState(placesListB, setPlacesListB);
  updatePlacesState(placesListA, setPlacesListA);
    }, [bilhete]);



      useEffect(() => {
        // Define os lugares selecionados iniciais quando o modal é aberto
        setSelectedPlaces(selectedPlacesParent);
      }, [showMovieFormModal4, selectedPlacesParent, setSelectedPlaces]);

      function generatePlacesList(prefix, startNumber, numPlaces) {
        const placesList = [];
        for (let i = startNumber; i < startNumber + numPlaces; i++) {
          const id = `${prefix}${i}`;
          placesList.push({ id, name: id });
        }
        return placesList;
      }

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
  
      // Chame a função para cancelar a reserva do lugar acessível após o tempo expirar
      EliminarLugarReservasTime(selectedAccessiblePlace);
  
    }, 60000); // 60,000 ms = 1 minuto
  
    // Armazene o setTimeout para que possamos limpá-lo mais tarde se necessário
    setTimeouts(prevTimeouts => ({ ...prevTimeouts, [selectedAccessiblePlace.id]: timeout }));
  
    setShowModal(false); // Feche o modal após a confirmação
  };
  

    const allPlaces = [
      ...placesListH,
      ...placesListG,
      ...placesListF,
      ...placesListE,
      ...placesListD,
      ...placesListC,
      ...placesListB,
      ...placesListA,
    ];

    const totalPlaces = allPlaces.length;
    const occupiedPlaces = allPlaces.filter(place => place.isOccupied).length;
    const availablePlaces = totalPlaces - occupiedPlaces;


  return (
    
   <Modal
         title="Lugares:"
      open={showMovieFormModal4}
      onCancel={() => {
        setSelectedPlacesParent([]); // Limpar os lugares selecionados ao fechar o modal 
        EliminarTodasReserva()
        setShowMovieFormModal4(false); // Fechar o modal
       

      }}
      
      footer={null}
      width={800}
 
      style={{
        alignItems : 'center',
        justifyContent : 'center',
        display: 'flex'
        
        
      }}

   >
     <div style={{ marginBottom: '20px', textAlign: 'center' }}>
    <h2>Total de Lugares: {totalPlaces}</h2>
    <h3>Lugares Disponíveis: {availablePlaces}</h3>
  </div>
     <div>
     <ul style={{ display: 'flex', listStyle: 'none', padding: 0 , marginTop:'5px'}}>

<text style={{ marginRight:'10px', fontSize:'22px'}}><b>H</b></text>
<div style={{ display: 'flex', marginLeft:'1px'}}>
          {placesListH.map(place => (
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
          </div>
        </ul>
   
 
          
           <ul style={{ display: 'flex', listStyle: 'none', padding: 0 , marginTop:'5px'}}>

           <text style={{ marginRight:'10px', fontSize:'22px'}}><b>G</b></text>
          <div style={{ display: 'flex', marginLeft:'1px'}}>
          {placesListG.map((place)=> (
          <li
            key={place.id}
            onClick={() => handlePlaceClick(place)}
            className={`seat ${selectedPlaces.some((selectedPlace) => selectedPlace.id === place.id) ? 'selected' : ''} ${place.isOccupied ? 'booked' : ''}`}
            style={{display:'flex'}}
          >
          
          <div style={{display:'flex',}}>
            <div className='seat-content' style={{color:'white', textAlign:'center'} }>{place.id}</div>
             
            </div>
          </li>
           
        ))} 
       </div>
      </ul>
      <ul style={{ display: 'flex', listStyle: 'none', padding: 0 , marginTop:'5px'}}>

           <text style={{ marginRight:'10px', fontSize:'22px'}}><b>F</b></text>
           <div style={{ display: 'flex', marginLeft:'3px'}}>
          {placesListF.map((place)=> (
          <li
            key={place.id}
            onClick={() => handlePlaceClick(place)}
            className={`seat ${selectedPlaces.some((selectedPlace) => selectedPlace.id === place.id) ? 'selected' : ''} ${place.isOccupied ? 'booked' : ''}`}
            style={{display:'flex'}}
          >
          
          <div style={{display:'flex',}}>
            <div className='seat-content' style={{color:'white', textAlign:'center'} }>{place.id}</div>
             
            </div>
          </li>
          
        ))} 
        </div>
      </ul>
      <ul style={{ display: 'flex', listStyle: 'none', padding: 0 , marginTop:'5px'}}>

           <text style={{ marginRight:'10px', fontSize:'22px'}}><b>E</b></text>
           <div style={{ display: 'flex', marginLeft:'2px'}}>
          {placesListE.map((place)=> (
          <li
            key={place.id}
            onClick={() => handlePlaceClick(place)}
            className={`seat ${selectedPlaces.some((selectedPlace) => selectedPlace.id === place.id) ? 'selected' : ''} ${place.isOccupied ? 'booked' : ''}`}
            style={{display:'flex'}}
          >
          
          <div style={{display:'flex',}}>
            <div className='seat-content' style={{color:'white', textAlign:'center'} }>{place.id}</div>
             
            </div>
          </li>
          
        ))} 
        </div>
      </ul>
      <ul style={{ display: 'flex', listStyle: 'none', padding: 0 , marginTop:'5px'}}>

           <text style={{ marginRight:'10px', fontSize:'22px'}}><b>D</b></text>
           <div style={{ display: 'flex'}}>
          {placesListD.map((place)=> (
          <li
            key={place.id}
            onClick={() => handlePlaceClick(place)}
            className={`seat ${selectedPlaces.some((selectedPlace) => selectedPlace.id === place.id) ? 'selected' : ''} ${place.isOccupied ? 'booked' : ''}`}
            style={{display:'flex'}}
          >
          
          <div style={{display:'flex'}}>
            <div className='seat-content' style={{color:'white', textAlign:'center'} }>{place.id}</div>
             
            </div>
          </li>
         
        ))} 
         </div>
      </ul>
      <ul style={{ display: 'flex', listStyle: 'none', padding: 0 , marginTop:'5px'}}>

           <text style={{ marginRight:'10px', fontSize:'22px'}}><b>C</b></text>
          
          {placesListC.map((place)=> (
          <li
            key={place.id}
            onClick={() => handlePlaceClick(place)}
            className={`seat ${selectedPlaces.some((selectedPlace) => selectedPlace.id === place.id) ? 'selected' : ''} ${place.isOccupied ? 'booked' : ''}`}
            style={{display:'flex'}}
          >
          
          <div style={{display:'flex',}}>
            <div className='seat-content' style={{color:'white', textAlign:'center'} }>{place.id}</div>
             
            </div>
          </li>
          
        ))} 
      </ul>
      <ul style={{ display: 'flex', listStyle: 'none', padding: 0 , marginTop:'5px'}}>

           <text style={{ marginRight:'10px', fontSize:'22px'}}><b>B</b></text>
          
          {placesListB.map((place)=> (
          <li
            key={place.id}
            onClick={() => handlePlaceClick(place)}
            className={`seat ${selectedPlaces.some((selectedPlace) => selectedPlace.id === place.id) ? 'selected' : ''} ${place.isOccupied ? 'booked' : ''}`}
            style={{display:'flex'}}
          >
          
          <div style={{display:'flex',}}>
            <div className='seat-content' style={{color:'white', textAlign:'center'} }>{place.id}</div>
             
            </div>
          </li>
          
        ))} 
      </ul>
    
      <ul style={{ display: 'flex', listStyle: 'none', padding: 0 , marginTop:'5px'}}>

           <text style={{ marginRight:'10px', fontSize:'22px'}}><b>A</b></text>
          
          {placesListA.map((place)=> (
          <li
            key={place.id}
            onClick={() => handlePlaceClick(place)}
            className={`seat ${selectedPlaces.some((selectedPlace) => selectedPlace.id === place.id) ? 'selected' : ''} ${place.isOccupied ? 'booked' : ''}`}
            style={{display:'flex'}}
          >
          
          <div style={{display:'flex',}}>
            <div className='seat-content' style={{color:'white', textAlign:'center'} }>{place.id}</div>
             
            </div>
          </li>
          
        ))} 
      </ul>
      
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
                setShowMovieFormModal4(false);
                handleSelectedPlaces(selectedPlaces); // Chamando a função com os lugares selecionados
              }}
            >
              CONFIRMAR
            </Button>
                </div>
        </div>
      )}
    </div>

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

export default Lugaresdireita
