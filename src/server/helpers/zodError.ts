import { ZodError } from 'zod';

export const formatZodError = (error: ZodError) => {
  const formatted: Record<string, string> = {};

  error.issues.forEach((issue) => {
    const field = issue.path[0] as string;

    if (!formatted[field]) {
      formatted[field] = issue.message;
    }
  });

  return formatted;
};
