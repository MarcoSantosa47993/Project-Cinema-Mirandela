import React from 'react'

function footer() {
    return (
            <div className='footer'>
                <div className='main-footer '>
                <div className='container'>
                    <div className='row'>
                        {/*Coluna 1*/}
                        <div className='col bg-footer'>
                            <div className='ml-2'>
                            <h3>Contactos</h3>
                            <ul className='list-unstyled'>
                               <a href={` http://maps.google.com/?q=${"Câmara Municipal de Mirandela"}`}><li><b>Câmara Municipal de Mirandela</b></li></a>
                                <li>Praça do Município 5370-288 Mirandela</li>
                               
                                <li><b>Telefone </b>278 200 200 </li>
                               
                                <li><b>E-mail </b><a href={`https://mail.google.com/mail/u/0/#inbox?compose=${"DmwnWrRqhsSlBKqdnzBxSrlkMfslzDfxPbMRrQCKlTsXSTSMKQLkcBqHNrLvtHklSMlQwJdMtFjB"}`} >geral@cm-mirandela.pt</a> </li>
                                <div className='img'>
                               <a href='http://www.visitmirandela.com/pages/1260'> <img   src={require('file:///D:/Users/Utilizador/Downloads/TurismoLogoMirandelaNew_1_980_2500.jpg')} ></img></a>
                                </div>
                            </ul>
                            </div> <div className=' items-center justify-center flex'>
                            <p className='texto'>
                                &copy; 2015 | Todos os Direitos Reservados
                            </p>
                        </div>
                        </div>

                       

                    </div>

                </div>
 
        </div>
        </div>




  )







       

                   
           
        
  
}

export default footer
