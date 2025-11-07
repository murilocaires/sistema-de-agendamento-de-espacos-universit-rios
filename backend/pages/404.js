// Página 404 customizada - dinâmica para evitar geração estática
export async function getServerSideProps() {
  return {
    props: {},
  };
}

export default function Custom404() {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>404 - Page Not Found</h1>
      <p>The page you are looking for does not exist.</p>
    </div>
  );
}

