import { Agent, run, tool } from "@openai/agents";
import { z } from "zod";
import "dotenv/config";
import axios from "axios";
import { Resend } from "resend";

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

const sendEmail = tool({
  name: "send_email",
  description: "This tool sends an email",
  parameters: z.object({
    toEmail: z.string().describe("email address to"),
    subject: z.string().describe("subject"),
    body: z.string().describe("body of the email"),
  }),
  async execute({ toEmail, subject, body }) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: "onboarding@resend.dev",
        to: toEmail,
        subject: subject,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body {
                  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                  line-height: 1.6;
                  color: #333;
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 20px;
                }
                .container {
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  border-radius: 10px;
                  padding: 30px;
                  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }
                .content {
                  background: white;
                  border-radius: 8px;
                  padding: 25px;
                  margin-top: 20px;
                }
                h2 {
                  color: white;
                  margin: 0 0 10px 0;
                  font-size: 24px;
                }
                .message {
                  white-space: pre-wrap;
                  font-size: 16px;
                  color: #444;
                }
                .footer {
                  text-align: center;
                  color: white;
                  margin-top: 20px;
                  font-size: 12px;
                  opacity: 0.9;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <h2>🤖 AI Agent Report</h2>
                <div class="content">
                  <div class="message">${body}</div>
                </div>
                <div class="footer">
                  Sent by Multi-Purpose Agent • ${new Date().toLocaleDateString()}
                </div>
              </div>
            </body>
          </html>
        `,
      });
      return `Email Sent Successfully.`;
    } catch (error) {
      return `Unexpected error sending email: ${error.message}`;
    }
  },
});

const weatherAgent = new Agent({
  name: "Multi-Purpose Agent",
  instructions:
    "You can check weather and send emails. Use the appropriate tool based on user requests.",
  tools: [getWeather, sendEmail],
});

const result = await run(
  weatherAgent,
  `What is the weather of London, delhi and Mumbai? and send me an email to ${process.env.EMAIL} with appropriate subject and body!`
);

console.log(result.finalOutput);
