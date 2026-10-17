export function Avisos({ erro, ok }: { erro?: string; ok?: string }) {
  return (
    <>
      {erro && (
        <p className="admin__aviso admin__aviso--erro" role="alert">
          {erro}
        </p>
      )}
      {ok && (
        <p className="admin__aviso admin__aviso--ok" role="status">
          {ok}
        </p>
      )}
    </>
  );
}
