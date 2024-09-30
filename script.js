const fetchWikipediaSummary = async (title) => {
  const fetchApi = await fetch(
    `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`
  )
  const postResult = await fetchApi.json()
  return postResult.originalimage ? postResult.originalimage.source : null // Return the image source or null if not found
}

let mainContainer = document.querySelector("#mainContainer")
let forecastContainer = document.querySelector("#forecastContainer")

import { fetchWeatherData } from "./fetchData.js"

const WMOInterpreter = async (weatherCode) => {
  return weatherCode.map((code) => {
    if (code >= 45 && code <= 48) {
      return "Foggy"
    } else if (code >= 51 && code <= 67) {
      return "Rainy"
    } else if (code >= 71 && code <= 86) {
      return "Snowy"
    } else if (code >= 95 && code <= 99) {
      return "Stormy"
    } else {
      return "Sunny"
    }
  })
}

const getDateString = (offset) => {
  const date = new Date()
  date.setDate(date.getDate() + offset)
  return date.toLocaleDateString("en-US", { weekday: "long", day: "numeric" })
}

const storeWeatherData = async (location) => {
  const value = await fetchWeatherData(location)
  const temperature = value?.temperature_2m
  const weather = await WMOInterpreter(value?.weather_code)
  const maxTemp = value?.temperature_2m_max
  const minTemp = value?.temperature_2m_min

  const currentWeather = [
    temperature,
    weather[0],
    maxTemp[0],
    minTemp[0],
    value?.name,
    value?.country,
  ]

  const forecast = await Promise.all(
    value?.weather_code.slice(1).map(async (code, index) => {
      const weatherDescription = await WMOInterpreter([code])
      return [weatherDescription[0], maxTemp[index + 1], minTemp[index + 1]]
    })
  )

  return { current: currentWeather, forecast }
}

const clearOldData = () => {
  document.querySelector("#todayDiv")?.remove()
  for (let i = 0; i < 6; i++) {
    document.querySelector(`#forecastDiv${i}`)?.remove()
  }
}

const appendElement = (parent, tagName, className, innerHTML) => {
  const element = document.createElement(tagName)
  if (className) element.className = className
  if (innerHTML) element.innerHTML = innerHTML
  parent.appendChild(element)
}

const createCard = async (data, inputLocationName) => {
  // Renamed locationName to inputLocationName
  const todayCard = document.createElement("div")
  todayCard.id = "todayDiv"
  mainContainer.append(todayCard)

  const [temperature, weather, maxTemp, minTemp, locationName, locationCountry] = data.current

  // Map weather conditions to image filenames
  const weatherImages = {
    Foggy: "./images/foggy.png",
    Rainy: "./images/rainy.png",
    Snowy: "./images/snowy.png",
    Stormy: "./images/stormy.png",
    Sunny: "./images/sunny.png",
  }

  // Fetch Wikipedia image based on the location name
  const wikiImageUrl = await fetchWikipediaSummary(locationName)

  // Set background image based on the Wikipedia image or fallback to weather images
  todayCard.style.backgroundImage = `url(${wikiImageUrl || weatherImages[weather]})`
  todayCard.style.backgroundSize = "170px 170px" // Adjust as necessary
  todayCard.style.backgroundRepeat = "no-repeat" // Prevent image repetition
  todayCard.style.backgroundPosition = "top center" // Align the image to the top center

  appendElement(todayCard, "p", "todayTemperature", `${temperature}°C`)
  appendElement(todayCard, "p", "todayWeather", weather)
  appendElement(todayCard, "p", "todayMaxTemp", `Max ${maxTemp}°C`)
  appendElement(todayCard, "p", "todayMinTemp", `Min ${minTemp}°C`)
  appendElement(todayCard, "p", "todayLocation", `${locationName}, ${locationCountry}`) // Show both location name and country
  appendElement(todayCard, "p", "todayDate", getDateString(0))

  for (let i = 0; i < 6; i++) {
    const createDiv = document.createElement("div")
    createDiv.id = `forecastDiv${i}`
    forecastContainer.append(createDiv)

    const [forecastWeather, forecastMaxTemp, forecastMinTemp] = data.forecast[i]

    // Set background image for forecast div based on forecast weather
    createDiv.style.backgroundImage = `url(${weatherImages[forecastWeather]})`
    createDiv.style.backgroundSize = "170px 170px" // Adjust as necessary
    createDiv.style.backgroundRepeat = "no-repeat" // Prevent image repetition
    createDiv.style.backgroundPosition = "top center" // Align the image to the top center

    appendElement(createDiv, "p", "forecastWeather", forecastWeather)
    appendElement(createDiv, "p", "forecastMaxTemp", `Max ${forecastMaxTemp}°C`)
    appendElement(createDiv, "p", "forecastMinTemp", `Min ${forecastMinTemp}°C`)
    appendElement(createDiv, "p", "forecastDate", getDateString(i + 1))
  }
}

const initWeatherApp = () => {
  // Create input container for textarea and button
  let inputContainer = document.createElement("div")
  inputContainer.id = "inputContainer"
  mainContainer.append(inputContainer)

  let locationName = document.createElement("textarea")
  locationName.id = "locationName"
  locationName.spellcheck = false
  inputContainer.append(locationName) // Append textarea to the input container

  let locationNameButton = document.createElement("button")
  locationNameButton.id = "locationNameButton"
  locationNameButton.innerText = "Submit" // Adding button text
  inputContainer.append(locationNameButton) // Append button to the input container

  // Add event listener to button
  locationNameButton.addEventListener("click", async () => {
    clearOldData() // Clear old weather data
    const data = await storeWeatherData(locationName.value) // Fetch new weather data

    if (data) {
      createCard(data, locationName.value) // Create new weather cards with location name
    }
  })
}

// Initialize the weather app
initWeatherApp()
