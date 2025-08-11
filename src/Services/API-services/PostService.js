import { toast } from "sonner";
import { ValidationMessage } from "../../Utils/Utils";

export const postApiService = async (Url, token, bodyData, localisation) => {
  try {
    const response = await fetch(Url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: token ? `Bearer ${token}` : undefined,
        "Content-Language": localisation ? localisation : "en",
        "accept-language": localisation ? localisation : "en",
      },
      ...(bodyData && { body: JSON.stringify(bodyData) }),
    });
    if (!response.ok) {
      const data = await response.json();
      return data;
    }
    const data = await response.json();
    return data;
  } catch (error) {
    toast.error(error?.message || ValidationMessage.SOMETHING_WENT_WRONG);
  }
};
