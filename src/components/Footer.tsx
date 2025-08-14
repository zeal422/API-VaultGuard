export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-6">
        <div className="text-center space-y-2">
          <p className="text-sm font-medium text-foreground">
            Developed by VectorMedia
          </p>
          <p className="text-sm text-muted-foreground/70">
            ©{currentYear} - All rights reserved
          </p>
          <p className="text-xs text-muted-foreground/70">
            V1.0.0
          </p>
        </div>
      </div>
    </footer>
  );
}