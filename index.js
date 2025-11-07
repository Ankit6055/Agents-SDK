import { Agent, run } from "@openai/agents";
import "dotenv/config";
import { ru } from "zod/v4/locales";

const agent = new Agent({
  name: "Assistant Agent",
  instructions: "You're an helpful assistant",
  model: "gpt-4o-mini",
});

const historyTutorAgent = new Agent({
  name: "History Tutor",
  instructions:
    "You provide assistance with historical queries. Explain important events and context clearly.",
});

const mathTutorAgent = new Agent({
  name: "Math Tutor",
  instructions:
    "You provide help with math problems. Explain your reasoning at each step and include examples",
});

const triageAgent = Agent.create({
  name: 'Triage Agent',
  instructions:
    "You determine which agent to use based on the user's homework question",
  handoffs: [historyTutorAgent, mathTutorAgent],
});

const result = await run(triageAgent, "who was mahatma gandhi?");

console.log(result.finalOutput);
