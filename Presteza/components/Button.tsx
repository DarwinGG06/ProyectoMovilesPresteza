import React from 'react'
import { Pressable, Text } from 'react-native'

// Se crea una interfaz que tendrá las propiedades que tiene el componente Botón
interface ButtonProps {
    text: string
    className?: string
    onPress: () => void
    disabled?: boolean
}

// Se crea un contrato del componente funional Botón
export const Button = ({ text, className, onPress, disabled }: ButtonProps) => {

    // Se retorna el componente Pressable que es el botón, que contiene el contrato del componente botón
    return (
        <Pressable
            onPress={onPress}
            disabled={disabled}
            className={`items-center rounded-lg bg-blue-600 p-3 active:opacity-80 disabled:opacity-50 ${className ?? ''}`}>
            <Text className="font-semibold text-white">{text}</Text>
        </Pressable>
    )
}

export default Button