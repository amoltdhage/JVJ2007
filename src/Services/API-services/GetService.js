export const getApiService = async (Url, token, bodyData, localisation) => {
  // try {
  const response = await fetch(Url, {
    method: "GET",
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
  // }
  // catch (error) {
  //   console.error("get api error: ", error);
  // }
};
