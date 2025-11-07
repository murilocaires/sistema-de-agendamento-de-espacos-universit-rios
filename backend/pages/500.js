// Página 500 customizada - dinâmica para evitar geração estática
export async function getServerSideProps() {
  return {
    props: {},
  };
}

export default function Custom500() {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>500 - Server Error</h1>
      <p>An error occurred on the server.</p>
    </div>
  );
}

