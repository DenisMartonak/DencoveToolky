import { useToast } from "../context/ToastContext";

export function useCopy() {
  const toast = useToast();

  return async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast("Copied to clipboard!");
    } catch {
      toast("Failed to copy");
    }
  };
}
