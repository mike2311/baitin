export interface Toast {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

export const useToast = () => {
  const toast = (toastOptions: Toast) => {
    // Simple console log for now - can be enhanced with a toast library later
    console.log('Toast:', toastOptions);
  };

  return { toast };
};
