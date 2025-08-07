export const Card = ({ className, ...props }) => (
  <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`} {...props} />
);
Card.displayName = "Card";

export const CardContent = ({ className, ...props }) => (
  <div className={`p-6 ${className}`} {...props} />
);
CardContent.displayName = "CardContent";