const apiBaseUrl = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ?? "http://localhost:3000";

const EDIT_JOBS_ENDPOINT = `${apiBaseUrl}/api/jobs`;

export type CreateEditJobPayload = {
  prompt: string;
  video: File;
  signal?: AbortSignal;
};

export type CreateEditJobResult = {
  success: boolean;
  jobId: string;
  outputUrl: string | null;
};

const parseErrorMessage = async (response: Response) => {
  try {
    const data = await response.json();
    if (data?.error) return data.error as string;
  } catch {
    // ignore
  }
  return response.statusText || "Request failed";
};

export const createEditJob = async ({ prompt, video, signal }: CreateEditJobPayload): Promise<CreateEditJobResult> => {
  const formData = new FormData();
  formData.append("prompt", prompt);
  formData.append("video", video);

  const response = await fetch(EDIT_JOBS_ENDPOINT, {
    method: "POST",
    body: formData,
    signal,
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const data = (await response.json()) as Partial<CreateEditJobResult>;

  if (!data?.jobId) {
    throw new Error("Invalid response from server");
  }

  return {
    success: data.success ?? true,
    jobId: data.jobId,
    outputUrl: typeof data.outputUrl === "string" && data.outputUrl.length > 0 ? data.outputUrl : null,
  };
};
