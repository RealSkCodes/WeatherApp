// Fetching the Latitude and Longitude by location name
const fetchLatiLong = async (locationName) => {
  const fetchApi = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${locationName}&count=1&language=en&format=json`
  )
  const postResult = await fetchApi.json()
  const { latitude, longitude, country, name } = postResult.results[0]
  return { latitude, longitude, country, name }
}

// Fetching the Weather Data by latitude and longitude
export const fetchWeatherData = async (locationName) => {
  const { latitude, longitude, country, name } = await fetchLatiLong(locationName)
  const fetchApi = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m&hourly=temperature_2m&daily=weather_code,temperature_2m_max,temperature_2m_min`
  )
  const postResult = await fetchApi.json()
  const temperature_2m = postResult.current.temperature_2m
  const { weather_code, temperature_2m_max, temperature_2m_min } = postResult.daily
  return { temperature_2m, weather_code, temperature_2m_max, temperature_2m_min, name, country }
}
