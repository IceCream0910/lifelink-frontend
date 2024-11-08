type SpacerProps = {
  x?: number;
  y?: number;
};

const Spacer = ({ x, y }: SpacerProps) => {
  return <div style={{ height: y, width: x }} />;
};

export default Spacer;