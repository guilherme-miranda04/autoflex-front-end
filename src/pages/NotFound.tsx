import { useLocation } from 'react-router-dom';

const NotFound = () => {
  const location = useLocation();

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight">404</h1>
        <p className="mt-2 text-muted-foreground">
          Esta página não existe. Verifique o URL ou volte para a página
          inicial.
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Path: {location.pathname}
        </p>
        <a
          href="/"
          className="mt-4 inline-block text-sm text-primary hover:underline"
        >
          Voltar para a página inicial
        </a>
      </div>
    </div>
  );
};

export default NotFound;
