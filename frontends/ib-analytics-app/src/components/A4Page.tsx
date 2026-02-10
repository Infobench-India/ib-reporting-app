import { Container } from "react-bootstrap";

interface A4PageProps {
  children: React.ReactNode;
}

export const A4Page: React.FC<A4PageProps> = ({ children }) => {
  return (
    <Container className="a4-page">
      {children}
    </Container>
  );
};