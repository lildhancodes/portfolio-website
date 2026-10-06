// Explicit imagetools queries for small images, e.g. `x.png?w=80;120&format=avif;webp;png&as=picture`.
declare module '*&as=picture' {
  const picture: import('imagetools-core').Picture
  export default picture
}
