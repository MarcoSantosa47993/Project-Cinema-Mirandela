import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { HideLoading, ShowLoading } from '../../redux/loadersSlice';
import { Button, message, Modal } from 'antd';
import { GetMoviebyId } from '../../apicalls/movies';
import { useNavigate, useParams } from "react-router-dom"
import moment from 'moment'
import { GetSessaoById } from '../../apicalls/cinemas';
import StripeCheckout from 'react-stripe-checkout';
import { GetCurrentUser } from '../../apicalls/users';
import { SetUser } from "../../redux/usersSlice";
import { ComprarBilhete, MakePagamento, GetBilhetesOfId, ReservarLugares2, EliminarLugarReserva2, GetBilhetes, ComprarBilhete2} from '../../apicalls/bilhetes';
import jsPDF from 'jspdf';
import JsBarcode from 'jsbarcode';
import io from 'socket.io-client';
let socket;

function BookSessao() {
  const { user } = useSelector((state) => state.users);
  const [sessao, setSessao] = React.useState(null)
  const [selectedLugares, setSelectedSeats] = React.useState([]);
  const params = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate()
  const [modalIsOpen, setModalIsOpen] = React.useState(false); // Estado para controlar a exibição do modal
  const [successModalIsOpen, setSuccessModalIsOpen] = React.useState(false);
  const [bilhete2Id,setBilhete2Id] = React.useState(null)
  const [bilheteId, setBilheteId] = React.useState(null)
  const isFirstLoad = React.useRef(true);
  const [bilhete1,setBilhete]  = React.useState([])
  const [reservedSeats, setReservedSeats] = React.useState([]);
  const [lugaresLiberados, setLugaresLiberados] = React.useState([]);

    // Função para confirmar a compra
    const confirmPurchase = () => {
      setModalIsOpen(false);
      setSuccessModalIsOpen(true);
    };


    const getBilhetes = async () => {
      try {
        if (!sessao) {  // Se sessao é null ou undefined
          message.error("Sessão não definida");
          return;
      }
          if (isFirstLoad.current) {
              dispatch(ShowLoading());
          }
  
          const response2 = await GetBilhetes(sessao);
  
          if (response2.success) {
              setBilhete(response2.data);
          } else {
              message.error(response2.message);
          }
  
          if (isFirstLoad.current) {
              setTimeout(() => {
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
    
    React.useEffect(() => {
      if (sessao) {  // Verifica se sessao está definido e não é null
          getBilhetes();

      }
  }, [sessao]);  // Adiciona sessao como uma dependência do useEffect



  useEffect(() => {
  getData();
  if (localStorage.getItem('token')) {
    getCurrentuser();
  }

}, []);

useEffect(() => {
   console.log("Params -> " + params.id)
}, []);
 

  useEffect(() => {
    // Conectar-se ao servidor
    socket = io('http://localhost:5000');
    socket.on('lugar-liberado', (data) => {
      console.log(`O lugar ${data.lugarId} foi liberado.`);
    
    if (data.userId !== user._id) {
        setLugaresLiberados(prevLugares => [...prevLugares, data.lugarId]);
    }
  });
    socket.on('lugar-reservado', (data) => {
      console.log(`O lugar ${data.lugarId} na sessão ${data.sessaoId} foi reservado pelo usuário ${data.userId}.`);
      
      // If the reserved seat is not by the current user, add it to reservedSeats
      if (data.userId !== user._id) {
        setReservedSeats(prevSeats => [...prevSeats, data.lugarId]);
      }
    });



    return () => {
        socket.disconnect();
    };
}, []);




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


  const getBilhetesId = async (payload) => {
    
    try {
      dispatch(ShowLoading())
      const response = await GetBilhetesOfId(payload)
      console.log("API Response:", response); // Add this line
      if (response.success) {
        setBilhete2Id(response.data, () => {
          // Now that the state is updated, you can proceed with generating the PDF
          generateAndPrintPDF();
        });
      } else {
        message.error(response.message)
      }
      dispatch(HideLoading())
    } catch (error) {
      message.error(error.message)
      dispatch(HideLoading())
    }
  }
  const dataReserva = new Date(); // Isso já estará em UTC.
  const ReservarLugar = async (value) => {
    const lugar = {
      id: value,
      userid: user._id,
      date: dataReserva,
      sessaoId: params.id
  };
    try {
      dispatch(ShowLoading())
      const response = await ReservarLugares2(lugar)
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

  const EliminarLugarReservas2 = async (value) => {
    const lugar = {
      lugar: value
  };
    try {
      dispatch(ShowLoading())
      const response = await EliminarLugarReserva2(lugar)
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

  const EliminarLugarReservas2Time = async (value) => {
    const lugar = {
      lugar: value
  };
    try {
      const response = await EliminarLugarReserva2(lugar)
      if (response.success) {
        message.error("A sua reserva expirou!")
      } 
    } catch (error) {
      message.error(error.message)
    }
  }


  const isLugarBooked = (numerolugar) => {
    if (!bilhete1 || !bilhete1.length) return false;
    for (let bilhete of bilhete1) {
        if (bilhete.lugares && bilhete.lugares.includes(numerolugar)) {
            // Se o usuário atual é o mesmo que reservou o bilhete e o estado é "Reservado", o lugar não será considerado "booked"
            if (bilhete.estado === "Reservado" && bilhete.user && bilhete.user._id === user._id) {
                return false;
            }
            return true;
        }
    }
    return false;
}


const timeouts = {}; // Objeto para guardar os timeouts
  const getLugares = () => {
    const colunas = 12 // vou ter 12 colunas cada uma com 12 assentos
    const totallugares = sessao.sessao.totallugares
    const linhas = Math.ceil(totallugares / colunas)
    return (
      <div className='flex gap-1 flex-col p-2 card ' >
        {Array.from(Array(linhas).keys()).map((lugar, index) => {//aqui vai começar o loop do total de lugares, no caso se 500 está a fazer do 1 até ao 500
          return (
            <div className='flex gap-1 justify-center'>
              {Array.from(Array(colunas).keys()).map((coluna, index) => { //inicialmente vou preencher a coluna 0 , alterando a variavel dentro do map (1,2,3,4 até 12)
                const numerolugar = lugar * colunas + coluna + 1

                let lugarClass = "seat2"
                if (selectedLugares.includes(lugar * colunas + coluna + 1)) {
                  lugarClass = lugarClass + " selected"
                }
                if (isLugarBooked(numerolugar)|| reservedSeats.includes(numerolugar)) {
                  lugarClass = lugarClass + " booked";
               }
               if (lugaresLiberados.includes(numerolugar)) {
                lugarClass = "seat2";  // redefine a classe para o padrão de assento disponível
            }
                return lugar * colunas + coluna + 1 <= totallugares && (
                  <div className={lugarClass}
                    onClick={() => {

                      const timeouts = {}; // Objeto para guardar os timeouts

                      // Dentro do seu onClick
                      if (!selectedLugares.includes(numerolugar)) {
                          setSelectedSeats(prevSeats => [...prevSeats, numerolugar]); // Se ainda não vou selecionar
                          ReservarLugar(numerolugar);
                      
                          // Agendar a remoção do lugar após 1 minuto
                          timeouts[numerolugar] = setTimeout(() => {
                              setSelectedSeats(prevSeats => {
                                  if (prevSeats.includes(numerolugar)) { // Se ainda estiver selecionado após 1 minuto
                                      EliminarLugarReservas2Time(numerolugar);
                                      return prevSeats.filter(item => item !== numerolugar);
                                  }
                                  return prevSeats;
                              });
                          }, 60000); // 60000ms = 1 minuto
                      } else {
                          setSelectedSeats(prevSeats => prevSeats.filter(item => item !== numerolugar)); // se já tiver incluido e eu voltar a clicar vou remover
                          EliminarLugarReservas2(numerolugar);
                      
                          // Limpar o timeout se existir um para esse lugar
                          if (timeouts[numerolugar]) {
                              clearTimeout(timeouts[numerolugar]);
                              delete timeouts[numerolugar];
                          }
                      }
                  }}
                  >
                    <h1 className='text-sm' >
                      {lugar * colunas + coluna + 1} {/* Exemplo: 1º lugar : 1 * 0 + 0 +1 = 1 vai ser colocado no lugar 1 / 2º lugar: 1*0(coluna 0) +1(segundo lugar da coluna 0) + 1 = 2 etcc*/}
                    </h1>
                  </div>
                );
              })}
            </div>
          );
        })}
<div className="palco mt-2">Ecrã</div> {/* Adicione esta linha */}
      </div>
    );
  }

  const onToken = async (token) => {
    try {
      dispatch(ShowLoading())
      const response = await MakePagamento(token, selectedLugares.length * sessao.precobilhete * 100)
      if (response.success) {
        message.success(response.message)
        bilhete(response.data)
      } else {
        message.error(response.message)
      }
      dispatch(HideLoading())

    } catch (error) {
      message.error(error.message)
      dispatch(HideLoading())
    }
  }

  const bilhete = async (pagamentoId) => {
    try {
      dispatch(ShowLoading())
      const response = await ComprarBilhete2({
        sessao: params.id,
        lugares: selectedLugares,
        pagamentoId,
        user: user._id,
      })
      console.log("Response -> " + JSON.stringify(response))
      if (response.success && !user.isAdmin && !user.isFunc) {
        message.success(response.message)
        console.log(response.message)
        navigate("/profile")
      }
      else if (response.success && (user.isAdmin || user.isFunc)) {
        message.success(response.message)
        console.log("Data -> ")
        console.log("Data -> " + response.data)
        setBilheteId(response.data)
      }
      else if (response.error) {
        message.error(response.message)
      }
      dispatch(HideLoading())
    } catch (error) {
      message.error(error.message)
      dispatch(HideLoading())
    }
  }

 

  const generateAndPrintPDF = (bilhetes) => {
     
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a6'
    });

    const valorEmEuros = sessao.precobilhete;

    const valorFormatado = valorEmEuros.toLocaleString('pt-PT', {
        style: 'currency',
        currency: 'EUR',
    });

    const lineHeight = 10;
    const marginLeft = 10;
    let marginTop = 10;
    const imgWidth = 20;
    const imgHeight = 20;
    const pageWidth2 = doc.internal.pageSize.getWidth();
    const xPosition2 = pageWidth2 - imgWidth - 5;



    bilhetes.forEach((bilhete, bilheteIndex) => {
        if (bilheteIndex !== 0) {
            doc.addPage();
            marginTop = 10;
        }
    
        doc.setFontSize(12);
        doc.text(`Detalhes do Bilhete ${bilheteIndex + 1}:`, marginLeft, marginTop);
        marginTop += lineHeight;

        // Add more details
        doc.text('  - Cinema: ' + sessao.sessao.cinema.nome, marginLeft, marginTop);
        marginTop += lineHeight;
        doc.text('  - Sessão: ' + sessao.sessao.nome, marginLeft, marginTop);
        marginTop += lineHeight;
        doc.text('  - Filme: ' + sessao.sessao.filme.titulo, marginLeft, marginTop);
        marginTop += lineHeight;
        doc.text('  - Total: ' + valorFormatado, marginLeft, marginTop );
        marginTop += lineHeight;
        marginTop += lineHeight;


        bilhete.lugares.forEach((lugar, lugarIndex) => {
          const rectX = marginLeft + 8; // Ajuste a posição horizontal do retângulo
          const rectY = marginTop - 9; // Ajuste a posição vertical do retângulo
          const rectWidth = 70; // Reduzi o tamanho do retângulo
          const rectHeight = lineHeight + 6; // Ajuste a altura do retângulo
          const textX = marginLeft + 30;
          const textY = marginTop;
          
          const numeroDoLugar = lugar // Obtém o número do lugar (por exemplo, '2' de 'c2')

          const lugar2 = `Lugar: ${numeroDoLugar}`;
        
          doc.setFillColor(0, 0, 0); // Define a cor do preenchimento para preto
          doc.rect(rectX, rectY, rectWidth, rectHeight, 'F'); // Desenha o retângulo preto
      
          doc.setTextColor(255, 255, 255); // Define a cor do texto para branco




doc.text(`   ${lugar2}`, textX, textY);
      
          marginTop += rectHeight + 2; // Ajuste o espaço vertical entre os retângulos
      });
      doc.setFillColor(0, 0, 0); // Define a cor do preenchimento para preto

        // ... repeat for other details like 'sessão', 'filme', etc.
        doc.setTextColor(0, 0, 0);
        // Calculate ending time of the film
        let startTime = sessao.hora;
        let durationMinutes = sessao.filme.duracao;

        let startTimeParts = startTime.split(":");
        let startDate = new Date();
        startDate.setHours(parseInt(startTimeParts[0]));
        startDate.setMinutes(parseInt(startTimeParts[1]));

        let endDate = new Date(startDate.getTime() + durationMinutes * 60000); 
        let endTime = endDate.getHours().toString().padStart(2, '0') + ':' + endDate.getMinutes().toString().padStart(2, '0');
        doc.setTextColor(0, 0, 0);

        // Add barcode
        const barcodeData = bilhete._id;
        const barcodeCanvas = document.createElement('canvas');
        JsBarcode(barcodeCanvas, barcodeData, { format: 'CODE128' });
        const barcodeDataURL = barcodeCanvas.toDataURL('image/png');

        const barcodeWidth = 100;
        const barcodeHeight = 30;
        const barcodeX = (doc.internal.pageSize.getWidth() - barcodeWidth) / 2;

        doc.addImage(barcodeDataURL, 'PNG', barcodeX, marginTop, barcodeWidth, barcodeHeight);
        marginTop += barcodeHeight + lineHeight;
        doc.setFontSize(9).text("Hora prevista de fim de filme: " + endTime, marginLeft +16, marginTop);
        marginTop += lineHeight;
        doc.setFontSize(9).text("Conserve este bilhete durante toda a sessão" ,  marginLeft+10 , marginTop);
        doc.setFontSize(9).text("Conserve este bilhete durante toda a sessão" ,  marginLeft+10 , marginTop);
        doc.setFontSize(9).text("Conserve este bilhete durante toda a sessão" ,  marginLeft+10 , marginTop);
   
        // Add any other details or texts as needed
          // Reset text color to black
  doc.setTextColor(0, 0, 0);
    });

    // Open the PDF in a new window
    window.open(doc.output('bloburl'), '_blank');
};


  useEffect(() => {

      console.log(bilheteId)

  }, [bilheteId]);

  useEffect(() => {
    if (bilhete2Id) {
      generateAndPrintPDF(bilhete2Id);
    }
  }, [bilhete2Id]);

  {
    return sessao && (

      <div>
        {/*show info*/}

        <div className='flex justify-between card p-2 items-center'>
          <div>
            <h1 className='text-2xl'>{sessao.sessao.cinema.nome}</h1>
            <a
  href={`http://maps.google.com/?q=${sessao.sessao.cinema.morada}`}
  className="text-xl"
  target="_blank"  // Adicione este atributo para abrir o link em uma nova aba/janela
  rel="noopener noreferrer" // Recomendação de segurança ao usar target="_blank"
>
  {sessao.sessao.cinema.morada}
</a> 
          </div>

          <div>
            <h1 className='text-2xl'>{sessao.sessao.filme.titulo}({sessao.sessao.filme.idioma.nome})</h1>
          </div>
          <div>
            <h1 className='text-xl'>{moment(sessao.data).format('DD-MM-YYYY')}  - {(sessao.hora)}
            </h1>

          </div>
        </div>

        {/*lugares*/}
        <div className='flex justify-center mt-2'>{getLugares()}</div>
        <div className='flex justify-center '>
          <div className='mt-2 flex uppercase card p-2 gap-3'>
            <h1 className='text-sm'>
              Total Lugares: {selectedLugares.length}
            </h1>

            <h1 className='text-sm'>
              Total: {selectedLugares.length * sessao.sessao.precobilhete} €
            </h1>
          </div>
        </div>
        <div className=' container flex justify-center'>
          {!user.isAdmin && !user.isFunc && selectedLugares.length > 0 && <div className='mt-2 flex justify-center'>
            <StripeCheckout
              token={onToken}
              amount={selectedLugares.length * sessao.precobilhete * 100}
              currency='EUR'
              enum="eu_vat"
              tax_id_collection="true"
              email={user.email}
              card
              stripeKey="pk_test_51NKVhMDvObFXHlKcfOPXAS0i9bAfCw1ol6p6TbxAcKu6TGICeUvgDcDgMi65H2s84Y9ear5RWfFTfHKwebvnEpcl00mdOQc9Ya">


              <Button>Comprar</Button>
            </StripeCheckout>
          </div>}

          
          
          {(user.isAdmin || user.isFunc) && selectedLugares.length > 0 && <div className=' flex justify-center'>

          <Button onClick={() => setModalIsOpen(true)}>Compra</Button>
          </div>
          }


        </div>

        <Modal
        open={modalIsOpen}
        onCancel={() => setModalIsOpen(false)} // Função para fechar o modal
        contentLabel="Exemplo de Modal"
        footer={null}
      >
   <h2 style={{ textAlign: 'center' }}>Confirmar Compra</h2>
    <div style={{ marginTop: '20px', marginBottom: '20px' }}>
    Bilhetes: {selectedLugares.map((place, index) => place + (index < selectedLugares.length - 1 ? ', ' : ''))}
    <p>
  Preço: {sessao && sessao.precobilhete ? sessao.precobilhete * selectedLugares.length + ' €' : ''}
</p>

    </div>

    <p style={{ textAlign: 'center' }}>Deseja confirmar a compra?</p>
    <div className="modal-buttons" style={{ display: 'flex', justifyContent: 'center' }}>
      <Button
        style={{ backgroundColor: '#6654DA', color: 'white', fontSize: '15px', marginRight: '10px' }}
        onClick={async () => {
          try {
       
             await bilhete('Fisico: ' + user._id);
           
            confirmPurchase(); 
   

          } catch (error) {
            // Lida com erros, se houver
          }
        }}
      >
        Sim
      </Button>
      <Button
        style={{ backgroundColor: 'red', color: 'white', fontSize: '15px' }}
        onClick={() => setModalIsOpen(false)}
      >
        Não
      </Button>
    </div>
        
      </Modal>

        {/* Modal de Sucesso */}
     <Modal
  open={successModalIsOpen}
  onCancel={() => {setSuccessModalIsOpen(false)
                  window.location.reload();
  }
  }
  contentLabel="Modal de Sucesso"
  footer={null}
  style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '15vh', // Use vh para definir a margem superior
    marginBottom: '15vh' // Use vh para definir a margem inferior
  }}
>
  {/* Conteúdo do modal de sucesso */}
  <div style={{ textAlign: 'center' ,marginTop: '10px'}}>
    <h2>Compra Realizada com Sucesso!</h2>
    <p>O bilhete foi gerado e está pronto para imprimir.</p>
  </div>
  <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
    <Button
      style={{ backgroundColor: '#6654DA', color: 'white', fontSize: '15px' }}
      onClick={async ()  => {
        
        console.log("bilheteId -> " + bilheteId)
    
         getBilhetesId(bilheteId)
   
    
 
    
        

        

        


      }
                
                  

       

      }

      
    >
      Imprimir Bilhete
    </Button>
  </div>
</Modal>



      </div>)
  }














}


export default BookSessao
