import React, { useEffect, useState } from 'react'
import PageTitle from '../components/PageTitle'
import { Button, Modal, Tabs } from 'antd'
import io from 'socket.io-client';
import { Table, message } from 'antd';
import { useDispatch } from 'react-redux';
import { HideLoading, ShowLoading } from '../redux/loadersSlice';
import { EliminarLugarReserva, EliminarTodasReservas, GetAllBilhetes2, GetBilhetes, GetReservas, ReservarLugares } from '../apicalls/bilhetes';
let socket;
function Lugaresbaixo({showMovieFormModal3,
    setShowMovieFormModal3, selectedPlacesParent, setSelectedPlacesParent,handleSelectedPlaces,sessao,user}) {
      let [lugar, setLugar] = React.useState(null);
      const dispatch = useDispatch();
      const isFirstLoad = React.useRef(true);
      const [placesListG, setPlacesListG] = useState(generatePlacesList('G', 8, 20));
      const [placesListH, setPlacesListH] = useState(generatePlacesList('H', 5, 21));
      const [placesListF, setPlacesListF] = useState(generatePlacesList('F', 8, 19))
      const [placesListE, setPlacesListE] = useState(generatePlacesList('E', 8, 18))
      const [placesListD, setPlacesListD] = useState(generatePlacesList('D', 8, 17))
      const [placesListC, setPlacesListC] = useState(generatePlacesList('C', 8, 16))
      const [placesListB, setPlacesListB] = useState(generatePlacesList('B', 7, 15))
      const [placesListA, setPlacesListA] = useState(generatePlacesList('A', 8, 14))
      const [bilhete,setBilhete]  = useState([])
      const [timeouts, setTimeouts] = useState({});

      const [selectedPlaces, setSelectedPlaces] = useState([]);

      useEffect(() => {
        const serverUrl = 'https://cinema-mirandela2.onrender.com'; // substitua pelo seu IP ou domínio

        // Conectar-se ao servidor
        socket = io(serverUrl);
        socket.on('lugar-liberado', (data) => {
          console.log(`O lugar ${data.lugarId} foi liberado.`);
  
          const listPrefix = data.lugarId[0];
          console.log(listPrefix)
  
          // Atualize a lista apropriada usando a função freePlaceInList
          switch(listPrefix) {
              case 'H':
                  setPlacesListH(prevList => freePlaceInList(prevList, data.lugarId));
                  break;
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
          }
      });
        socket.on('lugar-reservado', (data) => {
          console.log(`O lugar ${data.lugarId} na sessão ${data.sessaoId} foi reservado pelo usuário ${data.userId}.`);
          
    // Verificar se a sessão da mensagem é a mesma que a sessão atual
    if (data.sessaoId !== sessao.sessao._id) {
      return;  // se não for a mesma sessão, ignore a mensagem
  }
          if (data.userId !== user._id) {
          // Determinar a primeira letra do lugar para saber a lista correspondente

          const listPrefix = data.lugarId[0];

          // Dependendo da primeira letra, atualizamos a lista apropriada
          switch(listPrefix) {
              case 'H':
                  setPlacesListH(prevList => updatePlaceInList(prevList, data.lugarId,data.userId));
                  break;
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
                  console.error("Prefixo de lugar desconhecido: ", listPrefix);
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
        if (sessao.sessao) {  // Verifica se sessao está definido e não é null
            getBilhetes();
    
        }
    }, []);  // Adiciona sessao como uma dependência do useEffect


 
    useEffect(() => {
     console.log(sessao)
  }, [sessao]);  // Adiciona sessao como uma dependência do useEffect

    
    // Adicione um novo useEffect para monitorar mudanças em reservas
    useEffect(() => {
      // Função para atualizar a lista de lugares
    const updatePlacesState = (currentList, setListFunction) => {
      const updatedList = updateOccupiedPlaces(currentList);
      if (JSON.stringify(currentList) !== JSON.stringify(updatedList)) {
          setListFunction(updatedList);
      }
  };

  // Atualiza para cada fila de lugares
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
      }, [showMovieFormModal3, selectedPlacesParent, setSelectedPlaces]);

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
            if(place.id === lugarId) {
                // Se o lugar foi reservado pelo usuário atual, mantenha seu estado atual
                // Caso contrário, marque-o como ocupado
                const isOccupied = reservedUserId !== user ? true : place.isOccupied;
                return { ...place, isOccupied };
            }
            return place;
        });
    };


    const freePlaceInList = (list, lugarId) => {
      return list.map(place => {
          if (place.id === lugarId) {
              return { ...place, isOccupied: false, userId: null };  // Liberando o lugar
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
    
      if (sessao.sessao && sessao.bilhetes) {
   
   
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
      open={showMovieFormModal3}
      onCancel={() => {
        setSelectedPlacesParent([]); // Limpar os lugares selecionados ao fechar o modal
        EliminarTodasReserva()
        setShowMovieFormModal3(false); // Fechar o modal
        isFirstLoad.current = true
      

      }}
      className="mobile-scroll"  // Adicione esta linha
      footer={null}
      width={800}
 
      style={{
        alignItems : 'center',
        justifyContent : 'center',
        display: 'flex',
        flexDirection: 'column',  // Adicionar esta propriedade para alinhar os elementos verticalmente
        
        
      }}

   >
     <div style={{ marginBottom: '20px', textAlign: 'center' }}>
    <h2>Total de Lugares: {totalPlaces}</h2>
    <h3>Lugares Disponíveis: {availablePlaces}</h3>
  </div>
     <div style={{ alignItems: 'center', flexDirection: 'column', display: 'flex'}}>
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <div style={{ marginRight: '10px', marginTop: '5px', fontSize: '20px' }}><b>H</b></div> {/* Letra 'Q' aparece à esquerda */}
        <ul style={{ display: 'flex', listStyle: 'none', padding: 0, marginTop: '5px' }}>
          {placesListH.map(place => (
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
        <div style={{ marginRight: '10px', marginTop: '7px', fontSize: '20px' }}><b>G</b></div> {/* Letra 'Q' aparece à esquerda */}
        <ul style={{ display: 'flex', listStyle: 'none', padding: 0, marginTop: '5px' }}>
          {placesListG.map(place => (
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
        <div style={{ marginRight: '10px', marginTop: '7px', fontSize: '20px' }}><b>F</b></div> {/* Letra 'Q' aparece à esquerda */}
        <ul style={{ display: 'flex', listStyle: 'none', padding: 0, marginTop: '5px' }}>
          {placesListF.map(place => (
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
        <div style={{ marginRight: '10px', marginTop: '7px', fontSize: '20px' }}><b>E</b></div> {/* Letra 'Q' aparece à esquerda */}
        <ul style={{ display: 'flex', listStyle: 'none', padding: 0, marginTop: '5px' }}>
          {placesListE.map(place => (
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
        <div style={{ marginRight: '10px', marginTop: '7px', fontSize: '20px' }}><b>D</b></div> {/* Letra 'Q' aparece à esquerda */}
        <ul style={{ display: 'flex', listStyle: 'none', padding: 0, marginTop: '5px' }}>
          {placesListD.map(place => (
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
        <div style={{ marginRight: '10px', marginTop: '5px', fontSize: '20px' }}><b>C</b></div> {/* Letra 'Q' aparece à esquerda */}
        <ul style={{ display: 'flex', listStyle: 'none', padding: 0, marginTop: '2px',marginLeft:'7px' }}>
          {placesListC.map(place => (
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
        <div style={{ marginRight: '10px', marginTop: '5px', fontSize: '20px' }}><b>B</b></div> {/* Letra 'Q' aparece à esquerda */}
        <ul style={{ display: 'flex', listStyle: 'none', padding: 0, marginTop: '2px' ,marginLeft:'5px'}}>
          {placesListB.map(place => (
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
        <div style={{ marginRight: '10px', marginTop: '8px', fontSize: '20px' }}><b>A</b></div> {/* Letra 'Q' aparece à esquerda */}
        <ul style={{ display: 'flex', listStyle: 'none', padding: 0, marginTop: '5px' }}>
          {placesListA.map(place => (
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
                setShowMovieFormModal3(false);
                handleSelectedPlaces(selectedPlaces); // Chamando a função com os lugares selecionados
              }}
            >
              CONFIRMAR
            </Button>
                </div>
        </div>
      )}


   
    </Modal>
  )
      }}

export default Lugaresbaixo
