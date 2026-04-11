import axios from 'axios'

export const getWeather = async (req, res) => {
  const { latitude, longitude } = req.body
  
  if (!latitude || !longitude) {
    return res.status(400).json({ error: "Latitude and longitude are required." });
  }

  try {
    // Call OpenWeather API
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather`, {
        params: {
          lat: latitude,
          lon: longitude,
          appid: process.env.OPENWEATHER_API_KEY,
          units: 'metric'   // celsius
        }
      }
    )

    const data = response.data

    // Send only what SafeRoute needs back to the client
    res.status(200).json({
      location: data.name,
      temperature: data.main.temp,
      feelsLike: data.main.feels_like,
      humidity: data.main.humidity,
      weather: {
        main: data.weather[0].main,           //  "Rain"
        description: data.weather[0].description,  // "heavy intensity rain"
        icon: data.weather[0].icon
      },
      windSpeed: data.wind.speed,
      visibility: data.visibility,
      coordinates: {
        latitude: data.coord.lat,
        longitude: data.coord.lon
      }
    })

  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}