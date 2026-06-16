export const sendSms = async (to, body) => {
  const credentials = Buffer.from(`${process.env.UNISMS_API_KEY}:`).toString("base64");

  const response = await fetch("https://unismsapi.com/api/sms", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Basic ${credentials}`,
    },
    body: JSON.stringify({
      recipient: to,
      content: body,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`UniSMS failed: ${error}`);
  }
  const result = await response.json();
  console.log("UniSMS response:", result); // temporary debug
  return result;
  return response.json();
};