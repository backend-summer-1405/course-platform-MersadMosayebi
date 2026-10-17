export {};

declare global {
  namespace Express {
    interface Request {
      user?: {
        personId: string; 
        role?: string;    
      };
    }
  }
}