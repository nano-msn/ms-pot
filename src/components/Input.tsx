import { Component, JSX } from "solid-js"

export type InputProps = JSX.InputHTMLAttributes<HTMLInputElement>

export const Input: Component<InputProps> = (props) => (
  <input
    {...props}
    class={`appearance-none border rounded w-full py-1 px-1 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
      props.class ?? ""
    }`}
  />
)
