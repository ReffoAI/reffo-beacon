
const Image = ({ className, src, srcSet, alt }: { className: string, src: string, srcSet?: any, alt: string }) => {

  return (
    <img
      className={className}
      srcSet={srcSet}
      src={src}
      alt={alt}
    />
  );
};

export default Image;
