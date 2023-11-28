import {setWebhookCallback} from "vercel-grammy";
import {bot} from "../src/bot.mjs";

// Handler to set webhook url based on request headers
export default setWebhookCallback(bot, {
    path: "api/update",
    onError: "return"
});
