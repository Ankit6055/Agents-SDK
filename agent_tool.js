import { Agent, run, tool } from "@openai/agents";
import { z } from "zod";
import "dotenv/config";
import axios from "axios";

const getWeather = tool({
  name: "get_weather",
  description: "Return the weather for a given city.",
  parameters: z.object({ city: z.string() }),
  async execute({ city }) {
    const url = `https://wttr.in/${city.toLowerCase()}?format=%C+%t`;
    const response = await axios.get(url, { responseType: "text" });
    return `The weather in ${city} is ${response.data}.`;
  },
});

const weatherAgent = new Agent({
  name: "Weather Agent",
  instructions: "You are a helpful weather agent.",
  tools: [getWeather],
});

const result = await run(weatherAgent, "What is the weather of London?");

console.log(result.finalOutput);
