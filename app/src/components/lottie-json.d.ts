// Lottie animation files are imported dynamically as data; lottie-web types them as `any`.
declare module '*.lottie.json' {
  const data: object
  export default data
}
