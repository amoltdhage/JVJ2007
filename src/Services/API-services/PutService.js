export const putApiService = async (Url, token, bodyData, localisation) => {
  try {
    const response = await fetch(Url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        // Accept: "application/json",
        Authorization: "Bearer " + token,
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
    console.error("api error: ", error);
  }
};