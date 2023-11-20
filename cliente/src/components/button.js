import React from 'react'


function button({title, onClick,variant,disabled,fullWidth,type}) {

    
    let className = 'bg-secundary p-1 text-white'

    if(fullWidth)
    {
        className = 'bdr-2 bg-secundary p-1 text-white w-full mt-1'
    }



  return (
    <div>
      <button className={className} type={type}
      
      onClick={onClick} disabled={disabled}

      >{title}
      
      
      </button>
    </div>
  )
}

export default button
