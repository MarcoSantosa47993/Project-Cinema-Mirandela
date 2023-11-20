import React, { useState } from 'react';
import { FaFacebook, FaInstagram, FaHeadphonesAlt, FaGoogle, FaWindows,FaMountain  } from 'react-icons/fa'; // Importando os ícones
import mirandelaImage from '../../../cliente/src/images/mirandela_1_980_2500.png';
import { useNavigate } from 'react-router-dom';

 function SocialCircle({user}) {
    const [expanded, setExpanded] = useState(false);
    const [supportExpanded, setSupportExpanded] = useState(false);
    const  navigate = useNavigate()
    const [isFacebookHovered, setFacebookHovered] = useState(false);
    const [isInstagramHovered, setInstagramHovered] = useState(false);
    const [isSupportHovered, setSupportHovered] = useState(false);
    const [isMountainHovered, setMountainHovered] = useState(false);

    const iconStyle = (isHovered) => ({
        cursor: 'pointer',
        transition: 'transform 0.3s ease, color 0.3s ease',
        color: isHovered ? 'black' : 'gray',  // Se estiver com o mouse por cima, use preto, senão use cinza
        transform: isHovered ? 'scale(1.2)' : 'scale(1.0)', // Se estiver com o mouse por cima, amplie, senão mantenha o tamanho normal
    });

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            display: 'flex',
            flexDirection: 'column-reverse',
            alignItems: 'center',
            transition: 'transform 0.3s ease'
        }}>
            <div 
                style={{
                    backgroundImage: `url(${mirandelaImage})`,
                    backgroundSize: 'cover',
                    backgroundColor: '#e0e0e0',
                    border: '2px solid black',
                    borderRadius: '50%',
                    width: '80px',
                    height: '80px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 1,
                }} 
                onClick={() => setExpanded(!expanded)}
            ></div>

            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                marginBottom: '10px',
                transform: expanded ? 'translateY(0)' : 'translateY(50px)',
                opacity: expanded ? 1 : 0,
                transition: 'transform 0.3s ease, opacity 0.3s ease',
                pointerEvents: expanded ? 'auto' : 'none'  // Adicionando esta linha
            }}>
               <a 
            href="https://www.facebook.com/municipio.mirandela" 
            target="_blank" 
            rel="noopener noreferrer"
            onClick={() => setExpanded(false)}  // Adicionando esta linha
        >
            <FaFacebook size={30} style={iconStyle(isFacebookHovered)} onMouseEnter={() => setFacebookHovered(true)} onMouseLeave={() => setFacebookHovered(false)} />
        </a>
        <a 
            href="https://www.instagram.com/municipiomirandela/" 
            target="_blank" 
            rel="noopener noreferrer"
            onClick={() => setExpanded(false)}  // Adicionando esta linha
        >
            <FaInstagram size={30} style={iconStyle(isInstagramHovered)} onMouseEnter={() => setInstagramHovered(true)} onMouseLeave={() => setInstagramHovered(false)} />
        </a>

        <a 
    href="http://www.visitmirandela.com/" 
    target="_blank" 
    rel="noopener noreferrer"
    onClick={(e) => {
        e.stopPropagation(); 
        setExpanded(false);
    }}
>
    <FaMountain 
        size={30} 
        style={iconStyle(isMountainHovered)} 
        onMouseEnter={() => setMountainHovered(true)} 
        onMouseLeave={() => setMountainHovered(false)}
    />
</a>
                <div 
                    style={{ position: 'relative' }}
                    onMouseEnter={() => setSupportHovered(true)} 
                    onMouseLeave={() => setSupportHovered(false)}
                >
            <FaHeadphonesAlt 
    size={30} 
    onClick={() => {
        navigate(`/apoio/${user.nome}/${user.email}/${user._id}`);
        setExpanded(false);
    }}
    style={iconStyle(isSupportHovered)}
/>
                  



                </div>
            </div>
        </div>
    );
};

export default SocialCircle;