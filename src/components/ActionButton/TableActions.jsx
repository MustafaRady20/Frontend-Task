import React from 'react'
import ActionButton from '../ActionButton/ActionButton'
import pencil from '../../assets/Pencil.png'
import trash from '../../assets/Bin.png'
import Cookies from 'js-cookie'
const TableActions = ({ row, onEdit, onDelete,   }) => {
  
  const user = Cookies.get("user")
  return (
    <div className="flex space-x-2">
     {user ? (
      <div>
         <ActionButton
        icon={pencil}
        action={() => onEdit(row)}
        
      />
      <ActionButton
        icon={trash}
        action={onDelete}
        className="bg-red-500 hover:bg-red-600"
       
      />
      </div>
     ):null}
    </div>
  )
}
export default TableActions;