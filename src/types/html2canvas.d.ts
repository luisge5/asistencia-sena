declare module 'html2canvas' {
  interface Html2canvasOptions {
    backgroundColor?: string
    scale?: number
    useCORS?: boolean
    allowTaint?: boolean
    logging?: boolean
    width?: number
    height?: number
    x?: number
    y?: number
  }

  function html2canvas(element: HTMLElement, options?: Html2canvasOptions): Promise<HTMLCanvasElement>

  export default html2canvas
}
