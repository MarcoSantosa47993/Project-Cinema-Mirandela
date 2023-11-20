import React from 'react';
import '../stylesheets/lugares.css'; // Importando o CSS

const Retangulo = ({ tamanho, cor, borderRadius, onClick, className }) => {
  const estiloRetangulo = {
    backgroundColor: cor || 'blue',
    borderRadius: borderRadius || '50px',
  };

  return <div className={className} style={estiloRetangulo} onClick={onClick}></div>;
};

export default Retangulo;